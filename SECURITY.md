# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| `main` branch | ✅ |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Please report security issues privately by emailing the maintainers. Include:
- A description of the vulnerability
- Steps to reproduce the issue
- The potential impact
- Any suggested mitigations

You will receive a response within 72 hours. If the issue is confirmed, we will:
1. Work with you to understand and reproduce it
2. Develop and test a fix
3. Release a patch and credit you in the changelog

## Known Security Notes

### Environment Variables

This project uses the following sensitive environment variables. **Never commit real values to version control.**

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Must be a cryptographically random string of at least 64 hex characters. Generate with: `openssl rand -hex 64` |
| `SUPABASE_KEY` | Supabase anon key — treat as a secret even though it is "public" in Supabase's terminology |
| `SUPABASE_SERVICE_ROLE_KEY` | Full database access — guard carefully, never expose to clients |
| `STELLAR_SECRET_KEY` | Stellar keypair secret — losing this means losing custody of on-chain assets |

### Stellar Testnet

The Stellar integration currently targets **Testnet only**. Never deploy Mainnet keys to this codebase without a full security review of the escrow and payment logic.

### Authentication

All API routes except `/api/v1/auth/*` and `/api/v1/health` require a valid JWT Bearer token. See `backend/src/presentation/middleware/auth.middleware.ts`.
