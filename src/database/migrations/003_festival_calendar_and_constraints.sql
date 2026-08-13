-- Calendar-based festivals + city_id NOT NULL hardening
-- Run in Supabase SQL Editor after schema.sql

-- Festival calendar fields
ALTER TABLE festival_overlays
  ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS city_id VARCHAR(50) REFERENCES cities(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Keep legacy `active` in sync for older rows
UPDATE festival_overlays SET enabled = COALESCE(enabled, active, false);

-- Harden city_id NOT NULL on city-owned tables
ALTER TABLE city_greetings ALTER COLUMN city_id SET NOT NULL;
ALTER TABLE city_salary_messages ALTER COLUMN city_id SET NOT NULL;
ALTER TABLE local_spotlights ALTER COLUMN city_id SET NOT NULL;
ALTER TABLE ui_labels ALTER COLUMN city_id SET NOT NULL;
ALTER TABLE city_categories ALTER COLUMN city_id SET NOT NULL;
ALTER TABLE trending_tags ALTER COLUMN city_id SET NOT NULL;
ALTER TABLE restaurants ALTER COLUMN city_id SET NOT NULL;
ALTER TABLE festival_greetings ALTER COLUMN city_id SET NOT NULL;

-- Optional helper index for festival resolution
CREATE INDEX IF NOT EXISTS idx_festival_overlays_calendar
  ON festival_overlays (enabled, start_date, end_date, priority DESC);
