# Profile Connections - User Flow

Визуальная схема перехода от hover card к странице подписчиков/подписок.

## 📊 Полный User Flow

```
┌────────────────────────────────────────────────────────────────┐
│  Шаг 1: Наведение на аватар в посте/виджете                    │
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│  Шаг 2: Появляется UserHoverCard                               │
│                                                                 │
│  ┌─────────────────────────────────────┐                       │
│  │  🖼️  Alex Trader      [Follow]      │                       │
│  │      @alextrader       ✓            │                       │
│  │                                     │                       │
│  │  Professional swing trader | 8+    │                       │
│  │  years experience                  │                       │
│  │                                     │                       │
│  │  1.2K Following    45.2K Followers │← Cursor: pointer      │
│  │      ─────────          ─────────  │← Hover: underline     │
│  └──────────────────────────────────���──┘                       │
└────────────────────────────────────────────────────────────────┘
                              ↓
                    Клик на "45.2K Followers"
                              ↓
┌────────────────────────────────────────────────────────────────┐
│  Шаг 3: Переход на /profile-connections/alextrader?tab=followers│
└────────────────────────────────────────────────────────────────┘
                              ↓
┌────────────────────────────────────────────────────────────────┐
│  Шаг 4: Открывается страница ProfileConnections                │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ← alextrader                                            │  │
│  │     @alextrader                                          │  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │ Verified │ [Followers] │ Following               │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  │                                                          │  │
│  │  🖼️ Crypto Whale              @cryptowhale  [Follow]   │  │
│  │     Bitcoin maximalist. HODL since 2013.               │  │
│  │                                                          │  │
│  │  🖼️ Market News                @marketnews  [Follow]   │  │
│  │     Real-time crypto market updates                     │  │
│  │                                                          │  │
│  │  🖼️ DeFi Hunter                @defihunter  [Follow]   │  │
│  │     Finding the best DeFi yields                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

## 🎯 Детальное взаимодействие

### UserHoverCard - Footer

```
Состояние 1: Обычное
─────────────────────────────────────
1.2K Following    45.2K Followers
     (серый)          (серый)


Состояние 2: Hover на "Following"
─────────────────────────────────────
1.2K Following    45.2K Followers
     ─────────         (серый)
   (подчеркнут)
    (белый цвет)
  cursor: pointer


Состояние 3: Клик на "Following"
─────────────────────────────────────
→ navigate('/profile-connections/alextrader?tab=following')


Результат: Открывается ProfileConnections с вкладкой "Following"
```

## 🔄 Переключение вкладок

```
ProfileConnections с tab=followers
┌────────────────────────────────────┐
│ Verified │ [Followers] │ Following │
└────────────────────────────────────┘
                ↓
         Показывает MOCK_FOLLOWERS


Клик на "Following"
┌────────────────────────────────────┐
│ Verified │ Followers │ [Following] │
└────────────────────────────────────┘
                ↓
         Показывает MOCK_FOLLOWING
         URL: ?tab=following


Клик на "Verified"
┌────────────────────────────────────┐
│ [Verified] │ Followers │ Following │
└────────────────────────────────────┘
                ↓
         Показывает только verified из MOCK_FOLLOWERS
         URL: ?tab=verified
```

## 🎨 CSS Состояния

### Followers/Following в Hover Card

#### Default State
```css
.text-[#8E92A0]  /* Серый текст */
.transition-all   /* Плавный переход */
```

#### Hover State
```css
.group-hover:text-white      /* Белый текст */
.group-hover:underline       /* Подчеркивание */
.cursor-pointer              /* Курсор pointer */
```

### Вкладки на ProfileConnections

#### Active Tab
```css
.rounded-full
.bg-gradient-to-r from-[#A06AFF] to-[#482090]
.text-white
.shadow-[0_12px_30px_-18px_rgba(160,106,255,0.8)]
```

#### Inactive Tab (Hover)
```css
.text-[#9CA3AF]
.hover:text-white
.hover:bg-gradient-to-r from-[#A06AFF]/20 to-[#482090]/20

/* Анимированная линия снизу */
.group-hover:w-3/4  /* Появление линии */
background: linear-gradient(90deg, transparent 0%, #A06AFF 50%, transparent 100%)
```

## 📱 Примеры URL

### От разных профилей

**Alex Trader (handle: @alextrader)**
- Followers: `/profile-connections/alextrader?tab=followers`
- Following: `/profile-connections/alextrader?tab=following`

**Crypto Whale (handle: @cryptowhale)**
- Followers: `/profile-connections/cryptowhale?tab=followers`
- Following: `/profile-connections/cryptowhale?tab=following`

**Пользователь без handle (только имя: "John Doe")**
- Followers: `/profile-connections/john-doe?tab=followers`
- Following: `/profile-connections/john-doe?tab=following`

## 🔍 Логика определения handle

```tsx
const profileHandle = 
  author.handle?.replace('@', '') ||           // @alextrader → alextrader
  author.name.replace(/\s+/g, '-').toLowerCase(); // "John Doe" → "john-doe"
```

## ⚡ Performance

### Оптимизации

1. **Lazy Loading** - ProfileConnections загружается только при переходе
2. **useMemo** - кэширование отфильтрованных списков
3. **useSearchParams** - синхронизация tab с URL
4. **Local State** - follow/unfollow без перезагрузки

### Данные

```tsx
// Вычисляется один раз
const verifiedFollowers = useMemo(
  () => MOCK_FOLLOWERS.filter((user) => user.verified),
  []
);

// Пересчитывается только при смене activeTab
const currentUsers = useMemo(() => {
  switch (activeTab) {
    case "verified": return verifiedFollowers;
    case "followers": return MOCK_FOLLOWERS;
    case "following": return MOCK_FOLLOWING;
  }
}, [activeTab, verifiedFollowers]);
```

## 🎭 Анимации

### Hover Card появление
```
openDelay={150}    ← Задержка перед показом
closeDelay={200}   ← Задержка перед скрытием
```

### Вкладки переключение
```css
transition-all duration-300
```

### Hover линия
```css
w-0 → group-hover:w-3/4
transition-all duration-300
```

## 🚀 Расширения

### Будущие фичи

1. **Infinite Scroll**
   ```tsx
   const { data, fetchNextPage } = useInfiniteQuery(['followers', handle]);
   ```

2. **Поиск**
   ```tsx
   const filteredUsers = users.filter(u => 
     u.name.toLowerCase().includes(searchQuery.toLowerCase())
   );
   ```

3. **Sorting**
   ```tsx
   const sortedUsers = [...users].sort((a, b) => 
     sortBy === 'name' ? a.name.localeCompare(b.name) : b.followers - a.followers
   );
   ```

## 📊 Metrics

Полезные метрики для аналитики:

- Клики на Followers в hover card
- Клики на Following в hover card
- Переключения между вкладками
- Follow/Unfollow с ProfileConnections
- Время на странице ProfileConnections
- Клики на профили из списка

```tsx
// Analytics event example
onClick={() => {
  trackEvent('profile_connections_opened', {
    source: 'hover_card',
    tab: 'followers',
    profile: handle
  });
  navigate(`/profile-connections/${handle}?tab=followers`);
}}
```

## ✅ Checklist для интеграции

- [x] UserHoverCard с кликабельными Followers/Following
- [x] Hover эффект с подчеркиванием
- [x] ProfileConnections страница
- [x] Три вкладки (Verified, Followers, Following)
- [x] URL state через useSearchParams
- [x] Роутинг в App.tsx
- [x] UserHoverCard в списке пользователей
- [x] FollowButton интеграция
- [x] Sidebar с SuggestedProfiles
- [x] Кнопка "Назад"
- [x] Responsive layout
- [ ] Real API integration
- [ ] Loading states
- [ ] Error handling
- [ ] Infinite scroll
- [ ] Search functionality
