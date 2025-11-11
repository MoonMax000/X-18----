-- Добавление полей для Stripe в таблицу users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_price DECIMAL(10, 2) DEFAULT 0;

-- Таблица для хранения покупок постов
CREATE TABLE IF NOT EXISTS post_purchases (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    amount_cents BIGINT NOT NULL,
    stripe_payment_intent_id VARCHAR(255),
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Уникальное ограничение
    CONSTRAINT unique_user_post_purchase UNIQUE(user_id, post_id)
);

-- Индексы для post_purchases
CREATE INDEX IF NOT EXISTS idx_post_purchases_user_id ON post_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_post_purchases_post_id ON post_purchases(post_id);
CREATE INDEX IF NOT EXISTS idx_post_purchases_stripe_id ON post_purchases(stripe_payment_intent_id);

-- Таблица для подписок (если еще не существует)
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    stripe_subscription_id VARCHAR(255),
    price_cents BIGINT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Уникальное ограничение
    CONSTRAINT unique_user_creator_subscription UNIQUE(user_id, creator_id)
);

-- Индексы для subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_creator_id ON subscriptions(creator_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- Таблица для истории платежей
CREATE TABLE IF NOT EXISTS payment_history (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount_cents BIGINT NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    type VARCHAR(50) NOT NULL, -- 'post_purchase', 'subscription', 'tip'
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'succeeded', 'failed', 'refunded'
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    failure_reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Индексы для payment_history
CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_recipient_id ON payment_history(recipient_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_post_id ON payment_history(post_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_type ON payment_history(type);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON payment_history(created_at DESC);

-- Функция для автообновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для subscriptions
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Комментарии к таблицам
COMMENT ON TABLE post_purchases IS 'Хранит информацию о покупках платных постов';
COMMENT ON TABLE subscriptions IS 'Хранит информацию о подписках пользователей на авторов';
COMMENT ON TABLE payment_history IS 'История всех платежей в системе';

COMMENT ON COLUMN post_purchases.amount_cents IS 'Сумма в центах для точности';
COMMENT ON COLUMN subscriptions.status IS 'active, canceled, past_due, paused';
COMMENT ON COLUMN payment_history.type IS 'Тип платежа: покупка поста, подписка, чаевые';
