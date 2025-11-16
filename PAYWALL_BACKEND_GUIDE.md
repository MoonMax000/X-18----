# 🔐 Backend Implementation Guide - Profile Paywall System

**Status:** Frontend ✅ Ready | Backend ❌ Required  
**Дата:** $(date +%Y-%m-%d)

---

## 🎯 Что нужно реализовать

### 1. Database Migration

\`\`\`sql
-- File: custom-backend/internal/database/migrations/032_add_paywall_fields.sql

-- Add paywall fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_profile_private BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS subscription_discount_price INTEGER DEFAULT 300,  -- $3 in cents
ADD COLUMN IF NOT EXISTS subscription_discount_percentage INTEGER DEFAULT 90,
ADD COLUMN IF NOT EXISTS subscription_discount_days INTEGER DEFAULT 30;

-- Performance index
CREATE INDEX IF NOT EXISTS idx_users_profile_private ON users(is_profile_private);

-- Update subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS created_via VARCHAR(50) DEFAULT 'card_charge';

-- Performance index for subscription checks
CREATE INDEX IF NOT EXISTS idx_subscriptions_active 
ON subscriptions(subscriber_id, creator_id, status, expires_at);
\`\`\`

**Применить:**
\`\`\`bash
psql \$DATABASE_URL < custom-backend/internal/database/migrations/032_add_paywall_fields.sql
\`\`\`

---

### 2. Update User Model

\`\`\`go
// File: custom-backend/internal/models/user.go

type User struct {
    // ... existing fields
    
    // Paywall fields
    IsProfilePrivate              bool   \`json:"is_profile_private" gorm:"default:false"\`
    SubscriptionDiscountPrice     int    \`json:"subscription_discount_price" gorm:"default:300"\`      // $3 in cents
    SubscriptionDiscountPercentage int    \`json:"subscription_discount_percentage" gorm:"default:90"\`
    SubscriptionDiscountDays      int    \`json:"subscription_discount_days" gorm:"default:30"\`
}
\`\`\`

---

### 3. GET /api/users/username/:username - Add is_subscribed

\`\`\`go
// File: custom-backend/internal/api/users.go

func (h *Handler) GetUserByUsername(c *fiber.Ctx) error {
    username := c.Params("username")
    
    // Get current user ID from JWT (if authenticated)
    currentUserID := ""
    if userID := c.Locals("user_id"); userID != nil {
        currentUserID = userID.(string)
    }
    
    // Get user
    var user models.User
    if err := h.db.Where("username = ?", username).First(&user).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return c.Status(404).JSON(fiber.Map{"error": "User not found"})
        }
        return c.Status(500).JSON(fiber.Map{"error": "Database error"})
    }
    
    // ⭐ Check if current user is subscribed to this profile
    isSubscribed := false
    if currentUserID != "" && currentUserID != user.ID {
        var count int64
        err := h.db.Model(&models.Subscription{}).
            Where("subscriber_id = ? AND creator_id = ? AND status = ? AND expires_at > ?",
                currentUserID, user.ID, "active", time.Now()).
            Count(&count).Error
        
        if err == nil {
            isSubscribed = count > 0
        }
    }
    
    // ⭐ Calculate content stats
    photosCount := h.calculatePhotosCount(user.ID)
    videosCount := h.calculateVideosCount(user.ID)
    premiumPostsCount := h.calculatePremiumPostsCount(user.ID)
    
    // Return user with paywall fields
    return c.JSON(fiber.Map{
        "id":                               user.ID,
        "username":                         user.Username,
        "display_name":                     user.DisplayName,
        "bio":                              user.Bio,
        "avatar_url":                       user.AvatarURL,
        "header_url":                       user.HeaderURL,
        "verified":                         user.Verified,
        "subscription_price":               user.SubscriptionPrice,
        "followers_count":                  user.FollowersCount,
        "following_count":                  user.FollowingCount,
        "posts_count":                      user.PostsCount,
        // ⭐ Paywall fields
        "is_profile_private":               user.IsProfilePrivate,
        "is_subscribed":                    isSubscribed,  // ⭐ NEW
        "subscription_discount_price":      user.SubscriptionDiscountPrice,
        "subscription_discount_percentage": user.SubscriptionDiscountPercentage,
        "subscription_discount_days":       user.SubscriptionDiscountDays,
        "photos_count":                     photosCount,  // ⭐ NEW
        "videos_count":                     videosCount,  // ⭐ NEW
        "premium_posts_count":              premiumPostsCount,  // ⭐ NEW
        "created_at":                       user.CreatedAt,
    })
}

// Helper: Calculate photos count
func (h *Handler) calculatePhotosCount(userID string) int {
    var count int64
    h.db.Model(&models.Post{}).
        Joins("JOIN media ON media.post_id = posts.id").
        Where("posts.user_id = ? AND media.type = ?", userID, "image").
        Count(&count)
    return int(count)
}

// Helper: Calculate videos count
func (h *Handler) calculateVideosCount(userID string) int {
    var count int64
    h.db.Model(&models.Post{}).
        Joins("JOIN media ON media.post_id = posts.id").
        Where("posts.user_id = ? AND media.type = ?", userID, "video").
        Count(&count)
    return int(count)
}

// Helper: Calculate premium posts count
func (h *Handler) calculatePremiumPostsCount(userID string) int {
    var count int64
    h.db.Model(&models.Post{}).
        Where("user_id = ? AND is_premium = ?", userID, true).
        Count(&count)
    return int(count)
}
\`\`\`

---

### 4. PUT /api/users/me - Handle is_profile_private

\`\`\`go
// File: custom-backend/internal/api/users.go

func (h *Handler) UpdateProfile(c *fiber.Ctx) error {
    userID := c.Locals("user_id").(string)
    
    var req struct {
        FirstName        *string \`json:"first_name"\`
        LastName         *string \`json:"last_name"\`
        Bio              *string \`json:"bio"\`
        Location         *string \`json:"location"\`
        Website          *string \`json:"website"\`
        Role             *string \`json:"role"\`
        Sectors          *string \`json:"sectors"\`
        IsProfilePrivate *bool   \`json:"is_profile_private"\` // ⭐ NEW
    }
    
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
    }
    
    // Build update map
    updates := make(map[string]interface{})
    
    if req.FirstName != nil {
        updates["first_name"] = *req.FirstName
    }
    if req.LastName != nil {
        updates["last_name"] = *req.LastName
    }
    // ... other fields
    
    // ⭐ Handle private profile toggle
    if req.IsProfilePrivate != nil {
        updates["is_profile_private"] = *req.IsProfilePrivate
    }
    
    // Update user
    if err := h.db.Model(&models.User{}).
        Where("id = ?", userID).
        Updates(updates).Error; err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to update profile"})
    }
    
    // Get updated user
    var user models.User
    h.db.First(&user, "id = ?", userID)
    
    return c.JSON(user)
}
\`\`\`

---

### 5. POST /api/payments/charge-saved-card - Create Subscription

\`\`\`go
// File: custom-backend/internal/api/stripe_handlers.go

func (h *Handler) ChargeSavedCard(c *fiber.Ctx) error {
    userID := c.Locals("user_id").(string)
    
    var req struct {
        PaymentMethodID string                 \`json:"payment_method_id" validate:"required"\`
        PostID          *string                \`json:"post_id,omitempty"\`
        Amount          int                    \`json:"amount" validate:"required"\`  // In cents
        Description     string                 \`json:"description"\`
        Metadata        map[string]string      \`json:"metadata"\`
    }
    
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
    }
    
    // Validate
    if err := validator.New().Struct(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": err.Error()})
    }
    
    // Get payment method from DB
    var pm models.PaymentMethod
    if err := h.db.Where("stripe_payment_method_id = ? AND user_id = ?", 
        req.PaymentMethodID, userID).First(&pm).Error; err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "Payment method not found"})
    }
    
    // Create Stripe payment intent
    params := &stripe.PaymentIntentParams{
        Amount:        stripe.Int64(int64(req.Amount)),
        Currency:      stripe.String("usd"),
        Customer:      stripe.String(pm.StripeCustomerID),
        PaymentMethod: stripe.String(req.PaymentMethodID),
        Confirm:       stripe.Bool(true),
        Description:   stripe.String(req.Description),
    }
    
    // Add metadata
    for key, value := range req.Metadata {
        params.AddMetadata(key, value)
    }
    
    // Charge card
    intent, err := paymentintent.New(params)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{
            "error": "Payment failed",
            "details": err.Error(),
        })
    }
    
    // ⭐ If type is "subscription", create subscription record
    if req.Metadata != nil && req.Metadata["type"] == "subscription" {
        // Get creator ID from metadata or post
        var creatorID string
        if req.Metadata["authorId"] != "" {
            creatorID = req.Metadata["authorId"]
        } else if req.PostID != nil {
            var post models.Post
            h.db.First(&post, "id = ?", *req.PostID)
            creatorID = post.UserID
        }
        
        if creatorID != "" {
            // Create subscription
            subscription := &models.Subscription{
                SubscriberID:     userID,
                CreatorID:        creatorID,
                Status:           "active",
                PriceCents:       req.Amount,
                StripeSubID:      intent.ID,  // Use payment intent ID
                CurrentPeriodEnd: time.Now().Add(30 * 24 * time.Hour),  // 30 days
                CreatedAt:        time.Now(),
            }
            
            if err := h.db.Create(subscription).Error; err != nil {
                // Log error but don't fail - payment already succeeded
                log.Printf("⚠️ Failed to create subscription record: %v", err)
            } else {
                log.Printf("✅ Subscription created: %s → %s", userID, creatorID)
            }
        }
    }
    
    // Return success
    return c.JSON(fiber.Map{
        "success":          true,
        "status":           intent.Status,
        "payment_intent_id": intent.ID,
    })
}
\`\`\`

---

## 🧪 Testing Checklist

### Backend Tests:

\`\`\`bash
# 1. Test profile private toggle
curl -X PATCH http://localhost:8080/api/users/me \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"is_profile_private": true}'
  
# Expected: {"id": "xxx", "is_profile_private": true, ...}

# 2. Test get user with is_subscribed
curl http://localhost:8080/api/users/username/testuser \
  -H "Content-Type: application/json" \
  -b cookies.txt
  
# Expected: {"username": "testuser", "is_profile_private": true, "is_subscribed": false, ...}

# 3. Test subscription creation
curl -X POST http://localhost:8080/api/payments/charge-saved-card \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "payment_method_id": "pm_xxx",
    "amount": 300,
    "description": "Subscription",
    "metadata": {
      "type": "subscription",
      "authorId": "user_id_here"
    }
  }'
  
# Expected: {"success": true, "status": "succeeded", "payment_intent_id": "pi_xxx"}

# 4. Check subscription in DB
psql \$DATABASE_URL -c "SELECT * FROM subscriptions WHERE subscriber_id = 'xxx' ORDER BY created_at DESC LIMIT 1;"

# Expected: 1 row with status='active', expires_at > now
\`\`\`

---

## 🚀 Deployment

\`\`\`bash
# 1. Apply migration
psql \$DATABASE_URL < custom-backend/internal/database/migrations/032_add_paywall_fields.sql

# 2. Restart backend
./force-restart-backend.sh

# 3. Test on production
curl https://api.x18.pro/api/users/username/testuser -b cookies.txt

# 4. Monitor logs
aws logs tail /ecs/x18-backend --follow
\`\`\`

---

## 📊 Success Criteria

✅ User can toggle "Private Profile" in settings  
✅ Backend saves \`is_profile_private = true\`  
✅ GET /api/users/username/X returns \`is_subscribed\` field  
✅ Other users see ProfilePaywall when visiting private profile  
✅ After clicking "Subscribe" → charge card → create subscription  
✅ Paywall disappears after successful subscription  
✅ Content becomes visible  
✅ Subscription expires after 30 days  

---

**Frontend Status:** ✅ Ready (commit 29cfeb41)  
**Backend Status:** ⏳ Waiting for implementation  
**Estimated Time:** 45-60 minutes

