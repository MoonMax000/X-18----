# 📋 Анализ готовности `/profile` к интеграции с Backend

**Страница:** `/profile` (ProfileNew.tsx)  
**Тип:** Личные настройки пользователя (Dashboard)  
**Статус:** ⚠️ Частично готов - все использует моки, нужна полная интеграция с backend

---

## 📊 Общий статус

```
✅ UI готов:             100%  ████████████████████████
⚠️ Backend интеграция:   15%   ███░░░░░░░░░░░░░░░░░░░░░
```

**Frontend:** Все компоненты отрисовываются корректно  
**Backend:** Почти все ис��ользует локальные моки, нет API интеграции

---

## 🔍 Детальный анализ по вкладкам

### **Profile → Overview** (`ProfileOverview.tsx`)

**Статус:** 🟡 Частично готов (20%)

**Что есть:**
- ✅ UI форм полностью готов
- ✅ Redux store для локального state
- ✅ Auto-save в Redux (debounced)

**Что нужно:**
- ❌ API endpoint для сохранения профиля
- ❌ Загрузка данных из backend
- ❌ Валидация на backend
- ❌ Обработка ошибок от API

**Текущий код:**
```typescript
const handleSave = async () => {
  try {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // MOCK!
    alert("Profile updated successfully!");
  } catch (error: any) {
    alert(`Failed to save profile`);
  }
};
```

**Нужно реализовать:**
```typescript
// В client/services/api/profile.ts
export async function updateUserProfile(data: {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  location?: string;
  website?: string;
  role?: string;
  bio?: string;
  sectors?: string[];
}): Promise<void> {
  const response = await fetch('/api/v1/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to update profile');
}

// В ProfileOverview.tsx
const handleSave = async () => {
  try {
    setIsSaving(true);
    await updateUserProfile({
      displayName,
      username,
      bio,
      role,
      location,
      website,
    });
    alert("Profile updated successfully!");
  } catch (error: any) {
    alert(`Failed to save profile: ${error.message}`);
  } finally {
    setIsSaving(false);
  }
};
```

---

### **Social → Overview** (`SocialOverview.tsx`)

**Статус:** 🔴 Полностью моки (0%)

**Что использует моки:**
- ❌ Статистика (posts, likes, comments, followers)
- ❌ Рост подписчиков (график)
- ❌ Последняя активность
- ❌ Популярные посты
- ❌ Подписки (Subscriptions widget)
- ❌ Купленные посты (Purchased posts widget)
- ❌ Метрики вовлеченности

**Текущий код (моки):**
```typescript
const mockStats = {
  posts: 142,
  postsChange: "12%",
  likes: 2847,
  likesChange: "23%",
  comments: 563,
  commentsChange: "8%",
  followers: 1542,
  followersChange: "15%",
};
```

**Нужно интегрировать с GoToSocial:**
```typescript
// Используй существующие хуки:
import { useGTSProfile } from '@/hooks/useGTSProfile';
import { getCurrentAccount } from '@/services/api/gotosocial';

const SocialOverview = () => {
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    getCurrentAccount().then(setCurrentUser);
  }, []);
  
  const { profile, statuses } = useGTSProfile({
    userId: currentUser?.id,
    fetchStatuses: true,
  });
  
  // Вычисляй статистику из реальных данных:
  const stats = {
    posts: profile?.statuses_count || 0,
    likes: statuses.reduce((acc, s) => acc + s.favourites_count, 0),
    comments: statuses.reduce((acc, s) => acc + s.replies_count, 0),
    followers: profile?.followers_count || 0,
  };
  
  // ...
};
```

---

### **Social → My Posts** (`MyPosts.tsx`)

**Статус:** 🔴 Полностью моки (0%)

**Что использует моки:**
```typescript
const mockPosts: Post[] = [
  {
    id: "1",
    title: "Bitcoin Price Analysis Q2 2025",
    thumbnail: "https://...",
    status: "published",
    category: "analytics",
    isPremium: true,
    views: 12450,
    likes: 320,
    // ...
  },
  // ...
];
```

**Нужно интегрировать:**
```typescript
import { useGTSProfile } from '@/hooks/useGTSProfile';

const MyPosts = () => {
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    getCurrentAccount().then(setCurrentUser);
  }, []);
  
  const { statuses, isLoading } = useGTSProfile({
    userId: currentUser?.id,
    fetchStatuses: true,
  });
  
  // Конвертируй GTSStatus → Post format
  const posts = statuses.map(convertGTSStatusToPost);
  
  // ...
};
```

---

### **Social → Subscriptions** (`Subscriptions.tsx`)

**Статус:** 🔴 Полностью моки (0%)

**Что использует моки:**
```typescript
const mockFollowers: User[] = [
  {
    id: "1",
    name: "Sarah Anderson",
    username: "@sarah_trader",
    tier: "premium",
    followers: 12450,
    isFollowing: true,
  },
  // ...
];
```

**Нужно интегрировать:**
```typescript
import { useGTSProfile } from '@/hooks/useGTSProfile';

const Subscriptions = () => {
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    getCurrentAccount().then(setCurrentUser);
  }, []);
  
  const { followers, following } = useGTSProfile({
    userId: currentUser?.id,
    fetchFollowers: activeSection === "followers",
    fetchFollowing: activeSection === "following",
  });
  
  // Конвертируй GTSAccount → User format
  const users = (activeSection === "followers" ? followers : following)
    .map(convertGTSAccountToUser);
  
  // ...
};
```

---

### **Social → Monetization** (`Monetization.tsx`)

**Статус:** 🔴 Полностью моки (0%)

**Проблема:** GoToSocial **НЕ поддерживает** монетизацию из коробки!

**Что использует моки:**
- ❌ Total Revenue, Referral Income, Consulting fees
- ❌ Revenue trend график
- ❌ Breakdown by Source
- ❌ Payouts & Balance
- ❌ Recent Transactions

**Варианты решения:**

#### Вариант A: Построить кастомный backend (рекомендуется)
```
Stack:
- Custom API endpoints
- PostgreSQL для хранения транзакций
- Stripe/PayPal для платежей

Endpoints:
GET /api/v1/custom/monetization/stats
GET /api/v1/custom/monetization/revenue
GET /api/v1/custom/monetization/transactions
POST /api/v1/custom/monetization/payout
```

#### Вариант B: Использовать готовое решение
- **Gumroad API** - для продажи контента
- **Buy Me a Coffee API** - для донатов
- **Patreon API** - для подписок

#### Вариант C: Отключить вкладку до готовности backend
```typescript
// В ProfileNew.tsx - скрыть вкладку "Monetization"
const tabs = [
  // ...
  // { value: "monetization", label: "Monetization" }, // Отключено
];
```

---

### **Profile → Notifications** (`NotificationsSettings.tsx`)

**Статус:** 🔴 Hardcoded конфиг (0%)

**Что есть:**
```typescript
const sections: NotificationSectionConfig[] = [
  {
    title: "Notifications",
    items: [
      { label: "Enable notification sound", states: [true] },
      { label: "Show desktop notifications", states: [true] },
    ],
  },
  // ...
];
```

**Нужно:**
```typescript
// API для настроек
GET /api/v1/user/notification-settings
PUT /api/v1/user/notification-settings

// State management
const [settings, setSettings] = useState([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  fetch('/api/v1/user/notification-settings')
    .then(res => res.json())
    .then(setSettings);
}, []);

const handleToggle = async (section, item, channel) => {
  await fetch('/api/v1/user/notification-settings', {
    method: 'PUT',
    body: JSON.stringify({ section, item, channel, enabled: !value }),
  });
};
```

---

### **Profile → Billing** (`BillingSettings.tsx`)

**Статус:** 🔴 Полностью моки (0%)

**Что использует моки:**
- ❌ Payment methods (cards)
- ❌ Billing history
- ❌ Subscription status

**Нужно интегрировать со Stripe:**
```typescript
// Stripe integration
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// API endpoints
GET /api/v1/billing/payment-methods
POST /api/v1/billing/payment-methods
DELETE /api/v1/billing/payment-methods/:id
GET /api/v1/billing/invoices
GET /api/v1/billing/subscription
```

---

### **Profile → Referrals, KYC, Streaming, API**

**Статус:** ❓ Не проверял

Нужно проверить эти компоненты отдельно.

---

## 📋 Полный список необходимых Backend Endpoints

### **Profile Management**
```
GET    /api/v1/user/profile           - Получить профиль
PUT    /api/v1/user/profile           - Обновить профиль
POST   /api/v1/user/avatar            - Загрузить аватар
DELETE /api/v1/user/avatar            - Удалить аватар
```

### **Social Stats (GoToSocial - уже есть!)**
```
✅ GET /api/v1/accounts/verify_credentials
✅ GET /api/v1/accounts/:id/statuses
✅ GET /api/v1/accounts/:id/followers
✅ GET /api/v1/accounts/:id/following
```

### **Monetization (Custom - нужно построить)**
```
GET  /api/v1/custom/monetization/stats
GET  /api/v1/custom/monetization/revenue?range=1M|3M|1Y
GET  /api/v1/custom/monetization/transactions
POST /api/v1/custom/monetization/payout
GET  /api/v1/custom/monetization/balance
```

### **Notifications Settings**
```
GET /api/v1/user/notification-settings
PUT /api/v1/user/notification-settings
```

### **Billing (Stripe integration)**
```
GET    /api/v1/billing/payment-methods
POST   /api/v1/billing/payment-methods
DELETE /api/v1/billing/payment-methods/:id
PUT    /api/v1/billing/payment-methods/:id/default
GET    /api/v1/billing/invoices
GET    /api/v1/billing/subscription
PUT    /api/v1/billing/subscription
```

### **Referrals (Custom)**
```
GET  /api/v1/referrals/stats
GET  /api/v1/referrals/list
POST /api/v1/referrals/generate-link
```

### **KYC (Custom)**
```
GET  /api/v1/kyc/status
POST /api/v1/kyc/submit
GET  /api/v1/kyc/documents
POST /api/v1/kyc/documents/upload
```

### **API Keys (Custom)**
```
GET    /api/v1/api-keys
POST   /api/v1/api-keys
DELETE /api/v1/api-keys/:id
PUT    /api/v1/api-keys/:id/regenerate
```

---

## 🎯 План интеграции (по приоритету)

### **Phase 1: Критично (1-2 недели)**

1. **Profile Overview** (1 день)
   - ✅ UI готов
   - ⬜ API: `PUT /api/v1/user/profile`
   - ⬜ Загрузка аватара: `POST /api/v1/user/avatar`

2. **Social Overview** (2 дня)
   - ✅ UI готов
   - ⬜ Интеграция с GoToSocial (используй готовые хуки!)
   - ⬜ Вычисление статистики из реальных данных

3. **My Posts** (1 день)
   - ✅ UI готов
   - ⬜ Интеграция с GoToSocial (`useGTSProfile`)
   - ⬜ Конвертация GTSStatus → Post format

4. **Subscriptions** (1 день)
   - ✅ UI готов
   - ⬜ Интеграция с GoToSocial (followers/following)

---

### **Phase 2: Важно (1-2 недели)**

5. **Notifications Settings** (2 дня)
   - ⬜ API endpoints
   - ⬜ Загрузка/сохранение настроек

6. **Billing Settings** (3-5 дней)
   - ⬜ Stripe integration
   - ⬜ Payment methods CRUD
   - ⬜ Invoices history

---

### **Phase 3: Опцио��ально (2-3 недели)**

7. **Monetization** (1-2 недели)
   - ⬜ Построить кастомный backend
   - ⬜ Интеграция с Stripe
   - ⬜ Revenue tracking
   - ⬜ Payout система

8. **Referrals** (3 дня)
   - ⬜ Referral tracking system
   - ⬜ Link generation
   - ⬜ Stats calculation

9. **KYC** (5 дней)
   - ⬜ Document upload
   - ⬜ Verification workflow
   - ⬜ Status tracking

10. **API Keys** (2 дня)
    - ⬜ Key generation
    - ⬜ CRUD operations
    - ⬜ Rate limiting

---

## ✅ Что можно сделать СЕЙЧАС (быстрые победы)

### 1. **Social вкладки → GoToSocial** (2-3 дня)
Все хуки уже готовы! Нужно только:
```typescript
// В SocialOverview.tsx
import { useGTSProfile } from '@/hooks/useGTSProfile';
const { profile, statuses, followers } = useGTSProfile({ ... });

// В MyPosts.tsx
const { statuses } = useGTSProfile({ fetchStatuses: true });

// В Subscriptions.tsx
const { followers, following } = useGTSProfile({ fetchFollowers, fetchFollowing });
```

### 2. **Profile Overview → Simple API** (1 день)
```typescript
// Создай простой endpoint:
PUT /api/v1/user/profile
Body: { displayName, bio, location, website, role }

// Интегрируй в ProfileOverview
const handleSave = async () => {
  await fetch('/api/v1/user/profile', {
    method: 'PUT',
    body: JSON.stringify({ displayName, bio, ... }),
  });
};
```

---

## 🚧 Что НЕ работает без Backend

- ❌ Сохранение настроек профиля
- ❌ Monetization (вся вкладка)
- ❌ Billing (вся вкладка)
- ❌ Notification settings (сохранение)
- ❌ Referrals (вся вкладка)
- ❌ KYC (вся вкладка)
- ❌ API Keys (вся вкладка)

---

## 💡 Рекомендации

### Для MVP (минимум):
1. ✅ Интегрируй Social вкладки с GoToSocial (2-3 дня)
2. ✅ Добавь простой API для Profile Overview (1 день)
3. ⬜ Скрой остальные вкладки до готовности backend

### Для Production (полный функционал):
1. ⬜ Построй все API endpoints (2-3 недели)
2. ⬜ Интегрируй Stripe для Billing (1 неделя)
3. ⬜ Построй Monetization систему (2 недели)
4. ⬜ Добавь KYC и Referrals (1-2 недели)

---

## 📊 Итоговая оценка

**Frontend готовность:** ✅ 100% (UI полностью готов)  
**Backend интеграция:** ⚠️ 15% (только GoToSocial endpoints)

**Время на полную интеграцию:**
- Минимум (Social + Profile): **3-4 дня**
- Средний (+ Billing + Notifications): **2-3 недели**
- Полный (все вкладки): **6-8 недель**

---

## 🎯 Следующие шаги

1. **Сначала:** Интегрируй Social вкладки с GoToSocial (используй готовые хуки!)
2. **Затем:** Построй простой API для Profile Overview
3. **Потом:** Реши что делать с Monetization/Billing/KYC (построить или скрыть)

**Можешь начать прямо сейчас с Social интеграции - все хуки готовы!** 🚀
