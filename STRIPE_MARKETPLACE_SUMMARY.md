# ⚡ Quick Summary: Stripe Connect Marketplace

**Модель:** Marketplace (Gumroad/Patreon style)  
**Комиссия:** 10% платформе, 90% автору  
**Статус:** ✅ Готово к тестированию

---

## 🎯 Что изменилось

### **Было (старое):**
❌ Каждый пользователь вводил свои Stripe API ключи  
❌ Сложно для обычных пользователей  
❌ Нет контроля платформы  
❌ Нельзя брать комиссию

### **Стало (новое):**
✅ Stripe Connect для авторов (OAuth подключение)  
✅ Payment Methods для покупателей (карты)  
✅ Платформа контролирует платежи  
✅ Автоматическая комиссия 10%  
✅ Простой onboarding

---

## 📁 Что создано

### **Backend:**
```
backend/
├── prisma/schema.prisma               # ← Обновлен (3 новые модели)
├── src/services/stripe/
│   ├── stripeConnect.service.ts       # ← НОВЫЙ (для авторов)
│   └── stripeCustomer.service.ts      # ← НОВЫЙ (для покупателей)
├── src/api/routes/
│   ├── stripeConnect.routes.ts        # ← НОВЫЙ
│   └── paymentMethods.routes.ts       # ← НОВЫЙ
└── src/api/controllers/
    ├── stripeConnect.controller.ts    # ← НОВЫЙ
    └── paymentMethods.controller.ts   # ← НОВЫЙ
```

### **Frontend:**
```
client/
├── services/api/
│   ├── stripeConnect.ts               # ← НОВЫЙ (API client)
│   └── backend.ts                     # ← Обновлен (payment methods)
└── components/Monetization/
    ├── StripeConnectSettings.tsx      # ← НОВЫЙ (Connect UI)
    └── Monetization.tsx               # ← Обновлен (использует Connect)
```

---

## 🚀 Быстрый старт

### **1. Обнови Database**

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name stripe_connect_marketplace
```

### **2. Получи Stripe Connect ключи**

1. Зайди на https://dashboard.stripe.com
2. **Settings → Connect → Get started**
3. Скопируй:
   - **Client ID:** `ca_...`
   - **Secret Key:** `sk_test_...`
   - **Publishable Key:** `pk_test_...`

### **3. Обнови `.env`**

```env
# backend/.env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_CLIENT_ID="ca_..."  # ← НОВАЯ переменная!
```

### **4. Настрой Redirect URL в Stripe**

**Stripe Dashboard → Settings → Connect → Integration:**

Redirect URIs:
- Development: `http://localhost:8080/profile?tab=social&subtab=monetization`
- Production: `https://yourapp.com/profile?tab=social&subtab=monetization`

### **5. Запусти backend**

```bash
npm run dev
```

---

## 🧪 Тест

### **Как автор (продавец):**

```
1. Открой: http://localhost:8080/profile?tab=social&subtab=monetization
2. Увидишь "Connect Stripe to Start Earning"
3. Нажми "Connect with Stripe"
4. Тебя перекинет на Stripe OAuth
5. Войди/создай test аккаунт
6. Нажми "Connect"
7. Перекинет обратно → Статус "Stripe Connected" ✅
```

### **Test режим Stripe:**

Используй test данные:
- Test Bank: `110000000` / `000123456789`
- Test Card: `4242 4242 4242 4242`

---

## 💰 Как работают платежи

### **Пример: Покупка поста за $10**

```
1. Покупатель платит $10
2. Stripe списывает с карты покупателя
3. Автор получает $9 (90%)
4. Платформа получает $1 (10%)
5. Автоматический payout на банк автора
```

### **Backend код:**

```typescript
const payment = await stripeConnectService.createPaymentIntent({
  authorUserId: 'author_id',
  buyerCustomerId: 'customer_id',
  amount: 1000,              // $10
  platformFeePercent: 10,    // 10% комиссия
});
```

---

## 📊 API Endpoints

### **Для авторов (Stripe Connect):**
```
GET    /api/v1/stripe-connect/oauth-url     - Get OAuth URL
POST   /api/v1/stripe-connect/callback      - Handle redirect
GET    /api/v1/stripe-connect/account       - Get account status
DELETE /api/v1/stripe-connect/account       - Disconnect
GET    /api/v1/stripe-connect/dashboard-link - Open Stripe dashboard
```

### **Для покупателей (Payment Methods):**
```
POST   /api/v1/payment-methods/setup-intent  - Create Setup Intent
POST   /api/v1/payment-methods               - Add card
GET    /api/v1/payment-methods               - List cards
DELETE /api/v1/payment-methods/:id           - Remove card
PUT    /api/v1/payment-methods/:id/default   - Set default
```

---

## 🎨 UI Screens

### **1. Not Connected (автор)**

```
┌─────────────────────────────────────┐
│ Connect Stripe to Start Earning     │
├─────────────────────────────────────┤
│ ✓ Receive payments                  │
│ ✓ Automatic payouts                 │
│ ✓ Manage from dashboard             │
│                                      │
│ Platform Fee: 10%                   │
│ You receive: 90% of every sale      │
│                                      │
│ [Connect with Stripe]                │
└────��────────────────────────────────┘
```

### **2. Connected (автор)**

```
┌─────────────────────────────────────┐
│ ✓ Stripe Connected                  │
├─────────────────────────────────────┤
│ ✓ Connected successfully!            │
│   Account: user@email.com • US      │
│                                      │
│ ┌─────────┬─────────┬─────────┐    │
│ │Charges  │Payouts  │Details  │    │
│ │✓Enabled │✓Enabled │✓Complete│    │
│ └─────────┴─────────┴─────────┘    │
│                                      │
│ [Open Dashboard] [Disconnect]       │
└─────────────────────────────────────┘
```

---

## ⚠️ TODO: Что доделать

### **1. Payment Methods UI** (покупатели)

Создать компонент для добавления карт:

```tsx
// client/components/BillingSettings/PaymentMethodsSettings.tsx

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Add card form with Stripe Elements
<Elements stripe={stripePromise}>
  <AddCardForm onSuccess={handleCardAdded} />
</Elements>

// List saved cards
{cards.map(card => (
  <CardItem 
    key={card.id}
    card={card}
    onDelete={handleDelete}
    onSetDefault={handleSetDefault}
  />
))}
```

### **2. Purchase Flow**

Создать UI для покупки контента:

```tsx
// На premium посте показывать кнопку:
<Button onClick={() => purchasePost(post.id)}>
  Buy for ${post.price}
</Button>

// Backend создает платеж:
POST /api/v1/payments/purchase
Body: { postId, authorUserId }
```

### **3. Subscription UI**

Подписки на авторов:

```tsx
// На профиле автора:
<Button onClick={() => subscribe(author.id, 'monthly')}>
  Subscribe $19.99/month
</Button>
```

---

## 📚 Документация

- `STRIPE_CONNECT_MARKETPLACE_COMPLETE.md` - Полная документация
- `STRIPE_MARKETPLACE_SUMMARY.md` - Этот файл (Quick Start)

---

## ✅ Чеклист

Перед production:

- [ ] Получи Stripe Connect credentials (Client ID)
- [ ] Об��ови `.env` с правильными ключами
- [ ] Настрой Redirect URLs в Stripe Dashboard
- [ ] Запусти database migration
- [ ] Протестируй Connect flow (test mode)
- [ ] Построй Payment Methods UI для покупателей
- [ ] Построй Purchase flow для контента
- [ ] Переключись на Live mode в Stripe

---

## 🎉 Итоги

**Marketplace модель готова!**

✅ Stripe Connect OAuth flow  
✅ Platform fee система (10%)  
✅ Автоматические payouts  
✅ Dashboard access  

**Можно тестировать подключение Stripe!** 🚀

**Следующий шаг:** Добавь Payment Methods UI для покупателей (см. TODO выше)
