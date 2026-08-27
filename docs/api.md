# API Documentation

## Base URL

- **Development**: `http://localhost:3001/api/v1`
- **Production**: `https://api.croppedger.com/api/v1`

## Authentication

Most endpoints require authentication via JWT Bearer token.

```http
Authorization: Bearer <your-jwt-token>
```

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2025-08-27T10:00:00Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [ ... ]
  },
  "timestamp": "2025-08-27T10:00:00Z"
}
```

---

## Contracts API

### Create Contract

Create a new smart contract with Stellar escrow.

```http
POST /contracts
```

**Request Body:**
```json
{
  "buyerId": "string",
  "sellerId": "string",
  "cropType": "string",
  "quantity": 1000,
  "unitPrice": 50.00,
  "deliveryDate": "2025-09-15",
  "stellarPublicKey": "string"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxx",
    "stellarTxId": "xxxxxxxxxxxxxxxx",
    "status": "pending",
    "escrowAddress": "Gxxxxxxxxxxxxxxxx",
    "amount": 50000.00,
    "createdAt": "2025-08-27T10:00:00Z"
  }
}
```

### Get Contract

Retrieve a contract by ID.

```http
GET /contracts/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxx",
    "buyerId": "clxxxxxxx",
    "sellerId": "clxxxxxxx",
    "cropType": "Wheat",
    "quantity": 1000,
    "unitPrice": 50.00,
    "totalAmount": 50000.00,
    "status": "active",
    "stellarTxId": "xxxxxxxxxxxxxxxx",
    "deliveryDate": "2025-09-15",
    "createdAt": "2025-08-27T10:00:00Z"
  }
}
```

### List Contracts

List all contracts with filtering and pagination.

```http
GET /contracts?page=1&limit=20&status=active&buyerId=clxxxxxxx
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `status` (string): pending, active, completed, cancelled
- `buyerId` (string): Filter by buyer
- `sellerId` (string): Filter by seller
- `cropType` (string): Filter by crop type

**Response (200):**
```json
{
  "success": true,
  "data": {
    "contracts": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### Execute Contract

Execute a contract and release escrow funds.

```http
POST /contracts/:id/execute
```

**Request Body:**
```json
{
  "stellarSecret": "encrypted_secret",
  "confirmationCode": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxx",
    "status": "completed",
    "stellarTxId": "xxxxxxxxxxxxxxxx",
    "executedAt": "2025-08-27T10:00:00Z"
  }
}
```

### Cancel Contract

Cancel a pending contract.

```http
POST /contracts/:id/cancel
```

**Request Body:**
```json
{
  "reason": "Mutual agreement"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxx",
    "status": "cancelled",
    "cancelledAt": "2025-08-27T10:00:00Z"
  }
}
```

---

## Authentication API

### Register

Register a new user.

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "organizationId": "clxxxxxxx"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clxxxxxxx",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "tokens": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "eyJhbGci..."
    }
  }
}
```

### Login

Authenticate a user.

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clxxxxxxx",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "tokens": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "eyJhbGci..."
    }
  }
}
```

### Refresh Token

Refresh access token using refresh token.

```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGci..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

### Logout

Invalidate current session.

```http
POST /auth/logout
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Forecast API

### Generate Demand Forecast

Generate AI-powered demand forecast for a crop.

```http
POST /forecast/generate
```

**Request Body:**
```json
{
  "cropType": "Wheat",
  "region": "North America",
  "timeframe": "30",
  "historicalData": {
    "lastYearDemand": 50000,
    "seasonality": "high"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxx",
    "cropType": "Wheat",
    "region": "North America",
    "predictedDemand": 52500,
    "confidenceScore": 0.87,
    "factors": {
      "seasonalImpact": 1.05,
      "weatherImpact": 0.98,
      "marketTrend": 1.02
    },
    "generatedAt": "2025-08-27T10:00:00Z"
  }
}
```

### Get Historical Forecasts

Retrieve historical forecast data.

```http
GET /forecast/historical?cropType=Wheat&region=North%20America&limit=10
```

**Query Parameters:**
- `cropType` (string): Filter by crop type
- `region` (string): Filter by region
- `limit` (number, default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "forecasts": [
      {
        "id": "clxxxxxxx",
        "cropType": "Wheat",
        "predictedDemand": 52500,
        "actualDemand": 51800,
        "accuracy": 0.98,
        "generatedAt": "2025-08-20T10:00:00Z"
      }
    ]
  }
}
```

---

## Compliance API

### Generate Compliance Report

Generate a regulatory compliance report.

```http
POST /compliance/report
```

**Request Body:**
```json
{
  "organizationId": "clxxxxxxx",
  "reportType": "quarterly",
  "period": "2025-Q3",
  "includeTransactions": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxx",
    "organizationId": "clxxxxxxx",
    "reportType": "quarterly",
    "period": "2025-Q3",
    "status": "compliant",
    "summary": {
      "totalTransactions": 150,
      "totalVolume": 7500000,
      "complianceScore": 0.95
    },
    "generatedAt": "2025-08-27T10:00:00Z"
  }
}
```

### Get Compliance Status

Check compliance status for an organization.

```http
GET /compliance/status/:organizationId
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "organizationId": "clxxxxxxx",
    "status": "compliant",
    "lastAuditDate": "2025-08-15T10:00:00Z",
    "nextAuditDate": "2025-11-15T10:00:00Z",
    "issues": []
  }
}
```

---

## Organizations API

### Create Organization

Create a new organization (multi-tenant).

```http
POST /organizations
```

**Request Body:**
```json
{
  "name": "AgriCorp International",
  "type": "buyer",
  "address": {
    "street": "123 Farm Road",
    "city": "Des Moines",
    "country": "USA"
  },
  "stellarPublicKey": "Gxxxxxxxxxxxxxxxx"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxx",
    "name": "AgriCorp International",
    "type": "buyer",
    "stellarPublicKey": "Gxxxxxxxxxxxxxxxx",
    "createdAt": "2025-08-27T10:00:00Z"
  }
}
```

### Get Organization

Retrieve organization details.

```http
GET /organizations/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxxxxxxx",
    "name": "AgriCorp International",
    "type": "buyer",
    "members": 15,
    "activeContracts": 8,
    "totalVolume": 2500000
  }
}
```

---

## WebSocket Events

### Real-time Contract Updates

Connect to WebSocket for real-time contract status updates.

```javascript
const ws = new WebSocket('ws://localhost:3001/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'contract.updated') {
    console.log('Contract updated:', data.payload);
  }
};
```

**Event Types:**
- `contract.created`: New contract created
- `contract.updated`: Contract status changed
- `contract.executed`: Contract executed
- `contract.cancelled`: Contract cancelled

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `UNAUTHORIZED` | Invalid or missing authentication |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource conflict (duplicate, etc.) |
| `STELLAR_ERROR` | Stellar blockchain operation failed |
| `INTERNAL_ERROR` | Internal server error |

---

## Rate Limiting

- **Authenticated users**: 1000 requests/hour
- **Unauthenticated**: 100 requests/hour

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1693123456
```

---

## Pagination

All list endpoints support pagination:

```http
GET /contracts?page=2&limit=20
```

Response includes pagination metadata:
```json
{
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```
