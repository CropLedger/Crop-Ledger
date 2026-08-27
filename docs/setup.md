# Developer Setup Guide

## Prerequisites

Ensure you have the following installed:

- **Node.js** 20+ (LTS recommended)
- **npm** 10+ or **pnpm** 8+
- **PostgreSQL** 16+
- **Redis** 7+
- **Git**

### Verify installations

```bash
node --version  # Should be v20.x.x
npm --version   # Should be 10.x.x
psql --version  # Should be 16.x
redis-cli --version  # Should be 7.x
```

---

## Repository Setup

### Clone the repository

```bash
git clone https://github.com/your-org/CropLedger.git
cd CropLedger
```

### Install development tools (optional)

```bash
# Install Husky for git hooks
npm install -g husky

# Install commitlint for conventional commits
npm install -g @commitlint/cli @commitlint/config-conventional
```

---

## Backend Setup

### Navigate to backend directory

```bash
cd backend
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/croppedger?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Stellar
STELLAR_NETWORK=testnet
STELLAR_SECRET_KEY=your_secret_key
STELLAR_PUBLIC_KEY=your_public_key

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Set up PostgreSQL database

```bash
# Create database
createdb croppedger

# Or using psql
psql -U postgres
CREATE DATABASE croppedger;
\q
```

### Run Prisma migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database
npx prisma db seed
```

### Start Redis server

```bash
# On Windows (using WSL or Docker)
redis-server

# On macOS
brew services start redis

# On Linux
sudo systemctl start redis
```

### Start development server

```bash
npm run dev
```

Backend will be available at `http://localhost:3001`

### Run tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test with coverage
npm run test:coverage
```

---

## Frontend Setup

### Navigate to frontend directory (new terminal)

```bash
cd frontend
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# API
NUXT_PUBLIC_API_BASE_URL=http://localhost:3001/api/v1

# Stellar
NUXT_PUBLIC_STELLAR_NETWORK=testnet

# App
NUXT_PUBLIC_APP_NAME=CropLedger Enterprise
NUXT_PUBLIC_APP_URL=http://localhost:3000
```

### Start development server

```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

### Run tests

```bash
# Unit tests
npm run test

# E2E tests with Playwright
npm run test:e2e

# Linting
npm run lint
```

---

## Docker Setup (Alternative)

### Using Docker Compose

```bash
# From project root
docker-compose up -d
```

This will start:
- PostgreSQL database
- Redis server
- Backend API
- Frontend application

### Docker Compose services

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: croppedger
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

---

## Stellar Testnet Setup

### Create a Stellar testnet account

1. Visit [Stellar Laboratory](https://laboratory.stellar.org/)
2. Go to "Account Viewer"
3. Create a new account or import existing keypair
4. Request testnet XLM from friendbot

### Configure backend with Stellar credentials

Add to `backend/.env`:

```env
STELLAR_NETWORK=testnet
STELLAR_SECRET_KEY=Sxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STELLAR_PUBLIC_KEY=Gxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Verify Stellar connection

```bash
cd backend
npm run stellar:test
```

---

## IDE Configuration

### VS Code Extensions

Install these extensions for optimal development:

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Prisma** - Database ORM support
- **Vitest** - Test runner integration
- **Tailwind CSS IntelliSense** - CSS autocomplete
- **Vue - Official** - Vue/Nuxt support

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "backend/node_modules/typescript/lib",
  "vue.server.hybridMode": true
}
```

---

## Common Issues & Solutions

### PostgreSQL connection error

**Error**: `connection refused` or `authentication failed`

**Solution**:
```bash
# Check PostgreSQL is running
pg_isready

# Check connection string in .env
# Ensure user/password match your PostgreSQL setup
```

### Redis connection error

**Error**: `Redis connection to localhost:6379 failed`

**Solution**:
```bash
# Start Redis server
redis-server

# Or check if Redis is running
redis-cli ping
# Should return: PONG
```

### Prisma migration error

**Error**: `Migration failed`

**Solution**:
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or resolve migration conflict
npx prisma migrate resolve --applied "migration_name"
```

### Stellar network error

**Error**: `Network error when connecting to Stellar`

**Solution**:
```bash
# Verify network setting in .env
# Ensure you're using testnet for development
STELLAR_NETWORK=testnet

# Check your secret key is valid
# Request testnet XLM from friendbot
```

### Port already in use

**Error**: `EADDRINUSE: address already in use`

**Solution**:
```bash
# Find process using the port
netstat -ano | findstr :3001  # Windows
lsof -i :3001  # macOS/Linux

# Kill the process or change PORT in .env
PORT=3002 npm run dev
```

---

## Development Workflow

### Branch naming

```bash
feature/add-demand-forecasting
fix/stellar-payment-error
docs/update-api-documentation
refactor/clean-architecture
```

### Commit messages

Follow conventional commits:

```bash
feat: add demand forecasting API
fix: resolve Stellar escrow timeout
docs: update setup guide
refactor: extract user service
test: add contract e2e tests
```

### Pull request process

1. Create feature branch from `main`
2. Make changes and commit
3. Push to remote
4. Create pull request
5. Request review
6. Address feedback
7. Merge to `main`

---

## Performance Tips

### Backend

- Use Redis caching for frequently accessed data
- Enable database connection pooling
- Use BullMQ for background jobs
- Monitor query performance with Prisma

### Frontend

- Use Nuxt.js server-side rendering
- Implement lazy loading for components
- Optimize images with Nuxt Image module
- Use Pinia for efficient state management

---

## Debugging

### Backend debugging

```bash
# Run with Node debugger
node --inspect-brk src/server.js

# Or use VS Code launch configuration
# Press F5 to start debugging
```

### Frontend debugging

```bash
# Nuxt provides Chrome DevTools integration
# Open browser DevTools for Vue component inspection
```

### Database debugging

```bash
# View Prisma queries
npx prisma studio

# Log SQL queries
# Add to .env: DATABASE_URL="...?connection_limit=1&loglevel=debug"
```

---

## Next Steps

- Read the [Architecture Guide](architecture.md)
- Review the [API Documentation](api.md)
- Check [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines
- Explore the codebase starting with domain entities

---

## Getting Help

- **Documentation**: Check `/docs` directory
- **Issues**: Open an issue on GitHub
- **Discussions**: Join GitHub Discussions
- **Email**: support@croppedger.com
