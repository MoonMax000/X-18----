# 🚀 QUICK TODO - Tyrian Trade

> Краткий список всех задач по категориям

---

## 🔴 BACKEND (18 файлов)

### Routes (6 файлов - НЕ СУЩЕСТВУЮТ)
```
backend/src/api/routes/
├── notifications.routes.ts     ❌ СОЗДАТЬ
├── apiKeys.routes.ts           ❌ СОЗДАТЬ
├── kyc.routes.ts               ❌ СОЗДАТЬ
├── referrals.routes.ts         ❌ СОЗДАТЬ
├── monetization.routes.ts      ❌ СОЗДАТЬ
└── billing.routes.ts           ��� СОЗДАТЬ
```

### Controllers (6 файлов - НЕ СУЩЕСТВУЮТ)
```
backend/src/api/controllers/
├── notifications.controller.ts  ❌ СОЗДАТЬ
├── apiKeys.controller.ts        ❌ СОЗДАТЬ
├── kyc.controller.ts            ❌ СОЗДАТЬ
├── referrals.controller.ts      ❌ СОЗДАТЬ
├── monetization.controller.ts   ❌ СОЗДАТЬ
└── billing.controller.ts        ❌ СОЗДАТЬ
```

### Validators (6 файлов - НЕ СУЩЕСТВУЮТ)
```
backend/src/api/validators/
├── notifications.validator.ts   ❌ СОЗДАТЬ
├── apiKeys.validator.ts         ❌ СОЗДАТЬ
├── kyc.validator.ts             ❌ СОЗДАТЬ
├── referrals.validator.ts       ❌ СОЗДАТЬ
├── monetization.validator.ts    ❌ СОЗДАТЬ
└── billing.validator.ts         ❌ СОЗДАТЬ
```

---

## 🟡 FRONTEND (12+ компонентов)

### Settings Pages (4 компонента)
```
client/components/
├── NotificationsSettings/
│   └── NotificationsSettings.tsx    ❌ СОЗДАТЬ
├── KycSettings/
│   └── KycSettings.tsx              ✅ СУЩЕСТВУЕТ (проверить)
├── ReferralsSettings/
│   └── ReferralsSettings.tsx        ✅ СУЩЕСТВУЕТ (проверить)
└── ApiSettings/
    └── ApiSettings.tsx              ✅ СУЩЕСТВУЕТ (подключить к API)
```

### Payment UI (5 компонентов)
```
client/components/
├── BillingSettings/
│   ├── BillingSettings.tsx          ⚠️ ОБНОВИТЬ (использует mock)
│   └── CardForm.tsx                 ❌ СОЗДАТЬ
├── monetization/
│   └── PaymentModal.tsx             ⚠️ ОБНОВИТЬ (использует mock)
├── Subscriptions/
│   ├── Subscriptions.tsx            ⚠️ ОБНОВИТЬ (использует mock)
│   ├── SubscriptionPlans.tsx        ❌ СОЗДАТЬ
│   ├── ChangePlanModal.tsx          ❌ СОЗДАТЬ
│   └── CancelSubscriptionModal.tsx  ❌ СОЗДАТЬ
└── Monetization/
    └── MonetizationDashboard.tsx    ❌ СОЗДАТЬ
```

### Success/Cancel Pages (2 страницы)
```
client/pages/
├── PaymentSuccess.tsx               ❌ СОЗДАТЬ
└── PaymentCancel.tsx                ❌ СОЗДАТЬ
```

### API Client Updates (1 файл)
```
client/services/api/
└── backend.ts                       ⚠️ ОБНОВИТЬ (добавить новые endpoints)
```

---

## 🟢 IMPROVEMENTS

### Backend
- [ ] Stripe Webhooks endpoint
- [ ] Refresh Token mechanism
- [ ] File upload improvements (compression, validation)
- [ ] More email templates

### Frontend
- [ ] Stripe Elements provider (App.tsx)
- [ ] Real-time notifications
- [ ] Loading states
- [ ] Error boundaries

### Database
- [ ] RefreshToken model
- [ ] ApiKey model (если нет)
- [ ] Indexes для performance

---

## 📊 COUNTS

| Category | Total | Done | TODO |
|----------|-------|------|------|
| Backend Routes | 10 | 4 | 6 |
| Backend Controllers | 11 | 5 | 6 |
| Backend Validators | 8 | 2 | 6 |
| Frontend Components | 20+ | ~8 | ~12 |
| **TOTAL FILES** | **~50** | **~20** | **~30** |

---

## 🎯 NEXT STEPS

### Option A: Backend First (Recommended)
```bash
# Week 1: Create missing backend files (18 files)
1. Routes (6)
2. Controllers (6)
3. Validators (6)

# Week 2: Frontend Integration
4. Update API client
5. Create/Update UI components
6. Connect to backend

# Week 3: Testing & Deploy
7. Test all flows
8. Setup production
```

### Option B: Feature by Feature
```bash
# Each feature = routes + controller + validator + UI
1. Notifications (backend + frontend)
2. API Keys (backend + frontend)
3. KYC (backend + frontend)
4. Referrals (backend + frontend)
5. Monetization (backend + frontend)
6. Billing (backend + frontend)
```

---

## 🔥 CRITICAL PATH (Must Do)

**Для работы платформы МИНИМУМ нужно:**

### Backend
1. ✅ Auth (done)
2. ✅ Profile (done)
3. ✅ Stripe Connect (done)
4. ⚠️ Billing controller (для subscription management)
5. ⚠️ Monetization controller (для payouts)

### Frontend
1. ✅ Login/Signup (done)
2. ✅ Profile (done)
3. ⚠️ CardForm (для добавления карт)
4. ⚠️ Real Purchase Flow (вместо mock)
5. ⚠️ Subscription UI (для управления подписками)

---

## ⏱️ TIME ESTIMATES

**Backend (18 файлов):**
- Routes: 6 × 30min = 3 hours
- Controllers: 6 × 2h = 12 hours
- Validators: 6 × 30min = 3 hours
- **Total Backend:** ~18 hours (2-3 дня)

**Frontend (12+ компонентов):**
- CardForm (Stripe Elements): 4 hours
- Payment/Subscription updates: 6 hours
- Settings pages: 6 hours
- API integration: 4 hours
- **Total Frontend:** ~20 hours (2-3 дня)

**Testing & Deploy:**
- Testing: 8 hours
- Production setup: 4 hours
- **Total:** ~12 hours (1-2 дня)

**GRAND TOTAL:** ~50 hours (1-2 недели full-time)

---

**Полный список:** [TODO_COMPLETE_LIST.md](./TODO_COMPLETE_LIST.md)

**Last Updated:** 2024-01-15
