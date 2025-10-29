# 🚀 Установка переменных окружения на Railway

## Критическая переменная для медиа файлов

### Добавьте в Railway Dashboard:

1. **Откройте Railway Dashboard**
   - https://railway.com/project/9096e98b-bc6f-4b33-af17-a646f1eecd93
   
2. **Выберите сервис `x-18-production`**
   
3. **Перейдите во вкладку Variables**
   
4. **Добавьте переменную:**
   ```
   BASE_URL = https://api.tyriantrade.com
   ```

5. **Нажмите Save Changes**

6. **Railway автоматически перезапустит сервис**

## Проверка после установки

После перезапуска проверьте что медиа файлы загружаются с правильного URL:
- ❌ Неправильно: `http://localhost:8080/storage/media/...`
- ✅ Правильно: `https://api.tyriantrade.com/storage/media/...`

## Другие важные переменные

Убедитесь что у вас установлены:
```
PORT = 8080
DATABASE_URL = (уже должна быть)
JWT_SECRET = (уже должна быть)
CORS_ORIGINS = https://social.tyriantrade.com
```

---
*После установки BASE_URL все новые загруженные медиа файлы будут иметь правильный URL*
