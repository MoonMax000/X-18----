package api

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"custom-backend/configs"
	"custom-backend/internal/auth"
	"custom-backend/internal/cache"
	"custom-backend/internal/database"
	"custom-backend/internal/models"
)

type WebSocketHandler struct {
	db     *database.Database
	cache  *cache.Cache
	config *configs.Config
}

func NewWebSocketHandler(db *database.Database, cache *cache.Cache, config *configs.Config) *WebSocketHandler {
	return &WebSocketHandler{
		db:     db,
		cache:  cache,
		config: config,
	}
}

// WebSocket сообщения
type WSMessage struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

// Клиент WebSocket
type Client struct {
	UserID     uuid.UUID
	Connection *websocket.Conn
	Send       chan WSMessage
}

// Менеджер WebSocket подключений
type Hub struct {
	clients    map[uuid.UUID]map[*Client]bool // userID -> множество клиентов
	register   chan *Client
	unregister chan *Client
	cache      *cache.Cache
}

var hub *Hub

func InitWebSocketHub(cache *cache.Cache) {
	hub = &Hub{
		clients:    make(map[uuid.UUID]map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		cache:      cache,
	}
	go hub.run()
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			// Регистрация нового клиента
			if h.clients[client.UserID] == nil {
				h.clients[client.UserID] = make(map[*Client]bool)
			}
			h.clients[client.UserID][client] = true
			log.Printf("WebSocket client connected for user %s", client.UserID)

		case client := <-h.unregister:
			// Отключение клиента
			if clients, ok := h.clients[client.UserID]; ok {
				if _, ok := clients[client]; ok {
					delete(clients, client)
					close(client.Send)
					if len(clients) == 0 {
						delete(h.clients, client.UserID)
					}
					log.Printf("WebSocket client disconnected for user %s", client.UserID)
				}
			}
		}
	}
}

// Отправка уведомления конкретному пользователю
func (h *Hub) SendToUser(userID uuid.UUID, message WSMessage) {
	if clients, ok := h.clients[userID]; ok {
		for client := range clients {
			select {
			case client.Send <- message:
			default:
				// Канал заполнен, закрываем клиента
				delete(clients, client)
				close(client.Send)
			}
		}
	}
}

// WebSocket endpoint handler
func (h *WebSocketHandler) HandleWebSocket(c *fiber.Ctx) error {
	log.Printf("[WebSocket] New connection attempt from %s", c.IP())

	// Проверяем, является ли запрос WebSocket
	if websocket.IsWebSocketUpgrade(c) {
		// Пытаемся получить токен из разных источников
		var token string

		// 1. Проверяем HttpOnly cookie (приоритет для безопасности)
		token = c.Cookies("access_token")

		// 2. Если нет в cookie, проверяем Authorization header
		if token == "" {
			authHeader := c.Get("Authorization")
			if authHeader != "" && len(authHeader) > 7 && authHeader[:7] == "Bearer " {
				token = authHeader[7:]
			}
		}

		// 3. Если нет в header, проверяем query параметр (legacy)
		if token == "" {
			token = c.Query("token")
		}

		if token == "" {
			log.Printf("[WebSocket] No token provided")
			return c.Status(401).JSON(fiber.Map{"error": "Missing token"})
		}

		// Валидируем токен ДО upgrade
		claims, err := auth.ValidateAccessToken(token, h.config.JWT.AccessSecret)
		if err != nil {
			log.Printf("[WebSocket] Invalid token: %v", err)
			return c.Status(401).JSON(fiber.Map{"error": "Invalid token"})
		}

		// Сохраняем claims в locals для передачи в handler
		c.Locals("allowed", true)
		c.Locals("claims", claims)
		log.Printf("[WebSocket] Token validated for user %s", claims.UserID)

		return websocket.New(h.wsHandler)(c)
	}
	return fiber.ErrUpgradeRequired
}

// Обработчик WebSocket соединения
func (h *WebSocketHandler) wsHandler(conn *websocket.Conn) {
	log.Printf("[WebSocket] Connection upgraded successfully")

	// Получаем claims из контекста
	claimsInterface := conn.Locals("claims")
	if claimsInterface == nil {
		log.Printf("[WebSocket] No claims in context")
		conn.WriteMessage(websocket.CloseMessage, []byte("Authentication failed"))
		conn.Close()
		return
	}

	claims, ok := claimsInterface.(*auth.JWTClaims)
	if !ok {
		log.Printf("[WebSocket] Invalid claims type")
		conn.WriteMessage(websocket.CloseMessage, []byte("Authentication failed"))
		conn.Close()
		return
	}

	log.Printf("[WebSocket] Connection established for user %s", claims.UserID)

	// Создаем клиента
	client := &Client{
		UserID:     claims.UserID,
		Connection: conn,
		Send:       make(chan WSMessage, 256),
	}

	// Регистрируем клиента
	hub.register <- client

	// Создаем контекст для WebSocket соединения
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Подписываемся на Redis канал пользователя
	pubsub := h.cache.Client.Subscribe(
		ctx,
		fmt.Sprintf("notifications:%s", claims.UserID),
	)
	defer pubsub.Close()

	// Запускаем горутины для чтения и записи
	go client.writePump()
	go client.readPump(pubsub, cancel)

	// Отправляем приветственное сообщение
	client.Send <- WSMessage{
		Type: "connected",
		Payload: map[string]interface{}{
			"message": "Connected to notification stream",
			"userId":  claims.UserID,
		},
	}

	// Ждем завершения контекста
	<-ctx.Done()

	// Отключаем клиента
	hub.unregister <- client
}

// Чтение сообщений от клиента (ping/pong)
func (c *Client) readPump(pubsub *redis.PubSub, cancel context.CancelFunc) {
	defer func() {
		log.Printf("[WebSocket] Closing connection for user %s", c.UserID)
		c.Connection.Close()
		cancel()
	}()

	c.Connection.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.Connection.SetPongHandler(func(string) error {
		log.Printf("[WebSocket] Received pong from user %s", c.UserID)
		c.Connection.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	// Также слушаем сообщения от клиента
	go func() {
		for {
			mt, message, err := c.Connection.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					log.Printf("[WebSocket] Read error for user %s: %v", c.UserID, err)
				}
				cancel() // Отменяем контекст при ошибке
				return
			}

			log.Printf("[WebSocket] Received message from user %s, type: %d, data: %s", c.UserID, mt, string(message))

			// Обрабатываем различные типы сообщений
			if mt == websocket.PongMessage {
				c.Connection.SetReadDeadline(time.Now().Add(60 * time.Second))
			} else if mt == websocket.TextMessage {
				// Обрабатываем текстовые сообщения
				var msg map[string]interface{}
				if err := json.Unmarshal(message, &msg); err == nil {
					log.Printf("[WebSocket] Parsed message from user %s: %+v", c.UserID, msg)
				}
			}
		}
	}()

	// Слушаем сообщения из Redis
	log.Printf("[WebSocket] Subscribing to Redis channel for user %s", c.UserID)
	ch := pubsub.Channel()
	for msg := range ch {
		log.Printf("[WebSocket] Received Redis message for user %s: %s", c.UserID, msg.Payload)

		// Парсим уведомление из Redis
		var notification models.Notification
		if err := json.Unmarshal([]byte(msg.Payload), &notification); err != nil {
			log.Printf("[WebSocket] Failed to unmarshal notification for user %s: %v", c.UserID, err)
			continue
		}

		// Отправляем клиенту
		wsMsg := WSMessage{
			Type:    "notification",
			Payload: notification,
		}

		select {
		case c.Send <- wsMsg:
			log.Printf("[WebSocket] Sent notification to user %s", c.UserID)
		default:
			log.Printf("[WebSocket] Failed to send notification to user %s - channel full", c.UserID)
		}
	}
}

// Отправка сообщений клиенту
func (c *Client) writePump() {
	ticker := time.NewTicker(30 * time.Second)
	defer func() {
		ticker.Stop()
		log.Printf("[WebSocket] Closing write pump for user %s", c.UserID)
		c.Connection.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Connection.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				// Канал закрыт
				log.Printf("[WebSocket] Send channel closed for user %s", c.UserID)
				c.Connection.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			log.Printf("[WebSocket] Sending message to user %s: %+v", c.UserID, message)

			if err := c.Connection.WriteJSON(message); err != nil {
				log.Printf("[WebSocket] Write error for user %s: %v", c.UserID, err)
				return
			}

			log.Printf("[WebSocket] Message sent successfully to user %s", c.UserID)

		case <-ticker.C:
			c.Connection.SetWriteDeadline(time.Now().Add(10 * time.Second))
			log.Printf("[WebSocket] Sending ping to user %s", c.UserID)
			if err := c.Connection.WriteMessage(websocket.PingMessage, nil); err != nil {
				log.Printf("[WebSocket] Ping error for user %s: %v", c.UserID, err)
				return
			}
		}
	}
}

// Публикация уведомления в Redis (вызывается из других хендлеров)
func PublishNotification(cache *cache.Cache, notification *models.Notification) error {
	ctx := context.Background()

	// Сериализуем уведомление
	data, err := json.Marshal(notification)
	if err != nil {
		return fmt.Errorf("failed to marshal notification: %w", err)
	}

	// Публикуем в Redis канал пользователя
	err = cache.Client.Publish(
		ctx,
		fmt.Sprintf("notifications:%s", notification.UserID),
		string(data),
	).Err()

	if err != nil {
		return fmt.Errorf("failed to publish notification: %w", err)
	}

	return nil
}
