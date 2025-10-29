# GoToSocial Metadata Extension - Simple Guide

## Что это такое?

Ваш frontend уже имеет форму создания поста с такими полями:

- **Market** (dropdown): Crypto, Stocks, Forex, Commodities, Indices
- **Category** (dropdown с иконками): Signal, News, Education, Analysis, Macro, Code, Video, General
- **Symbol** (text input): BTC, ETH, AAPL и т.д.
- **Timeframe** (dropdown): 15m, 1h, 4h, 1d, 1w
- **Risk** (dropdown): Low, Medium, High
- **Access Type** (modal): free, pay-per-post, subscribers-only, followers-only, premium
- **Price** (number input): цена для pay-per-post

Это **просто UI элементы** для сбора данных. Никакой сложной логики.

---

## Что нужно сохранить в GoToSocial?

Когда пользователь создаёт пост, frontend отправляет JSON:

```json
{
  "status": "BTC breakout! Great opportunity 🚀",
  "visibility": "public",
  "custom_metadata": {
    "market": "Crypto",
    "category": "Signal",
    "symbol": "BTC",
    "timeframe": "4h",
    "risk": "Medium",
    "access_type": "pay-per-post",
    "price": 5.0
  }
}
```

GoToSocial должен **просто сохранить** этот JSON в базе данных. Всё.

---

## Минимальная доработка GoToSocial

### Шаг 1: Добавить колонку в БД (5 минут)

```sql
-- PostgreSQL
ALTER TABLE statuses 
ADD COLUMN custom_metadata JSONB;

-- SQLite
ALTER TABLE statuses 
ADD COLUMN custom_metadata TEXT;
```

### Шаг 2: Обновить модель Status (2 минуты)

`internal/gtsmodel/status.go`:

```go
type Status struct {
    ID        string    `bun:"type:CHAR(26),pk"`
    Content   string    `bun:""`
    // ... existing fields ...
    
    // Add this one line:
    CustomMetadata *json.RawMessage `bun:"type:jsonb,nullzero"`
}
```

### Шаг 3: Принимать данные в API (10 минут)

`internal/api/client/statuses/statuscreate.go`:

```go
type StatusCreateRequest struct {
    Status    string `json:"status"`
    // ... existing fields ...
    
    // Add this one line:
    CustomMetadata *json.RawMessage `json:"custom_metadata,omitempty"`
}

func (m *Module) StatusCreatePOSTHandler(c *gin.Context) {
    // ... existing code ...
    
    form := &StatusCreateRequest{}
    if err := c.ShouldBindJSON(form); err != nil {
        // handle error
    }
    
    status := &gtsmodel.Status{
        Content: form.Status,
        // ... other fields ...
        CustomMetadata: form.CustomMetadata, // Just pass it through
    }
    
    // Save to DB
    db.Create(status)
}
```

### Шаг 4: Вернуть данные в ответе (5 минут)

`internal/api/model/status.go`:

```go
type Status struct {
    ID      string `json:"id"`
    Content string `json:"content"`
    // ... existing fields ...
    
    // Add this one line:
    CustomMetadata *json.RawMessage `json:"custom_metadata,omitempty"`
}
```

### Шаг 5 (опционально): Фильтрация (20 минут)

Если хотите фильтровать посты по категориям:

```go
// GET /api/v1/timelines/home?category=Signal&market=Crypto

func GetTimeline(category, market string) ([]*Status, error) {
    query := db.NewSelect().Model(&Status{})
    
    if category != "" {
        query = query.Where("custom_metadata->>'category' = ?", category)
    }
    if market != "" {
        query = query.Where("custom_metadata->>'market' = ?", market)
    }
    
    var statuses []*Status
    query.Scan(&statuses)
    return statuses, nil
}
```

---

## Полный пример изменений

### 1. Миграция (1 файл)

`internal/db/bundb/migrations/20240315000001_add_custom_metadata.go`:

```go
package migrations

import (
    "context"
    "github.com/uptrace/bun"
)

func init() {
    up := func(ctx context.Context, db *bun.DB) error {
        _, err := db.ExecContext(ctx, 
            "ALTER TABLE statuses ADD COLUMN custom_metadata JSONB")
        return err
    }

    down := func(ctx context.Context, db *bun.DB) error {
        _, err := db.ExecContext(ctx, 
            "ALTER TABLE statuses DROP COLUMN custom_metadata")
        return err
    }

    if err := Migrations.Register(up, down); err != nil {
        panic(err)
    }
}
```

### 2. Модель (изменить 1 файл)

`internal/gtsmodel/status.go`:

```go
import "encoding/json"

type Status struct {
    // ... existing fields ...
    CustomMetadata *json.RawMessage `bun:"type:jsonb,nullzero"`
}
```

### 3. API Request (изменить 1 файл)

`internal/api/client/statuses/statuscreate.go`:

```go
type StatusCreateRequest struct {
    // ... existing fields ...
    CustomMetadata *json.RawMessage `json:"custom_metadata,omitempty"`
}
```

### 4. API Response (изменить 1 файл)

`internal/api/model/status.go`:

```go
type Status struct {
    // ... existing fields ...
    CustomMetadata *json.RawMessage `json:"custom_metadata,omitempty"`
}
```

**Итого:** 1 новый файл + 3 изменённых файла = **~50 строк кода**

---

## Тестирование

### Создать пост с метаданными:

```bash
curl -X POST https://your-gts.com/api/v1/statuses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "BTC signal! 🚀",
    "visibility": "public",
    "custom_metadata": {
      "market": "Crypto",
      "category": "Signal",
      "symbol": "BTC",
      "timeframe": "4h",
      "risk": "Medium"
    }
  }'
```

### Получить пост:

```bash
curl https://your-gts.com/api/v1/statuses/STATUS_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Ответ:
```json
{
  "id": "01HKJW7M8X...",
  "content": "BTC signal! 🚀",
  "custom_metadata": {
    "market": "Crypto",
    "category": "Signal",
    "symbol": "BTC",
    "timeframe": "4h",
    "risk": "Medium"
  }
}
```

### Фильтровать (если добавили фильтрацию):

```bash
# Только сигналы
curl "https://your-gts.com/api/v1/timelines/home?category=Signal"

# Только крипто новости
curl "https://your-gts.com/api/v1/timelines/home?category=News&market=Crypto"
```

---

## Frontend уже готов!

Ваш frontend уже создаёт эти данные в `useSimpleComposer.ts`:

```typescript
const postData = {
  status: text,
  visibility: 'public',
  custom_metadata: {
    market: postMarket,        // "Crypto"
    category: postCategory,    // "Signal"
    symbol: postSymbol,        // "BTC"
    timeframe: postTimeframe,  // "4h"
    risk: postRisk,            // "Medium"
    access_type: accessType,   // "pay-per-post"
    price: postPrice,          // 5.0
  }
};
```

После доработки GoToSocial просто отправляйте этот объект в `/api/v1/statuses` и всё заработает!

---

## Отображение бейджей

Frontend уже умеет показывать бейджи на основе `custom_metadata`:

```typescript
// В компоненте FeedPost.tsx

function PostBadges({ post }: { post: GTSStatus }) {
  if (!post.custom_metadata) return null;

  return (
    <div className="flex gap-2">
      {/* Category badge */}
      <Badge color={categoryColors[post.custom_metadata.category]}>
        {post.custom_metadata.category}
      </Badge>

      {/* Market badge */}
      <Badge>{post.custom_metadata.market}</Badge>

      {/* Symbol */}
      {post.custom_metadata.symbol && (
        <Badge>${post.custom_metadata.symbol}</Badge>
      )}

      {/* Timeframe */}
      {post.custom_metadata.timeframe && (
        <Badge>{post.custom_metadata.timeframe}</Badge>
      )}
    </div>
  );
}
```

---

## Важно: Монетизация

**Метаданные `access_type` и `price` НЕ работают автоматически!**

GoToSocial будет **сохранять** эти поля, но **не проверять доступ**.

Для реальной монетизации нужна отдельная система:
- Stripe/PayPal интеграция
- Таблица payments в БД
- Middleware для проверки доступа

Но это уже **отдельная задача**, не связанная с метаданными постов.

---

## Резюме

### Что делают метаданные:
✅ Категоризация постов (Signal, News, etc.)  
✅ Рыночна�� информация (Crypto, Stocks, etc.)  
✅ Торговые данные (Symbol, Timeframe, Risk)  
✅ Фильтрация постов по категориям  
✅ Отображение бейджей в UI  

### Что НЕ делают метаданные:
❌ Ограничение доступа (нужна отдельная система монетизации)  
❌ Обработка платежей (нужен Stripe)  
❌ Проверка подписок (нужна таблица subscriptions)  

### Сколько времени:
⏱️ **30-60 минут** на базовую реализацию  
⏱️ **+2-3 часа** на фильтрацию и тесты  
⏱️ **Итого: ~4 часа работы**

### Что нужно знать:
- Базовый Go (если умеете читать код - достаточно)
- SQL (ALTER TABLE)
- JSON (просто копировать/вставлять данные)

**Это действительно просто!** 🎉
