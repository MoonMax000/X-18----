# Profile Architecture Documentation

## Обзор

Мы реализовали правильную архитектуру профилей для вашей платформы, похожую на Twitter. Теперь у вас есть:

- ✅ **20+ тестовых пользователей** с реальными данными
- ✅ **Динамические роуты** (`/profile/:username`)
- ✅ **Единый компонент** для своего и чужого профиля
- ✅ **Контекст авторизации** для определения текущего пользователя
- ✅ **Автоматические переходы** между профилями

## Структура файлов

### 1. База данных пользователей
**Файл:** `client/data/users.ts`

- 20+ пользователей с полными профилями
- Текущий пользователь: `tyrian_trade`
- Helper функции:
  - `getUserByUsername(username)` - найти по username
  - `getUserById(id)` - найти по ID
  - `getCurrentUser()` - получить текущего пользователя
  - `getAllUsers()` - все пользователи
  - `getRandomUsers(count, excludeId)` - случайные пользователи

### 2. Контекст авторизации
**Файл:** `client/contexts/AuthContext.tsx`

```typescript
const { currentUser } = useAuth();
```

Используйте в компонентах для получения текущего пользователя.

### 3. Динамическая страница профиля
**Файл:** `client/pages/ProfileDynamic.tsx`

- Автоматически определяет: свой/чужой профиль
- Роут: `/profile/:username`
- Если username совпадает с currentUser - показывает "Edit profile"
- Если нет - показывает "Follow"

### 4. Обновленные компоненты

**ProfileContentClassic.tsx:**
- Теперь принимает `profile` prop
- Автоматически использует его или defaultProfile

**FollowRecommendationsWidget.tsx:**
- Виджеты теперь используют реальных пользователей
- Клики на профили ведут на `/profile/:username`

## Примеры пользователей

### Текущий пользователь
```
username: tyrian_trade
route: /profile/tyrian_trade
```

### Другие пользователи для тестирования
```
/profile/crypto_analyst      - Alex Morrison (криптоаналитик)
/profile/ai_researcher        - Dr. Sarah Chen (AI исследователь)
/profile/market_oracle        - Marcus Webb (трейдер)
/profile/defi_builder         - Elena Rodriguez (DeFi разработчик)
/profile/tech_insider         - James Liu (тех журналист)
/profile/nft_collector        - Maya Santos (NFT коллекционер)
/profile/quant_trader         - Dmitry Volkov (квант трейдер)
/profile/macro_trader         - Victoria Knight (макро трейдер)
/profile/blockchain_dev       - Ryan Park (блокчейн разработчик)
/profile/fintech_founder      - Sophia Zhang (финтех основатель)
/profile/dao_builder          - Lucas Martins (DAO билдер)
/profile/venture_cap          - Amanda Foster (венчурный капитали��т)
/profile/options_pro          - Michael Chen (опционный трейдер)
/profile/startup_scout        - Emma Wilson (стартап советник)
/profile/forex_mentor         - Thomas Anderson (форекс ментор)
/profile/token_economist      - Dr. Priya Patel (экономист токенов)
/profile/yield_farmer         - Carlos Gutierrez (DeFi фармер)
/profile/technical_analyst    - Jessica Kim (технический аналитик)
/profile/web3_designer        - Oliver Brown (web3 дизайнер)
```

## Как работают переходы

### Из виджетов "Who to follow"
1. Пользователь кликает на профиль
2. Переход на `/profile/:username`
3. `ProfileDynamic` определяет: свой/чужой
4. Показывает соответствующий UI

### Из навбара
- "Мой профиль" → `/profile/tyrian_trade`
- "Примеры профилей" → `/profile/crypto_analyst`

### Из постов
Когда будете подключать посты к пользователям:
```typescript
<Link to={`/profile/${post.author.username}`}>
  {post.author.name}
</Link>
```

## Подготовка к бэкенду

### 1. API endpoints (будущие)
```
GET  /api/users/:username       - Получить профиль
GET  /api/users/current          - Текущий пользователь
POST /api/users/:id/follow       - Подписаться
POST /api/users/:id/unfollow     - Отписаться
PUT  /api/users/current          - Обновить профиль
```

### 2. Где менять при подключении API

**AuthContext.tsx:**
```typescript
// Сейчас:
const currentUser = getCurrentUser();

// С API:
const [currentUser, setCurrentUser] = useState(null);
useEffect(() => {
  api.get('/users/current').then(setCurrentUser);
}, []);
```

**ProfileDynamic.tsx:**
```typescript
// Сейчас:
const profileUser = getUserByUsername(username);

// С API:
const [profileUser, setProfileUser] = useState(null);
useEffect(() => {
  api.get(`/users/${username}`).then(setProfileUser);
}, [username]);
```

### 3. Состояние подписки
```typescript
// Добавить в ProfileHero:
const [isFollowing, setIsFollowing] = useState(false);

const handleFollow = async () => {
  await api.post(`/users/${profile.id}/follow`);
  setIsFollowing(true);
};
```

## Тестирование

### 1. Проверьте переходы
- Откройте `/profile/tyrian_trade` - должна быть кнопка "Edit profile"
- Откройте `/profile/crypto_analyst` - должна быть кнопка "Follow"
- Кликните на пользователя в виджете - должен открыться его профиль

### 2. Проверьте виджеты
- "Who to follow" должен показывать разных пользователей каждый раз
- Клик на avatar или имя → переход на профиль
- Кнопка Follow должна работать

### 3. Проверьте навигацию
- Левое меню: "Мой профиль" и "Примеры профилей"
- Переходы работают корректно
- Кнопка "назад" работает

## Добавление нового пользователя

В `client/data/users.ts`:

```typescript
"new_username": {
  id: "new_username",
  name: "Full Name",
  username: "new_username",
  bio: "Short bio",
  location: "City, Country",
  website: {
    label: "example.com",
    url: "https://example.com",
  },
  joined: "Месяц год",
  avatar: "https://i.pravatar.cc/400?img=XX",
  cover: "https://images.unsplash.com/photo-...",
  stats: {
    tweets: 100,
    following: 50,
    followers: 200,
    likes: 150,
  },
  isVerified: true,  // опционально
  isPremium: true,   // опционально
},
```

Затем пользователь будет доступен по `/profile/new_username`.

## Следующие шаги

1. ✅ Профильная архитектура - **ГОТОВО**
2. 🔄 Связать посты с пользователями
3. 🔄 Добавить реальную логику Follow/Unfollow
4. 🔄 Добавить редактирование профиля с сохранением
5. 🔄 Подключить бэкенд API
6. 🔄 Добавить загрузку avatar/cover
7. 🔄 Добавить страницу Followers/Following

## Полезные команды

```bash
# Проверить роутинг
npm run dev

# Открыть разные профили
http://localhost:5173/profile/tyrian_trade
http://localhost:5173/profile/crypto_analyst
http://localhost:5173/profile/ai_researcher
```

## Примечания

- Старые роуты `/profile-page` и `/other-profile` оставлены для обратной совместимости
- Можно удалить их после полного перехода на новую архитектуру
- Все переходы теперь используют `/profile/:username`
- Mock данные легко заменяются на API calls
