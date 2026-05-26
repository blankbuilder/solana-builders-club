CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE perk_status AS ENUM (
  'submitted',
  'approved',
  'rejected',
  'paused',
  'archived'
);

CREATE TYPE perk_redemption_kind AS ENUM (
  'external',
  'intro',
  'none'
);

CREATE TYPE perk_event_type AS ENUM (
  'submitted',
  'edited',
  'approved',
  'rejected',
  'paused',
  'archived',
  'featured',
  'unfeatured'
);

CREATE TABLE perks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name TEXT NOT NULL,
  partner_contact_name TEXT NOT NULL,
  partner_contact_email TEXT NOT NULL,
  partner_website_url TEXT,
  logo_url TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  benefit TEXT NOT NULL,
  category TEXT NOT NULL,
  public_terms TEXT NOT NULL DEFAULT '',
  redemption_kind perk_redemption_kind NOT NULL DEFAULT 'none',
  redemption_instructions TEXT,
  private_redemption_url TEXT,
  private_redemption_code TEXT,
  max_redemptions INTEGER CHECK (max_redemptions IS NULL OR max_redemptions > 0),
  expires_at TIMESTAMPTZ,
  status perk_status NOT NULL DEFAULT 'submitted',
  featured BOOLEAN NOT NULL DEFAULT false,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by_telegram_id TEXT,
  updated_by_telegram_id TEXT
);

CREATE INDEX perks_status_created_at_idx ON perks (status, created_at);
CREATE INDEX perks_featured_idx ON perks (featured);
CREATE INDEX perks_expires_at_idx ON perks (expires_at);
CREATE INDEX perks_partner_contact_email_idx ON perks (partner_contact_email);

CREATE TABLE perk_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  perk_id UUID NOT NULL REFERENCES perks(id) ON DELETE CASCADE,
  event_type perk_event_type NOT NULL,
  actor_telegram_id TEXT,
  actor_name TEXT,
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX perk_events_perk_id_created_at_idx ON perk_events (perk_id, created_at);
CREATE INDEX perk_events_event_type_idx ON perk_events (event_type);
