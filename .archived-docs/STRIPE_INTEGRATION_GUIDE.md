# Stripe Integration Guide

## ✅ Что реализовано:

### 1. **Оплата через Stripe Checkout**
- ✅ Убраны поля ввода карты напрямую в модальном окне
- ✅ Убран PayPal из опций оплаты
- ✅ Добавлена кнопка "Оплатить через Stripe"
- ✅ Информация о безопасности платежей (SSL, PCI DSS)

### 2. **Правильное поведение модальных окон**
- ✅ **Блокировка скролла** - страница под модалкой не скроллится
- ✅ **Клик вне окна** - закрывает модалку
- ✅ **Блокировка взаимодействий** - нельзя кликнуть на контент под backdrop'ом
- ✅ **Focus trap** - фокус остается внутри модалки

### 3. **Затронутые файлы:**
```
client/
├── hooks/
│   └── useModalScrollLock.ts          ← Блокировка скролла
├── lib/
│   └── stripe.ts                       ← Stripe интеграция
└── components/
    └── monetization/
        ├── PaymentModal.tsx            ← Обновлено для Stripe
        ├── TipModal.tsx                ← Добавлена блокировка скролла
        └── FollowModal.tsx             ← Добавлена блокировка скролла
```

---

## 🎯 Как это работает:

### **Для пользователя:**

1. **Открыть платный пост** → Нажать "Unlock" или "Subscribe"
2. **Модальное окно** → Показывается информация о Stripe
3. **Кнопка "Оплатить $X"** → Перенаправление на Stripe Checkout
4. **Stripe Checkout** → Безопасная страница оплаты от Stripe
5. **После оплаты** → Возврат на сайт + контент разблокирован

### **Технически (сейчас - ДЕМО режим):**

```tsx
// 1. Пользователь нажимает "Оплатить"
handleStripeCheckout() {
  // 2. Создается Stripe Checkout session (mock)
  const checkoutUrl = await createStripeCheckout({
    type: "unlock",
    amount: 9,
    postId: "post-123"
  });

  // 3. Закрываем модалку
  handleClose();

  // 4. Перенаправление на Stripe (в продакшене)
  // redirectToStripeCheckout(checkoutUrl);

  // 5. ДЕМО: Симуляция успешной оплаты через 2 секунды
  setTimeout(() => {
    purchasePost(postId, amount);
    onSuccess();
  }, 2000);
}
```

---

## 🚀 Интеграция с реальным Stripe (Production):

### **Шаг 1: Получить API ключи Stripe**

1. Зарегистрироваться на https://stripe.com
2. Получить ключи в Dashboard → Developers → API Keys:
   - **Publishable key** (pk_test_...) - для frontend
   - **Secret key** (sk_test_...) - для backend

### **Шаг 2: Создать backend endpoint**

```javascript
// server/routes/stripe.ts
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.post('/api/stripe/create-checkout', async (req, res) => {
  const { type, amount, postId, authorId, plan } = req.body;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: type === 'unlock' ? 'Unlock Premium Post' : 'Author Subscription',
        },
        unit_amount: amount * 100, // Stripe uses cents
        recurring: type === 'subscribe' ? { interval: plan } : undefined,
      },
      quantity: 1,
    }],
    mode: type === 'subscribe' ? 'subscription' : 'payment',
    success_url: `${req.headers.origin}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.origin}?payment=cancelled`,
    metadata: {
      type,
      postId,
      authorId,
      plan,
      userId: req.user.id, // From authentication
    },
  });

  res.json({ url: session.url });
});
```

### **Шаг 3: Webhook для обработки платежей**

```javascript
// server/routes/stripe-webhook.ts
app.post('/webhook/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { type, postId, authorId, userId } = session.metadata;

    // Разблокировать конте��т в базе данных
    if (type === 'unlock') {
      await db.unlockPost(userId, postId);
    } else if (type === 'subscribe') {
      await db.createSubscription(userId, authorId, {
        stripeSubscriptionId: session.subscription,
        status: 'active',
      });
    }

    console.log('✅ Payment successful:', session.id);
  }

  res.json({ received: true });
});
```

### **Шаг 4: Обновить frontend**

В `client/lib/stripe.ts` раскомментировать:

```typescript
// В функции createStripeCheckout:
export async function createStripeCheckout(options: StripeCheckoutOptions): Promise<string> {
  // PRODUCTION: Вызов backend API
  const response = await fetch('/api/stripe/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options),
  });

  const { url } = await response.json();
  return url;
}

// В PaymentModal, раскомментировать:
redirectToStripeCheckout(checkoutUrl);
```

### **Шаг 5: Переменные окружения**

```env
# .env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 🧪 Тестирование:

### **Тестовые карты Stripe:**

- **��спешная оплата**: `4242 4242 4242 4242`
- **Отклонена**: `4000 0000 0000 0002`
- **Требуется 3D Secure**: `4000 0025 0000 3155`

**Любой CVV и дата в будущем работают в тест-режиме.**

---

## 📋 Checklist для Production:

- [ ] Получить Stripe API ключи
- [ ] Создать backend endpoint `/api/stripe/create-checkout`
- [ ] Настроить Stripe webhook `/webhook/stripe`
- [ ] Добавить обработку успешных платежей в webhook
- [ ] Обновить `client/lib/stripe.ts` для вызова API
- [ ] Добавить переменные окружения
- [ ] Протестировать с тестовыми картами
- [ ] Настроить продакшн webhook в Stripe Dashboard
- [ ] Переключиться на live ключи

---

## 🔐 Безопасность:

✅ **Что делает Stripe:**
- Обрабатывает платежи (PCI DSS Level 1)
- Хранит данные карт (не вы!)
- Защита от мошенничества (Radar)
- 3D Secure поддержка

✅ **Что делаете вы:**
- Создаете checkout session через API
- Получаете webhook о успешной оплате
- Разблокируете контент в БД
- НЕ храните данные карт!

---

## 📞 Дополнительно:

- **Документация Stripe**: https://stripe.com/docs/payments/checkout
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Тестирование**: https://stripe.com/docs/testing
- **Webhooks**: https://stripe.com/docs/webhooks

---

## ✨ Текущее состояние (DEMO):

Сейчас система работает в **демо-режиме**:
- При клике "Оплатить" → симулируется успех через 2 сек
- Контент разблокируется автоматически
- Никакие реальные платежи НЕ происходят

**Для продакшн:** следуйте инструкциям выше!
