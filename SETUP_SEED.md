# 🚀 Быстрая настройка seeding

## 1. ��становите зависимости

```bash
pnpm add @supabase/supabase-js
```

## 2. Настройте переменные окружения

Скопируйте `.env.example` в `.env` и заполните:

```env
# Для бэкенда (server-side)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key

# Для фронтенда (client-side)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key
```

**Где взять ключи:**
1. Откройте Supabase Dashboard
2. Settings → API
3. Project URL = SUPABASE_URL
4. service_role key = SUPABASE_SERVICE_KEY (используйте осторожно!)
5. anon public key = VITE_SUPABASE_ANON_KEY (безопасно для фронтенда)

## 3. Выполните миграции

Откройте Supabase Dashboard → SQL Editor и выполните SQL из `server/config/database.ts`.

Или скопируйте прямо отсюда:

```sql
-- Смотрите файл server/config/database.ts
-- Переменная exports.migrations
```

## 4. Запустите seeding

```bash
pnpm seed
```

## 5. Готово! ✅

Проверьте:
- Supabase Dashboard → Table Editor → users (должно быть 50 записей)
- Откройте /profile/tyrian_trade в приложении
- Виджеты должны показывать реальных пользователей

---

## Что дальше?

**Обновите виджеты для использования реальных данных:**

Замените в `client/pages/FeedTest.tsx`:

```tsx
// Было (mock данные)
import { DEFAULT_SUGGESTED_PROFILES } from '@/components/SocialFeedWidgets/sidebarData';

// Стало (реальные данные)
import TopAuthorsWidget from '@/components/SocialFeedWidgets/TopAuthorsWidget';

// В JSX
<TopAuthorsWidget limit={10} />
```

**Используйте хелперы из `client/lib/supabase.ts`:**

```tsx
import { getTopAuthors, getSuggestedProfiles } from '@/lib/supabase';

const authors = await getTopAuthors(10);
const suggested = await getSuggestedProfiles(5);
```

---

## Логин тестовых пользователей

Все 50 пользователей имеют одинаковый пароль:

```
Email: {username}@tradingplatform.io
Password: Test123!@#
```

Примеры:
- tyrian_trade@tradingplatform.io
- crypto_analyst@tradingplatform.io
- alexander_trader@tradingplatform.io

---

**Полная документация:** [SEEDING_GUIDE.md](./SEEDING_GUIDE.md)
