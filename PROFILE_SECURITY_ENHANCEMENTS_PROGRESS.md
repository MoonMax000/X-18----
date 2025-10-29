# Отчет о реализации улучшений безопасности профиля

## Статус: В процессе (14% завершено - 4/28 задач)

Дата: 29.10.2025

---

## ✅ Завершенные задачи

### Backend - Базовая инфраструктура TOTP

1. **✅ Добавлена библиотека github.com/pquerna/otp**
   - Установлена версия v1.5.0
   - Включает зависимость github.com/boombuler/barcode для QR кодов

2. **✅ Создана миграция базы данных**
   - Файл: `custom-backend/internal/database/migrations/009_add_totp_and_deactivation_fields.sql`
   - Добавлены поля:
     - `totp_secret` VARCHAR(255) - зашифрованный секрет TOTP
     - `totp_enabled` BOOLEAN - статус включения TOTP
     - `deactivated_at` TIMESTAMP - время деактивации аккаунта
     - `deletion_scheduled_at` TIMESTAMP - запланированное удаление (через 30 дней)
   - Созданы индексы для оптимизации производительности

3. **✅ Обновлена модель User**
   - Добавлены новые поля в структуру User
   - TOTPSecret скрыт из JSON ответов (json:"-")
   - Добавлены комментарии о 30-дневном периоде восстановления

4. **✅ Создан базовый TOTPService**
   - Структура сервиса готова в `custom-backend/internal/services/security.go`
   - Методы-заглушки созданы:
     - `GenerateTOTPSecret()` - генерация секрета и QR кода
     - `VerifyTOTPCode()` - верификация TOTP кода
     - `EnableTOTP()` - включение TOTP для пользователя
     - `DisableTOTP()` - отключение TOTP

---

## 🚧 В процессе / Требуется реализация

### Backend - TOTP функциональность

#### 5. **Реализовать TOTP endpoints в auth.go** (КРИТИЧНО)
Необходимо добавить следующие endpoints:

```go
// TOTP Management
POST /api/auth/2fa/totp/generate      - Генерация QR кода
POST /api/auth/2fa/totp/verify-setup  - Подтверждение setup TOTP
POST /api/auth/2fa/totp/verify        - Верификация TOTP при логине

// Account Settings с TOTP
POST /api/auth/account/change-email   - Смена email (требует TOTP)
POST /api/auth/account/change-phone   - Смена phone (требует TOTP)
POST /api/auth/account/change-password - Смена пароля (требует TOTP)

// Account Deactivation
POST /api/auth/account/deactivate     - Деактивация аккаунта
POST /api/auth/account/reactivate     - Восстановление аккаунта
GET  /api/auth/account/deactivation-status - Проверка статуса
```

#### 6. **Завершить реализацию TOTP функций**
В `security.go` нужно дописать:
- Генерацию TOTP секрета используя `otp.Generate()`
- Создание QR кода изображения
- Кодирование QR в base64 data URL
- Верификацию TOTP кода с временным окном
- Шифрование TOTP секрета перед сохранением

#### 7. **Система деактивации аккаунта**
- Логика деактивации с установкой `deletion_scheduled_at` = now + 30 дней
- Проверка при логине: если аккаунт деактивирован, предложить восстановление
- Автоматическое восстановление при успешном логине в течение 30 дней

#### 8. **Cron job для удаления аккаунтов**
Создать отдельный сервис или scheduled task:
```go
// internal/services/cleanup.go
func CleanupDeactivatedAccounts() {
    // Найти аккаунты где deletion_scheduled_at < now
    // Безвозвратно удалить эти аккаунты
}
```

---

### Frontend - TOTP 2FA Interface

#### 9. **Модальное окно с QR кодом**
В `ProfileSecuritySettings.tsx`:
- При включении 2FA показать модал с QR кодом
- Инструкция: "Отсканируйте QR код в Google Authenticator / Microsoft Authenticator / Authy"
- Показать секретный ключ для ручного ввода

#### 10. **Ввод TOTP кода для верификации**
- 6 полей для ввода цифр
- Автопереход между полями
- Верификация кода после ввода 6 цифр

#### 11. **Обновить интерфейс SecuritySettings**
- Добавить индикатор статуса TOTP
- Показывать "TOTP 2FA Enabled" с галочкой
- Кнопка "Отключить" только если введен правильный TOTP код

#### 12. **Смена email/phone/password через TOTP**
Для каждой операции:
- Проверить что TOTP включен
- Запросить TOTP код перед выполнением
- Показать ошибку если TOTP не настроен

---

### Frontend - Деактивация аккаунта

#### 13. **UI для деактивации**
В tab "Delete Account":
- Предупреждение красным цветом
- "Аккаунт будет деактивирован на 30 дней"
- "Вы можете войти снова в течение 30 дней для восстановления"
- "После 30 дней аккаунт будет удален безвозвратно"

#### 14. **Страница восстановления**
При логине деактивированного аккаунта:
- Показать модал: "Ваш аккаунт деактивирован"
- "Удаление запланировано на: [дата]"
- Кнопка "Восстановить аккаунт"

---

### Frontend - Упрощение профиля

#### 15. **Рефакторинг полей имени**
Текущие поля: `first_name`, `last_name`, `display_name`, `username`

Новая структура:
- `full_name` - одно поле для имени и фамилии
- `username` - @никнейм

Обновить:
- Backend модель User
- API endpoints
- Frontend формы
- Все компоненты отображающие имя

#### 16. **Обновить ProfileContentClassic.tsx**
- Убрать поля first_name, last_name
- Добавить одно поле "Full Name"
- Валидация: минимум 2 символа

---

### Frontend - Автосохранение

#### 17. **Реализовать debounced auto-save**
```typescript
const useAutoSave = (value: string, onSave: (val: string) => void, delay = 1000) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  useEffect(() => {
    setSaving(true);
    const timer = setTimeout(async () => {
      await onSave(value);
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value]);
  
  return { saving, saved };
};
```

#### 18. **Убрать кнопки Reset и Save Changes**
- Удалить кнопки из всех форм
- Автосохранение при переключении полей

#### 19. **Индикатор "Saving..." → "Saved ✓"**
```tsx
{saving && <span className="text-gray-400">Saving...</span>}
{saved && <span className="text-green-500">Saved ✓</span>}
```

---

### Frontend - Валидация и улучшения

#### 20. **Ограничить Bio до 300 символов**
```tsx
<textarea 
  maxLength={300}
  value={bio}
  onChange={(e) => setBio(e.target.value)}
/>
<span className="text-gray-400 text-sm">
  {bio.length}/300 characters
</span>
```

#### 21. **Автозакрытие dropdowns**
Role и Sector dropdowns:
- Закрывать после выбора
- Закрывать при клике вне dropdown
- Использовать `useOnClickOutside` hook

#### 22. **Проверить все поля**
Убедиться что работают:
- Location (текстовое поле)
- Website/URL (валидация URL)
- Role (dropdown)
- Sector (dropdown)
- Bio (textarea с ограничением)

---

### Testing - Интеграционное тестирование

#### 23. **Тест TOTP 2FA flow**
1. Включить TOTP в настройках
2. Получить QR код
3. Отсканировать в Google Authenticator
4. Ввести код для верификации
5. Выйти и войти снова
6. Ввести TOTP код при логине

#### 24. **Тест деактивации аккаунта**
1. Деактивировать аккаунт
2. Попытаться войти - увидеть предложение восстановить
3. Восстановить аккаунт
4. Убедиться что все данные сохранены

#### 25. **Тест автосохранения**
1. Изменить Bio
2. Переключиться на другое поле
3. Увидеть "Saving..." → "Saved ✓"
4. Обновить страницу
5. Убедиться что изменения сохранены

#### 26. **Тест смены email/phone/password**
1. Включить TOTP
2. Попытаться сменить email без TOTP - ошибка
3. Ввести TOTP код
4. Сменить email успешно
5. Повторить для phone и password

---

## 📊 Общий прогресс

```
Backend TOTP:           █████░░░░░ 50% (2/4)
Backend Endpoints:      ░░░░░░░░░░  0% (0/3)
Backend Deactivation:   ░░░░░░░░░░  0% (0/2)
Frontend TOTP:          ░░░░░░░░░░  0% (0/4)
Frontend Deactivation:  ░░░░░░░░░░  0% (0/2)
Frontend Profile:       ░░░░░░░░░░  0% (0/2)
Frontend Auto-save:     ░░░░░░░░░░  0% (0/3)
Frontend Validation:    ░░░░░░░░░░  0% (0/3)
Testing:                ░░░░░░░░░░  0% (0/4)
```

**Общий прогресс: 14% (4/28)**

---

## 🎯 Следующие шаги (приоритет)

1. **Завершить TOTP функции в security.go**
   - Добавить генерацию QR кода
   - Реализовать верификацию TOTP

2. **Создать TOTP endpoints в auth.go**
   - 3 endpoint для TOTP management
   - 3 endpoint для смены данных с TOTP

3. **Реализовать деактивацию аккаунта**
   - Endpoints для deactivate/reactivate
   - Логика 30-дневного восстановления

4. **Frontend TOTP interface**
   - Модальное окно с QR кодом
   - Ввод 6-значного кода

5. **Frontend автосохранение**
   - useAutoSave hook
   - Индикаторы saving/saved

---

## 💡 Рекомендации

### Безопасность
- TOTP секрет должен быть зашифрован в базе данных
- Использовать bcrypt или AES для шифрования
- Хранить ключ шифрования в переменных окружения

### User Experience
- Показывать backup codes при первом включении TOTP
- Позволить восстановление через backup email
- Отправлять email уведомления о важных действиях

### Производительность
- Кешировать TOTP верификацию (не проверять один код дважды)
- Debounce автосохранения минимум 1 секунда
- Batch updates для множественных изменений профиля

---

## 📝 Заметки по реализации

### TOTP Generation
```go
import "github.com/pquerna/otp/totp"

key, err := totp.Generate(totp.GenerateOpts{
    Issuer:      "TyrianTrade",
    AccountName: user.Email,
    Period:      30,
    Digits:      6,
    Algorithm:   otp.AlgorithmSHA1,
})
secret := key.Secret()
qrCode := key.URL() // Use this to generate QR image
```

### QR Code Generation
```go
import "github.com/boombuler/barcode/qr"
import "github.com/boombuler/barcode"
import "image/png"
import "bytes"

code, _ := qr.Encode(qrURL, qr.M, qr.Auto)
code, _ = barcode.Scale(code, 256, 256)

var buf bytes.Buffer
png.Encode(&buf, code)
base64Image := base64.StdEncoding.EncodeToString(buf.Bytes())
dataURL := "data:image/png;base64," + base64Image
```

### TOTP Verification
```go
import "github.com/pquerna/otp/totp"

valid := totp.Validate(code, secret)
```

---

## 🔄 Обновления

- **29.10.2025 20:57** - Создан базовый отчет, завершена инфраструктура TOTP (4/28 задач)
