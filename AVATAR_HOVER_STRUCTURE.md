# Avatar Hover Card - Структура и Использование

Документация по системе всплывающих карточек профилей при наведении на аватары.

## 📋 Обзор

Система состоит из трёх уровней компонентов для максимальной переиспользуемости:

```
UserHoverCard (базовый UI компонент)
    ↓
AvatarWithHoverCard (обертка для переиспользования)
    ↓
Любой компонент с аватаром (посты, виджеты и т.д.)
```

## 🏗️ Архитектура

### 1. UserHoverCard (Базовый компонент)
**Путь:** `client/components/PostCard/UserHoverCard.tsx`

Базовый hover card с UI логикой. Используется напрямую на странице `/home`.

**Особенности:**
- Radix UI HoverCard под капотом
- Анимации и transitions
- Кнопки Follow/Unfollow
- Отображение followers/following
- Верификационный бейдж
- Bio (краткое описание профиля, как в Twitter)

### 2. AvatarWithHoverCard (Обертка)
**Путь:** `client/components/common/AvatarWithHoverCard.tsx`

Универсальная обертка для легкого переиспользования в любых компонентах.

**Особенности:**
- Простой API
- Автоматическая обработка `undefined` полей
- Опция `disabled` для мобильных устройств
- Принимает любой `children`

**Использование:**
```tsx
<AvatarWithHoverCard
  author={{
    name: "John Doe",
    handle: "@john",
    avatar: "/avatar.jpg",
    followers: 1500,
    following: 320
  }}
  isFollowing={false}
  onFollowToggle={(nextState) => handleFollow(nextState)}
>
  {/* Любой контент с аватаром */}
</AvatarWithHoverCard>
```

### 3. Интеграция в компоненты

## 📍 Где используется

### Страница /feedtest
**Компонент:** `client/features/feed/components/posts/FeedPost.tsx`

Hover card на аватаре автора поста:
```tsx
<UserHoverCard author={post.author} isFollowing={isFollowing}>
  <div className="flex items-center gap-3">
    <Avatar>...</Avatar>
    <div>{post.author.name}</div>
  </div>
</UserHoverCard>
```

### Виджеты

#### TopAuthorsWidget
**Путь:** `client/features/feed/components/widgets/TopAuthorsWidget.tsx`

Hover card на каждом авторе в списке:
```tsx
<AvatarWithHoverCard author={author} isFollowing={author.isFollowing}>
  <div className="flex items-center gap-2">
    <img src={author.avatar} className="w-10 h-10 rounded-full" />
    <div>{author.name}</div>
  </div>
</AvatarWithHoverCard>
```

#### SuggestedProfilesWidget
**Путь:** `client/components/SocialFeedWidgets/SuggestedProfilesWidget.tsx`

Hover card на рекомендуемых профилях:
```tsx
<AvatarWithHoverCard author={profile}>
  <Link to={profileUrl}>
    <Avatar>...</Avatar>
    <div>{profile.name}</div>
  </Link>
</AvatarWithHoverCard>
```

#### FollowRecommendationsWidget
**Путь:** `client/components/SocialFeedWidgets/FollowRecommendationsWidget.tsx`

Hover card на рекомендациях для подписки:
```tsx
<AvatarWithHoverCard author={profile}>
  <div className="flex items-center gap-3">
    <Avatar>...</Avatar>
    <div>{profile.name}</div>
  </div>
</AvatarWithHoverCard>
```

## 🎯 Преимущества структуры

### 1. Переиспользование кода
- Один компонент для всех аватаров
- Не нужно дублировать логику hover card
- Легко добавить в новые места

### 2. Легкая поддержка
- Изменения в UserHoverCard применяются везде автоматически
- Централизованная логика и стили
- Единый источник правды для UI

### 3. Гибкость
- AvatarWithHoverCard принимает любой children
- Можно кастомизировать каждое использование
- Опция disabled для особых случаев

### 4. Производительность
- Hover card рендерится только при наведении
- Нет лишних рендеров
- Оптимизированные анимации

## 📝 Как добавить в новый компонент

### Шаг 1: Импортируйте компонент
```tsx
import AvatarWithHoverCard from "@/components/common/AvatarWithHoverCard";
```

### Шаг 2: Оберните аватар
```tsx
<AvatarWithHoverCard
  author={{
    name: user.name,
    handle: user.handle,
    avatar: user.avatar,
    verified: user.verified,
    followers: user.followers || 0,
    following: user.following || 0,
  }}
  isFollowing={isFollowing}
  onFollowToggle={(nextState) => handleFollowToggle(user.handle, nextState)}
>
  {/* Ваш существующий код с аватаром */}
  <div className="flex items-center gap-2 cursor-pointer">
    <Avatar>...</Avatar>
    <div>{user.name}</div>
  </div>
</AvatarWithHoverCard>
```

### Шаг 3: Добавьте cursor-pointer
Важно добавить `cursor-pointer` к children для лучшего UX.

## 🔧 Настройка и кастомизация

### Отключение на мобильных
```tsx
const isMobile = window.innerWidth < 768;

<AvatarWithHoverCard
  author={author}
  disabled={isMobile}
>
  {children}
</AvatarWithHoverCard>
```

### Обработка подписки
```tsx
const [isFollowing, setIsFollowing] = useState(false);

const handleFollowToggle = (handle: string, nextState: boolean) => {
  setIsFollowing(nextState);
  // API call to follow/unfollow
  await api.toggleFollow(handle, nextState);
};

<AvatarWithHoverCard
  author={author}
  isFollowing={isFollowing}
  onFollowToggle={(nextState) => handleFollowToggle(author.handle, nextState)}
>
  {children}
</AvatarWithHoverCard>
```

## 📦 Файлы проекта

```
client/
├── components/
│   ├── common/
│   │   ├── AvatarWithHoverCard.tsx  # Обертка для переиспользования
│   │   └── README.md                # Документация компонента
│   └── PostCard/
│       └── UserHoverCard.tsx        # Базовый UI компонент
├── features/feed/
│   └── components/
│       ├── posts/
│       │   └── FeedPost.tsx         # Использует UserHoverCard напрямую
│       └── widgets/
│           ├── TopAuthorsWidget.tsx             # Использует AvatarWithHoverCard
│           ├── SuggestedProfilesWidget.tsx      # Использует AvatarWithHoverCard
│           └── FollowRecommendationsWidget.tsx  # Использует AvatarWithHoverCard
└── AVATAR_HOVER_STRUCTURE.md        # Эта документация
```

## 🚀 Best Practices

1. **Всегда используйте AvatarWithHoverCard** для новых компонентов
2. **Добавляйте cursor-pointer** к children для индикации hover
3. **Передавайте полные данные** author для лучшего UX
4. **Обрабатывайте onFollowToggle** если нужна интерактивность
5. **Используйте disabled** на мобильных если hover мешает
6. **Тестируйте hover** на разных экранах и браузерах

## 🐛 Troubleshooting

### Hover card не появляется
- Проверьте, что передан children
- Убедитесь что disabled не true
- Проверьте z-index родительских элементов

### Follow/Unfollow не работает
- Проверьте передан ли onFollowToggle
- Убедитесь что isFollowing правильно обновляется
- Проверьте console на ошибки API

### Аватар не кликабелен
- Добавьте cursor-pointer к children
- Проверьте что нет pointer-events: none

## 📚 Дополнительная документация

- Подробное использование: `client/components/common/README.md`
- UserHoverCard API: см. `client/components/PostCard/UserHoverCard.tsx`
- Radix HoverCard: https://www.radix-ui.com/docs/primitives/components/hover-card
