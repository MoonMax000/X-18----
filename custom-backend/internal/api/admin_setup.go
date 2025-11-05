package api

import (
	"log"
	"time"

	"custom-backend/internal/database"
	"custom-backend/internal/models"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AdminSetupHandler struct {
	db *database.Database
}

func NewAdminSetupHandler(db *database.Database) *AdminSetupHandler {
	return &AdminSetupHandler{db: db}
}

// CreateAdminUser creates the permanent admin user
// This is a temporary endpoint for initial setup
// POST /api/setup/admin
func (h *AdminSetupHandler) CreateAdminUser(c *fiber.Ctx) error {
	log.Println("🔧 Creating permanent admin user...")

	// Fixed admin ID
	adminID := uuid.MustParse("00000000-0000-0000-0000-000000000001")
	referralID := uuid.MustParse("00000000-0000-0000-0000-000000000002")

	// Check if user with this email already exists
	var existingUser models.User
	if err := h.db.DB.Where("email = ?", "kyvaldov@gmail.com").First(&existingUser).Error; err == nil {
		log.Println("⚠️  User exists, updating password and role...")

		// Update password and ensure admin role
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("Admin123!"), bcrypt.DefaultCost)
		if err != nil {
			log.Printf("❌ Failed to hash password: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"error": "Failed to hash password",
			})
		}

		existingUser.Password = string(hashedPassword)
		existingUser.Role = "admin"
		existingUser.IsEmailVerified = true

		if err := h.db.DB.Save(&existingUser).Error; err != nil {
			log.Printf("❌ Failed to update user: %v", err)
			return c.Status(500).JSON(fiber.Map{
				"error": "Failed to update admin user",
			})
		}

		log.Println("✅ Admin user updated successfully")
		return c.JSON(fiber.Map{
			"message": "Admin user updated successfully",
			"user": fiber.Map{
				"id":       existingUser.ID,
				"email":    existingUser.Email,
				"username": existingUser.Username,
				"role":     existingUser.Role,
			},
			"credentials": fiber.Map{
				"email":    "kyvaldov@gmail.com",
				"password": "Admin123!",
			},
		})
	}

	// Password: Admin123!
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("Admin123!"), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("❌ Failed to hash password: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error": "Failed to hash password",
		})
	}

	// Create admin user
	admin := models.User{
		ID:              adminID,
		Username:        "admin",
		Email:           "kyvaldov@gmail.com",
		Password:        string(hashedPassword),
		DisplayName:     "System Admin",
		Role:            "admin",
		IsEmailVerified: true,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	if err := h.db.DB.Create(&admin).Error; err != nil {
		log.Printf("❌ Failed to create admin user: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error":   "Failed to create admin user",
			"details": err.Error(),
		})
	}

	log.Println("✅ Admin user created successfully")

	// Create referral code for admin
	referralCode := models.ReferralCode{
		ID:        referralID,
		UserID:    adminID,
		Code:      "ADMIN2024",
		TotalUses: 0,
		IsActive:  true,
		CreatedAt: time.Now(),
	}

	if err := h.db.DB.Create(&referralCode).Error; err != nil {
		log.Printf("⚠️  Failed to create referral code: %v", err)
		// Don't fail if referral code creation fails
	} else {
		log.Println("✅ Referral code created successfully")
	}

	return c.JSON(fiber.Map{
		"message": "Admin user created successfully",
		"user": fiber.Map{
			"id":       admin.ID,
			"email":    admin.Email,
			"username": admin.Username,
			"role":     admin.Role,
		},
		"credentials": fiber.Map{
			"email":    "kyvaldov@gmail.com",
			"password": "Admin123!",
		},
	})
}

// CreateDBAgent creates the db_agent PostgreSQL user for IAM authentication
// This is a one-time setup endpoint
// POST /api/setup/db-agent
func (h *AdminSetupHandler) CreateDBAgent(c *fiber.Ctx) error {
	log.Println("🔧 Creating db_agent PostgreSQL user for IAM authentication...")

	// SQL to create db_agent user with IAM authentication
	sql := `
	DO $$
	BEGIN
		-- Check if user exists
		IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'db_agent') THEN
			-- Create user
			CREATE ROLE db_agent WITH LOGIN;
			RAISE NOTICE 'User db_agent created';
		ELSE
			RAISE NOTICE 'User db_agent already exists';
		END IF;

		-- Grant IAM authentication role
		GRANT rds_iam TO db_agent;
		
		-- Grant database access
		GRANT CONNECT ON DATABASE tyriantrade TO db_agent;
		
		-- Grant schema usage
		GRANT USAGE ON SCHEMA public TO db_agent;
		
		-- Grant table permissions
		GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO db_agent;
		
		-- Grant sequence permissions
		GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO db_agent;
		
		-- Set default privileges for future tables
		ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO db_agent;
		ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO db_agent;
		
		RAISE NOTICE 'Permissions granted successfully';
	END
	$$;
	`

	// Execute SQL
	if err := h.db.DB.Exec(sql).Error; err != nil {
		log.Printf("❌ Failed to create db_agent user: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"error":   "Failed to create db_agent user",
			"details": err.Error(),
		})
	}

	log.Println("✅ db_agent user created successfully")

	return c.JSON(fiber.Map{
		"message": "db_agent user created successfully",
		"details": "User can now authenticate using IAM tokens",
		"usage": fiber.Map{
			"generate_token": "aws rds generate-db-auth-token --hostname tyriantrade-db.c01iqwikc9ht.us-east-1.rds.amazonaws.com --port 5432 --region us-east-1 --username db_agent",
			"connect":        "psql 'host=tyriantrade-db.c01iqwikc9ht.us-east-1.rds.amazonaws.com port=5432 dbname=tyriantrade user=db_agent sslmode=require' (with PGPASSWORD set to token)",
		},
	})
}
