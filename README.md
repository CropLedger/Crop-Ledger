# CropLedger Enterprise

**Enterprise agricultural supply chain management on the Stellar blockchain.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-blue)](https://stellar.org)
[![CI](https://github.com/your-org/CropLedger/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/CropLedger/actions)

---

## What it does

CropLedger connects farmers, buyers, and cooperatives on a shared supply chain
ledger with on-chain escrow payments and an end-to-end traceability trail for
every agricultural batch.

| Feature | Status |
|---------|--------|
| Contract creation with Stellar Claimable Balance escrow | ✅ Working |
| Agricultural batch lifecycle (CREATED → DELIVERED) | ✅ Working |
| Traceability event log (harvest, transit, inspection, delivery) | ✅ Working |
| JWT-authenticated REST API (Fastify) | ✅ Working |
| Dashboard, contracts, batches, analytics pages (Nuxt 3) | ✅ Working |
| Soroban escrow smart contract (Rust) | ✅ Scaffolded — needs Rust toolchain to build |
| Freighter wallet composable | ✅ Implemented — not yet wired to UI |
| AI demand forecasting | ⚠️ Hardcoded lookup tables — real ML not implemented |

---

## Technology stack

- **Backend**: Fastify 5 (Node.js 20), Clean Architecture, Zod validation
- **Frontend**: Nuxt.js 3, Element Plus, TypeScript
- **Database**: Supabase (PostgreSQL-as-a-service)
- **Blockchain**: Stellar SDK — Horizon API, Claimable Balances
- **Smart contracts**: Soroban (`contracts/escrow/`) — Rust + `soroban-sdk`
- **Wallet**: Freighter browser extension
- **Testing**: Vitest
- **CI**: GitHub Actions

---

## Quick start

### Prerequisites

- Node.js 20+
- A free [Supabase](https://supabase.com) project
- A funded Stellar Testnet keypair from [Stellar Laboratory](https://laboratory.stellar.org/#account-creator)

### 1 — Database

Run `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor.

### 2 — Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_KEY, JWT_SECRET, STELLAR_SECRET_KEY
npm run dev
# → http://localhost:4000  (API)
# → http://localhost:4000/docs  (Swagger UI)
```

### 3 — Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

Full setup instructions: [docs/setup.md](docs/setup.md)

---

## Repository structure

```
CropLedger/
├── backend/          Fastify API (TypeScript)
├── contracts/        Soroban smart contracts (Rust)
│   └── escrow/       On-chain escrow contract
├── frontend/         Nuxt.js 3 app (TypeScript/Vue)
├── supabase/
│   └── migrations/   Database schema SQL
├── docs/
│   ├── architecture.md
│   ├── setup.md
│   └── api.md
├── .github/
│   └── workflows/ci.yml
├── AUDIT.md          Technical audit findings (2026-11-11)
├── CONTRIBUTING.md
├── SECURITY.md
└── CODE_OF_CONDUCT.md
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). We use Conventional Commits and
require all CI checks to pass before merging.

---

## License

[MIT](LICENSE) © CropLedger Contributors
