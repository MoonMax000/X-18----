package services

import (
	"fmt"
	"log"
	"time"

	"github.com/yourusername/x18-backend/internal/cache"
	"gorm.io/gorm"
)

// CleanupService handles periodic cleanup tasks
type CleanupService struct {
	db             *gorm.DB
	cache          *cache.Cache
	accountService *AccountService
	sessionService *SessionService
}

// NewCleanupService creates a new cleanup service
func NewCleanupService(db *gorm.DB, cache *cache.Cache) *CleanupService {
	return &CleanupService{
		db:             db,
		cache:          cache,
		accountService: NewAccountService(db, cache),
		sessionService: NewSessionService(db, cache),
	}
}

// StartScheduledCleanup starts all scheduled cleanup tasks
//
// This should be called once during application startup.
// It runs cleanup tasks on a regular schedule in background goroutines.
//
// Schedule:
//   - Account deletion: Every 6 hours
//   - Session cleanup: Every 1 hour
//   - Cache cleanup: Every 30 minutes
func (cs *CleanupService) StartScheduledCleanup() {
	log.Println("[Cleanup] Starting scheduled cleanup tasks...")

	// Start account deletion cleanup (every 6 hours)
	go cs.scheduleTask("Account Deletion", 6*time.Hour, cs.CleanupDeactivatedAccounts)

	// Start session cleanup (every 1 hour)
	go cs.scheduleTask("Session Cleanup", 1*time.Hour, cs.CleanupExpiredSessions)

	// Start cache cleanup (every 30 minutes)
	go cs.scheduleTask("Cache Cleanup", 30*time.Minute, cs.CleanupExpiredCache)

	log.Println("[Cleanup] All scheduled cleanup tasks started")
}

// scheduleTask runs a cleanup task on a regular interval
func (cs *CleanupService) scheduleTask(name string, interval time.Duration, task func() error) {
	// Run immediately on startup
	log.Printf("[Cleanup] Running initial %s...\n", name)
	if err := task(); err != nil {
		log.Printf("[Cleanup] Error during initial %s: %v\n", name, err)
	}

	// Then run on schedule
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for range ticker.C {
		log.Printf("[Cleanup] Running scheduled %s...\n", name)
		if err := task(); err != nil {
			log.Printf("[Cleanup] Error during %s: %v\n", name, err)
		}
	}
}

// CleanupDeactivatedAccounts permanently deletes accounts past their recovery period
//
// This is the core function for the 30-day account deletion feature.
// It finds all accounts where:
//   - deactivated_at is not null
//   - deletion_scheduled_at is in the past
//
// Then permanently deletes them including all associated data.
//
// Returns:
//   - error: Any error that occurred during cleanup
func (cs *CleanupService) CleanupDeactivatedAccounts() error {
	log.Println("[Cleanup] Starting deactivated accounts cleanup...")

	// Get all accounts scheduled for deletion
	accounts, err := cs.accountService.GetDeactivatedAccounts()
	if err != nil {
		return fmt.Errorf("failed to fetch deactivated accounts: %w", err)
	}

	if len(accounts) == 0 {
		log.Println("[Cleanup] No accounts to delete")
		return nil
	}

	log.Printf("[Cleanup] Found %d account(s) to delete\n", len(accounts))

	// Delete each account
	deletedCount := 0
	failedCount := 0

	for _, user := range accounts {
		log.Printf("[Cleanup] Deleting account: %s (Email: %s)\n", user.ID, user.Email)

		err := cs.accountService.PermanentlyDeleteAccount(user.ID)
		if err != nil {
			log.Printf("[Cleanup] Failed to delete account %s: %v\n", user.ID, err)
			failedCount++
			continue
		}

		deletedCount++
		log.Printf("[Cleanup] Successfully deleted account: %s\n", user.ID)
	}

	log.Printf("[Cleanup] Account deletion complete. Deleted: %d, Failed: %d\n",
		deletedCount, failedCount)

	return nil
}

// CleanupExpiredSessions removes expired sessions from the database
//
// This helps keep the database clean and improves performance.
// Sessions are considered expired when their expires_at timestamp is in the past.
//
// Returns:
//   - error: Any error that occurred during cleanup
func (cs *CleanupService) CleanupExpiredSessions() error {
	log.Println("[Cleanup] Starting expired sessions cleanup...")

	err := cs.sessionService.CleanupExpiredSessions()
	if err != nil {
		return fmt.Errorf("failed to cleanup sessions: %w", err)
	}

	log.Println("[Cleanup] Expired sessions cleanup complete")
	return nil
}

// CleanupExpiredCache removes expired items from the Redis cache
//
// While Redis automatically expires keys with TTL, this provides an additional
// cleanup mechanism for any stale cache entries.
//
// Returns:
//   - error: Any error that occurred during cleanup
func (cs *CleanupService) CleanupExpiredCache() error {
	log.Println("[Cleanup] Starting cache cleanup...")

	// Redis handles TTL automatically, but we can add custom cleanup logic here
	// For example, cleanup specific cache patterns

	// Example: Cleanup old 2FA codes (though they should auto-expire)
	// pattern := "2fa:*"
	// ... cleanup logic ...

	log.Println("[Cleanup] Cache cleanup complete")
	return nil
}

// ManualCleanupDeactivatedAccounts manually triggers account cleanup
//
// This can be called by an admin API endpoint for immediate cleanup
// without waiting for the scheduled task.
//
// Returns:
//   - deletedCount: Number of accounts deleted
//   - failedCount: Number of deletions that failed
//   - error: Any error that occurred
func (cs *CleanupService) ManualCleanupDeactivatedAccounts() (int, int, error) {
	log.Println("[Cleanup] Manual account cleanup triggered")

	accounts, err := cs.accountService.GetDeactivatedAccounts()
	if err != nil {
		return 0, 0, fmt.Errorf("failed to fetch deactivated accounts: %w", err)
	}

	if len(accounts) == 0 {
		return 0, 0, nil
	}

	deletedCount := 0
	failedCount := 0

	for _, user := range accounts {
		err := cs.accountService.PermanentlyDeleteAccount(user.ID)
		if err != nil {
			log.Printf("[Cleanup] Failed to delete account %s: %v\n", user.ID, err)
			failedCount++
			continue
		}
		deletedCount++
	}

	log.Printf("[Cleanup] Manual cleanup complete. Deleted: %d, Failed: %d\n",
		deletedCount, failedCount)

	return deletedCount, failedCount, nil
}

// GetCleanupStats returns statistics about cleanup operations
//
// Returns:
//   - pendingDeletions: Number of accounts pending deletion
//   - expiredSessions: Number of expired sessions
//   - error: Any error that occurred
func (cs *CleanupService) GetCleanupStats() (map[string]int, error) {
	stats := make(map[string]int)

	// Count accounts pending deletion
	accounts, err := cs.accountService.GetDeactivatedAccounts()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch accounts: %w", err)
	}
	stats["pending_deletions"] = len(accounts)

	// Count expired sessions
	var count int64
	err = cs.db.Model(&struct {
		ExpiresAt time.Time `gorm:"column:expires_at"`
	}{}).
		Table("sessions").
		Where("expires_at < ?", time.Now()).
		Count(&count).Error

	if err != nil {
		return nil, fmt.Errorf("failed to count sessions: %w", err)
	}
	stats["expired_sessions"] = int(count)

	return stats, nil
}

// CleanupOldLoginAttempts removes old login attempt records
//
// Keeps the database clean by removing login attempts older than 90 days.
// This is called less frequently as part of general maintenance.
//
// Returns:
//   - error: Any error that occurred during cleanup
func (cs *CleanupService) CleanupOldLoginAttempts() error {
	log.Println("[Cleanup] Starting old login attempts cleanup...")

	// Delete login attempts older than 90 days
	cutoffDate := time.Now().AddDate(0, 0, -90)

	result := cs.db.Exec(
		"DELETE FROM login_attempts WHERE attempted_at < ?",
		cutoffDate,
	)

	if result.Error != nil {
		return fmt.Errorf("failed to cleanup login attempts: %w", result.Error)
	}

	log.Printf("[Cleanup] Deleted %d old login attempts\n", result.RowsAffected)
	return nil
}

// CleanupOldNotifications removes read notifications older than 30 days
//
// Keeps the notifications table manageable while preserving recent history.
//
// Returns:
//   - error: Any error that occurred during cleanup
func (cs *CleanupService) CleanupOldNotifications() error {
	log.Println("[Cleanup] Starting old notifications cleanup...")

	// Delete read notifications older than 30 days
	cutoffDate := time.Now().AddDate(0, 0, -30)

	result := cs.db.Exec(
		"DELETE FROM notifications WHERE read = true AND created_at < ?",
		cutoffDate,
	)

	if result.Error != nil {
		return fmt.Errorf("failed to cleanup notifications: %w", result.Error)
	}

	log.Printf("[Cleanup] Deleted %d old notifications\n", result.RowsAffected)
	return nil
}

// PerformFullCleanup runs all cleanup tasks sequentially
//
// This is useful for maintenance windows or admin-triggered full cleanup.
//
// Returns:
//   - error: Any error that occurred during cleanup
func (cs *CleanupService) PerformFullCleanup() error {
	log.Println("[Cleanup] Starting full cleanup...")

	tasks := []struct {
		name string
		task func() error
	}{
		{"Deactivated Accounts", cs.CleanupDeactivatedAccounts},
		{"Expired Sessions", cs.CleanupExpiredSessions},
		{"Expired Cache", cs.CleanupExpiredCache},
		{"Old Login Attempts", cs.CleanupOldLoginAttempts},
		{"Old Notifications", cs.CleanupOldNotifications},
	}

	successCount := 0
	failedCount := 0

	for _, t := range tasks {
		log.Printf("[Cleanup] Running: %s\n", t.name)
		if err := t.task(); err != nil {
			log.Printf("[Cleanup] Failed: %s - %v\n", t.name, err)
			failedCount++
		} else {
			successCount++
		}
	}

	log.Printf("[Cleanup] Full cleanup complete. Success: %d, Failed: %d\n",
		successCount, failedCount)

	if failedCount > 0 {
		return fmt.Errorf("some cleanup tasks failed: %d/%d",
			failedCount, len(tasks))
	}

	return nil
}
