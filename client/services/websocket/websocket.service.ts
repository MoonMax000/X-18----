/**
 * WebSocket сервис для real-time уведомлений
 * Автоматическое переподключение и управление состоянием
 */

import { customAuth } from '../auth/custom-backend-auth';

interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

interface WebSocketMessage {
  type: string;
  payload: any;
}

export enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isIntentionallyClosed = false;
  private messageQueue: WebSocketMessage[] = [];
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();
  private connectionStateListeners: Set<(state: ConnectionState) => void> = new Set();
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;

  constructor() {
    // Базовая конфигурация
    this.config = {
      url: '',
      reconnectInterval: 5000, // 5 секунд
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000 // 30 секунд
    };

    // Подписываемся на события авторизации
    window.addEventListener('auth:logout', () => this.disconnect());
  }

  /**
   * Подключение к WebSocket серверу
   */
  connect(): void {
    // Проверяем авторизацию
    const token = customAuth.getAccessToken();
    if (!token) {
      console.warn('WebSocket: No auth token available');
      return;
    }

    // Если уже подключены или подключаемся
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || 
                    this.ws.readyState === WebSocket.OPEN)) {
      return;
    }

    // Строим URL с токеном
    const wsUrl = this.buildWebSocketUrl(token);
    this.isIntentionallyClosed = false;
    
    this.setConnectionState(ConnectionState.CONNECTING);
    console.log('WebSocket: Connecting to', wsUrl);

    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket: Connection error', error);
      this.handleError(error);
    }
  }

  /**
   * Отключение от WebSocket
   */
  disconnect(): void {
    this.isIntentionallyClosed = true;
    this.cleanup();
    this.setConnectionState(ConnectionState.DISCONNECTED);
  }

  /**
   * Отправка сообщения
   */
  send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Добавляем в очередь
      this.messageQueue.push(message);
    }
  }

  /**
   * Подписка на события
   */
  on(event: string, callback: (data: any) => void): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    
    this.eventListeners.get(event)!.add(callback);

    // Возвращаем функцию отписки
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.eventListeners.delete(event);
        }
      }
    };
  }

  /**
   * Подписка на изменение состояния соединения
   */
  onConnectionStateChange(callback: (state: ConnectionState) => void): () => void {
    this.connectionStateListeners.add(callback);
    
    // Сразу вызываем с текущим состоянием
    callback(this.connectionState);

    return () => {
      this.connectionStateListeners.delete(callback);
    };
  }

  /**
   * Получить текущее состояние соединения
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Проверка активности соединения
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  private buildWebSocketUrl(token: string): string {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
    const wsHost = baseUrl.replace(/^https?:\/\//, '');
    
    return `${wsProtocol}://${wsHost}/ws/notifications?token=${token}`;
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket: Connected');
      this.setConnectionState(ConnectionState.CONNECTED);
      this.reconnectAttempts = 0;

      // Отправляем сообщения из очереди
      this.flushMessageQueue();

      // Запускаем heartbeat
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        console.log('WebSocket: Message received', message);

        // Обрабатываем служебные сообщения
        if (message.type === 'pong') {
          return; // Ответ на ping
        }

        // Вызываем обработчики для конкретного типа сообщения
        this.emit(message.type, message.payload);
        
        // Вызываем обработчики для всех сообщений
        this.emit('message', message);

      } catch (error) {
        console.error('WebSocket: Failed to parse message', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket: Error', error);
      this.handleError(error);
    };

    this.ws.onclose = (event) => {
      console.log('WebSocket: Closed', event.code, event.reason);
      this.handleClose(event);
    };
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`WebSocket: Error in listener for event ${event}`, error);
        }
      });
    }
  }

  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.connectionStateListeners.forEach(callback => {
        try {
          callback(state);
        } catch (error) {
          console.error('WebSocket: Error in connection state listener', error);
        }
      });
    }
  }

  private handleError(error: any): void {
    this.setConnectionState(ConnectionState.ERROR);
    
    // Если токен истек, пробуем обновить
    if (error.message?.includes('401') || error.message?.includes('Invalid token')) {
      this.handleAuthError();
    } else {
      this.scheduleReconnect();
    }
  }

  private handleClose(event: CloseEvent): void {
    this.stopHeartbeat();

    if (this.isIntentionallyClosed) {
      return;
    }

    // Коды закрытия WebSocket
    if (event.code === 1000) {
      // Нормальное закрытие
      this.setConnectionState(ConnectionState.DISCONNECTED);
    } else if (event.code === 1001) {
      // Сервер уходит
      this.scheduleReconnect();
    } else if (event.code >= 4000 && event.code < 5000) {
      // Ошибки приложения (4xxx)
      if (event.code === 4001) {
        // Ошибка авторизации
        this.handleAuthError();
      } else {
        this.setConnectionState(ConnectionState.ERROR);
      }
    } else {
      // Другие ошибки - пробуем переподключиться
      this.scheduleReconnect();
    }
  }

  private async handleAuthError(): Promise<void> {
    try {
      // Пробуем обновить токен
      await customAuth.refreshToken();
      // Переподключаемся с новым токеном
      this.reconnectAttempts = 0;
      this.connect();
    } catch (error) {
      console.error('WebSocket: Failed to refresh token', error);
      this.setConnectionState(ConnectionState.ERROR);
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 10)) {
      console.error('WebSocket: Max reconnection attempts reached');
      this.setConnectionState(ConnectionState.ERROR);
      return;
    }

    const delay = Math.min(
      (this.config.reconnectInterval || 5000) * Math.pow(1.5, this.reconnectAttempts),
      30000 // Максимум 30 секунд
    );

    console.log(`WebSocket: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);
    this.setConnectionState(ConnectionState.DISCONNECTED);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({ type: 'ping', payload: {} });
      }
    }, this.config.heartbeatInterval || 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private cleanup(): void {
    this.stopHeartbeat();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.messageQueue = [];
  }
}

// Экспортируем singleton
export const wsService = new WebSocketService();

// Типы для уведомлений
export interface NotificationPayload {
  id: string;
  user_id: string;
  type: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

// Helper для работы с уведомлениями
export const notificationWS = {
  // Подписка на новые уведомления
  onNotification(callback: (notification: NotificationPayload) => void): () => void {
    return wsService.on('notification', callback);
  },

  // Подписка на состояние соединения
  onConnectionChange(callback: (state: ConnectionState) => void): () => void {
    return wsService.onConnectionStateChange(callback);
  },

  // Подключение
  connect(): void {
    wsService.connect();
  },

  // Отключение
  disconnect(): void {
    wsService.disconnect();
  },

  // Проверка состояния
  isConnected(): boolean {
    return wsService.isConnected();
  },

  getConnectionState(): ConnectionState {
    return wsService.getConnectionState();
  }
};
