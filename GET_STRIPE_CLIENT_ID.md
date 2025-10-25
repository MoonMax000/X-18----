# 🔑 Как получить Stripe Client ID для Connect

**Нужен для:** Marketplace модели (авторы подключают свои Stripe аккаунты через OAuth)

---

## 📋 Шаги

### 1. **Открой Stripe Dashboard**

Зайди на: https://dashboard.stripe.com/test/dashboard

**Убедись что ты в TEST mode!** (переключатель в правом верхнем углу)

---

### 2. **Включи Stripe Connect**

1. В левом меню: **Settings** (⚙️)
2. **Connect** → **Overview**
3. Нажми **"Get started with Connect"**

---

### 3. **Выбери тип интеграции**

Выбери: **"Platform or marketplace"**

---

### 4. **Настрой OAuth Redirect URIs**

В разделе **"Integration"**:

**Redirect URIs** (добавь оба):
```
http://localhost:8080/profile?tab=social&subtab=monetization
https://yourapp.com/profile?tab=social&subtab=monetization
```

**Нажми "Add URI"** для каждого.

---

### 5. **Скопируй Client ID**

В разделе **"OAuth settings"** найди:

```
Client ID: ca_...
```

**Скопируй этот ID!** Он начинается с `ca_`

---

### 6. **Обнови `.env`**

```bash
cd backend
# Обнови строку:
STRIPE_CLIENT_ID="ca_..."  # ← Вставь свой Client ID
```

---

### 7. **Готово!**

Теперь можешь запускать backend:

```bash
npm run dev
```

И тестировать Stripe Connect на:
```
http://localhost:8080/profile?tab=social&subtab=monetization
```

---

## 🧪 Проверка

После настройки:

1. Открой `/profile?tab=social&subtab=monetization`
2. Нажми **"Connect with Stripe"**
3. Должен открыться Stripe OAuth popup
4. Подключись test аккаунтом
5. Должен вернуться обратно со статусом **"Stripe Connected"** ✅

---

## ⚠️ Важно

- **Test mode:** Используй test Client ID (начинается с `ca_`)
- **Live mode:** Когда пойдешь в production, создашь отдельный Live Client ID
- **Redirect URIs:** Должны точно совпадать с URL в коде

---

## 📸 Скриншот где найти

```
Stripe Dashboard
  └─ Settings (⚙️)
      └─ Connect
          └─ Overview
              └─ Get started
                  ├─ Platform or marketplace
                  └─ Integration
                      ├─ Redirect URIs (добавить)
                      └─ OAuth settings
                          └─ Client ID: ca_... ← ЗДЕСЬ!
```

---

## 🔗 Прямая ссылка

https://dashboard.stripe.com/test/settings/connect

(Убедись что в TEST mode!)

---

**После получения Client ID - обнови `.env` и перезапусти backend!**
