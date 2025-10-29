# 🚀 Production развертывание завершено

## ✅ Выполненные шаги

### 1. Frontend развернут на Netlify
- **URL**: https://social.tyriantrade.com
- **Статус**: Работает (HTTP 200)
- **API URL**: Правильно настроен на https://api.tyriantrade.com

### 2. Backend на Railway
- **URL**: https://api.tyriantrade.com
- **Railway URL**: https://x-18-production-38ec.up.railway.app
- **Статус**: Работает

## ⚠️ ВАЖНО: Требуется применить миграции базы данных

### Необходимые миграции:
- **007_add_widgets_and_admin.sql** - Добавляет систему виджетов и админ-панель
- **008_add_extended_user_fields.sql** - Расширенные поля безопасности пользователей

## 📝 Инструкция по применению миграций

### Шаг 1: Добавьте DATABASE_URL в Railway

1. Откройте Railway Dashboard: https://railway.app/dashboard
2. Выберите ваш проект
3. Нажмите на сервис **X-18----** (custom-backend)
4. Перейдите в **Variables**
5. Добавьте новую переменную:
   - **Имя**: `DATABASE_URL`
   - **Значение**: Скопируйте из сервиса PostgreSQL
     - Нажмите на PostgreSQL сервис
     - Перейдите в Variables
     - Скопируйте значение DATABASE_URL (начинается с `postgresql://`)
6. Сохраните изменения

### Шаг 2: Подключитесь к базе данных

```bash
# Установите Railway CLI если еще не установлен
brew install railway

# Войдите в Railway
railway login

# Подключитесь к проекту
railway link

# Подключитесь к базе данных
railway connect postgres
```

### Шаг 3: Примените миграции

После подключения к базе данных выполните:

```sql
-- Миграция 007: Система виджетов и админ-панель
CREATE TABLE IF NOT EXISTS widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content JSONB,
    position VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    visibility_rules JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_widgets_type ON widgets(type);
CREATE INDEX idx_widgets_position ON widgets(position);
CREATE INDEX idx_widgets_active ON widgets(is_active);

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_level INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_permissions JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_admin_action TIMESTAMPTZ;

CREATE INDEX idx_users_admin ON users(is_admin);
CREATE INDEX idx_users_admin_level ON users(admin_level);

-- Миграция 008: Расширенные поля безопасности
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_codes TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS security_questions JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_history JSONB DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ip_whitelist INET[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS ip_blacklist INET[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS session_timeout_minutes INTEGER DEFAULT 60;
ALTER TABLE users ADD COLUMN IF NOT EXISTS require_password_change BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS security_alerts_enabled BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trusted_devices JSONB DEFAULT '[]';

CREATE INDEX idx_users_2fa ON users(two_factor_enabled);
CREATE INDEX idx_users_locked ON users(account_locked_until);
CREATE INDEX idx_users_security_alerts ON users(security_alerts_enabled);
```

### Шаг 4: Создайте администратора

```sql
-- Сделайте вашего пользователя администратором
UPDATE users 
SET is_admin = true, 
    admin_level = 10,
    admin_permissions = '{"all": true}'::jsonb
WHERE email = 'ваш_email@example.com';
```

### Шаг 5: Проверьте работу

1. Откройте https://social.tyriantrade.com
2. Войдите в систему
3. Проверьте доступ к админ-панели: https://social.tyriantrade.com/admin

## 🔧 Устранение проблем

### Если не можете подключиться к базе данных:
1. Убедитесь, что Railway CLI установлен: `railway --version`
2. Проверьте, что вы залогинены: `railway whoami`
3. Проверьте связь с проектом: `railway status`

### Если миграции не применяются:
1. Проверьте права доступа в базе данных
2. Убедитесь, что используете правильный DATABASE_URL
3. Попробуйте применить миграции через Railway UI в разделе Query

## 📊 Статус системы

| Компонент | Статус | URL |
|-----------|--------|-----|
| Frontend | ✅ Работает | https://social.tyriantrade.com |
| Backend API | ✅ Работает | https://api.tyriantrade.com |
| База данных | ⚠️ Требует миграций | Railway PostgreSQL |
| Медиа хранилище | ✅ Настроено | Railway Volumes |

## 🎯 Следующие шаги после миграций

1. Создайте администратора (см. Шаг 4)
2. Настройте виджеты через админ-панель
3. Проверьте все функции:
   - Регистрация новых пользователей
   - Вход в систему
   - Создание постов
   - Загрузка медиа файлов
   - Уведомления
   - Админ-панель

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи в Railway Dashboard
2. Проверьте консоль браузера на https://social.tyriantrade.com
3. Убедитесь, что все переменные окружения настроены правильно
