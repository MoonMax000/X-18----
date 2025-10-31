package services

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"custom-backend/internal/cache"
	"custom-backend/internal/models"
	"gorm.io/gorm"
)

// AccountService handles account lifecycle operations
type AccountService struct {
	db    *gorm.DB
	cache *cache.Cache
}

// NewAccountService creates a new account service
func NewAccountService(db *gorm.DB, cache *cache.Cache) *AccountService {
	return &AccountService{
		db:    db,
		cache: cache,
	}
}

// DeactivateAccount marks an account for deactivation with 30-day recovery period
//
// When a user deactivates their account:
// - Account is marked as deactivated with current timestamp
// - Deletion is scheduled for 30 days from now
// - User can still log in during recovery period to restore account
// - After 30 days, a cleanup job will permanently delete the account
//
// Parameters:
//   - userID: UUID of the user to deactivate
//   - reason: Optional reason for deactivation (for analytics)
//
// Returns:
//   - deletionDate: The scheduled deletion date (30 days from now)
//   - error: Any error that occurred
func (as *AccountService) DeactivateAccount(userID uuid.UUID, reason string) (*time.Time, error) {
	// Check if user exists
	var user models.User
	if err := as.db.First(&user, "id = ?", userID).Error; err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// Check if already deactivated
	if user.DeactivatedAt != nil {
		return user.DeletionScheduledAt, fmt.Errorf("account is already deactivated")
	}

	// Calculate deletion date (30 days from now)
	now := time.Now()
	deletionDate := now.Add(30 * 24 * time.Hour) // 30 days

	// Update user record
	if err := as.db.Model(&user).Updates(map[string]interface{}{
		"deactivated_at":        now,
		"deletion_scheduled_at": deletionDate,
	}).Error; err != nil {
		return nil, fmt.Errorf("failed to deactivate account: %w", err)
	}

	// Log the deactivation (optional - for analytics/audit trail)
	// You could create a separate table for account actions if needed
	fmt.Printf("Account deactivated - User ID: %s, Reason: %s, Deletion scheduled: %s\n",
		userID, reason, deletionDate.Format(time.RFC3339))

	// Clear any cached user data
	cacheKey := fmt.Sprintf("user:%s", userID.String())
	as.cache.Delete(cacheKey)

	return &deletionDate, nil
}

// RestoreAccount restores a deactivated account during the recovery period
//
// This allows users to recover their account within 30 days of deactivation.
// If the account is permanently deleted (after 30 days), this will fail.
//
// Parameters:
//   - userID: UUID of the user to restore
//
// Returns:
//   - error: Any error that occurred (e.g., account not found, not deactivated, or past recovery period)
func (as *AccountService) RestoreAccount(userID uuid.UUID) error {
	// Check if user exists
	var user models.User
	if err := as.db.First(&user, "id = ?", userID).Error; err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	// Check if account is deactivated
	if user.DeactivatedAt == nil {
		return fmt.Errorf("account is not deactivated")
	}

	// Check if recovery period has expired
	if user.DeletionScheduledAt != nil && time.Now().After(*user.DeletionScheduledAt) {
		return fmt.Errorf("recovery period has expired, account cannot be restored")
	}

	// Restore the account by clearing deactivation timestamps
	if err := as.db.Model(&user).Updates(map[string]interface{}{
		"deactivated_at":        nil,
		"deletion_scheduled_at": nil,
	}).Error; err != nil {
		return fmt.Errorf("failed to restore account: %w", err)
	}

	// Log the restoration
	fmt.Printf("Account restored - User ID: %s\n", userID)

	// Clear any cached data
	cacheKey := fmt.Sprintf("user:%s", userID.String())
	as.cache.Delete(cacheKey)

	return nil
}

// PermanentlyDeleteAccount permanently deletes a user account and all associated data
//
// This should ONLY be called:
// 1. By the cleanup service after the 30-day recovery period
// 2. By admin for immediate deletion (with proper authorization)
//
// WARNING: This operation is IRREVERSIBLE
//
// The deletion process removes:
// - User profile data
// - All user posts and comments
// - All user relationships (follows, blocks)
// - All user sessions
// - All user media files
// - Login attempts and security logs
//
// Parameters:
//   - userID: UUID of the user to delete
//
// Returns:
//   - error: Any error that occurred during deletion
func (as *AccountService) PermanentlyDeleteAccount(userID uuid.UUID) error {
	// Check if user exists
	var user models.User
	if err := as.db.First(&user, "id = ?", userID).Error; err != nil {
		return fmt.Errorf("user not found: %w", err)
	}

	// Start a transaction for atomic deletion
	tx := as.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Delete user relationships (follows)
	if err := tx.Where("follower_id = ? OR following_id = ?", userID, userID).Delete(&models.Follow{}).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete follows: %w", err)
	}

	// Delete user likes
	if err := tx.Where("user_id = ?", userID).Delete(&models.Like{}).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete likes: %w", err)
	}

	// Delete user retweets
	if err := tx.Where("user_id = ?", userID).Delete(&models.Retweet{}).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete retweets: %w", err)
	}

	// Delete user bookmarks
	if err := tx.Where("user_id = ?", userID).Delete(&models.Bookmark{}).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete bookmarks: %w", err)
	}

	// Delete user notifications
	if err := tx.Where("user_id = ? OR from_user_id = ?", userID, userID).Delete(&models.Notification{}).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete notifications: %w", err)
	}

	// Delete user media
	if err := tx.Where("user_id = ?", userID).Delete(&models.Media{}).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete media: %w", err)
	}

	// Delete user posts
	if err := tx.Where("user_id = ?", userID).Delete(&models.Post{}).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete posts: %w", err)
	}

	// Delete user sessions
	if err := tx.Where("user_id = ?", userID).Delete(&models.Session{}).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete sessions: %w", err)
	}

	// Delete login attempts
	if err := tx.Where("user_id = ?", userID).Delete(&models.LoginAttempt{}).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete login attempts: %w", err)
	}

	// Delete user lockouts
	if err := tx.Where("user_id = ?", userID).Delete(&models.UserLockout{}).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete lockouts: %w", err)
	}

	// Delete verification codes
	if err := tx.Where("user_id = ?", userID).Delete(&models.VerificationCode{}).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete verification codes: %w", err)
	}

	// Finally, delete the user
	if err := tx.Delete(&user).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to delete user: %w", err)
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit deletion: %w", err)
	}

	// Clear any cached data
	cacheKey := fmt.Sprintf("user:%s", userID.String())
	as.cache.Delete(cacheKey)

	// Log the permanent deletion
	fmt.Printf("Account permanently deleted - User ID: %s, Email: %s\n", userID, user.Email)

	// TODO: Delete user media files from storage
	// This should be implemented based on your storage solution (local, S3, etc.)
	// Example:
	// if err := as.deleteUserMediaFiles(userID); err != nil {
	//     log.Printf("Warning: Failed to delete media files for user %s: %v", userID, err)
	// }

	return nil
}

// GetDeactivatedAccounts retrieves all accounts scheduled for deletion
//
// This is used by the cleanup service to find accounts that should be permanently deleted.
// Returns accounts where:
// - deactivated_at is not null
// - deletion_scheduled_at is in the past
//
// Returns:
//   - []models.User: List of users to be deleted
//   - error: Any error that occurred
func (as *AccountService) GetDeactivatedAccounts() ([]models.User, error) {
	var users []models.User
	now := time.Now()

	err := as.db.Where(
		"deactivated_at IS NOT NULL AND deletion_scheduled_at < ?",
		now,
	).Find(&users).Error

	if err != nil {
		return nil, fmt.Errorf("failed to fetch deactivated accounts: %w", err)
	}

	return users, nil
}

// IsAccountDeactivated checks if an account is currently deactivated
//
// Parameters:
//   - userID: UUID of the user to check
//
// Returns:
//   - bool: true if account is deactivated
//   - *time.Time: scheduled deletion date if deactivated
//   - error: Any error that occurred
func (as *AccountService) IsAccountDeactivated(userID uuid.UUID) (bool, *time.Time, error) {
	var user models.User
	if err := as.db.First(&user, "id = ?", userID).Error; err != nil {
		return false, nil, fmt.Errorf("user not found: %w", err)
	}

	if user.DeactivatedAt == nil {
		return false, nil, nil
	}

	return true, user.DeletionScheduledAt, nil
}

// GetAccountRecoveryInfo returns information about account recovery status
//
// Parameters:
//   - userID: UUID of the user
//
// Returns:
//   - deactivatedAt: When the account was deactivated
//   - deletionScheduledAt: When the account will be permanently deleted
//   - daysRemaining: Number of days remaining in recovery period
//   - error: Any error that occurred
func (as *AccountService) GetAccountRecoveryInfo(userID uuid.UUID) (*time.Time, *time.Time, int, error) {
	var user models.User
	if err := as.db.First(&user, "id = ?", userID).Error; err != nil {
		return nil, nil, 0, fmt.Errorf("user not found: %w", err)
	}

	if user.DeactivatedAt == nil {
		return nil, nil, 0, fmt.Errorf("account is not deactivated")
	}

	// Calculate days remaining
	daysRemaining := 0
	if user.DeletionScheduledAt != nil {
		duration := time.Until(*user.DeletionScheduledAt)
		daysRemaining = int(duration.Hours() / 24)
		if daysRemaining < 0 {
			daysRemaining = 0
		}
	}

	return user.DeactivatedAt, user.DeletionScheduledAt, daysRemaining, nil
}
