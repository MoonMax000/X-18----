package api

import (
	"log"

	"custom-backend/internal/database"

	"github.com/gofiber/fiber/v2"
)

type AdminCleanupHandler struct {
	db *database.Database
}

func NewAdminCleanupHandler(db *database.Database) *AdminCleanupHandler {
	return &AdminCleanupHandler{db: db}
}

// CleanupAllData deletes all users and related data
// WARNING: This is for development/testing only!
// DELETE /api/admin/cleanup/all
func (h *AdminCleanupHandler) CleanupAllData(c *fiber.Ctx) error {
	log.Println("⚠️  CLEANUP: Deleting all users and posts...")

	// Delete in correct order to avoid foreign key violations
	tables := []string{
		"notifications",
		"sessions",
		"referral_codes",
		"follows",
		"comments",
		"likes",
		"retweets",
		"bookmarks",
		"media",
		"posts",
		"users",
	}

	deletedTables := []string{}
	skippedTables := []string{}

	for _, table := range tables {
		result := h.db.DB.Exec("DELETE FROM " + table)
		if result.Error != nil {
			// Check if table doesn't exist (ignore this error)
			if result.Error.Error() != "" && (result.Error.Error() == "ERROR: relation \""+table+"\" does not exist (SQLSTATE 42P01)" ||
				result.Error.Error() == "relation \""+table+"\" does not exist") {
				log.Printf("⚠️  Skipping non-existent table: %s", table)
				skippedTables = append(skippedTables, table)
				continue
			}
			log.Printf("❌ Failed to delete from %s: %v", table, result.Error)
			return c.Status(500).JSON(fiber.Map{
				"error":   "Failed to cleanup database",
				"table":   table,
				"details": result.Error.Error(),
			})
		}
		log.Printf("✅ Deleted all from %s (rows: %d)", table, result.RowsAffected)
		deletedTables = append(deletedTables, table)
	}

	log.Println("✅ Cleanup completed successfully")

	return c.JSON(fiber.Map{
		"message":        "Cleanup completed successfully",
		"deleted_tables": deletedTables,
		"skipped_tables": skippedTables,
	})
}
