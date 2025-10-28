package cache

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/yourusername/x18-backend/configs"
)

type Cache struct {
	Client *redis.Client
	ctx    context.Context
}

// Connect initializes Redis connection
func Connect(config *configs.RedisConfig) (*Cache, error) {
	client := redis.NewClient(&redis.Options{
		Addr:     config.Addr(),
		Password: config.Password,
		Username: config.Username, // Для Redis 6+
		DB:       config.DB,

		// Отключаем неподдерживаемые команды для Railway Redis
		DisableIndentity: true,
		IdentitySuffix:   "",
	})

	ctx := context.Background()

	// Test connection
	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}

	log.Println("✅ Redis connected successfully")

	return &Cache{
		Client: client,
		ctx:    ctx,
	}, nil
}

// Close closes Redis connection
func (c *Cache) Close() error {
	return c.Client.Close()
}

// Timeline cache methods

// AddToTimeline adds post ID to user's timeline (sorted set by timestamp)
func (c *Cache) AddToTimeline(userID string, postID string, timestamp int64) error {
	key := fmt.Sprintf("timeline:%s", userID)
	return c.Client.ZAdd(c.ctx, key, redis.Z{
		Score:  float64(timestamp),
		Member: postID,
	}).Err()
}

// GetTimeline retrieves posts from timeline (paginated)
func (c *Cache) GetTimeline(userID string, limit int, offset int) ([]string, error) {
	key := fmt.Sprintf("timeline:%s", userID)
	return c.Client.ZRevRange(c.ctx, key, int64(offset), int64(offset+limit-1)).Result()
}

// RemoveFromTimeline removes post from timeline
func (c *Cache) RemoveFromTimeline(userID string, postID string) error {
	key := fmt.Sprintf("timeline:%s", userID)
	return c.Client.ZRem(c.ctx, key, postID).Err()
}

// SetTimelineExpiry sets expiry for timeline cache (24 hours default)
func (c *Cache) SetTimelineExpiry(userID string, duration time.Duration) error {
	key := fmt.Sprintf("timeline:%s", userID)
	return c.Client.Expire(c.ctx, key, duration).Err()
}

// Session cache methods

// SetSession stores session data
func (c *Cache) SetSession(key string, value string, expiry time.Duration) error {
	return c.Client.Set(c.ctx, key, value, expiry).Err()
}

// GetSession retrieves session data
func (c *Cache) GetSession(key string) (string, error) {
	return c.Client.Get(c.ctx, key).Result()
}

// DeleteSession removes session
func (c *Cache) DeleteSession(key string) error {
	return c.Client.Del(c.ctx, key).Err()
}

// Rate limiting

// CheckRateLimit checks if rate limit is exceeded
func (c *Cache) CheckRateLimit(key string, limit int, window time.Duration) (bool, error) {
	count, err := c.Client.Incr(c.ctx, key).Result()
	if err != nil {
		return false, err
	}

	if count == 1 {
		c.Client.Expire(c.ctx, key, window)
	}

	return count <= int64(limit), nil
}

// Cache invalidation

// InvalidateUserCache invalidates all cache for a user
func (c *Cache) InvalidateUserCache(userID string) error {
	pattern := fmt.Sprintf("*%s*", userID)
	iter := c.Client.Scan(c.ctx, 0, pattern, 0).Iterator()

	for iter.Next(c.ctx) {
		if err := c.Client.Del(c.ctx, iter.Val()).Err(); err != nil {
			return err
		}
	}

	return iter.Err()
}

// Pub/Sub for real-time notifications

// PublishNotification publishes notification to channel
func (c *Cache) PublishNotification(channel string, message string) error {
	return c.Client.Publish(c.ctx, channel, message).Err()
}

// SubscribeNotifications subscribes to notification channel
func (c *Cache) SubscribeNotifications(channel string) *redis.PubSub {
	return c.Client.Subscribe(c.ctx, channel)
}
