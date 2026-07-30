-- Run this in Neon SQL editor

ALTER TABLE integrations
  ADD COLUMN IF NOT EXISTS api_key_encrypted TEXT,
  ADD COLUMN IF NOT EXISTS config_json JSONB DEFAULT '{}';

-- Ensure unique constraint for ON CONFLICT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'integrations_user_type_unique'
  ) THEN
    ALTER TABLE integrations ADD CONSTRAINT integrations_user_type_unique UNIQUE (user_id, type);
  END IF;
END $$;

-- Create integrations table if it doesn't exist at all
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  api_key_encrypted TEXT,
  config_json JSONB DEFAULT '{}',
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, type)
);
