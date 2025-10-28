package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"

	"github.com/yourusername/x18-backend/configs"
	"github.com/yourusername/x18-backend/internal/api"
	"github.com/yourusername/x18-backend/internal/cache"
	"github.com/yourusername/x18-backend/internal/database"
	"github.com/yourusername/x18-backend/pkg/middleware"
)

func main() {
	log.Println("🚀 Starting X-18 Backend Server...")

	// Load configuration
	cfg := configs.LoadConfig()
	log.Printf("✅ Configuration loaded (ENV: %s)", cfg.Server.Env)

	// Connect to PostgreSQL
	db, err := database.Connect(&cfg.Database)
	if err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}
	defer db.Close()
	log.Println("✅ PostgreSQL connected")

	// Run migrations
	if err := db.AutoMigrate(); err != nil {
		log.Fatalf("❌ Failed to run migrations: %v", err)
	}
	log.Println("✅ Database migrations completed")

	// Connect to Redis
	redisCache, err := cache.Connect(&cfg.Redis)
	if err != nil {
		log.Fatalf("❌ Failed to connect to Redis: %v", err)
	}
	defer redisCache.Close()
	log.Println("✅ Redis connected")

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      "X-18 Backend API",
		ServerHeader: "X-18",
		ErrorHandler: customErrorHandler,
	})

	// Global middleware
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${method} ${path} (${latency})\n",
	}))

	// Get CORS origin from environment or use localhost for development
	corsOrigin := os.Getenv("CORS_ORIGIN")
	if corsOrigin == "" {
		corsOrigin = "http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000"
	}

	log.Printf("✅ CORS configured for: %s", corsOrigin)
	app.Use(cors.New(cors.Config{
		AllowOrigins:     corsOrigin,
		AllowMethods:     "GET,POST,PUT,PATCH,DELETE,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization",
		AllowCredentials: true,
		MaxAge:           3600,
	}))

	// Health check endpoint
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
			"env":    cfg.Server.Env,
		})
	})

	// API routes
	apiGroup := app.Group("/api")

	// Version info
	apiGroup.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"name":    "X-18 Backend API",
			"version": "1.0.0",
			"status":  "operational",
		})
	})

	// Initialize handlers
	authHandler := api.NewAuthHandler(db, redisCache, cfg)
	usersHandler := api.NewUsersHandler(db, redisCache)
	postsHandler := api.NewPostsHandler(db)
	timelineHandler := api.NewTimelineHandler(db)
	notificationsHandler := api.NewNotificationsHandler(db)
	mediaHandler := api.NewMediaHandler(db)
	searchHandler := api.NewSearchHandler(db)
	widgetsHandler := api.NewWidgetsHandler(db)
	postMenuHandler := api.NewPostMenuHandler(db)
	adminHandler := api.NewAdminHandler(db)

	// Auth routes (public)
	auth := apiGroup.Group("/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)
	auth.Post("/refresh", authHandler.RefreshToken)

	// Protected auth routes
	auth.Post("/logout", middleware.JWTMiddleware(cfg), authHandler.Logout)

	// Users routes
	users := apiGroup.Group("/users")
	users.Get("/me", middleware.JWTMiddleware(cfg), usersHandler.GetMe)
	users.Patch("/me", middleware.JWTMiddleware(cfg), usersHandler.UpdateProfile)
	users.Get("/username/:username", usersHandler.GetUserByUsername)
	users.Get("/:id", usersHandler.GetUser)
	users.Get("/:id/posts", usersHandler.GetUserPosts)
	users.Get("/:id/followers", usersHandler.GetFollowers)
	users.Get("/:id/following", usersHandler.GetFollowing)
	users.Post("/:id/follow", middleware.JWTMiddleware(cfg), usersHandler.FollowUser)
	users.Delete("/:id/follow", middleware.JWTMiddleware(cfg), usersHandler.UnfollowUser)

	// Posts routes
	posts := apiGroup.Group("/posts")
	posts.Post("/", middleware.JWTMiddleware(cfg), postsHandler.CreatePost)
	posts.Get("/:id", postsHandler.GetPost)
	posts.Get("/:id/replies", postsHandler.GetPostReplies)
	posts.Delete("/:id", middleware.JWTMiddleware(cfg), postsHandler.DeletePost)
	posts.Post("/:id/like", middleware.JWTMiddleware(cfg), postsHandler.LikePost)
	posts.Delete("/:id/like", middleware.JWTMiddleware(cfg), postsHandler.UnlikePost)
	posts.Post("/:id/retweet", middleware.JWTMiddleware(cfg), postsHandler.RetweetPost)
	posts.Delete("/:id/retweet", middleware.JWTMiddleware(cfg), postsHandler.UnretweetPost)
	posts.Post("/:id/bookmark", middleware.JWTMiddleware(cfg), postsHandler.BookmarkPost)
	posts.Delete("/:id/bookmark", middleware.JWTMiddleware(cfg), postsHandler.UnbookmarkPost)

	// Bookmarks
	apiGroup.Get("/bookmarks", middleware.JWTMiddleware(cfg), postsHandler.GetUserBookmarks)

	// Timeline routes
	timeline := apiGroup.Group("/timeline")
	timeline.Get("/home", middleware.JWTMiddleware(cfg), timelineHandler.GetHomeTimeline)
	timeline.Get("/explore", timelineHandler.GetExploreTimeline)
	timeline.Get("/trending", timelineHandler.GetTrendingPosts)
	timeline.Get("/user/:id", timelineHandler.GetUserTimeline)
	timeline.Get("/search", timelineHandler.GetPostsByMetadata)

	// Notifications routes
	notifications := apiGroup.Group("/notifications", middleware.JWTMiddleware(cfg))
	notifications.Get("/", notificationsHandler.GetNotifications)
	notifications.Get("/unread-count", notificationsHandler.GetUnreadCount)
	notifications.Patch("/:id/read", notificationsHandler.MarkAsRead)
	notifications.Patch("/read-all", notificationsHandler.MarkAllAsRead)
	notifications.Delete("/:id", notificationsHandler.DeleteNotification)

	// Media routes
	media := apiGroup.Group("/media")
	media.Post("/upload", middleware.JWTMiddleware(cfg), mediaHandler.UploadMedia)
	media.Get("/:id", mediaHandler.GetMedia)
	media.Delete("/:id", middleware.JWTMiddleware(cfg), mediaHandler.DeleteMedia)
	media.Get("/user/:id", mediaHandler.GetUserMedia)

	// Search routes
	search := apiGroup.Group("/search")
	search.Get("/", searchHandler.Search)
	search.Get("/users", searchHandler.SearchUsers)
	search.Get("/posts", searchHandler.SearchPosts)
	search.Get("/hashtag/:tag", searchHandler.SearchHashtags)
	search.Get("/trending-hashtags", searchHandler.GetTrendingHashtags)

	// Widgets routes (public)
	widgets := apiGroup.Group("/widgets")
	widgets.Get("/news", widgetsHandler.GetNews)
	widgets.Get("/trending-tickers", widgetsHandler.GetTrendingTickers)
	widgets.Get("/top-authors", widgetsHandler.GetTopAuthors)

	// Widgets routes (protected)
	widgets.Get("/my-earnings", middleware.JWTMiddleware(cfg), widgetsHandler.GetMyEarnings)
	widgets.Get("/my-subscriptions", middleware.JWTMiddleware(cfg), widgetsHandler.GetMySubscriptions)
	widgets.Get("/my-activity", middleware.JWTMiddleware(cfg), widgetsHandler.GetMyActivity)

	// Post menu routes (protected)
	posts.Post("/:postId/pin", middleware.JWTMiddleware(cfg), postMenuHandler.PinPost)
	posts.Delete("/:postId/pin", middleware.JWTMiddleware(cfg), postMenuHandler.UnpinPost)
	posts.Post("/:postId/report", middleware.JWTMiddleware(cfg), postMenuHandler.ReportPost)
	posts.Get("/:postId/link", postMenuHandler.CopyPostLink)

	// User blocking routes
	users.Post("/:userId/block", middleware.JWTMiddleware(cfg), postMenuHandler.BlockUser)
	users.Delete("/:userId/block", middleware.JWTMiddleware(cfg), postMenuHandler.UnblockUser)
	users.Get("/blocked", middleware.JWTMiddleware(cfg), postMenuHandler.GetBlockedUsers)
	users.Get("/:userId/pinned-post", postMenuHandler.GetPinnedPost)

	// Admin routes (protected, admin only)
	admin := apiGroup.Group("/admin", middleware.JWTMiddleware(cfg), middleware.AdminOnly(db))

	// Admin - News management
	admin.Post("/news", adminHandler.CreateNews)
	admin.Get("/news", adminHandler.GetAllNews)
	admin.Put("/news/:id", adminHandler.UpdateNews)
	admin.Delete("/news/:id", adminHandler.DeleteNews)

	// Admin - User management
	admin.Get("/users", adminHandler.GetAllUsers)
	admin.Get("/users/:id", adminHandler.GetUserDetails)
	admin.Patch("/users/:id/role", adminHandler.UpdateUserRole)

	// Admin - Reports management
	admin.Get("/reports", adminHandler.GetReports)
	admin.Patch("/reports/:id", adminHandler.ReviewReport)

	// Admin - Statistics
	admin.Get("/stats", adminHandler.GetAdminStats)

	// Serve static media files
	app.Static("/storage/media", "./storage/media")

	// 404 handler
	app.Use(func(c *fiber.Ctx) error {
		return c.Status(404).JSON(fiber.Map{
			"error": "Route not found",
		})
	})

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
		<-sigChan

		log.Println("\n🛑 Shutting down server...")
		if err := app.Shutdown(); err != nil {
			log.Printf("❌ Server shutdown error: %v", err)
		}
	}()

	// Start server
	addr := cfg.Server.Host + ":" + cfg.Server.Port
	log.Printf("🚀 Server running on http://%s", addr)
	if err := app.Listen(addr); err != nil {
		log.Fatalf("❌ Server failed to start: %v", err)
	}
}

// customErrorHandler handles errors globally
func customErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
	}

	return c.Status(code).JSON(fiber.Map{
		"error": err.Error(),
	})
}
