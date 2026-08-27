# Architecture Guide

## Overview

CropLedger Enterprise follows **Clean Architecture (Hexagonal Pattern)** to ensure separation of concerns, testability, and maintainability. The architecture divides the application into distinct layers, each with specific responsibilities.

## Layer Structure

```
backend/src/
├── domain/              # Core business logic (framework-agnostic)
│   ├── entities/        # Business entities and value objects
│   ├── use-cases/       # Application use cases (interactors)
│   └── repositories/    # Repository interfaces (contracts)
├── application/         # Application orchestration
│   ├── services/        # Application services
│   ├── dto/             # Data transfer objects
│   └── mappers/         # Entity ↔ DTO mappers
├── infrastructure/      # External implementations
│   ├── database/        # Prisma ORM, PostgreSQL
│   ├── blockchain/      # Stellar SDK integration
│   ├── cache/           # Redis, BullMQ
│   └── ai/              # AI/ML services (forecasting)
└── presentation/        # API and UI layer
    ├── controllers/     # Fastify route handlers
    ├── routes/          # Route definitions
    ├── middleware/      # Auth, validation, logging
    └── websockets/      # Real-time event handlers
```

## Domain Layer

The **domain layer** contains pure business logic with no dependencies on external frameworks.

### Entities
- `Contract`: Smart contract representation for escrow payments
- `User`: User entity with roles and permissions
- `Organization`: Multi-tenant organization structure
- `DemandForecast`: AI-powered demand forecasting data
- `ComplianceReport`: Regulatory compliance tracking

### Use Cases
Use cases encapsulate application business rules:
- `CreateContractUseCase`: Handles contract creation with Stellar escrow
- `ExecuteContractUseCase`: Processes contract execution and payments
- `GenerateDemandForecastUseCase`: AI-powered demand prediction
- `GenerateComplianceReportUseCase`: Regulatory report generation

### Repository Interfaces
Define contracts for data access without implementation details:
- `IContractRepository`: Contract CRUD operations
- `IUserRepository`: User management operations
- `IOrganizationRepository`: Organization operations

## Application Layer

The **application layer** orchestrates domain use cases and handles cross-cutting concerns.

### Services
- `AuthService`: Authentication and authorization
- `StellarService`: Stellar blockchain operations
- `CacheService`: Redis caching wrapper
- `EventBus`: Domain event publishing

### DTOs
Data Transfer Objects for API communication:
- `CreateContractDto`: Contract creation request
- `ContractResponseDto`: Contract response format
- `ForecastRequestDto`: Forecast generation request

## Infrastructure Layer

The **infrastructure layer** implements interfaces defined in the domain layer.

### Database (Prisma + PostgreSQL)
```prisma
model Contract {
  id          String   @id @default(cuid())
  stellarTxId String   @unique
  amount      Decimal
  status      ContractStatus
  // ...
}
```

### Blockchain (Stellar SDK)
- Claimable Balance creation for escrow
- Payment execution with multi-signature support
- Network switching (Testnet/Mainnet)

### Cache (Redis + BullMQ)
- Session storage
- Job queue for async operations
- Rate limiting

### AI Services
- `DemandForecastService`: Simulated ML forecasting
- Integration ready for external AI providers

## Presentation Layer

The **presentation layer** handles HTTP/WebSocket communication.

### Controllers
- `ContractController`: Contract CRUD endpoints
- `AuthController`: Authentication endpoints
- `ForecastController`: AI forecasting endpoints
- `ComplianceController`: Compliance reporting endpoints

### Middleware
- `AuthMiddleware`: JWT validation
- `ValidationMiddleware`: Zod schema validation
- `ErrorMiddleware`: Centralized error handling
- `LoggingMiddleware`: Request/response logging

### Routes
RESTful API structure:
```
/api/v1/contracts      - Contract management
/api/v1/auth           - Authentication
/api/v1/forecast       - AI forecasting
/api/v1/compliance     - Compliance reporting
```

## Frontend Architecture

### Nuxt.js 3 Structure
```
frontend/
├── composables/       # Vue composables (useAuth, useContracts)
├── components/        # Vue components (Element Plus)
├── pages/             # File-based routing
├── layouts/           # Layout templates
├── stores/            # Pinia state management
├── middleware/        # Route middleware
├── locales/           # i18n translations (en, es)
└── utils/             # Utility functions
```

### Key Patterns
- **Composables**: Reusable logic (authentication, API calls)
- **Element Plus**: UI component library
- **i18n**: Multi-language support (English, Spanish)
- **Pinia**: State management

## Data Flow

### Request Flow
1. HTTP request → Fastify router
2. Middleware (auth, validation)
3. Controller → Use Case
4. Use Case → Domain Entity
5. Repository → Database/Stellar
6. Response → DTO → JSON

### Event Flow
1. Domain event published
2. EventBus receives event
3. Subscribers process event
4. Side effects (cache invalidation, notifications)

## Security Architecture

### Authentication
- JWT tokens with refresh token rotation
- Multi-factor authentication support
- Session management with Redis

### Authorization
- Role-based access control (RBAC)
- Organization-level permissions
- Resource-level ownership checks

### Blockchain Security
- Stellar network segregation (Testnet/Mainnet)
- Multi-signature wallet support
- Claimable Balance escrow mechanism

## Scalability Considerations

### Horizontal Scaling
- Stateless Fastify instances
- Redis shared cache
- PostgreSQL connection pooling
- Load balancer ready

### Vertical Scaling
- BullMQ job processing
- Database indexing strategy
- Caching layers (Redis, CDN)

## Deployment Architecture

### Development
- Docker Compose for local development
- Hot reloading for both backend and frontend
- Mock Stellar network (Testnet)

### Production
- Containerized deployment (Docker/Kubernetes)
- PostgreSQL with read replicas
- Redis Cluster
- Stellar Mainnet integration
- CI/CD pipeline

## Monitoring & Observability

- Structured logging (JSON format)
- Health check endpoints
- Metrics collection (Prometheus ready)
- Error tracking (Sentry integration ready)
