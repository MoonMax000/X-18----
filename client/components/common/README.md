# Common Components

Переиспользуемые компоненты для всего приложения.

## AvatarWithHoverCard

Обертка для аватаров, которая добавляет всплывающую карточку при наведении с информацией о пользователе.

### Использование

```tsx
import AvatarWithHoverCard from "@/components/common/AvatarWithHoverCard";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

<AvatarWithHoverCard
  author={{
    name: "John Doe",
    handle: "@johndoe",
    avatar: "/avatar.jpg",
    verified: true,
    followers: 1500,
    following: 320,
    bio: "Crypto trader and analyst"
  }}
  isFollowing={false}
  onFollowToggle={(nextState) => {
    console.log('Follow state changed:', nextState);
  }}
>
  <div className="flex items-center gap-2 cursor-pointer">
    <Avatar>
      <AvatarImage src="/avatar.jpg" />
    </Avatar>
    <div>
      <div className="font-semibold">John Doe</div>
      <div className="text-sm text-gray-500">@johndoe</div>
    </div>
  </div>
</AvatarWithHoverCard>
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `author` | `Author` | Yes | Информация о пользователе |
| `isFollowing` | `boolean` | No | Подписан ли текущий пользователь |
| `onFollowToggle` | `(nextState: boolean) => void` | No | Callback при изменении подписки |
| `children` | `ReactNode` | Yes | Контент который будет обернут (аватар, имя и т.д.) |
| `disabled` | `boolean` | No | Отключить hover card (вернет только children) |

### Author Type

```tsx
{
  name: string;          // Имя пользователя
  handle: string;        // @username
  avatar?: string;       // URL аватара
  verified?: boolean;    // Верифицирован ли
  followers?: number;    // Количество подписчиков
  following?: number;    // Количество подписок
  bio?: string;          // Краткое опис��ние профиля (как в Twitter)
}
```

**Примечание:** Bio отображается в hover card если оно заполнено. Рекомендуется держать его коротким (до 160 символов), как в Twitter.

### Примеры использования

#### В постах

```tsx
<AvatarWithHoverCard
  author={post.author}
  isFollowing={isFollowing}
  onFollowToggle={(nextState) => handleFollowToggle(post.author.handle, nextState)}
>
  <div className="flex items-center gap-3">
    <Avatar>
      <AvatarImage src={post.author.avatar} />
    </Avatar>
    <div>
      <div className="font-bold">{post.author.name}</div>
      <div className="text-sm text-gray-500">{post.author.handle}</div>
    </div>
  </div>
</AvatarWithHoverCard>
```

#### В виджетах

```tsx
<AvatarWithHoverCard
  author={{
    name: author.name,
    handle: author.handle,
    avatar: author.avatar,
    followers: author.followers,
    following: 0,
  }}
  isFollowing={author.isFollowing}
>
  <div className="flex items-center gap-2 cursor-pointer">
    <img src={author.avatar} className="w-10 h-10 rounded-full" />
    <div>
      <div className="font-semibold">{author.name}</div>
      <div className="text-xs text-gray-500">{author.handle}</div>
    </div>
  </div>
</AvatarWithHoverCard>
```

#### Отключение hover card

Если нужно временно отключить hover card (например, на мобильных устройствах):

```tsx
const isMobile = window.innerWidth < 768;

<AvatarWithHoverCard
  author={author}
  disabled={isMobile}
>
  {/* ... */}
</AvatarWithHoverCard>
```

### Где используется

- `/feedtest` - в постах (FeedPost.tsx)
- Виджеты:
  - TopAuthorsWidget
  - SuggestedProfilesWidget
  - FollowRecommendationsWidget
- `/home` - в постах (уже было)

### Структура файлов

```
client/
  components/
    common/
      AvatarWithHoverCard.tsx  # Основной компонент
      README.md                # Эта документация
    PostCard/
      UserHoverCard.tsx        # Базовый hover card компонент
```

### Особенности

1. **Оптимизация** - Hover card загружается только при наведении
2. **Доступность** - Поддерживает keyboard navigation
3. **Мобильные устройства** - Можно отключить через prop `disabled`
4. **Переиспользование** - Оди�� компонент для всех аватаров в приложении
5. **Легкая настройка** - Принимает любой children, полная гибкость в дизайне

### Best Practices

1. Всегда добавляйте `cursor-pointer` к children для UX
2. Передавайте полные данные author для лучшего UX
3. Используйте disabled на мобильных устройствах если hover card мешает
4. Добавляйте onFollowToggle для интерактивности
