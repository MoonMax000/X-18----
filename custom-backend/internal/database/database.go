package database

import (
	"fmt"
	"log"

	"custom-backend/configs"
	"custom-backend/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type Database struct {
	DB *gorm.DB
}

// Connect initializes database connection
func Connect(config *configs.DatabaseConfig) (*Database, error) {
	dsn := config.DSN()

	// Configure GORM logger
	logLevel := logger.Info
	if config.SSLMode == "disable" {
		logLevel = logger.Silent
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("✅ Database connected successfully")

	return &Database{DB: db}, nil
}

// AutoMigrate runs all database migrations
func (d *Database) AutoMigrate() error {
	log.Println("🔄 Running database migrations...")

	// Run GORM AutoMigrate for models
	err := d.DB.AutoMigrate(
		&models.User{},
		&models.Post{},
		&models.Follow{},
		&models.Like{},
		&models.Retweet{},
		&models.Bookmark{},
		&models.Notification{},
		&models.Media{},
		&models.Session{},
		&models.Subscription{},
		&models.Purchase{},
		&models.News{},
		&models.VerificationCode{},
		&models.ReferralCode{},
		&models.ReferralInvitation{},
		&models.ReferralReward{},
	)

	if err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	// Apply custom SQL migrations that GORM might miss
	log.Println("🔧 Applying custom SQL migrations...")

	// Migration 017: OAuth fields (GORM sometimes doesn't add new columns to existing tables)
	d.DB.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50)")
	d.DB.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider_id VARCHAR(255)")
	d.DB.Exec("CREATE INDEX IF NOT EXISTS idx_users_oauth_provider ON users(oauth_provider, oauth_provider_id)")
	d.DB.Exec("ALTER TABLE users ALTER COLUMN password DROP NOT NULL")

	// Set admin role for specific email (for testing/development)
	adminEmail := "admin@gmail.com"
	result := d.DB.Exec("UPDATE users SET role = 'admin' WHERE email = ? AND (role IS NULL OR role = '')", adminEmail)
	if result.RowsAffected > 0 {
		log.Printf("✅ Admin role set for %s", adminEmail)
	}

	log.Println("✅ Migrations completed successfully")
	return nil
}

// Close closes the database connection
func (d *Database) Close() error {
	sqlDB, err := d.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

// Ping checks if database is accessible
func (d *Database) Ping() error {
	sqlDB, err := d.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Ping()
}
