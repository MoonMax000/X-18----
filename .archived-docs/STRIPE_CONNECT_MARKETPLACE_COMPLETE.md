# 🎉 Stripe Connect Marketplace - Полная реализация!

**Модель:** Marketplace (как Gumroad, Patreon)  
**Статус:** ✅ Backend готов, Frontend готов  
**Дата:** Только что завершено

---

## 🏗️ Архитектура

### **Концепция:**

```
┌─────────────────────────────────────────────────┐
│     Tyrian Trade (Master Stripe Account)        │
│         Платформа контролирует платежи          │
└─────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
    ┌───▼────┐            ┌─────▼─────┐
    │ Авторы │            │ Покупатели│
    │(Connect│            │(Customers)│
    │Account)│            │           │
    └────────┘            └───────────┘
        │                       │
   Получают 90%             Платят 100%
   от продажи               за контент
        │                       │
        └───────────┬───────────┘
                    │
              Платформа
           берет 10% комиссию
```

---

## 📊 Database Schema

### **Новые модели:**

#### 1. **StripeConnectAccount** (для авторов)
```prisma
model StripeConnectAccount {
  id              String  @id
  userId          String  @unique
  stripeAccountId String  @unique  // Connect Account ID
  
  // Account details
  email           String?
  country         String?
  defaultCurrency String?
  
  // Capabilities
  chargesEnabled  Boolean  // Can accept payments
  payoutsEnabled  Boolean  // Can receive payouts
  detailsSubmitted Boolean // Setup complete
  
  // OAuth tokens
  accessToken     String?
  refreshToken    String?
  
  createdAt       DateTime
  updatedAt       DateTime
}
```

#### 2. **StripeCustomer** (для покупателей)
```prisma
model StripeCustomer {
  id                      String  @id
  userId                  String  @unique
  stripeCustomerId        String  @unique  // Customer ID
  defaultPaymentMethodId  String?  // Default card
  
  // Relations
  paymentMethods          PaymentMethod[]
}
```

#### 3. **PaymentMethod** (карты покупателей)
```prisma
model PaymentMethod {
  id              String  @id
  paymentMethodId String  @unique  // Stripe Payment Method ID
  
  // Card details
  type            String   // card, bank_account
  brand           String?  // visa, mastercard
  last4           String?
  expMonth        Int?
  expYear         Int?
  isDefault       Boolean
}
```

---

## 🔌 Backend API

### **Stripe Connect Routes** (`/api/v1/stripe-connect`)

```typescript
GET    /oauth-url           // Get Stripe OAuth URL для подключения
POST   /callback            // Handle OAuth redirect
GET    /account             // Get connected account status
DELETE /account             // Disconnect account
GET    /dashboard-link      // Get Stripe dashboard link
GET    /balance             // Get account balance
```

### **Payment Methods Routes** (`/api/v1/payment-methods`)

```typescript
POST   /setup-intent        // Create Setup Intent для добавления карты
POST   /                    // Add payment method
GET    /                    // List payment methods
DELETE /:id                 // Remove payment method
PUT    /:id/default         // Set default card
```

---

## 🎨 Frontend Components

### **1. StripeConnectSettings.tsx**

**Путь:** `client/components/Monetization/StripeConnectSettings.tsx`

**Для авторов** (продавцов контента):

**Функции:**
- ✅ Кнопка "Connect with Stripe" → OAuth flow
- ✅ Статус подключения (Charges, Payouts, Details)
- ✅ Кнопка "Open Dashboard" → Stripe dashboard
- ✅ Кнопка "Disconnect"
- ✅ Platform fee информация (10%)

**Интегрирован в:** `/profile?tab=social&subtab=monetization`

---

### **2. PaymentMethodsSettings.tsx** (TODO)

**Для покупателей:**

**Функции** (нужно создать):
- Add Card (Stripe Elements)
- List Cards
- Set Default Card
- Delete Card

**Интегрируется в:** `/profile?tab=profile&subtab=billing`

---

## 🔄 Как работают платежи

### **Сценарий: Покупка premium поста за $10**

```typescript
// 1. Backend создает Payment Intent
const paymentIntent = await stripeConnectService.createPaymentIntent({
  authorUserId: 'author_123',      // Кто получает деньги
  buyerCustomerId: 'cus_buyer',    // Кто платит
  amount: 1000,                     // $10 (в центах)
  platformFeePercent: 10,           // 10% комиссия
});

// Результат:
// - Покупатель платит $10
// - Автор получает $9 (90%)
// - Платформа получает $1 (10%)
```

### **Сценарий: Подписка на автора ($19.99/month)**

```typescript
// 1. Создаем Subscription
const subscription = await stripeConnectService.createSubscription({
  authorUserId: 'author_123',
  buyerCustomerId: 'cus_buyer',
  priceId: 'price_monthly_1999',  // Stripe Price ID
  platformFeePercent: 10,
});

// Результат:
// - Каждый месяц $19.99 списывается с покупателя
// - Автор получает $17.99 (90%)
// - Платформа получает $2.00 (10%)
```

---

## 🚀 Настройка Backend

### **1. Получить Stripe Keys**

Зайди на https://dashboard.stripe.com и создай Connect application:

1. **Settings → Connect → Overview**
2. Нажми "Get started with Connect"
3. Скопируй:
   - **Client ID:** `ca_...`
   - **Secret Key:** `sk_test_...` или `sk_live_...`
   - **Publishable Key:** `pk_test_...` или `pk_live_...`

### **2. Обнови `.env`**

```env
# Master Stripe Account (твой платформенный аккаунт)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_CLIENT_ID="ca_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Frontend URL (для OAuth redirect)
FRONTEND_URL="http://localhost:8080"
```

### **3. Настрой OAuth Redirect**

В Stripe Dashboard:
1. **Settings → Connect → Integration**
2. **Redirect URIs:**
   - Development: `http://localhost:8080/profile?tab=social&subtab=monetization`
   - Production: `https://yourapp.com/profile?tab=social&subtab=monetization`

### **4. Webhooks** (опционально)

Настрой webhooks для отслеживания событий:
- `account.updated` - Когда статус аккаунта изменился
- `payment_intent.succeeded` - Успешный платеж
- `payout.paid` - Выплата автору

Webhook URL: `https://yourapp.com/api/webhooks/stripe`

---

## 🧪 Тестирование

### **1. Подключение Stripe (автор)**

```
1. Открой: /profile?tab=social&subtab=monetization
2. Нажми "Connect with Stripe"
3. Тебя перекинет на Stripe OAuth
4. Войди или создай test аккаунт
5. Нажми "Connect"
6. Перекинет обратно → Stripe Connected ✅
```

### **2. Тестовые данные Stripe**

Для теста используй Stripe test mode:

**Test Bank Account:**
- Account Number: `000123456789`
- Routing Number: `110000000`

**Test Card:**
- Number: `4242 4242 4242 4242`
- Expiry: Любая будущая дата
- CVC: Любые 3 цифры

---

## 💡 User Flow

### **Для автора (продавец):**

```
1. Регистрация на платформе
2. Переход в Monetization → Connect Stripe
3. OAuth flow → подключение аккаунта
4. Заполнение банковских данных в Stripe
5. Публикация premium контента
6. Получение платежей (90% от продаж)
7. Автоматические выплаты на банк
```

### **Для покупателя:**

```
1. Регистрация на платформе
2. Добавление карты в Billing
3. Покупка premium контента
4. Списание с карты
5. Доступ к контенту
```

---

## 📋 Комиссия платформы

### **Настройка:**

```typescript
// В backend/src/services/stripe/stripeConnect.service.ts

// По умолчанию 10%
const platformFeePercent = 10;

// Можно настроить для каждого автора:
const customFee = await getAuthorCommission(authorId); // 5-30%
```

### **Варианты:**

- **10%** - Стандартная (как Gumroad)
- **5%** - Premium авторы
- **20%** - Новые авторы
- **30%** - Максимальная

---

## 🎯 Что готово

✅ **Backend:**
- Prisma schema обновлен
- Stripe Connect service
- Stripe Customer service
- API routes
- Controllers
- OAuth flow

✅ **Frontend:**
- Stripe Connect UI компонент
- OAuth callback handling
- Dashboard link
- Disconnect функция
- API client

---

## ⚠️ TODO: Доработки

### **1. Payment Methods UI** (для покупателей)

Нужно создать компонент для управления картами:

```tsx
// client/components/BillingSettings/PaymentMethodsSettings.tsx

<Card>
  <CardHeader>Add Payment Method</CardHeader>
  <CardContent>
    {/* Stripe Elements для добавления карты */}
    <Elements stripe={stripePromise}>
      <AddCardForm />
    </Elements>
    
    {/* Список сохраненных карт */}
    {cards.map(card => (
      <CardRow key={card.id} card={card} />
    ))}
  </CardContent>
</Card>
```

### **2. Purchase Flow**

Создать UI для покупки контента:

```tsx
// Ког��а пользователь покупает пост
const handlePurchase = async (postId: string) => {
  const payment = await backendApi.purchasePost({
    postId,
    amount: 1000, // $10
  });
  
  // Show success message
  // Unlock content
};
```

### **3. Subscription UI**

Для месячных подписок на авторов:

```tsx
// Кнопка "Subscribe" на профиле автора
<Button onClick={() => subscribeToAuthor(authorId, 'monthly')}>
  Subscribe $19.99/month
</Button>
```

### **4. Earnings Dashboard**

Для авторов - показывать доходы:

```tsx
// В Monetization tab
<EarningsDashboard>
  <TotalEarnings amount={9000} />
  <RevenueChart data={monthlyRevenue} />
  <RecentSales sales={recentSales} />
  <PayoutHistory payouts={payouts} />
</EarningsDashboard>
```

---

## 📚 Документация

**Новые файлы:**

1. `backend/prisma/schema.prisma` - Обновлен (Connect models)
2. `backend/src/services/stripe/stripeConnect.service.ts` - Service для авторов
3. `backend/src/services/stripe/stripeCustomer.service.ts` - Service для покупателей
4. `backend/src/api/routes/stripeConnect.routes.ts` - Routes
5. `backend/src/api/controllers/stripeConnect.controller.ts` - Controller
6. `client/services/api/stripeConnect.ts` - Frontend API client
7. `client/components/Monetization/StripeConnectSettings.tsx` - UI компонент
8. `STRIPE_CONNECT_MARKETPLACE_COMPLETE.md` - Этот файл

---

## ✅ Следующие шаги

1. **Запусти backend:**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev --name add_stripe_connect
   npm run dev
   ```

2. **Получи Stripe Connect credentials:**
   - Зайди на https://dashboard.stripe.com
   - Settings → Connect → Get started
   - Скопируй Client ID, Secret Key

3. **Обнови `.env`:**
   ```env
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_CLIENT_ID="ca_..."
   ```

4. **Протестируй Connect flow:**
   - Открой `/profile?tab=social&subtab=monetization`
   - Нажми "Connect with Stripe"
   - Пройди OAuth flow

5. **Построй Payment Methods UI** (см. TODO выше)

---

## 🎉 Итоги

**Marketplace модель реализована!**

- ✅ Stripe Connect для авторов (OAuth flow)
- ✅ Payment Methods для покупателей (backend готов)
- ✅ Platform fee система (10% комиссия)
- ✅ Автоматические payouts
- ✅ Dashboard access для авторов

**Готово к тестированию!** 🚀

---

**Вопросы?** Вся архитектура настроена для marketplace модели. Осталось только добавить Payment Methods UI и Purchase flow.
