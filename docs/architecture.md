# Architecture Guide

## Overview

CropLedger Enterprise uses **Clean Architecture (Hexagonal Pattern)** to keep
business logic independent of frameworks and external services.

> **Note on what is NOT yet implemented**
>
> The `application/` layer (services, DTOs, mappers) described in older docs
> does not exist yet — domain use cases call repositories directly.
> Redis, BullMQ, and PostgreSQL are not used.
> The database layer is **Supabase** (hosted PostgreSQL + REST client).

---

## Actual technology stack

| Concern | Technology |
|---------|-----------|
| Backend framework | Fastify 5 (Node.js) |
| Frontend | Nuxt.js 3 + Element Plus |
| Database | Supabase (PostgreSQL-as-a-service) |
| Blockchain | Stellar SDK — Horizon REST API (Testnet) |
| Smart contracts | Soroban (Rust) — `contracts/escrow/` |
| Wallet | Freighter browser extension |
| Auth | @fastify/jwt (HS256) |
| Validation | Zod |
| Testing | Vitest |
| CI | GitHub Actions |

---

## Backend source tree

```
backend/src/
├── domain/
│   ├── entities/
│   │   ├── account.entity.ts
│   │   ├── agricultural-batch.entity.ts   ← batch + BatchStatus
│   │   ├── contract.entity.ts             ← TransactionStatus, EscrowState
│   │   ├── traceability-event.entity.ts   ← EventType (8 values)
│   │   ├── forecast.entity.ts
│   │   └── organization.entity.ts
│   ├── repositories/                      ← interfaces only
│   │   ├── account.repository.interface.ts
│   │   ├── agricultural-batch.repository.interface.ts
│   │   ├── contract.repository.interface.ts
│   │   ├── organization.repository.interface.ts
│   │   └── traceability-event.repository.interface.ts
│   └── use-cases/
│       ├── account/create-account.use-case.ts
│       ├── batch/
│       │   ├── create-batch.use-case.ts
│       │   └── record-event.use-case.ts   ← auto-advances BatchStatus
│       ├── contract/create-contract.use-case.ts
│       └── forecast/generate-demand-forecast.use-case.ts
├── infrastructure/
│   ├── blockchain/
│   │   └── stellar.service.ts             ← real Horizon calls, Claimable Balances
│   ├── database/
│   │   ├── supabase-client.ts             ← single Supabase client
│   │   └── repositories/
│   │       ├── account.repository.ts
│   │       ├── agricultural-batch.repository.ts
│   │       ├── contract.repository.ts
│   │       └── traceability-event.repository.ts
│   ├── security/
│   │   └── bcrypt-hasher.ts
│   └── ai/
│       └── demand-forecast.service.ts     ← NOTE: uses hardcoded tables, not real ML
├── presentation/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── account.controller.ts
│   │   ├── batch.controller.ts
│   │   ├── contract.controller.ts
│   │   └── forecast.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts             ← JWT verification (enabled)
│   │   └── error-handler.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── analytics.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── batch.routes.ts
│   │   ├── contract.routes.ts
│   │   ├── account.routes.ts
│   │   ├── forecast.routes.ts
│   │   └── health.routes.ts
│   └── websockets/index.ts
└── index.ts                               ← Fastify bootstrap, port 4000
```

---

## API surface

All routes except `/health` and `/api/v1/auth/*` require
`Authorization: Bearer <JWT>`.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Create account |
| POST | `/api/v1/auth/login` | Login → JWT |
| POST | `/api/v1/auth/refresh` | Refresh JWT |
| POST | `/api/v1/auth/logout` | Logout (stateless) |
| GET  | `/api/v1/contracts` | List contracts |
| POST | `/api/v1/contracts` | Create contract + Stellar escrow |
| GET  | `/api/v1/contracts/:id` | Get contract |
| PATCH| `/api/v1/contracts/:id` | Update status/escrow |
| DELETE| `/api/v1/contracts/:id` | Delete contract |
| GET  | `/api/v1/batches` | List agricultural batches |
| POST | `/api/v1/batches` | Create batch |
| GET  | `/api/v1/batches/:id` | Get batch |
| GET  | `/api/v1/batches/:id/events` | Get traceability timeline |
| POST | `/api/v1/batches/:id/events` | Record traceability event |
| GET  | `/api/v1/analytics/stats` | Dashboard stats |
| GET  | `/api/v1/forecast` | AI demand forecast |
| GET  | `/api/v1/accounts` | List accounts |
| GET  | `/health` | Health check |
| GET  | `/docs` | Swagger UI |

---

## Database (Supabase)

Schema is defined in `supabase/migrations/001_initial_schema.sql`.
Run it via the Supabase SQL editor or `supabase db push`.

Tables: `organizations`, `accounts`, `contracts`,
`agricultural_batches`, `traceability_events`

**There is no Prisma.** The `backend/prisma/schema.prisma` file is
a leftover design artefact and is not used.

---

## Stellar integration

### Claimable Balance escrow (implemented in `stellar.service.ts`)

1. `createEscrow()` — creates a Claimable Balance with two claimants:
   the seller (unconditional) and the buyer (unconditional fallback).
   Requires `STELLAR_SECRET_KEY` in `.env`.
2. `releaseEscrow()` — seller claims the balance after delivery.
3. `refundEscrow()` — buyer reclaims before the deadline.
4. `createPayment()` — direct XLM or asset payment.

### Soroban escrow contract (`contracts/escrow/`)

A fully on-chain alternative with a typed state machine:
`PENDING → FUNDED → RELEASED | REFUNDED`.

Build:
```bash
rustup target add wasm32-unknown-unknown
cd contracts
cargo build --target wasm32-unknown-unknown --release
```

Deploy to Testnet:
```bash
stellar contract deploy \
  --wasm contracts/escrow/target/wasm32-unknown-unknown/release/cropledger_escrow.wasm \
  --source <YOUR_SECRET_KEY> \
  --network testnet
```

---

## Frontend source tree

```
frontend/
├── composables/
│   ├── useAuth.ts
│   ├── useBatches.ts        ← CRUD + event recording
│   ├── useContracts.ts
│   ├── useAnalytics.ts
│   ├── useFreighter.ts      ← Freighter wallet integration
│   └── useVaults.ts
├── pages/
│   ├── index.vue            ← landing + login/signup
│   ├── dashboard/index.vue  ← overview
│   ├── contracts/index.vue  ← contracts table + create dialog
│   ├── batches/index.vue    ← batches + event timeline drawer
│   └── analytics/index.vue ← live stats
├── assets/css/main.css
├── locales/en.json
└── nuxt.config.ts           ← apiBase defaults to localhost:4000
```

**Pinia stores are listed as a dependency but not yet implemented.**
State is managed in component `ref()` calls via composables.

---

## Known limitations (open work)

| Item | Status |
|------|--------|
| Soroban contract compiled & deployed to Testnet | Scaffolded — needs Rust toolchain to build |
| Freighter wallet integration wired to UI | Composable ready — not yet mounted in any page |
| Pinia stores | Not implemented |
| Demand forecasting AI | Hardcoded lookup tables, not real ML |
| Redis / BullMQ | Listed as dependencies, not used |
| Vaults page | Composable exists (`useVaults.ts`), page missing |
| Row-Level Security on Supabase | Not configured |
| Multi-tenant org isolation | Org ID present in schema, not enforced in queries |
