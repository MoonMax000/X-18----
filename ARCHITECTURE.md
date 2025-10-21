# Tyrian Trade — Архитектура приложения

## Общая структура

```
client/
├── components/           # UI компоненты (shared)
│   ├── monetization/    # Платёжные модалы
│   └── feed/            # Компоненты ленты
├── features/            # Фичи (feature-sliced)
│   └── feed/
│       ├── components/  # Компоненты фичи
│       ├── hooks/       # Хуки фичи
│       ├── styles/      # Стили и токены
│       ├── utils/       # Утилиты
│       ├── types.ts     # Типы
│       ├── constants.ts # Константы
│       └── mocks.ts     # Mock данн��е
├── hooks/               # Глобальные хуки
├── pages/               # Страницы (роуты)
└── shared/              # Shared код
    ├── types/           # TypeScript типы
    └── api/             # API контракты

shared/
├── types/index.ts       # Схемы данных
└── api/contracts.ts     # API функции
```

---

## Ключевые компоненты

### 1. Хуки (Hooks)

#### useGatingCheck
**Назначение**: Проверка доступа к посту  
**Путь**: `client/hooks/useGatingCheck.ts`

```typescript
import { useGatingCheck } from "@/hooks/useGatingCheck";

function PostCard({ post }: { post: Post }) {
  const { canAccess, reason, loading } = useGatingCheck(post);

  if (loading) return <Skeleton />;

  return canAccess ? (
    <PostContent post={post} />
  ) : (
    <GatedContent
      accessLevel={post.accessLevel}
      postId={post.id}
      authorId={post.author.userId}
      {...post}
    />
  );
}
```

**Логика**:
```typescript
isAuthor ∨ 
isPublic ∨ 
(isFollowers ∧ isFollowing) ∨ 
(isSubscribers ∧ hasSubscription) ∨ 
(isPaid ∧ (hasPurchased ∨ hasSubscription))
```

#### usePayment
**Назначение**: Платежи (подписки, покупки, донаты)  
**Путь**: `client/hooks/usePayment.ts`

```typescript
import { usePayment } from "@/hooks/usePayment";

function PaymentModal({ postId, amount }: PaymentModalProps) {
  const { status, error, purchasePost } = usePayment();

  const handlePay = async () => {
    const success = await purchasePost(postId, amount);
    if (success) {
      // Optimistic unlock
      onSuccess();
    }
  };

  return (
    <div>
      {status === "processing" && <Spinner />}
      {status === "failed" && <Error message={error} />}
      <button onClick={handlePay}>Pay ${amount}</button>
    </div>
  );
}
```

#### useHotScore
**Назначение**: Сортировка постов по "горячести"  
**Путь**: `client/hooks/useHotScore.ts`

```typescript
import { useHotScore } from "@/hooks/useHotScore";

function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedMode, setFeedMode] = useState<"hot" | "recent">("hot");

  const sortedPosts = useHotScore(posts, feedMode === "hot");

  return <PostsList posts={sortedPosts} />;
}
```

**Формула**:
```
hotScore = engagement × decay

engagement = likes×1 + comments×3 + reposts×2 + views×0.01
decay = e^(-ageHours / 24)
```

#### useNewPosts
**Назначение**: Реалтайм-уведомления о новых постах  
**Путь**: `client/hooks/useNewPosts.ts`

```typescript
import { useNewPosts } from "@/hooks/useNewPosts";

function FeedPage() {
  const { newPostsCount, loadNewPosts } = useNewPosts({
    feedParams: { tab: "all", topic: "news" },
    enabled: true,
  });

  const handleLoadNew = async () => {
    const newPosts = await loadNewPosts();
    setPosts((prev) => [...newPosts, ...prev]);
  };

  return (
    <>
      {newPostsCount > 0 && (
        <NewPostsBanner count={newPostsCount} onClick={handleLoadNew} />
      )}
      <PostsList posts={posts} />
    </>
  );
}
```

#### useAnalytics
**Назначение**: Трекинг событий  
**Путь**: `client/hooks/useAnalytics.ts`

```typescript
import { useAnalytics } from "@/hooks/useAnalytics";

function PostCard({ post }: { post: Post }) {
  const { track } = useAnalytics();

  const handleLike = () => {
    track("like_toggle", {
      postId: post.id,
      action: isLiked ? "unlike" : "like",
    });
    // ...
  };

  useEffect(() => {
    // Трек просмотра через 3 секунды
    const timer = setTimeout(() => {
      track("post_view", { postId: post.id, duration: 3 });
    }, 3000);
    return () => clearTimeout(timer);
  }, [post.id]);

  return <button onClick={handleLike}>Like</button>;
}
```

---

### 2. Компоненты

#### GatedContent
**Путь**: `client/features/feed/components/posts/GatedContent.tsx`

```typescript
<GatedContent
  accessLevel="paid"
  postId="post-123"
  authorId="user-456"
  postPrice={9}
  subscriptionPrice={29}
  authorName="Crypto Whale"
/>
```

**Варианты**:
- `paid`: одноразовая покупка + подписка
- `subscribers`: только подписка
- `premium`: премиум подписка (дороже)
- `followers`: только для подписчиков (Follow)

#### PaymentModal
**Путь**: `client/components/monetization/PaymentModal.tsx`

```typescript
<PaymentModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  type="unlock" // или "subscribe"
  amount={9}
  postId="post-123"
  authorId="user-456"
  authorName="Crypto Whale"
  plan="monthly" // или "yearly"
  onSuccess={handleSuccess}
/>
```

**Состояния**:
- `idle`: начальное
- `processing`: обработка платежа (спиннер)
- `success`: успех (галочка)
- `failed`: ошибка (показ error message)

#### Widgets

**AuthorActivityWidget**:
```typescript
<AuthorActivityWidget
  period="7d"
  posts={12}
  likesReceived={340}
  comments={68}
  newFollowers={15}
/>
```

**TopTickersWidget** (для профиля):
```typescript
<TopTickersWidget
  tickers={[
    { ticker: "$BTC", postsCount: 45 },
    { ticker: "$ETH", postsCount: 28 },
  ]}
  selectedTicker={selectedTicker}
  onTickerClick={setSelectedTicker}
/>
```

**EarningsWidget** (только для владельца):
```typescript
<EarningsWidget
  period="30d"
  mrr={1240}
  arpu={24.8}
  activeSubscribers={50}
  topPostsByRevenue={[
    { postId: "post-123", title: "Signal...", revenue: 180 },
  ]}
/>
```

---

## Потоки данных (Data Flow)

### Публикация поста

```
User → QuickComposer (клик)
  → AdvancedComposer (модал)
    → Заполнение:
      - text
      - type (Idea/Opinion/Analysis...)
      - topic (News/Education...)
      - accessLevel (Public/Followers/Subscribers/Paid)
      - price (если Paid)
    → POST /posts
      → 201 Created
        → Optimistic update ленты
        → track("post_create", { postId, type, topic, accessLevel })
```

### Разблокировка поста

```
User → GatedContent (видит размытие)
  → Клик "Unlock for $9"
    → PaymentModal (открывается)
      → Ввод данных карты
      → purchasePost(postId, 9)
        → POST /purchases
          → 200 OK
            → Optimistic unlock (hasPurchased = true)
            → GatedContent скрывается
            → PostContent показывается
            → track("post_unlock", { postId, amount, method })
```

### Подписка на автора

```
User → Профиль автора
  → Клик "Subscribe $29/mo"
    → PaymentModal (тип: subscribe)
      → Выбор плана (monthly/yearly)
      → subscribe(authorId, "monthly")
        → POST /subscriptions
          → 200 OK
            → Optimistic subscribe (isSubscriber = true)
            → Все посты автора разблокируются
            → Бейдж "Subscriber" появляется
            → track("subscribe_success", { authorId, subscriptionId, amount })
```

### Hot Score сортировка

```
User → Переключает на "Hot"
  → setFeedMode("hot")
    → useHotScore(posts, true)
      → Для каждого поста:
        engagement = likes×1 + comments×3 + reposts×2 + views×0.01
        decay = e^(-ageHours / 24)
        hotScore = engagement × decay
      → Сортировка по hotScore (desc)
      → Возврат отсортированного массива
        → Рендер PostsList
        → track("sort_toggle", { mode: "hot" })
```

---

## Mock API

Все API функции находятся в `shared/api/contracts.ts`.

**Примеры mock данных**:

```typescript
// client/hooks/useGatingCheck.ts
const MOCK_SUBSCRIPTIONS = new Set(["user-456"]); // подписки
const MOCK_PURCHASES = new Set(["post-123"]); // покупки
const MOCK_FOLLOWING = new Set(["user-456"]); // фолловинги

// Функции для optimistic updates:
export function unlockPost(postId: string) {
  MOCK_PURCHASES.add(postId);
}

export function subscribeToAuthor(authorId: string) {
  MOCK_SUBSCRIPTIONS.add(authorId);
}
```

**Подключение реального API**:

1. Заменить mock функции в `shared/api/contracts.ts` на реальные fetch-вызовы
2. Убрать mock данные из `useGatingCheck.ts`, `usePayment.ts`
3. Настроить WebSocket в `useNewPosts.ts`

---

## Фильтры (Type vs Topic)

### Концепция

**Type** (вид контента) — **ОСЬ 1**:
- All, Idea, Opinion, Analysis, Code, Media
- Управляется **табами** (Ideas, Opinions, Analytics, Soft)

**Topic** (тематика) — **ОСЬ 2**:
- All, News, Education, Macro, On-chain, Code, Video, Signal
- Управляется **выпадающим фильтром** "Тема"

### Таблица пересечений

| Таб       | Type     | Topic Filter | Результат                  |
|-----------|----------|--------------|----------------------------|
| All       | all      | News         | Все новости                |
| Ideas     | idea     | All          | Только Ideas, любая тема   |
| Ideas     | idea     | Video        | Ideas с видео              |
| Analytics | analysis | Macro        | Analysis на тему Macro     |
| Soft      | code     | Education    | Образовательные посты с кодом |

### Код

```typescript
// constants.ts
export const TABS_CONFIG = {
  all: { type: 'all', visible: ['topic', 'market', 'price', ...] },
  ideas: { type: 'idea', visible: ['topic', 'market', ...] },
  // ...
};

// В компоненте:
const activeType = TABS_CONFIG[activeTab].type;
const filteredPosts = posts.filter(post => {
  if (activeType !== 'all' && post.type !== activeType) return false;
  if (filters.topic !== 'all' && post.topic !== filters.topic) return false;
  return true;
});
```

---

## Стилизация (Tokens)

**Цвета** (Tailwind):
```typescript
// tailwind.config.ts
colors: {
  'widget-border': '#16C784',   // Зелёный (рамка виджетов)
  'widget-bg': '#0B0E13',        // Фон виджетов
  'accent': '#A06AFF',           // Фиолетовый (градиенты)
  'accent-dark': '#482090',      // Тёмно-фиолетовый
  'bullish': '#2EBD85',          // Зелёный (бычий)
  'bearish': '#FF2626',          // Красный (медвежий)
  'hot': '#FF6B35',              // Оранжевый (Hot)
}
```

**Использование**:
```tsx
<div className="border border-widget-border bg-widget-bg">
  <button className="bg-gradient-to-r from-accent to-accent-dark">
    Subscribe
  </button>
</div>
```

---

## Тестирование

См. `TEST_PLAN.md` для полного плана тестирования.

**Unit тесты** (рекомендуется):
- `useGatingCheck.test.ts`: проверка логики доступа
- `useHotScore.test.ts`: проверка формулы и сортировки
- `calculateHotScore.test.ts`: юнит-��есты для разных сценариев

**Integration тесты**:
- `PaymentModal.test.tsx`: флоу оплаты (mock API)
- `GatedContent.test.tsx`: интеграция с useGatingCheck
- `FeedPage.test.tsx`: табы + фильтры + сортировка

**E2E тесты** (Cypress/Playwright):
- Публикация поста → видимость в ленте
- Unlock поста → разблокировка
- Subscribe → доступ ко всем постам автора
- Фильтры Type × Topic → правильная выдача

---

## Deployment

**Build**:
```bash
npm run build
```

**Environment Variables**:
```
VITE_API_URL=https://api.tyrian.trade
VITE_WS_URL=wss://api.tyrian.trade/feed
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_GA_ID=G-XXXXXXXXXX
```

**CI/CD**:
- Netlify автодеплой из `main` ветки
- Preview деплои для PR

---

## Roadmap

**M0 (MVP)** — ✅ Готово:
- Фильтры Type + Topic
- Gating check
- Композер с аудиторией
- GatedContent UI
- Профили own/other
- Виджеты

**M1 (Монетизация)** — ✅ Готово:
- Платёжные модалы
- Optimistic unlock
- Earnings widget
- Subscriber badges
- Донаты

**M2 (UX polish)** — ✅ Готово:
- Hot score алгоритм
- NewPostsBanner (WebSocket mock)
- Author Activity widget
- Аналитика (tracking)

**M3 (Backend)** — Следующий этап:
- ��еальный API (замена моков)
- WebSocket сервер
- Stripe integration
- Database (Supabase)

---

## FAQ

**Q: Как добавить новый тип поста?**  
A: Обновите `PostType` в `shared/types/index.ts`, добавьте таб в `constants.ts`, создайте иконку.

**Q: Как изменить формулу Hot Score?**  
A: Измените `HOT_SCORE_CONFIG` в `client/hooks/useHotScore.ts`.

**Q: Как подключить реальный API?**  
A: Замените mock функции в `shared/api/contracts.ts` на fetch-вызовы, настройте `VITE_API_URL`.

**Q: Где хранятся mock подписки/покупки?**  
A: В `client/hooks/useGatingCheck.ts` (Set'ы). При реальном API — запросы на `/subscriptions/check`, `/purchases/check`.

**Q: Как работает optimistic unlock?**  
A: После успешной оплаты (`POST /purchases → 200 OK`) добавляем `postId` в `MOCK_PURCHASES` → `useGatingCheck` сразу возвращает `canAccess=true` → UI обновляется без перезагрузки.
