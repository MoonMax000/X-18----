# 🚀 Быстрый старт системы авторизации

## 1️⃣ Установка (5 минут)

```bash
# Установите новые зависимости
pnpm add @supabase/supabase-js bcrypt jsonwebtoken
pnpm add -D @types/bcrypt @types/jsonwebtoken
```

## 2️⃣ База данных (10 минут)

### Вариант A: Supabase (Рекомендуется)

1. [Подключите Supabase](#open-mcp-popover)
2. Откройте SQL Editor в Supabase Dashboard
3. Скопируйте SQL из `server/config/database.ts` (строка с `migrations`)
4. Выполните SQL

### Вариант B: Neon

1. [Подключите Neon](#open-mcp-popover)
2. Выполните те же SQL миграции

## 3️⃣ Настройка (5 минут)

```bash
# Создайте .env файл
cp .env.example .env
```

Заполните обязательные переменные:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=generate_random_64_char_string
JWT_REFRESH_SECRET=generate_another_random_64_char_string
```

Сгенерировать секреты:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 4️⃣ Интеграция (10 минут)

### Обновите App.tsx

```tsx
import { AuthProvider } from '@/contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Ваш существующий код */}
    </AuthProvider>
  );
}
```

### Обновите LoginModal

```tsx
import { useAuthIntegration } from '@/hooks/useAuthIntegration';

const LoginModal = ({ isOpen, onClose }) => {
  const { handleLogin, error } = useAuthIntegration();

  const onSubmit = async () => {
    const result = await handleLogin(email, password);
    if (result.success && !result.requires2FA) {
      onClose(); // Готово!
    }
  };
};
```

## 5️⃣ Запуск (1 минута)

```bash
# Запустите сервер
pnpm dev
```

## ✅ Готово!

Откройте приложение → Нажмите на ава��ар → Login → Создайте аккаунт

**Что дальше?**
- 📖 Читайте [SETUP_AUTH.md](./SETUP_AUTH.md) для деталей
- 🔧 Смотрите [INTEGRATION_STEPS.md](./INTEGRATION_STEPS.md) для интеграции
- 🏗️ Изучите [AUTH_ARCHITECTURE.md](./AUTH_ARCHITECTURE.md) для архитектуры

**Нужна помощь?**
- Все коды верификации выводятся в консоль (в dev режиме)
- Проверьте логи сервера на ошибки
- Убедитесь, что база данных создана

**Важно в production:**
- Измените JWT секреты на безопасные случайные строки
- Настройте отправку email/SMS для кодов верификации
- Включите HTTPS
- Настройте правильный CORS
