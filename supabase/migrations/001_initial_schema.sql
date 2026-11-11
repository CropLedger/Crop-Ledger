-- CropLedger initial schema
-- Run via: supabase db push  OR  copy-paste into the Supabase SQL editor

-- ─────────────────────────────────────────
-- Organizations
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────
-- Accounts
-- ─────────────────────────────────────────
CREATE TYPE account_type AS ENUM ('ENTERPRISE', 'COOPERATIVE', 'INSPECTOR', 'ADMIN');

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  type account_type NOT NULL DEFAULT 'ENTERPRISE',
  stellar_public_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────
-- Contracts
-- ─────────────────────────────────────────
CREATE TYPE transaction_status AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED', 'DISPUTED');
CREATE TYPE escrow_state AS ENUM ('LOCKED', 'RELEASED', 'REFUNDED');

CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  contract_number TEXT NOT NULL UNIQUE,
  buyer_id UUID NOT NULL REFERENCES accounts(id),
  seller_id UUID NOT NULL REFERENCES accounts(id),
  crop_type TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  escrow_tx_id TEXT,
  escrow_state escrow_state NOT NULL DEFAULT 'LOCKED',
  status transaction_status NOT NULL DEFAULT 'PENDING',
  delivery_date DATE NOT NULL,
  delivery_location TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────
-- Agricultural Batches
-- ─────────────────────────────────────────
CREATE TYPE batch_status AS ENUM ('CREATED', 'IN_TRANSIT', 'INSPECTED', 'DELIVERED', 'REJECTED');

CREATE TABLE IF NOT EXISTS agricultural_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number TEXT NOT NULL UNIQUE,
  contract_id UUID REFERENCES contracts(id),
  farmer_id UUID NOT NULL REFERENCES accounts(id),
  crop_type TEXT NOT NULL,
  variety_name TEXT,
  quantity_kg NUMERIC NOT NULL,
  quality_grade TEXT,
  harvest_date DATE NOT NULL,
  origin_location TEXT NOT NULL,
  destination_location TEXT,
  status batch_status NOT NULL DEFAULT 'CREATED',
  stellar_tx_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────
-- Traceability Events
-- ─────────────────────────────────────────
CREATE TYPE event_type AS ENUM (
  'HARVEST', 'QUALITY_CHECK', 'STORAGE',
  'TRANSPORT_START', 'TRANSPORT_END',
  'CUSTOMS', 'DELIVERY', 'REJECTION'
);

CREATE TABLE IF NOT EXISTS traceability_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES agricultural_batches(id) ON DELETE CASCADE,
  event_type event_type NOT NULL,
  actor_id UUID NOT NULL REFERENCES accounts(id),
  location TEXT,
  temperature NUMERIC,
  humidity NUMERIC,
  notes TEXT,
  stellar_tx_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_contracts_buyer ON contracts(buyer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_seller ON contracts(seller_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_batches_farmer ON agricultural_batches(farmer_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON agricultural_batches(status);
CREATE INDEX IF NOT EXISTS idx_events_batch ON traceability_events(batch_id);
