# CropLedger API Reference Specification
/* Authorized Protocol Quality Assurance & Formal Invariant Verification */

## Core Service Ports
- **API Server Port**: `8080` (Default HTTP JSON gateway)
- **Database Port**: `5432` (PostgreSQL connection pool)

## Endpoints

### 1. Health Status
- **Method**: `GET /api/v1/health`
- **Response**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "ledgerSequence": 1248092
}
```

### 2. Harvest Registry
- **Method**: `POST /api/v1/harvest/register`
- **Payload**:
```json
{
  "farmerId": "GAB4...72",
  "cropType": "wheat",
  "weightKg": 1500,
  "timestamp": 1794676500
}
```
