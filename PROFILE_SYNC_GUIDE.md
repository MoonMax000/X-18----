# Profile Synchronization System

## Обзор

Система синхронизации профиля использует **Redux** для централизованного управления данными профиля пользователя. Это обеспечивает автоматическое обновление данных на всех страницах при изменении профиля.

## Архитектура

### Redux Store (`client/store/profileSlice.ts`)

Централизованное хранилище данных профиля с тремя основными действиями:

- **`updateProfile(data)`** - Частичное обновление профиля (используется для автосохранения)
- **`setProfile(data)`** - Полная замена данных профиля
- **`resetProfile()`** - Сброс к начальным значениям

```typescript
// Структура данных профиля
interface ProfileData {
  name: string;
  username: string;
  bio: string;
  role?: string;
  location?: string;
  website?: string;
  avatar?: string;
  cover?: string;
  stats?: {
    tweets: number;
    following: number;
    followers: number;
    likes?: number;
  };
  // ...
}
```

## Компоненты

### 1. ProfileOverview (`/profile` → Profile)

**Страница настроек профиля** - где пользователь редактирует свои данные.

**Функциональность:**
- Автосохранение в Redux с задержкой 800мс при изменении полей
- Синхронизация локального state с Redux при внешних изменениях
- Все изменения автоматически распространяются на другие страницы

```typescript
// Автосохранение
useEffect(() => {
  const timer = setTimeout(() => {
    dispatch(updateProfile({
      name: displayName,
      username,
      bio,
      role,
    }));
  }, 800);
  return () => clearTimeout(timer);
}, [displayName, username, bio, role]);
```

### 2. ProfilePage (`/profile-page`)

**Страница "Мой профиль"** - показывает профиль пользователя.

**Функциональность:**
- Читает данные из Redux для своего профиля (`isOwnProfile=true`)
- Автоматически обновляется при изменениях в ProfileOverview
- Показывает роль под ником

### 3. OtherProfilePage (`/other-profile`, `/profile/:handle`)

**Страница "Чужой профиль"** - показывает профиль другого пользователя.

**Функциональность:**
- Использует данные из API/моков (не Redux)
- Показывает роль если она установлена
- Независима от Redux store

### 4. UserHeader

**Компонент шапки профиля** - используется на странице `/profile`.

**Функциональность:**
- Автоматически читает из Redux для `isOwn=true`
- Показывает роль под ником с фиолетовым бейджем
- Синхронизируется с ProfileOverview

## Поток данных

```
┌─────────────────────┐
│  ProfileOverview    │  Пользователь редактирует
│  (/profile)         │  поля: имя, роль, био
└──────────┬──────────┘
           │
           │ dispatch(updateProfile(...))
           │ (автосохранение 800ms)
           ▼
    ┌──────────────┐
    │ Redux Store  │  Централизованное хранилище
    │ profileSlice │  данных профиля
    └──────┬───────┘
           │
           │ useSelector(state => state.profile.currentUser)
           │
    ┌──────┴────────────────────────────┐
    │                                   │
    ▼                                   ▼
┌──────────────────┐          ┌─────────────────┐
│  ProfilePage     │          │  UserHeader     │
│  (/profile-page) │          │  (/profile)     │
│                  │          │                 │
│  Автоо��новление  │          │  Автообновление │
└──────────────────┘          └─────────────────┘
```

## Отображение роли

Роль отображается во всех компонентах профиля с единым стилем:

```tsx
{profile.role && (
  <div className="flex items-center gap-1.5 mt-0.5">
    <div className="flex items-center gap-1.5 rounded-full border border-[#A06AFF]/30 bg-[#A06AFF]/10 px-2.5 py-1">
      <StarIcon className="h-3 w-3 text-[#A06AFF]" />
      <span className="text-xs font-semibold text-[#A06AFF]">
        {profile.role}
      </span>
    </div>
  </div>
)}
```

**Места отображения:**
- ✅ `/profile` - UserHeader (под @username)
- ✅ `/profile-page` - ProfileDetails (под @username)
- ✅ `/other-profile` - ProfileDetails (под @username)

## Оптимизация

### 1. Debounced Auto-save (800ms)

Избегаем частых обновлений Redux при вводе текста:

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    dispatch(updateProfile({ ... }));
  }, 800);
  return () => clearTimeout(timer);
}, [formFields]);
```

### 2. Селективное ��тение из Redux

Компоненты читают только для своего профиля:

```typescript
const profileData = isOwnProfile 
  ? currentUser  // из Redux
  : apiData;     // из API
```

### 3. Мемоизация

Используем `useSelector` с мелкими селекторами для минимизации ре-рендеров.

## Использование

### Обновление профиля из любого компонента:

```typescript
import { useDispatch } from 'react-redux';
import { updateProfile } from '@/store/profileSlice';

const dispatch = useDispatch();

// Частичное обновление
dispatch(updateProfile({ role: 'New Role' }));

// Полная замена
dispatch(setProfile(newProfileData));
```

### Чтение данных профиля:

```typescript
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

const currentUser = useSelector((state: RootState) => state.profile.currentUser);
```

## Преимущества

1. **Единый источник истины** - все данные профиля в одном месте
2. **Автоматическая синхронизация** - изменения распространяются на все страницы
3. **Оптимизированная производительность** - debouncing и селективные обновления
4. **Простота использования** - стандартные Redux hooks
5. **Типобезопасность** - полная поддержка TypeScript

## Добавление новых полей

Чтобы добавить новое поле в профиль:

1. Обновите интерфейс в `client/store/profileSlice.ts`:
```typescript
export interface ProfileData {
  // ...existing fields
  newField?: string;
}
```

2. Добавьте поле в `ProfileOverview` компонент:
```typescript
const [newField, setNewField] = useState(currentUser.newField || "");
```

3. Включите в автосохранение:
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    dispatch(updateProfile({ ..., newField }));
  }, 800);
  return () => clearTimeout(timer);
}, [..., newField]);
```

4. Отобразите в компонентах профиля (ProfileDetails, UserHeader и т.д.)

## Troubleshooting

**Проблема:** Изменения не отображаются на других страницах

**Решение:** 
- Проверьте что ��омпонент использует `useSelector` для чтения из Redux
- Убедитесь что `isOwnProfile` установлен правильно
- Проверьте что dispatch вызывается после изменений

**Проблема:** Слишком частые обновления Redux

**Решение:**
- Увеличьте задержку debounce (сейчас 800ms)
- Используйте батчинг для нескольких полей

**Проблема:** Роль не отображается

**Решение:**
- Проверьте что `profile.role` не пустая строка
- Убедитесь что данные синхронизированы с Redux
- Проверьте условный рендеринг `{profile.role && ...}`
