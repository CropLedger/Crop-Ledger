# CropLedger Enterprise

<p align="center">
  <b>Enterprise-Grade Agricultural Supply Chain Management on Stellar Blockchain</b>
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://stellar.org"><img src="https://img.shields.io/badge/Stellar-XLM-blue" alt="Stellar"></a>
  <a href="https://fastify.io"><img src="https://img.shields.io/badge/Fastify-Node-green" alt="Fastify"></a>
  <a href="https://nuxt.com"><img src="https://img.shields.io/badge/Nuxt-3-green" alt="Nuxt 3"></a>
</p>

---

## 🎯 Vision

CropLedger Enterprise transforms agricultural supply chain management through blockchain technology, providing enterprises with:

- **Smart Contract Escrow**: Automated, trustless payments via Stellar Claimable Balances
- **Real-Time Analytics**: Advanced dashboard with predictive crop yield analytics
- **Multi-Tenant Architecture**: Enterprise-grade multi-organization support
- **AI-Powered Insights**: Machine learning models for demand forecasting
- **Compliance Ready**: Built-in audit trails and regulatory reporting

---

## 🏗️ Architecture

### Technology Stack
- **Backend**: Fastify (Node.js) with Clean Architecture (Hexagonal Pattern)
- **Frontend**: Nuxt.js 3 with Element Plus UI
- **Database**: PostgreSQL with Prisma ORM
- **Blockchain**: Stellar Network (Smart contracts, Escrow, Payments)
- **Caching**: Redis with BullMQ for job queues
- **Testing**: Vitest + Playwright

### Clean Architecture Layers
```
├── domain/           # Business logic (entities, use cases, repositories interfaces)
├── application/      # Application services (orchestration, DTOs)
├── infrastructure/   # External implementations (database, Stellar, Redis)
└── presentation/     # API controllers, WebSocket handlers
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ & npm
- PostgreSQL 16+
- Redis 7+

### Installation
```bash
# Clone repository
git clone https://github.com/your-org/CropLedger.git
cd CropLedger

# Backend setup
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:3000`

---

## 📚 Documentation

- [Architecture Guide](docs/architecture.md)
- [API Documentation](docs/api.md)
- [Developer Setup](docs/setup.md)
- [Contributing](CONTRIBUTING.md)

---

## 🤝 Contributing

We follow a structured contribution process. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

---

<p align="center"><b>Built for enterprise agriculture 🌾</b></p>
