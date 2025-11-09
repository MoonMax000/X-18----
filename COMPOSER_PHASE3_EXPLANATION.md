# Composer Phase 3: Что изменилось и как это работает

## Краткий ответ

В Фазе 3 была добавлена **backend-поддержка** для новых полей контроля доступа к постам. Frontend UI еще НЕ создан, поэтому визуально ничего не изменилось.

---

## Подробно: Что было сделано

### 1. Backend изменения ✅ (задеплоено в production)

#### A. База данных
Добавлено 2 новых поля в таблицу `posts`:

```sql
access_level VARCHAR(30) DEFAULT 'free'
- Значения: 'free', 'pay-per-post', 'subscribers-only', 'followers-only', 'premium'

reply_policy VARCHAR(30) DEFAULT 'everyone'  
- Значения: 'everyone', 'following', 'verified', 'mentioned'
```

**Где:** Production database (AWS Lightsail PostgreSQL)
**Статус:** ✅ Применено и проверено

#### B. Backend API (Go)
**Файл:** `custom-backend/internal/models/post.go`
```go
type Post struct {
    // ... существующие поля
    
    // Новые поля Phase 3
    AccessLevel string `gorm:"size:30;default:'free';index" json:"access_level"`
    ReplyPolicy string `gorm:"size:30;default:'everyone'" json:"reply_policy"`
}
```

**Файл:** `custom-backend/internal/api/posts.go`
```go
type CreatePostRequest struct {
    // ... существующие поля
    
    // Новые поля Phase 3
    AccessLevel string `json:"access_level"`
    ReplyPolicy string `json:"reply_policy"`
}
```

**Валидация:**
- Проверяет, что `access_level` - одно из 5 допустимых значений
- Проверяет, что `reply_policy` - одно из 4 допустимых значений
- Требует `price_cents > 0` если `access_level = 'pay-per-post'`

**Где:** Custom backend (ECS Fargate)
**Статус:** ✅ Задеплоено в production (commit c41f3af8)

### 2. Frontend изменения ⏳ (код готов, НЕ задеплоен)

#### A. TypeScript типы
**Файл:** `client/services/api/custom-backend.ts`
```typescript
interface CreatePostData {
    // ... существующие поля
    
    // Новые поля Phase 3
    access_level?: 'free' | 'pay-per-post' | 'subscribers-only' | 'followers-only' | 'premium';
    reply_policy?: 'everyone' | 'following' | 'verified' | 'mentioned';
    price_cents?: number;
}
```

#### B. Маппинг полей
**Файл:** `client/utils/postPayloadBuilder.ts`
```typescript
export function buildPostPayload(data: PostFormData): CreatePostData {
    return {
        // ... существующий маппинг
        
        // Новый маппинг Phase 3
        access_level: data.accessType || 'free',
        reply_policy: data.replySetting || 'everyone',
        price_cents: data.price ? Math.round(data.price * 100) : undefined
    };
}
```

**Где:** Client code (React)
**Статус:** ⏳ Код готов, но НЕ задеплоен

### 3. UI компоненты ❌ (еще не созданы)

**НЕ СДЕЛАНО:**
- Селектор "Who can see" (выбор access_level)
- Инпут для цены (при выборе pay-per-post)
- Селектор "Who can reply" (выбор reply_policy)

**Почему не видно изменений:**
Потому что UI для выбора этих настроек еще не добавлен в композер!

---

## Как это должно работать (когда UI будет готов)

### Сценарий 1: Free Post (по умолчанию)
```
Пользователь создает пост → 
Backend получает: { access_level: 'free', reply_policy: 'everyone' } →
Пост сохраняется в БД с этими значениями
```

### Сценарий 2: Pay-per-post
```
Пользователь выбирает "Pay-per-post" + вводит $5 →
Backend получает: { access_level: 'pay-per-post', price_cents: 500 } →
Backend проверяет: price_cents > 0 ✓ →
Пост сохраняется
```

### Сценарий 3: Subscribers-only
```
Пользователь выбирает "Subscribers only" →
Backend получает: { access_level: 'subscribers-only' } →
Пост сохраняется (доступен только подписчикам)
```

---

## Почему не видно изменений локально?

### Production:
✅ Backend код задеплоен
✅ Миграция БД применена
❌ Frontend НЕ задеплоен (нет UI)
**Результат:** API принимает новые поля, но нельзя их отправить из UI

### Локально (ваша машина):
❌ Backend не перезапущен (старая версия)
❌ Миграция НЕ применена к локальной БД
❌ Frontend не задеплоен
**Результат:** Ничего не работает

---

## Как проверить что это работает?

### 1. Проверка через API (curl)

**Создать free post:**
```bash
curl -X POST https://your-api.com/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test post",
    "access_level": "free",
    "reply_policy": "everyone"
  }'
```

**Создать pay-per-post:**
```bash
curl -X POST https://your-api.com/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Premium content",
    "access_level": "pay-per-post",
    "price_cents": 500,
    "reply_policy": "everyone"
  }'
```

**Проверить что поля сохранились:**
```bash
# В БД
psql ... -c "SELECT id, content, access_level, reply_policy, price_cents FROM posts ORDER BY created_at DESC LIMIT 5;"
```

### 2. Проверка локально (если нужно)

#### Применить миграцию к локальной БД:
```bash
cd custom-backend
psql -U postgres -d tyriantrade -f internal/database/migrations/024_add_access_control_fields.sql
```

#### Перезапустить backend:
```bash
./START_CUSTOM_BACKEND_STACK.sh
```

---

## Что нужно сделать дальше?

### Фаза 4: UI Implementation (следующий шаг)

1. **Создать Audience Selector компонент**
   ```typescript
   // В CreatePostBox или QuickComposer
   <select value={accessType} onChange={...}>
     <option value="free">Everyone can see</option>
     <option value="subscribers-only">Subscribers only</option>
     <option value="followers-only">Followers only</option>
     <option value="pay-per-post">Pay-per-post</option>
     <option value="premium">Premium</option>
   </select>
   ```

2. **Добавить Price Input** (показывается только если accessType === 'pay-per-post')
   ```typescript
   {accessType === 'pay-per-post' && (
     <input 
       type="number" 
       placeholder="Price in USD"
       value={price}
       onChange={...}
     />
   )}
   ```

3. **Создать Reply Policy Selector**
   ```typescript
   <select value={replySetting} onChange={...}>
     <option value="everyone">Everyone can reply</option>
     <option value="following">People you follow</option>
     <option value="verified">Verified accounts only</option>
     <option value="mentioned">Only mentioned</option>
   </select>
   ```

4. **Интегрировать в форму**
   - Добавить эти селекторы в `CreatePostBox` или `QuickComposer`
   - Сохранять значения в state
   - Отправлять через `buildPostPayload`

5. **Задеплоить frontend**
   ```bash
   cd client
   npm run build
   # Deploy to S3/CloudFront
   ```

---

## Текущий статус проекта

```
✅ Phase 1: Критичные фиксы (COMPLETE)
✅ Phase 2: UX компоненты (COMPLETE)
✅ Phase 3: Backend интеграция (COMPLETE)
   ✅ Database migration
   ✅ Backend model & API
   ✅ Frontend types & payload builder
   ❌ UI components (not created yet)
⏳ Phase 4: UI Implementation (PENDING)
⏳ Phase 5: Testing (PENDING)
```

---

## Резюме

**Что сделано:**
- ✅ База данных готова принимать access_level и reply_policy
- ✅ Backend API валидирует и сохраняет эти поля
- ✅ Frontend код готов отправлять эти поля (но UI нет)

**Почему не видно изменений:**
- ❌ UI компоненты (селекторы) еще не созданы
- ❌ Без UI нельзя выбрать access_level/reply_policy
- ❌ Frontend не задеплоен даже с готовым кодом

**Следующий шаг:**
Создать UI компоненты для выбора access_level, reply_policy и цены в композере.
