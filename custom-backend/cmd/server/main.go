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
	"github.com/joho/godotenv"

	"custom-backend/configs"
	"custom-backend/internal/api"
	"custom-backend/internal/cache"
	"custom-backend/internal/database"
	"custom-backend/internal/services"
	"custom-backend/pkg/email"
	"custom-backend/pkg/middleware"
)

func main() {
	log.Println("🚀 Starting X-18 Backend Server...")

	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Printf("⚠️  Warning: .env file not found or could not be loaded: %v", err)
	} else {
		log.Println("✅ .env file loaded successfully")
	}

	// Load configuration
	cfg := configs.LoadConfig()
	log.Printf("✅ Configuration loaded (ENV: %s)", cfg.Server.Env)

	// Debug OAuth config
	if cfg.OAuth.Google.ClientID != "" {
		log.Printf("✅ Google OAuth configured (Client ID: %s...)", cfg.OAuth.Google.ClientID[:20])
	} else {
		log.Println("⚠️  Google OAuth NOT configured")
	}

	if cfg.OAuth.Apple.ClientID != "" {
		log.Printf("✅ Apple OAuth configured (Client ID: %s)", cfg.OAuth.Apple.ClientID)
	} else {
		log.Println("⚠️  Apple OAuth NOT configured")
	}

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

	// Global middleware with stack trace for debugging
	app.Use(recover.New(recover.Config{
		EnableStackTrace: true,
		StackTraceHandler: func(c *fiber.Ctx, e interface{}) {
			log.Printf("🔥 PANIC: %v", e)
		},
	}))
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

	// Initialize WebSocket hub
	api.InitWebSocketHub(redisCache)

	// Initialize email client based on EMAIL_PROVIDER
	var emailClient email.EmailClient
	emailProvider := os.Getenv("EMAIL_PROVIDER")
	if emailProvider == "" {
		emailProvider = "resend" // Default to Resend for backward compatibility
	}

	switch emailProvider {
	case "ses":
		// AWS SES configuration
		awsRegion := os.Getenv("AWS_REGION")
		if awsRegion == "" {
			awsRegion = "us-east-1"
		}
		sesFromEmail := os.Getenv("SES_FROM_EMAIL")
		if sesFromEmail == "" {
			sesFromEmail = "noreply@tyriantrade.com"
		}

		sesClient, err := email.NewSESClient(awsRegion, sesFromEmail, "Tyrian Trade")
		if err != nil {
			log.Fatalf("❌ Failed to initialize AWS SES client: %v", err)
		}
		emailClient = sesClient
		log.Printf("✅ AWS SES email client initialized (region: %s, from: %s)", awsRegion, sesFromEmail)

	case "resend":
		// Resend configuration
		resendAPIKey := os.Getenv("RESEND_API_KEY")
		resendFromEmail := os.Getenv("RESEND_FROM_EMAIL")
		if resendFromEmail == "" {
			resendFromEmail = "noreply@tyriantrade.com"
		}

		emailClient = email.NewResendClient(resendAPIKey, resendFromEmail, "Tyrian Trade")
		if resendAPIKey == "" {
			log.Println("⚠️  Warning: RESEND_API_KEY not set - email sending will be disabled")
		} else {
			log.Printf("✅ Resend email client initialized (from: %s)", resendFromEmail)
		}

	default:
		log.Fatalf("❌ Invalid EMAIL_PROVIDER: %s (must be 'ses' or 'resend')", emailProvider)
	}

	// Initialize handlers
	authHandler := api.NewAuthHandler(db, redisCache, cfg, emailClient)
	oauthHandler := api.NewOAuthHandler(db, redisCache, cfg)
	usersHandler := api.NewUsersHandler(db, redisCache)
	postsHandler := api.NewPostsHandler(db)
	timelineHandler := api.NewTimelineHandler(db)
	notificationsHandler := api.NewNotificationsHandler(db)
	notificationPreferencesHandler := api.NewNotificationPreferencesHandler(db)
	mediaHandler := api.NewMediaHandler(db)
	searchHandler := api.NewSearchHandler(db)
	widgetsHandler := api.NewWidgetsHandler(db)
	postMenuHandler := api.NewPostMenuHandler(db)
	adminHandler := api.NewAdminHandler(db)
	adminCleanupHandler := api.NewAdminCleanupHandler(db)
	adminSetupHandler := api.NewAdminSetupHandler(db)
	wsHandler := api.NewWebSocketHandler(db, redisCache, cfg)
	totpHandler := api.NewTOTPHandler(db.DB, redisCache)
	accountHandler := api.NewAccountHandler(db.DB, redisCache)
	protectedOpsHandler := api.NewProtectedOperationsHandler(db, redisCache, cfg)
	referralHandler := api.NewReferralHandler(db)
	profileStatsHandler := api.NewProfileStatsHandler(db)

	// Stripe webhook handler
	stripeWebhookSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")
	stripeSecretKey := os.Getenv("STRIPE_SECRET_KEY")
	if stripeWebhookSecret == "" {
		log.Println("⚠️  Warning: STRIPE_WEBHOOK_SECRET not set")
	}
	if stripeSecretKey == "" {
		log.Println("⚠️  Warning: STRIPE_SECRET_KEY not set")
	}
	stripeWebhookHandler := api.NewStripeWebhookHandler(db, stripeWebhookSecret, stripeSecretKey)

	// Create security service for TOTP middleware
	securityService := services.NewSecurityService(db.DB, redisCache)

	// Start cleanup service (background tasks)
	cleanupService := services.NewCleanupService(db.DB, redisCache)
	go cleanupService.StartScheduledCleanup()
	log.Println("✅ Cleanup service started (accounts: 6h, sessions: 1h, cache: 30min)")

	// Auth routes (public) with rate limiting
	auth := apiGroup.Group("/auth")
	auth.Post("/register", middleware.AuthRateLimiter(), authHandler.Register)
	auth.Post("/login", middleware.AuthRateLimiter(), authHandler.Login)
	auth.Post("/login/2fa", middleware.AuthRateLimiter(), authHandler.Login2FA)
	auth.Post("/refresh", middleware.AuthRateLimiter(), authHandler.RefreshToken)
	auth.Post("/password/reset", middleware.AuthRateLimiter(), authHandler.RequestPasswordReset)
	auth.Post("/password/reset/confirm", middleware.AuthRateLimiter(), authHandler.ResetPassword)

	// OAuth routes (public)
	auth.Get("/google", oauthHandler.GoogleLogin)
	auth.Get("/google/callback", oauthHandler.GoogleCallback)
	auth.Get("/apple", oauthHandler.AppleLogin)
	auth.Post("/apple/callback", oauthHandler.AppleCallback)

	// OAuth account management routes (public for linking confirmation, protected for others)
	auth.Post("/oauth/set-password", middleware.JWTMiddleware(cfg), oauthHandler.SetPasswordForOAuthUser)
	auth.Post("/oauth/unlink", middleware.JWTMiddleware(cfg), oauthHandler.UnlinkOAuthProvider)
	auth.Get("/oauth/status", middleware.JWTMiddleware(cfg), oauthHandler.GetOAuthStatus)

	// Protected auth routes
	auth.Post("/logout", middleware.JWTMiddleware(cfg), authHandler.Logout)
	auth.Post("/verify/email", authHandler.VerifyEmail) // Public endpoint - secured by email code
	auth.Post("/resend-verification", middleware.JWTMiddleware(cfg), authHandler.ResendVerificationEmail)

	// TOTP-protected sensitive operations
	auth.Post("/password/change",
		middleware.JWTMiddleware(cfg),
		middleware.TOTPRequired(securityService),
		protectedOpsHandler.ChangePassword)

	// Session management
	auth.Get("/sessions", middleware.JWTMiddleware(cfg), authHandler.GetSessions)
	auth.Delete("/sessions/:sessionId", middleware.JWTMiddleware(cfg), authHandler.RevokeSession)

	// 2FA settings
	auth.Get("/2fa/settings", middleware.JWTMiddleware(cfg), authHandler.Get2FASettings)
	auth.Post("/2fa/enable", middleware.JWTMiddleware(cfg), authHandler.Enable2FA)
	auth.Post("/2fa/confirm", middleware.JWTMiddleware(cfg), authHandler.Confirm2FA)
	auth.Post("/2fa/disable", middleware.JWTMiddleware(cfg), authHandler.Disable2FA)

	// Account security
	auth.Post("/backup-contact", middleware.JWTMiddleware(cfg), authHandler.UpdateBackupContact)
	auth.Post("/delete-account",
		middleware.JWTMiddleware(cfg),
		middleware.TOTPOptional(securityService),
		authHandler.RequestAccountDeletion)

	// TOTP 2FA routes (protected)
	totp := apiGroup.Group("/totp", middleware.JWTMiddleware(cfg))
	totp.Post("/generate", totpHandler.GenerateTOTPSecret)
	totp.Post("/enable", totpHandler.VerifyAndEnableTOTP)
	totp.Post("/disable", totpHandler.DisableTOTP)
	totp.Post("/verify", totpHandler.VerifyTOTP)
	totp.Get("/status", totpHandler.GetTOTPStatus)
	totp.Post("/backup-codes/regenerate", totpHandler.RegenerateBackupCodes)

	// Account management routes (protected)
	account := apiGroup.Group("/account", middleware.JWTMiddleware(cfg))
	account.Post("/deactivate",
		middleware.TOTPOptional(securityService),
		accountHandler.DeactivateAccount)
	account.Post("/restore", accountHandler.RestoreAccount)
	account.Get("/recovery-info", accountHandler.GetRecoveryInfo)

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

	// TOTP-protected user operations
	users.Post("/email/change",
		middleware.JWTMiddleware(cfg),
		middleware.TOTPRequired(securityService),
		protectedOpsHandler.ChangeEmail)
	users.Post("/phone/change",
		middleware.JWTMiddleware(cfg),
		middleware.TOTPRequired(securityService),
		protectedOpsHandler.ChangePhone)

	// Profile stats routes (protected)
	users.Get("/me/stats", middleware.JWTMiddleware(cfg), profileStatsHandler.GetUserStats)
	users.Get("/me/activity", middleware.JWTMiddleware(cfg), profileStatsHandler.GetUserActivity)
	users.Get("/me/top-posts", middleware.JWTMiddleware(cfg), profileStatsHandler.GetTopPosts)
	users.Get("/me/follower-growth", middleware.JWTMiddleware(cfg), profileStatsHandler.GetFollowerGrowth)

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

	// Notifications routes with rate limiting
	notifications := apiGroup.Group("/notifications", middleware.JWTMiddleware(cfg))
	notifications.Get("/", middleware.NotificationRateLimiter(), notificationsHandler.GetNotifications)
	notifications.Get("/unread-count", middleware.NotificationRateLimiter(), notificationsHandler.GetUnreadCount)
	notifications.Patch("/:id/read", notificationsHandler.MarkAsRead)
	notifications.Patch("/read-all", notificationsHandler.MarkAllAsRead)
	notifications.Delete("/:id", notificationsHandler.DeleteNotification)

	// Notification Preferences routes (protected)
	apiGroup.Get("/notification-preferences", middleware.JWTMiddleware(cfg), notificationPreferencesHandler.GetNotificationPreferences)
	apiGroup.Put("/notification-preferences", middleware.JWTMiddleware(cfg), notificationPreferencesHandler.UpdateNotificationPreferences)

	// Referral routes (protected)
	referrals := apiGroup.Group("/referrals", middleware.JWTMiddleware(cfg))
	referrals.Get("/stats", referralHandler.GetReferralStats)
	referrals.Get("/code", referralHandler.GetReferralCode)
	referrals.Get("/invitations", referralHandler.GetReferralInvitations)

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
	widgets.Get("/news/:id", widgetsHandler.GetNewsById)
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
	admin.Get("/users/by-country", adminHandler.GetUsersByCountry)

	// Admin - Cleanup (TEMPORARY - for testing)
	admin.Delete("/cleanup/all", adminCleanupHandler.CleanupAllData)

	// Setup routes (TEMPORARY - for initial admin creation)
	setup := apiGroup.Group("/setup")
	setup.Post("/admin", adminSetupHandler.CreateAdminUser)
	setup.Post("/db-agent", adminSetupHandler.CreateDBAgent)

	// Stripe webhooks (public endpoint - no auth, Stripe verifies with signature)
	webhooks := apiGroup.Group("/webhooks")
	webhooks.Post("/stripe", stripeWebhookHandler.HandleWebhook)

	// WebSocket endpoint
	app.Get("/ws/notifications", wsHandler.HandleWebSocket)

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
