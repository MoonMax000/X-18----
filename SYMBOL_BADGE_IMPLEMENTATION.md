# Symbol Badge Implementation - Отчёт

## Проблема
Symbol badge не отображается в постах, хотя symbol сохраняется в metadata.

## Реализовано

### 1. Backend (Go)

**custom-backend/internal/api/search.go:**
```go
type SearchPostsRequest struct {
    Symbol string `query:"symbol"` // BTC, ETH, etc.
    // ... other fields
}

// В query builder:
if req.Symbol != "" {
    query = query.Where("metadata->>'symbol' = ?", strings.ToUpper(req.Symbol))
}
```

**custom-backend/internal/api/post_dto.go:**
```go
type PostDTO struct {
    // Extracted metadata fields
    Market    string `json:"market,omitempty"`
    Symbol    string `json:"symbol,omitempty"`
    Ticker    string `json:"ticker,omitempty"` // Alias
    Timeframe string `json:"timeframe,omitempty"`
    Risk      string `json:"risk,omitempty"`
    // ...
}

// В toPostDTO():
if post.Metadata != nil {
    if symbol, ok := post.Metadata["symbol"].(string); ok {
        dto.Symbol = symbol
        dto.Ticker = symbol // Также заполняем ticker
    }
    // ... другие поля
}
```

### 2. Frontend (React/TS)

**client/features/feed/components/posts/FeedPost.tsx:**
```tsx
{/* Symbol Badge */}
{post.ticker && (
  <span 
    onClick={(e) => {
      e.stopPropagation();
      navigate(`/?symbol=${post.ticker}`);
    }}
    className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-white font-bold text-xs cursor-pointer transition-all hover:ring-2 hover:ring-green-400/50 hover:scale-105"
    style={{ backgroundColor: "rgb(16, 185, 129)" }}
    title={`Поиск постов с ${post.ticker}`}
  >
    {post.ticker}
  </span>
)}
```

**client/hooks/useSearch.ts:**
```ts
export interface SearchFilters {
  query: string;
  symbol?: string; // Добавлено
  // ... other fields
}

// В search():
if (searchFilters.symbol) params.append('symbol', searchFilters.symbol);
```

**client/components/SearchModal/SearchModal.tsx:**
```tsx
const symbolParam = searchParams.get('symbol');

const { results } = useSearch({
  query: searchQuery,
  symbol: symbolParam || undefined, // Передаём symbol
  // ...
});

// Установить symbol из URL при открытии
useEffect(() => {
  if (isOpen && symbolParam) {
    setSearchQuery(symbolParam);
  }
}, [isOpen, symbolParam]);
```

## Диагностика

### Логи показывают:
```
ticker: undefined  // ❌ Backend НЕ извлекает
market: "Stocks"   // ✅ Работает
category: "Analysis" // ✅ Работает
```

### DEBUG добавлен:
```go
fmt.Printf("\n[toPostDTO] Post ID: %s\n", post.ID)
fmt.Printf("[toPostDTO] Metadata: %+v\n", post.Metadata)
fmt.Printf("[toPostDTO] Extracted symbol/ticker: %s\n", symbol)
fmt.Printf("[toPostDTO] Result DTO - Market: %s, Symbol: %s, Ticker: %s\n\n", dto.Market, dto.Symbol, dto.Ticker)
```

## Следующие шаги

1. **Дождитесь запуска** фронтенда (идёт сейчас)
2. **Обновите страницу** в браузере (F5)
3. **Создайте НОВЫЙ пост** с заполненным Symbol
4. **Проверьте backend логи:**
   ```bash
   tail -f custom-backend.log | grep toPostDTO
   ```
5. **Проверьте что показывает** `[toPostDTO] Metadata:` - там должен быть symbol
6. **Если Metadata пустая** - проблема в том как posts.go сохраняет

## Файлы изменены:
- custom-backend/internal/api/search.go
- custom-backend/internal/api/post_dto.go 
- client/features/feed/components/posts/FeedPost.tsx
- client/hooks/useSearch.ts
- client/components/SearchModal/SearchModal.tsx

## Статус
Backend перезапускается с DEBUG логированием.
После запуска нужно проверить логи при создании нового поста.
