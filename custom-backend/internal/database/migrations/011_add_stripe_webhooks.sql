-- Migration 011: Add Stripe Webhooks Support
-- Description: Add stripe_webhook_events table and stripe_customer_id to users table
-- Created: 2025-10-30

-- Add stripe_customer_id to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);

-- Create stripe_webhook_events table for logging and idempotency
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    processing_error TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_id ON stripe_webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_type ON stripe_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed ON stripe_webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_created_at ON stripe_webhook_events(created_at);

-- Comments for documentation
COMMENT ON TABLE stripe_webhook_events IS 'Stores Stripe webhook events for processing and idempotency';
COMMENT ON COLUMN stripe_webhook_events.event_id IS 'Stripe event ID (evt_xxx) for idempotency';
COMMENT ON COLUMN stripe_webhook_events.event_type IS 'Stripe event type (e.g., payment_intent.succeeded)';
COMMENT ON COLUMN stripe_webhook_events.payload IS 'Full Stripe event payload as JSONB';
COMMENT ON COLUMN stripe_webhook_events.processed IS 'Whether the event has been processed';
COMMENT ON COLUMN stripe_webhook_events.processing_error IS 'Error message if processing failed';

COMMENT ON COLUMN users.stripe_customer_id IS 'Stripe customer ID (cus_xxx) for billing';
