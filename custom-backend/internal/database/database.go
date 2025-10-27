package database

import (
	"fmt"
	"log"

	"github.com/yourusername/x18-backend/configs"
	"github.com/yourusername/x18-backend/internal/models"
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
	)

	if err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
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
