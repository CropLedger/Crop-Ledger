# Developer Setup Guide

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20 LTS | Backend + frontend |
| npm | 10+ | Package management |
| Rust | stable | Soroban smart contracts |
| Stellar CLI | 21+ | Contract deploy |
| Git | any | Source control |

**You do NOT need PostgreSQL, Redis, or Docker to run locally.**
The database is Supabase (hosted). Create a free project at
<https://supabase.com> to get your `SUPABASE_URL` and `SUPABASE_KEY`.

---

## 1 — Clone and configure

```bash
git clone https://github.com/your-org/CropLedger.git
cd CropLedger
```

### Backend environment

```bash
cd backend
cp .env.example .env
```

Fill in `.env`:

```env
PORT=4000
NODE_ENV=development

# From your Supabase project: Settings → API
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Generate: openssl rand -hex 64
JWT_SECRET=<64-char-hex-string>

# From https://laboratory.stellar.org/#account-creator (Testnet)
STELLAR_NETWORK=TESTNET
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_SECRET_KEY=S...
```

### Frontend environment

```bash
cd frontend
# No .env.example needed; apiBase defaults to localhost:4000 in nuxt.config.ts
# Override only if deploying:
# NUXT_PUBLIC_API_BASE_URL=https://your-api.onrender.com
```

---

## 2 — Set up the database

Run the migration SQL **once** in your Supabase SQL editor
(Dashboard → SQL Editor → New query):

```bash
cat supabase/migrations/001_initial_schema.sql
# Copy the output and paste into the Supabase SQL editor, then Run
```

Or if you have the Supabase CLI installed:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

---

## 3 — Start the backend

```bash
cd backend
npm install
npm run dev
# → http://localhost:4000
# → http://localhost:4000/docs  (Swagger UI)
```

---

## 4 — Start the frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## 5 — Run backend tests

```bash
cd backend
npm test
```

The test suite uses Vitest with mocked repositories — no live database
connection is needed to run tests.

---

## 6 — Build & deploy the Soroban escrow contract (optional)

```bash
# Install Rust wasm target
rustup target add wasm32-unknown-unknown

# Build
cd contracts
cargo build --target wasm32-unknown-unknown --release

# Install Stellar CLI (if needed)
cargo install stellar-cli --features opt

# Deploy to Testnet
stellar contract deploy \
  --wasm escrow/target/wasm32-unknown-unknown/release/cropledger_escrow.wasm \
  --source "$STELLAR_SECRET_KEY" \
  --network testnet
```

The deployed contract ID should be stored as an environment variable
(`SOROBAN_ESCROW_CONTRACT_ID`) and passed to the backend at startup.

---

## 7 — Install the Freighter wallet (browser)

1. Install [Freighter](https://www.freighter.app/) from the Chrome Web Store.
2. Create or import a Testnet keypair.
3. Enable Testnet in Freighter: Settings → Network → Testnet.
4. The `useFreighter()` composable will detect the extension automatically.

---

## Ports summary

| Service | Port |
|---------|------|
| Backend API | 4000 |
| Swagger UI | 4000/docs |
| Frontend | 3000 |
| Supabase | hosted |
| Stellar Testnet | hosted (horizon-testnet.stellar.org) |

---

## Common issues

### `JWT_SECRET environment variable is required`
The server now refuses to start without a JWT secret. Set it in `.env`:
```bash
echo "JWT_SECRET=$(openssl rand -hex 64)" >> backend/.env
```

### Supabase `relation "agricultural_batches" does not exist`
You need to run the migration SQL. See step 2 above.

### `STELLAR_SECRET_KEY is required to create an escrow`
The Stellar service no longer uses fake IDs. Fund a Testnet keypair at
<https://laboratory.stellar.org/#account-creator> and add its secret to `.env`.

### Freighter `window.freighterApi` is undefined
The browser extension is not installed or is locked. Install it from
<https://www.freighter.app/> and unlock it before connecting.
