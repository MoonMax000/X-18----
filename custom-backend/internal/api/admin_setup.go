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

	// Check if admin already exists
	var existingUser models.User
	if err := h.db.DB.Where("id = ?", adminID).First(&existingUser).Error; err == nil {
		log.Println("⚠️  Admin user already exists")
		return c.JSON(fiber.Map{
			"message": "Admin user already exists",
			"user": fiber.Map{
				"id":       existingUser.ID,
				"email":    existingUser.Email,
				"username": existingUser.Username,
				"role":     existingUser.Role,
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
