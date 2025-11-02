# Username Change Limitation - Twitter-Style Implementation

## Дата: 02.11.2025

## Обзор
Реализована система ограничения смены username по типу Twitter:
- **3 бесплатных смены** username
- После этого - **только 1 раз в неделю** (7 дней)

## Изменения

### 1. Backend - Database Model
**Файл:** `custom-backend/internal/models/user.go`

Добавлены поля для отслеживания:
```go
UsernameChangesCount int        `gorm:"default:0" json:"username_changes_count"`
LastUsernameChangeAt *time.Time `json:"last_username_change_at,omitempty"`
```

### 2. Database Migration
**Файл:** `custom-backend/internal/database/migrations/015_add_username_change_tracking.sql`

Создана миграция, добавляющая:
- Колонку `username_changes_count` (INTEGER, default 0)
- Колонку `last_username_change_at` (TIMESTAMP, nullable)
- Индекс для оптимизации запросов
- Комментарии к колонкам

### 3. Backend API Logic
**Файл:** `custom-backend/internal/api/users.go`

Добавлена валидация в метод `UpdateProfile`:
- Проверка на занятость username
- Проверка лимита изменений:
  - Если < 3 изменений: разрешить и инкрементировать счетчик
  - Если >= 3 изменений: проверить прошло ли 7 дней с последней смены
  - Возврат детальной ошибки с информацией о времени до следующей смены

### 4. Frontend API Service
**Файл:** `client/services/api/custom-backend.ts`

Добавлен метод `getMe()` как алиас для `getCurrentUser()`.

### 5. Frontend UI
**Файл:** `client/components/ProfileOverview/ProfileOverview.tsx`

Реализован UI для отображения лимитов:
- Показ количества оставшихся бесплатных смен ("3 free changes left")
- Показ даты следующей доступной смены ("Next change: DD.MM.YYYY")
- Показ ошибок с детальной информацией о времени ожидания
- Auto-save username изменений с валидацией

## Как работает система

### Первые 3 смены (бесплатные)
1. Пользователь меняет username
2. Backend инкрементирует `username_changes_count`
3. Обновляет `last_username_change_at` на текущее время
4. Frontend показывает: "2 free changes left" (например)

### После 3-х смен
1. Пользователь пытается поменять username
2. Backend проверяет: прошло ли 7 дней с `last_username_change_at`
3. Если **да** - разрешает, инкрементирует счетчик, обновляет дату
4. Если **нет** - возвращает ошибку с информацией:
   ```json
   {
     "error": {
       "message": "Username can only be changed once per week after 3 changes",
       "days_left": 5,
       "hours_left": 12,
       "next_change_at": "2025-11-09T10:30:00Z"
     }
   }
   ```
5. Frontend показывает: "Next change in 5 days and 12 hours"

## Deployment Status

### ✅ Completed
- [x] Backend model updates
- [x] Database migration created
- [x] Backend validation logic
- [x] Frontend UI implementation
- [x] API service updates

### 🔄 In Progress
- [ ] Migration 015 applied to production DB (running)
- [ ] Backend deployed to ECS
- [ ] End-to-end testing

## Testing Plan

После деплоя нужно протестировать:

1. **Первая смена username**
   - Проверить что счетчик = 1
   - UI показывает "2 free changes left"

2. **Вторая и третья смены**
   - Счетчик увеличивается корректно
   - UI обновляется правильно

3. **Четвертая смена (сразу после третьей)**
   - Должна вернуть ошибку
   - Показать сколько времени до следующей смены

4. **Смена через 7 дней**
   - Должна быть разрешена
   - Счетчик инкрементируется
   - Дата обновляется

## Production URLs
- Backend API: https://api.tyriantrade.com
- Frontend: https://social.tyriantrade.com
- Profile Settings: https://social.tyriantrade.com/profile?tab=profile

## Files Modified
1. `custom-backend/internal/models/user.go`
2. `custom-backend/internal/api/users.go`
3. `custom-backend/internal/database/migrations/015_add_username_change_tracking.sql`
4. `client/services/api/custom-backend.ts`
5. `client/components/ProfileOverview/ProfileOverview.tsx`

## Next Steps
1. ✅ Verify migration 015 applied successfully
2. Deploy backend to ECS with new code
3. Deploy frontend to S3/CloudFront
4. Test complete flow on production
5. Monitor for any issues

## Notes
- Система полностью автоматическая, не требует manual intervention
- Все изменения backwards compatible
- Существующие пользователи начнут с 0 изменений (3 бесплатных доступны)
- Username verification badge продолжает работать как раньше
