# Анализ архитектуры бэкендов и рекомендации

## 🔍 Текущая ситуация

У вас сейчас **ДВА** отдельных бэкенда:

### 1. GoToSocial (Порт 8080)
**Язык:** Go  
**Назначение:** Федеративная социальная сеть (ActivityPub протокол)

**Функционал GoToSocial:**
✅ Регистрация пользователей
✅ Аутентификация (OAuth 2.0)
✅ Публикация постов (статусов)
✅ Лайки, репосты, комментарии
✅ Подписки на пользователей
✅ Timeline (лента постов)
✅ Нотификации
✅ Медиа-загрузка (изображения, видео)
✅ Поиск пользователей и постов
✅ Приватность (публичные/приватные посты)
✅ Федерация с другими Mastodon/GoToSocial инстансами
✅ **Custom metadata** (ваша реализация для трейдинговых постов)

### 2. Backend (Node.js/Express) в папке `/backend`
**Язык:** TypeScript/Node.js  
**Назначение:** Дополнительный функционал для платформы

**Функционал Backend:**
✅ Stripe интеграция (платежи)
✅ Подписки (subscriptions)
✅ KYC верификация
✅ Marketplace функции
✅ Дополнительные бизнес-логики

---

## 🤔 Нужно ли объединять бэкенды?

### Вариант 1: НЕ объединять (Рекомендуется) ⭐

**Плюсы:**
- ✅ GoToSocial - зрелый, протестированный продукт
- ✅ Федерация работает из коробки
- ✅ Регулярные обновления безопасности
- ✅ Разделение ответственности (SOC - Separation of Concerns)
- ✅ Можно масштабировать каждый сервис независимо
- ✅ GoToSocial = социальная сеть, Backend = бизнес-логика

**Минусы:**
- ⚠️ Два сервиса для поддержки
- ⚠️ Нужна синхронизация пользователей между системами

**Рекомендуемая архитектура:**
```
Frontend (React)
    ↓
    ├─→ GoToSocial API (8080)  - социальные функции
    │   ├─ Посты
    │   ├─ Подписки
    │   ├─ Лайки
    │   └─ Custom metadata (трейдинг)
    │
    └─→ Backend API (3000)      - бизнес-логика
        ├─ Платежи (Stripe)
        ├─ Подписки premium
        ├─ KYC
        └─ Marketplace
```

### Вариант 2: Объединить в один Node.js backend

**Плюсы:**
- ✅ Одна кодовая база
- ✅ Легче управлять

**Минусы:**
- ❌ Потеряете федерацию ActivityPub
- ❌ Придется переписывать весь функционал GoToSocial
- ❌ Месяцы разработки
- ❌ Потеряете совместимость с Mastodon/Fediverse

---

## 💡 Рекомендация: Микросервисная архитектура

### Оставьте два бэкенда, но синхронизируйте пользователей:

```javascript
// Когда пользователь регистрируется в GoToSocial
// 1. Webhook от GoToSocial → Backend
// 2. Backend создает профиль в своей БД
// 3. Связывает GoToSocial user_id с Backend user_id

// Пример синхронизации:
{
  "gotosocial_id": "01HQWXYZ...",
  "backend_user_id": 123,
  "username": "trader123",
  "email": "trader@example.com",
  "created_at": "2025-10-25"
}
```

---

## 🔧 Как исправить текущие ошибки

### 1. WebSocket ошибки (не критичны)
Это просто предупреждения Vite HMR для разработки. Можно игнорировать или настроить:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    hmr: {
      protocol: 'ws', // вместо 'wss'
      host: 'localhost',
    },
  },
});
```

### 2. CORS ошибки
Уже исправлены в `config.yaml`:
```yaml
cors-allow-origins:
  - "http://localhost:5173"
  - "http://localhost:3000"
  - "http://localhost:8081"
```

### 3. Дублирование /api/v1
✅ УЖЕ ИСПРАВЛЕНО в `.env.local`

---

## 📋 Регистрация пользователей в GoToSocial

### Способ 1: Через CLI (для тестирования)
```bash
cd gotosocial
./gotosocial --config-path ./config.yaml admin account create \
  --username testuser \
  --email test@example.com \
  --password TestPassword123!

# Подтвердить аккаунт
./gotosocial --config-path ./config.yaml admin account confirm --username testuser
```

### Способ 2: Через API (для продакшена)

**В `config.yaml` включите открытую регистрацию:**
```yaml
# Добавьте в config.yaml
accounts-registration-open: true
accounts-approval-required: false  # или true если нужна модерация
```

**Затем используйте API:**
```bash
# Создать приложение OAuth
curl -X POST http://localhost:8080/api/v1/apps \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "Tyrian Platform",
    "redirect_uris": "http://localhost:8081/auth/callback",
    "scopes": "read write follow"
  }'

# Вернет client_id и client_secret
```

### Способ 3: Frontend регистрация (рекомендуется)

Создайте компонент регистрации в React:

```typescript
// components/Registration.tsx
import { useState } from 'react';

async function registerUser(username: string, email: string, password: string) {
  // 1. Создать аккаунт через GoToSocial API
  const response = await fetch('http://localhost:8080/api/v1/accounts/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      email,
      password,
      agreement: true,
      locale: 'en'
    })
  });
  
  return response.json();
}
```

---

## 🎯 Итоговая рекомендация

### ✅ ОСТАВЬТЕ ДВА БЭКЕНДА

**Причины:**
1. GoToSocial - для социальных функций (посты, подписки, лайки)
2. Node.js Backend - для бизнес-логики (платежи, KYC, marketplace)
3. Синхронизируйте пользователей через webhooks или API
4. Федерация ActivityPub остается рабочей
5. Легче масштабировать и поддерживать

**Схема работы:**
```
Пользователь регистрируется
    ↓
GoToSocial API (создает аккаунт)
    ↓
Webhook → Backend (создает связанный профиль)
    ↓
Пользователь получает доступ к обеим системам
```

---

## 🚀 Следующие шаги

1. **Обновите страницу Frontend** (Cmd+R) - исправления .env.local применятся
2. **Включите регистрацию** в `config.yaml` GoToSocial
3. **Создайте компонент регистрации** в React
4. **Настройте синхронизацию** между GoToSocial и Backend
5. **Протестируйте** создание пользователя и вход

---

## 📞 Для быстрого старта

Используйте существующего пользователя из базы:
- `devidandersoncrypto`
- `tyriantm`
- `outdev`
- `danilvasilev`

Если не помните пароли, сбросьте через CLI:
```bash
cd gotosocial
./gotosocial --config-path ./config.yaml admin account password \
  --username devidandersoncrypto
