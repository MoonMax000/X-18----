# 🌱 Database Seeding Guide

## Что это даёт?

После выполнения seeding у вас будет:
- ✅ **50 тестовых пользователей** с уникальными профилями
- ✅ **Реалистичные данные** - имена, аватары, биографии
- ✅ **Статистика** - подписчики, посты, точность прогнозов
- ✅ **Рабочие страницы** - /profile/tyrian_trade, /profile/crypto_analyst, и т.д.
- ✅ **Виджеты заполнены** - "You might like", "Top Authors", и другие

---

## 🚀 Быстрый старт

### 1. Убедитесь что Supabase подключен

```bash
# Проверьте .env файл
cat .env | grep SUPABASE
```

Должно быть:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
```

### 2. Выполните миграции

Откройте Supabase Dashboard → SQL Editor и выполните SQL из `server/config/database.ts` (переменная `migrations`).

Или используйте MCP:
```typescript
// Если подключен Supabase MCP
await mcp__supabase__apply_migration({
  project_id: 'your_project_id',
  name: 'create_users_and_related_tables',
  query: migrations // из database.ts
});
```

### 3. Запустите seeding

```bash
# Установите зависимости если ещё не установили
pnpm install

# Запустите seed скрипт
pnpm seed
```

### 4. Проверьте результат

**В Supabase Dashboard:**
- Table Editor → users → должно быть 50 записей

**В приложении:**
- Откройте /profile/tyrian_trade
- Откройте /profile/crypto_analyst
- Проверьте виджет "You might like" - должны быть реальные пользователи

---

## 📊 Что создаётся

### Пользователи (50 штук)

```typescript
{
  username: "tyrian_trade", "crypto_analyst", "alexander_trader", ...
  email: "tyrian_trade@tradingplatform.io",
  first_name: "Alexander",
  last_name: "Ivanov",
  avatar_url: "https://i.pravatar.cc/150?img=1",
  bio: "Professional crypto trader with 5+ years of experience...",
  trading_style: "Day Trader",
  specialization: "Bitcoin",
  
  // Статистика (случайные значения)
  followers_count: 5000,
  following_count: 500,
  posts_count: 150,
  accuracy_rate: 85,
  win_rate: 75,
  total_trades: 1000,
  
  // Статусы
  verified: true,  // Первые 20 пользователей
  premium: true,   // Первые 10 пользователей
}
```

### Пароль для всех пользователей

```
Test123!@#
```

Можете войти как любой пользователь:
- Email: `{username}@tradingplatform.io`
- Password: `Test123!@#`

---

## 🔧 Использование в коде

### Загрузка пользователей для виджетов

```typescript
import { supabase } from '@/lib/supabase';

// Top Authors (топ 10 по подписчикам)
const { data: topAuthors } = await supabase
  .from('users')
  .select('id, username, first_name, last_name, avatar_url, followers_count, verified')
  .order('followers_count', { ascending: false })
  .limit(10);

// Suggested Profiles (случайные пользователи)
const { data: suggested } = await supabase
  .from('users')
  .select('id, username, first_name, last_name, avatar_url, bio, verified')
  .order('RANDOM()')
  .limit(5);

// Verified traders
const { data: verifiedTraders } = await supabase
  .from('users')
  .select('*')
  .eq('verified', true)
  .limit(20);
```

### Динамическая страница профиля

```typescript
// В ProfileDynamic.tsx
const { username } = useParams();

const { data: user } = await supabase
  .from('users')
  .select('*')
  .eq('username', username)
  .single();

if (!user) {
  return <NotFound />;
}
```

---

## 📝 Структура таблицы users

```sql
users
├── id                    UUID (primary key)
├── email                 VARCHAR(255) UNIQUE
├── username              VARCHAR(100) UNIQUE ⭐
├── password_hash         VARCHAR(255)
├── first_name            VARCHAR(100)
├── last_name             VARCHAR(100)
├── avatar_url            TEXT
├── bio                   TEXT
├── trading_style         VARCHAR(100)
├── specialization        VARCHAR(100)
├── email_verified        BOOLEAN
├── verified              BOOLEAN ⭐
├── premium               BOOLEAN ⭐
├── followers_count       INTEGER ⭐
├── following_count       INTEGER ⭐
├── posts_count           INTEGER ⭐
├── accuracy_rate         INTEGER ⭐
├── win_rate              INTEGER ⭐
├── total_trades          INTEGER ⭐
├── joined_date           TIMESTAMP
├── created_at            TIMESTAMP
└── updated_at            TIMESTAMP
```

⭐ = Используется в виджетах и профилях

---

## 🎨 Примеры пользователей

После seeding у вас будут:

**Топ трейдеры (verified):**
- tyrian_trade - Professional trader, высокие показатели
- crypto_analyst - Аналитик, много подписчиков
- alexander_ivanov - Day Trader
- maria_trader - Swing Trader
- ...ещё 16 верифицированных

**Premium пользователи (первые 10):**
- Имеют доступ к платным фичам
- Показываются в специальных виджетах

**Обычные пользователи (30 шт):**
- Разнообразные стили торговли
- Разные специализации
- Реалистичная статистика

---

## 🔄 Повторный seeding

Если хотите пересоздать данные:

```bash
# Удалите старых пользователей в Supabase Dashboard
DELETE FROM users;

# Запустите seed снова
pnpm seed
```

**Внимание:** Это удалит всех пользователей, включая созданных вручную!

---

## 🐛 Troubleshooting

### Ошибка: "duplicate key value violates unique constraint"

Пользователи уже существуют. Удалите их перед повторным seeding.

### Ошибка: "relation users does not exist"

Сначала выполните миграции (SQL из database.ts).

### Ошибка: "permission denied for table users"

Используйте SERVICE_KEY в .env, а не ANON_KEY.

### Не видно аватаров

Аватары загружаются с https://i.pravatar.cc - проверьте интернет соединение.

---

## 📈 Следующие шаги

После seeding пользователей вы можете:

1. **Создать посты** - Seed скрипт для постов (signals, analysis)
2. **Добавить подписки** - Связи между пользователями
3. **Генерировать активность** - Лайки, комментарии
4. **Тестировать фичи** - С реальными данными

---

## ✅ Checklist

- [ ] Supabase подключен
- [ ] Миграции выполнены
- [ ] .env настроен
- [ ] `pnpm seed` выполнен успешно
- [ ] 50 пользователей в БД
- [ ] Профили открываются (/profile/tyrian_trade)
- [ ] Виджеты показывают реальных пользователей

**Готово!** 🎉 Теперь у вас 50 тестовых пользователей для разработки.

---

## 🆘 Помощь

Если что-то не работает:
1. Проверьте логи в консоли при запуске seed
2. Проверьте Supabase Dashboard → Table Editor
3. Убедитесь что миграции выполнены
4. Проверьте .env переменные
