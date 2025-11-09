# Диагноз проблемы синхронизации avatar/cover

## Проблема

На странице `/profile` изображения успешно загружаются и отображаются, но на `/profile-page` они показываются как placeholder'ы.

## Что работает

1. ✅ Загрузка изображений на S3/CloudFront успешна
2. ✅ UPDATE профиля через `PATCH /api/users/me` работает
3. ✅ AuthContext обновляется после загрузки
4. ✅ На `/profile` изображения отображаются корректно

## Что НЕ работает

❌ API endpoint `GET /api/users/username/{username}` возвращает `avatar_url: undefined` и `header_url: undefined`

## Анализ кода

### Backend (custom-backend/internal/api/users.go)

```go
func (h *UsersHandler) GetUserByUsername(c *fiber.Ctx) error {
    username := c.Params("username")
    
    var user models.User
    if err := h.db.DB.Where("username = ?", username).First(&user).Error; err != nil {
        // ...
    }
    
    return c.JSON(user.ToPublic()) // ✅ ToPublic() включает avatar_url и header_url
}
```

### Backend Model (custom-backend/internal/models/user.go)

```go
type User struct {
    AvatarURL string `gorm:"size:2000" json:"avatar_url"` // ✅ Поле есть
    HeaderURL string `gorm:"size:2000" json:"header_url"` // ✅ Поле есть
}

func (u *User) ToPublic() PublicUser {
    return PublicUser{
        AvatarURL: u.AvatarURL, // ✅ Возвращается
        HeaderURL: u.HeaderURL, // ✅ Возвращается
    }
}
```

### Frontend (client/hooks/useImageUpload.ts)

Логика загрузки:
1. Загружает файл на S3
2. Вызывает `customBackendAPI.updateProfile({ avatar_url: url })` или `{ header_url: url }`
3. Обновляет AuthContext

### Frontend (client/hooks/useCustomUserProfile.ts)

```typescript
// ✅ Правильно делает refetch при изменении currentUser.avatar_url/header_url
useEffect(() => {
    if (isOwnProfile) {
        fetchProfile(); // RE-FETCH from API
    }
}, [currentUser?.avatar_url, currentUser?.header_url]);
```

## Возможные причины

### 1. **База данных не обновляется (НАИБОЛЕЕ ВЕРОЯТНО)**

Проблема: UPDATE запрос выполняется, но данные не сохраняются в БД.

Проверка нужна в `UpdateProfile` handler:
- Проверить что `updates["avatar_url"]` и `updates["header_url"]` правильно записываются
- Проверить что GORM правильно обновляет эти поля
- Возможно нужно добавить логирование для отладки

### 2. Проблема с именованием полей

В Go используется camelCase (`AvatarURL`), но в JSON snake_case (`avatar_url`).
GORM должен правильно маппить через тег `json:"avatar_url"`.

### 3. Проблема с пустыми строками

Возможно поля обновляются пустыми строками `""` вместо реального URL.

## Решение

### Шаг 1: Добавить логирование в UpdateProfile

```go
func (h *UsersHandler) UpdateProfile(c *fiber.Ctx) error {
    // ... existing code ...
    
    if req.AvatarURL != nil {
        log.Printf("Updating avatar_url: %s", *req.AvatarURL)
        updates["avatar_url"] = *req.AvatarURL
    }
    if req.HeaderURL != nil {
        log.Printf("Updating header_url: %s", *req.HeaderURL)
        updates["header_url"] = *req.HeaderURL
    }
    
    if len(updates) > 0 {
        log.Printf("Updates to apply: %+v", updates)
        if err := h.db.DB.Model(&user).Updates(updates).Error; err != nil {
            log.Printf("ERROR updating profile: %v", err)
            return c.Status(500).JSON(fiber.Map{
                "error": "Failed to update profile",
            })
        }
        log.Printf("Profile updated successfully")
    }
    
    // Reload user FROM DATABASE
    h.db.DB.First(&user, "id = ?", userID)
    log.Printf("After reload - avatar_url: %s, header_url: %s", user.AvatarURL, user.HeaderURL)
    
    return c.JSON(user.ToMe())
}
```

### Шаг 2: Проверить миграцию БД

Убедиться что колонки `avatar_url` и `header_url` существуют в таблице `users`:

```sql
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('avatar_url', 'header_url');
```

### Шаг 3: Проверить данные в БД напрямую

```sql
SELECT id, username, avatar_url, header_url 
FROM users 
WHERE username = 'devidandersoncrypto';
```

### Шаг 4: Если данные не записываются

Возможно нужно использовать `Update` вместо `Updates`:

```go
// Вместо:
h.db.DB.Model(&user).Updates(updates).Error

// Попробовать:
if req.AvatarURL != nil {
    h.db.DB.Model(&user).Update("avatar_url", *req.AvatarURL)
}
if req.HeaderURL != nil {
    h.db.DB.Model(&user).Update("header_url", *req.HeaderURL)
}
```

## Следующие шаги

1. Добавить логирование в UpdateProfile handler
2. Пересобрать и задеплоить бэкенд
3. Проверить логи при загрузке изображения
4. Проверить данные в БД напрямую
5. Если нужно - исправить код и задеплоить снова

## Временное решение (workaround)

Можно добавить fallback в frontend чтобы брать avatar/header из AuthContext:

```typescript
const displayAvatar = profile.avatar_url || currentUser?.avatar_url;
const displayHeader = profile.header_url || currentUser?.header_url;
