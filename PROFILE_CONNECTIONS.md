# Profile Connections - Followers & Following страница

Документация по странице просмотра подписчиков и подписок пользователя.

## 📋 Обзор

Страница `/profile-connections/:handle` отображает список подписчиков или подписок пользователя с вкладками для переключения между ними.

## 🎯 Функционал

### 1. Открытие с нужной вкладкой
При клике на "Followers" или "Following" в UserHoverCard:
- Открывается страница ProfileConnections
- Автоматически переключается на выбранную вкладку (через query па��аметр `?tab=`)

### 2. Три вкладки
```
┌────────────────────────────────────────┐
│  ✓ Verified  │  Followers  │  Following │
└────────────────────────────────────────┘
```

- **Verified Followers** - только верифицированные подписчики
- **Followers** - все подписчики
- **Following** - все подписки

### 3. Hover эффекты в UserHoverCard

#### До изменений:
```
45.2K Followers    1.2K Following
```

#### После изменений:
```
45.2K Followers (с подчеркиванием при hover)
1.2K Following  (с подчеркиванием при hover)
```

**CSS для hover:**
```tsx
<span className="text-[#8E92A0] group-hover:text-white group-hover:underline transition-all">
  Followers
</span>
```

## 🏗️ Архитектура

### Компоненты

```
ProfileConnections.tsx
├── Шапка с кнопкой "Назад"
├── Три вкладки (Verified, Followers, Following)
├── Список пользователей
│   ├── UserHoverCard для каждого
│   ├── Avatar
│   ├── Имя + верификация
│   ├── Bio
│   └── FollowButton
└── Sidebar с SuggestedProfiles
```

### Роутинг

**Путь:** `/profile-connections/:handle?tab=followers|following|verified`

**Примеры:**
- `/profile-connections/alextrader?tab=followers`
- `/profile-connections/cryptowhale?tab=following`
- `/profile-connections/marketnews?tab=verified`

## 🔗 Интеграция

### UserHoverCard
**Файл:** `client/components/PostCard/UserHoverCard.tsx`

При клике на Followers/Following:
```tsx
<button
  onClick={(e) => {
    e.stopPropagation();
    const profileHandle = author.handle?.replace('@', '') || 
                         author.name.replace(/\s+/g, '-').toLowerCase();
    navigate(`/profile-connections/${profileHandle}?tab=followers`);
  }}
  className="group cursor-pointer hover:text-white"
>
  <span className="font-semibold text-white">45.2K</span>{" "}
  <span className="text-[#8E92A0] group-hover:text-white group-hover:underline">
    Followers
  </span>
</button>
```

### App.tsx
**Файл:** `client/App.tsx`

Добавлен роут:
```tsx
<Route
  path="/profile-connections/:handle"
  element={<ProfileConnections />}
/>
```

## 📊 Данные

### Mock данные

#### MOCK_FOLLOWERS
5 пользователей с полными профилями:
```tsx
{
  id: "1",
  name: "Crypto Whale",
  handle: "@cryptowhale",
  avatar: "https://i.pravatar.cc/150?img=10",
  verified: true,
  bio: "Bitcoin maximalist. HODL since 2013.",
  followers: 125000,
  following: 420,
}
```

#### MOCK_FOLLOWING
5 известных профилей:
- Vitalik Buterin
- CZ Binance
- Satoshi Nakamoto
- Crypto Analytics
- Web3 Builder

## 🎨 UI/UX особенности

### 1. Вкладки с эффектами
```tsx
className={cn(
  "flex-1 px-3 py-2 text-sm font-semibold transition-all duration-300",
  isActive
    ? "rounded-full bg-gradient-to-r from-[#A06AFF] to-[#482090] text-white"
    : "rounded-full text-[#9CA3AF] hover:text-white"
)}
```

**Активная вкладка:**
- Градиентный фон (purple)
- Тень с blur
- Белый текст

**Неактивная вкладка:**
- При hover: градиентный фон с прозрачностью
- Анимированная линия снизу
- Изменение цвета текста

### 2. Hover линия под вкладкой
```tsx
{!isActive && (
  <div
    className="absolute bottom-0 left-1/2 h-0.5 w-0 
               rounded-full transform -translate-x-1/2 
               group-hover:w-3/4 transition-all duration-300"
    style={{
      background: 'linear-gradient(90deg, transparent 0%, #A06AFF 50%, transparent 100%)'
    }}
  />
)}
```

### 3. Карточки пользователей
- Hover эффект (фон темнеет)
- UserHoverCard при наведении на аватар/имя
- FollowButton справа
- Bio под именем

## 🚀 Использование

### Открытие страницы из кода
```tsx
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

// Открыть подписчиков
navigate(`/profile-connections/${handle}?tab=followers`);

// Открыть подписки
navigate(`/profile-connections/${handle}?tab=following`);

// Открыть верифицированных
navigate(`/profile-connections/${handle}?tab=verified`);
```

### Из UserHoverCard (автоматически)
При клике на:
- "Followers" → открывается `/profile-connections/:handle?tab=followers`
- "Following" → открывается `/profile-connections/:handle?tab=following`

## 📱 Адаптивность

### Desktop (lg+)
```
┌─────────────────────┬──────────────┐
│   User List         │   Sidebar    │
│   (max-w-720px)     │   (340px)    │
└─────────────────────┴──────────────┘
```

### Mobile/Tablet
```
┌─────────────────────┐
│   User List         │
│   (full width)      │
│   (no sidebar)      │
└─────────────────────┘
```

## 🔄 State Management

### URL State
- Вкладка хранится в query параметре `?tab=`
- Синхронизируется с useState через useSearchParams

### Local State
```tsx
const [activeTab, setActiveTab] = useState<TabType>(initialTab);
const [followingState, setFollowingState] = useState<Record<string, boolean>>({});
```

### Follow/Unfollow
Локальное состояние для каждого пользователя:
```tsx
followingState[userId] = true/false
```

## 🎯 Best Practices

1. **Используйте handle вместо userId** в URL для SEO и читабельности
2. **Сохраняйте tab в query params** для возможности поделиться ссылкой
3. **Показывайте loading state** при загрузке данных (в будущем)
4. **Кэшируйте данные** чтобы не загружать повторно при переключении вкладок
5. **Добавьте infinite scroll** для больших списков

## 🔮 Будущие улучшения

- [ ] Infinite scroll для загрузки большого количества пользователей
- [ ] Поиск по списку подписчиков/подписок
- [ ] Фильтры (verified only, mutual follows, etc.)
- [ ] Сортировка (по алфавиту, по дате подписки)
- [ ] Skeleton loading вместо пустого экрана
- [ ] Реальные API вызовы вместо моков
- [ ] Оптимистичные обновления для follow/unfollow

## 📚 Связанные файлы

- `client/pages/ProfileConnections.tsx` - основная страница
- `client/components/PostCard/UserHoverCard.tsx` - кликабельные Followers/Following
- `client/App.tsx` - роутинг
- `client/components/PostCard/FollowButton.tsx` - кнопка подписки
- `client/components/SocialFeedWidgets/SuggestedProfilesWidget.tsx` - sidebar
