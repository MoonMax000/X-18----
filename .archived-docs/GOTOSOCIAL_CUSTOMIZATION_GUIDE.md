# GoToSocial Customization Guide

## Adding Custom Metadata Support for Trading Signals

This guide shows how to extend GoToSocial to support custom metadata for posts, specifically for trading signals and other custom post types.

---

## 🎯 Goal

Add support for custom metadata in posts:
- Post type (signal, news, education, analysis, etc.)
- Trading signal data (ticker, entry, stop loss, take profit)
- Sentiment (bullish, bearish, neutral)
- Market categorization (crypto, stocks, forex)
- Timeframe, risk level, etc.

---

## 📁 GoToSocial Project Structure

```
gotosocial/
├── internal/
│   ├── api/
│   │   └── client/
│   │       └── statuses/
│   │           ├── statuscreate.go      # Status creation endpoint
│   │           ├── statusupdate.go      # Status update endpoint
│   │           └── statusget.go         # Status retrieval
│   ├── db/
│   ���   ├── bundb/
│   │   │   └── status.go                # Database queries for statuses
│   │   └── migrations/                  # Database migrations
│   ├── gtsmodel/
│   │   └── status.go                    # Status model definition
│   └── processing/
│       └── status/
│           └── create.go                # Status creation logic
└── docs/
    └── api/
        └── swagger.yaml                  # API documentation
```

---

## 🗄️ Step 1: Database Schema Changes

### 1.1. Create Migration File

Create `internal/db/bundb/migrations/20240315120000_add_status_metadata.go`:

```go
package migrations

import (
    "context"
    "github.com/superseriousbusiness/gotosocial/internal/gtsmodel"
    "github.com/uptrace/bun"
)

func init() {
    up := func(ctx context.Context, db *bun.DB) error {
        // Add custom_metadata column to statuses table
        _, err := db.NewAddColumn().
            Model((*gtsmodel.Status)(nil)).
            ColumnExpr("custom_metadata JSONB").
            Exec(ctx)
        
        return err
    }

    down := func(ctx context.Context, db *bun.DB) error {
        // Remove custom_metadata column
        _, err := db.NewDropColumn().
            Model((*gtsmodel.Status)(nil)).
            Column("custom_metadata").
            Exec(ctx)
        
        return err
    }

    if err := Migrations.Register(up, down); err != nil {
        panic(err)
    }
}
```

### 1.2. Alternative: Separate Table Approach

If you prefer a separate table for better normalization:

Create `internal/db/bundb/migrations/20240315120000_add_status_metadata_table.go`:

```go
package migrations

import (
    "context"
    "github.com/uptrace/bun"
)

type StatusMetadata struct {
    StatusID    string  `bun:"status_id,pk,type:text"`
    PostType    string  `bun:"post_type,type:text"`
    Ticker      string  `bun:"ticker,type:text"`
    Sentiment   string  `bun:"sentiment,type:text"`
    Timeframe   string  `bun:"timeframe,type:text"`
    Risk        string  `bun:"risk,type:text"`
    Entry       float64 `bun:"entry,type:decimal(20,8)"`
    StopLoss    float64 `bun:"stop_loss,type:decimal(20,8)"`
    TakeProfit  float64 `bun:"take_profit,type:decimal(20,8)"`
    Market      string  `bun:"market,type:text"`
}

func init() {
    up := func(ctx context.Context, db *bun.DB) error {
        _, err := db.NewCreateTable().
            Model((*StatusMetadata)(nil)).
            IfNotExists().
            Exec(ctx)
        
        return err
    }

    down := func(ctx context.Context, db *bun.DB) error {
        _, err := db.NewDropTable().
            Model((*StatusMetadata)(nil)).
            IfExists().
            Exec(ctx)
        
        return err
    }

    if err := Migrations.Register(up, down); err != nil {
        panic(err)
    }
}
```

---

## 🏗️ Step 2: Model Changes

### 2.1. Update Status Model

Edit `internal/gtsmodel/status.go`:

```go
package gtsmodel

import (
    "time"
)

// Status represents a user post/status
type Status struct {
    ID                   string           `bun:"type:CHAR(26),pk,nullzero,notnull,unique"`
    URI                  string           `bun:",unique,nullzero,notnull"`
    URL                  string           `bun:",nullzero"`
    Content              string           `bun:""`
    Text                 string           `bun:""`
    // ... existing fields ...
    
    // Custom metadata for trading signals and other post types
    CustomMetadata       *StatusMetadata  `bun:"type:jsonb,nullzero"`
    CustomMetadataID     string           `bun:"type:CHAR(26),nullzero"` // If using separate table
    
    CreatedAt            time.Time        `bun:"type:timestamptz,nullzero,notnull,default:current_timestamp"`
    UpdatedAt            time.Time        `bun:"type:timestamptz,nullzero,notnull,default:current_timestamp"`
}

// StatusMetadata contains custom metadata for posts
type StatusMetadata struct {
    // Post categorization
    PostType    string  `json:"post_type,omitempty"`    // "signal", "news", "education", "analysis", "macro", "code", "video"
    Market      string  `json:"market,omitempty"`       // "crypto", "stocks", "forex", "commodities", "indices"
    Category    string  `json:"category,omitempty"`     // Additional category
    
    // Trading signal specific fields
    Ticker      string  `json:"ticker,omitempty"`       // "BTC", "ETH", "AAPL", etc.
    Sentiment   string  `json:"sentiment,omitempty"`    // "bullish", "bearish", "neutral"
    Direction   string  `json:"direction,omitempty"`    // "long", "short"
    Timeframe   string  `json:"timeframe,omitempty"`    // "15m", "1h", "4h", "1d", "1w"
    Risk        string  `json:"risk,omitempty"`         // "low", "medium", "high"
    
    // Price levels (stored as strings to preserve precision)
    Entry       string  `json:"entry,omitempty"`
    StopLoss    string  `json:"stop_loss,omitempty"`
    TakeProfit  string  `json:"take_profit,omitempty"`
    
    // Performance metrics
    Accuracy    float64 `json:"accuracy,omitempty"`     // 0-100
    SampleSize  int     `json:"sample_size,omitempty"`  // Number of signals in sample
    
    // Access control (if using custom monetization)
    AccessLevel string  `json:"access_level,omitempty"` // "public", "paid", "subscribers", "followers", "premium"
    Price       float64 `json:"price,omitempty"`        // Price for paid posts
}
```

---

## 🔌 Step 3: API Endpoint Changes

### 3.1. Update Status Creation Request

Edit `internal/api/client/statuses/statuscreate.go`:

```go
package statuses

import (
    "encoding/json"
    "net/http"
    
    "github.com/gin-gonic/gin"
    apiutil "github.com/superseriousbusiness/gotosocial/internal/api/util"
    "github.com/superseriousbusiness/gotosocial/internal/gtsmodel"
    "github.com/superseriousbusiness/gotosocial/internal/oauth"
)

// StatusCreateRequest represents the request body for creating a status
type StatusCreateRequest struct {
    Status              string                    `form:"status" json:"status"`
    MediaIDs            []string                  `form:"media_ids[]" json:"media_ids"`
    Poll                *PollRequest              `form:"poll" json:"poll"`
    InReplyToID         string                    `form:"in_reply_to_id" json:"in_reply_to_id"`
    Sensitive           *bool                     `form:"sensitive" json:"sensitive"`
    SpoilerText         string                    `form:"spoiler_text" json:"spoiler_text"`
    Visibility          string                    `form:"visibility" json:"visibility"`
    ScheduledAt         string                    `form:"scheduled_at" json:"scheduled_at"`
    Language            string                    `form:"language" json:"language"`
    
    // Custom metadata for trading signals and post categorization
    CustomMetadata      *gtsmodel.StatusMetadata  `form:"custom_metadata" json:"custom_metadata"`
}

// StatusCreatePOSTHandler handles POST requests to create a new status
func (m *Module) StatusCreatePOSTHandler(c *gin.Context) {
    authed, err := oauth.Authed(c, true, true, true, true)
    if err != nil {
        apiutil.ErrorHandler(c, gtserror.NewErrorUnauthorized(err, err.Error()), m.processor.InstanceGetV1)
        return
    }

    if _, err := apiutil.NegotiateAccept(c, apiutil.JSONAcceptHeaders...); err != nil {
        apiutil.ErrorHandler(c, gtserror.NewErrorNotAcceptable(err, err.Error()), m.processor.InstanceGetV1)
        return
    }

    form := &StatusCreateRequest{}
    if err := c.ShouldBind(form); err != nil {
        apiutil.ErrorHandler(c, gtserror.NewErrorBadRequest(err, err.Error()), m.processor.InstanceGetV1)
        return
    }

    // Validate custom metadata if provided
    if form.CustomMetadata != nil {
        if err := validateCustomMetadata(form.CustomMetadata); err != nil {
            apiutil.ErrorHandler(c, gtserror.NewErrorBadRequest(err, err.Error()), m.processor.InstanceGetV1)
            return
        }
    }

    apiStatus, errWithCode := m.processor.Status().Create(c.Request.Context(), authed, form)
    if errWithCode != nil {
        apiutil.ErrorHandler(c, errWithCode, m.processor.InstanceGetV1)
        return
    }

    c.JSON(http.StatusOK, apiStatus)
}

// validateCustomMetadata validates the custom metadata fields
func validateCustomMetadata(metadata *gtsmodel.StatusMetadata) error {
    // Validate post_type
    validPostTypes := map[string]bool{
        "signal": true, "news": true, "education": true, 
        "analysis": true, "macro": true, "code": true, 
        "video": true, "general": true,
    }
    if metadata.PostType != "" && !validPostTypes[metadata.PostType] {
        return fmt.Errorf("invalid post_type: %s", metadata.PostType)
    }

    // Validate sentiment
    validSentiments := map[string]bool{
        "bullish": true, "bearish": true, "neutral": true,
    }
    if metadata.Sentiment != "" && !validSentiments[metadata.Sentiment] {
        return fmt.Errorf("invalid sentiment: %s", metadata.Sentiment)
    }

    // Validate direction
    validDirections := map[string]bool{
        "long": true, "short": true,
    }
    if metadata.Direction != "" && !validDirections[metadata.Direction] {
        return fmt.Errorf("invalid direction: %s", metadata.Direction)
    }

    // Validate market
    validMarkets := map[string]bool{
        "crypto": true, "stocks": true, "forex": true,
        "commodities": true, "indices": true,
    }
    if metadata.Market != "" && !validMarkets[metadata.Market] {
        return fmt.Errorf("invalid market: %s", metadata.Market)
    }

    // Validate risk
    validRisks := map[string]bool{
        "low": true, "medium": true, "high": true,
    }
    if metadata.Risk != "" && !validRisks[metadata.Risk] {
        return fmt.Errorf("invalid risk: %s", metadata.Risk)
    }

    // Validate timeframe
    validTimeframes := map[string]bool{
        "15m": true, "1h": true, "4h": true, "1d": true, "1w": true, "1M": true,
    }
    if metadata.Timeframe != "" && !validTimeframes[metadata.Timeframe] {
        return fmt.Errorf("invalid timeframe: %s", metadata.Timeframe)
    }

    return nil
}
```

### 3.2. Update Status Response (API Model)

Edit `internal/api/model/status.go`:

```go
package model

// Status represents a status/post
type Status struct {
    ID                     string              `json:"id"`
    CreatedAt              string              `json:"created_at"`
    InReplyToID            *string             `json:"in_reply_to_id"`
    InReplyToAccountID     *string             `json:"in_reply_to_account_id"`
    Sensitive              bool                `json:"sensitive"`
    SpoilerText            string              `json:"spoiler_text"`
    Visibility             Visibility          `json:"visibility"`
    Language               *string             `json:"language"`
    URI                    string              `json:"uri"`
    URL                    *string             `json:"url"`
    RepliesCount           int                 `json:"replies_count"`
    ReblogsCount           int                 `json:"reblogs_count"`
    FavouritesCount        int                 `json:"favourites_count"`
    EditedAt               *string             `json:"edited_at,omitempty"`
    Content                string              `json:"content"`
    Reblog                 *StatusReblogged    `json:"reblog"`
    Application            *Application        `json:"application,omitempty"`
    Account                *Account            `json:"account"`
    MediaAttachments       []*Attachment       `json:"media_attachments"`
    Mentions               []*Mention          `json:"mentions"`
    Tags                   []*Tag              `json:"tags"`
    Emojis                 []*Emoji            `json:"emojis"`
    Card                   *Card               `json:"card"`
    Poll                   *Poll               `json:"poll"`
    Text                   *string             `json:"text,omitempty"`
    
    // Custom metadata extension
    CustomMetadata         *StatusMetadata     `json:"custom_metadata,omitempty"`
}

// StatusMetadata contains custom metadata for posts
type StatusMetadata struct {
    PostType    string  `json:"post_type,omitempty"`
    Market      string  `json:"market,omitempty"`
    Category    string  `json:"category,omitempty"`
    Ticker      string  `json:"ticker,omitempty"`
    Sentiment   string  `json:"sentiment,omitempty"`
    Direction   string  `json:"direction,omitempty"`
    Timeframe   string  `json:"timeframe,omitempty"`
    Risk        string  `json:"risk,omitempty"`
    Entry       string  `json:"entry,omitempty"`
    StopLoss    string  `json:"stop_loss,omitempty"`
    TakeProfit  string  `json:"take_profit,omitempty"`
    Accuracy    float64 `json:"accuracy,omitempty"`
    SampleSize  int     `json:"sample_size,omitempty"`
    AccessLevel string  `json:"access_level,omitempty"`
    Price       float64 `json:"price,omitempty"`
}
```

---

## 🔄 Step 4: Processing Logic

### 4.1. Update Status Creation Processor

Edit `internal/processing/status/create.go`:

```go
package status

import (
    "context"
    "errors"
    "fmt"
    
    apimodel "github.com/superseriousbusiness/gotosocial/internal/api/model"
    "github.com/superseriousbusiness/gotosocial/internal/gtsmodel"
    "github.com/superseriousbusiness/gotosocial/internal/id"
)

// Create processes the creation of a new status
func (p *Processor) Create(ctx context.Context, account *gtsmodel.Account, form *apimodel.StatusCreateRequest) (*apimodel.Status, gtserror.WithCode) {
    // Generate new ID
    statusID, err := id.NewULID()
    if err != nil {
        return nil, gtserror.NewErrorInternalError(err)
    }

    // Create status object
    status := &gtsmodel.Status{
        ID:        statusID,
        URI:       uris.GenerateURIForStatus(account.ID, statusID),
        URL:       uris.GenerateURLForStatus(account.ID, statusID),
        AccountID: account.ID,
        Content:   text.SanitizeToHTML(form.Status),
        Text:      form.Status,
        // ... other fields ...
        
        // Add custom metadata if provided
        CustomMetadata: form.CustomMetadata,
    }

    // Store status in database
    if err := p.state.DB.PutStatus(ctx, status); err != nil {
        return nil, gtserror.NewErrorInternalError(err)
    }

    // Convert to API model
    apiStatus, err := p.tc.StatusToAPIStatus(ctx, status, account)
    if err != nil {
        return nil, gtserror.NewErrorInternalError(err)
    }

    return apiStatus, nil
}
```

---

## 🔍 Step 5: Add Filtering Support

### 5.1. Add Filter Query Parameters

Edit `internal/api/client/timelines/home.go`:

```go
package timelines

import (
    "net/http"
    "strconv"
    
    "github.com/gin-gonic/gin"
    apiutil "github.com/superseriousbusiness/gotosocial/internal/api/util"
)

// HomeTimelineGETHandler returns statuses from the home timeline
func (m *Module) HomeTimelineGETHandler(c *gin.Context) {
    authed, err := oauth.Authed(c, true, true, true, true)
    if err != nil {
        apiutil.ErrorHandler(c, gtserror.NewErrorUnauthorized(err, err.Error()), m.processor.InstanceGetV1)
        return
    }

    if _, err := apiutil.NegotiateAccept(c, apiutil.JSONAcceptHeaders...); err != nil {
        apiutil.ErrorHandler(c, gtserror.NewErrorNotAcceptable(err, err.Error()), m.processor.InstanceGetV1)
        return
    }

    limit := 20
    if limitString := c.Query("limit"); limitString != "" {
        if i, err := strconv.Atoi(limitString); err == nil && i > 0 && i < 80 {
            limit = i
        }
    }

    maxID := c.Query("max_id")
    minID := c.Query("min_id")
    
    // NEW: Custom metadata filters
    postType := c.Query("post_type")      // "signal", "news", etc.
    ticker := c.Query("ticker")           // "BTC", "ETH", etc.
    sentiment := c.Query("sentiment")     // "bullish", "bearish"
    market := c.Query("market")           // "crypto", "stocks", etc.

    resp, errWithCode := m.processor.Timeline().HomeTimelineGet(c.Request.Context(), authed, maxID, minID, limit, postType, ticker, sentiment, market)
    if errWithCode != nil {
        apiutil.ErrorHandler(c, errWithCode, m.processor.InstanceGetV1)
        return
    }

    if resp.LinkHeader != "" {
        c.Header("Link", resp.LinkHeader)
    }

    c.JSON(http.StatusOK, resp.Items)
}
```

### 5.2. Update Database Query

Edit `internal/db/bundb/status.go`:

```go
package bundb

import (
    "context"
    
    "github.com/superseriousbusiness/gotosocial/internal/gtsmodel"
    "github.com/uptrace/bun"
)

// GetHomeTimeline returns statuses for the home timeline with optional filters
func (s *statusDB) GetHomeTimeline(ctx context.Context, accountID string, maxID string, minID string, limit int, filters *TimelineFilters) ([]*gtsmodel.Status, error) {
    statuses := []*gtsmodel.Status{}

    q := s.db.NewSelect().
        Model(&statuses).
        Where("account_id IN (SELECT target_account_id FROM follows WHERE account_id = ?)", accountID).
        Order("created_at DESC").
        Limit(limit)

    if maxID != "" {
        q = q.Where("id < ?", maxID)
    }

    if minID != "" {
        q = q.Where("id > ?", minID)
    }

    // Apply custom metadata filters
    if filters != nil {
        if filters.PostType != "" {
            q = q.Where("custom_metadata->>'post_type' = ?", filters.PostType)
        }
        if filters.Ticker != "" {
            q = q.Where("custom_metadata->>'ticker' = ?", filters.Ticker)
        }
        if filters.Sentiment != "" {
            q = q.Where("custom_metadata->>'sentiment' = ?", filters.Sentiment)
        }
        if filters.Market != "" {
            q = q.Where("custom_metadata->>'market' = ?", filters.Market)
        }
    }

    if err := q.Scan(ctx); err != nil {
        return nil, err
    }

    return statuses, nil
}

// TimelineFilters contains filter options for timeline queries
type TimelineFilters struct {
    PostType  string
    Ticker    string
    Sentiment string
    Market    string
}
```

---

## 📚 Step 6: Update Swagger Documentation

Edit `docs/api/swagger.yaml`:

```yaml
/api/v1/statuses:
  post:
    summary: Create a new status
    parameters:
      - in: formData
        name: status
        type: string
        description: Text content of the status
      - in: formData
        name: custom_metadata
        schema:
          $ref: '#/definitions/StatusMetadata'
        description: Custom metadata for the status
    responses:
      200:
        description: Success
        schema:
          $ref: '#/definitions/Status'

definitions:
  Status:
    type: object
    properties:
      id:
        type: string
      content:
        type: string
      custom_metadata:
        $ref: '#/definitions/StatusMetadata'
      # ... other fields ...

  StatusMetadata:
    type: object
    properties:
      post_type:
        type: string
        enum: [signal, news, education, analysis, macro, code, video, general]
      ticker:
        type: string
        example: "BTC"
      sentiment:
        type: string
        enum: [bullish, bearish, neutral]
      direction:
        type: string
        enum: [long, short]
      timeframe:
        type: string
        enum: [15m, 1h, 4h, 1d, 1w, 1M]
      risk:
        type: string
        enum: [low, medium, high]
      market:
        type: string
        enum: [crypto, stocks, forex, commodities, indices]
      entry:
        type: string
      stop_loss:
        type: string
      take_profit:
        type: string
      accuracy:
        type: number
      sample_size:
        type: integer
      access_level:
        type: string
      price:
        type: number
```

---

## 🧪 Step 7: Testing

### 7.1. Create a Test Status with Metadata

```bash
curl -X POST https://your-instance.com/api/v1/statuses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "BTC breaking out! Great long opportunity 🚀",
    "visibility": "public",
    "custom_metadata": {
      "post_type": "signal",
      "ticker": "BTC",
      "sentiment": "bullish",
      "direction": "long",
      "timeframe": "4h",
      "risk": "medium",
      "market": "crypto",
      "entry": "45200",
      "stop_loss": "44500",
      "take_profit": "47000",
      "accuracy": 85.5,
      "sample_size": 50
    }
  }'
```

### 7.2. Query with Filters

```bash
# Get only signal posts
curl -X GET "https://your-instance.com/api/v1/timelines/home?post_type=signal" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get BTC signals only
curl -X GET "https://your-instance.com/api/v1/timelines/home?post_type=signal&ticker=BTC" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get bullish crypto signals
curl -X GET "https://your-instance.com/api/v1/timelines/home?post_type=signal&sentiment=bullish&market=crypto" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔒 Step 8: (Optional) Access Control Integration

If you want to implement paid posts and subscriptions, add access control checks:

```go
// internal/processing/status/get.go

func (p *Processor) Get(ctx context.Context, requestingAccount *gtsmodel.Account, targetStatusID string) (*apimodel.Status, gtserror.WithCode) {
    status, err := p.state.DB.GetStatusByID(ctx, targetStatusID)
    if err != nil {
        return nil, gtserror.NewErrorNotFound(err)
    }

    // Check access control if custom metadata has access_level
    if status.CustomMetadata != nil && status.CustomMetadata.AccessLevel != "" && status.CustomMetadata.AccessLevel != "public" {
        hasAccess, err := p.checkAccess(ctx, requestingAccount, status)
        if err != nil || !hasAccess {
            // Return limited version or error
            return p.getLimitedStatus(ctx, status), nil
        }
    }

    return p.tc.StatusToAPIStatus(ctx, status, requestingAccount)
}

func (p *Processor) checkAccess(ctx context.Context, account *gtsmodel.Account, status *gtsmodel.Status) (bool, error) {
    // If it's the author's own post
    if account.ID == status.AccountID {
        return true, nil
    }

    switch status.CustomMetadata.AccessLevel {
    case "followers":
        // Check if requesting account follows the author
        return p.state.DB.IsFollowing(ctx, account.ID, status.AccountID)
    
    case "paid":
        // Check if user has purchased this post (requires custom purchase table)
        return p.state.DB.HasPurchasedPost(ctx, account.ID, status.ID)
    
    case "subscribers":
        // Check if user is subscribed to author (requires custom subscription table)
        return p.state.DB.IsSubscribedTo(ctx, account.ID, status.AccountID)
    
    default:
        return false, nil
    }
}
```

---

## 🚀 Deployment Steps

1. **Apply migrations:**
```bash
./gotosocial --config-path ./config.yaml admin db migrate
```

2. **Rebuild GoToSocial:**
```bash
go build -o gotosocial ./cmd/gotosocial
```

3. **Restart service:**
```bash
systemctl restart gotosocial
```

4. **Verify:**
```bash
# Check that custom_metadata column exists
psql -d gotosocial -c "SELECT column_name FROM information_schema.columns WHERE table_name='statuses';"
```

---

## 📝 Summary

After these changes, your GoToSocial instance will support:

✅ Custom post types (signal, news, education, etc.)  
✅ Trading signal metadata (ticker, entry, stop, target)  
✅ Sentiment tracking (bullish/bearish)  
✅ Market categorization  
✅ Timeline filtering by metadata  
✅ Optional access control for paid content  

Your frontend is **already prepared** to use these features through the hooks and services we created earlier!

---

**Next Steps:**
1. Fork GoToSocial repository
2. Apply these changes
3. Test locally
4. Deploy to production
5. Update frontend `.env` to point to your custom instance
