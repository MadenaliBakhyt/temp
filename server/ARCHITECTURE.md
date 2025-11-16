# Backend Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Frontend)                         │
│                                                                  │
│  1. User connects wallet (MetaMask)                            │
│  2. Sign SIWE message with wallet                              │
│  3. Send message + signature to backend                        │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER (Node.js)                     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                    Middleware Stack                      │  │
│  │                                                          │  │
│  │  1. Helmet (Security Headers)                           │  │
│  │  2. CORS (Cross-Origin)                                 │  │
│  │  3. Body Parser (JSON)                                  │  │
│  │  4. Morgan (Logging)                                    │  │
│  │  5. Rate Limiter                                        │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                     Route Handlers                       │  │
│  │                                                          │  │
│  │  /api/auth/*     → Authentication Routes                │  │
│  │  /api/profile/*  → Profile Management Routes            │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  Business Logic Layer                    │  │
│  │                                                          │  │
│  │  • SIWE Verification (ethers.js + siwe)                 │  │
│  │  • JWT Token Generation/Verification                    │  │
│  │  • Profile CRUD Operations                              │  │
│  │  • IPFS Upload Handler                                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                 Prisma ORM Client                        │  │
│  │                                                          │  │
│  │  • Type-safe database queries                           │  │
│  │  • Automatic migrations                                 │  │
│  │  • Connection pooling                                   │  │
│  └─────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SQLite Database                            │
│                                                                 │
│  Tables:                                                        │
│  • users      (walletAddress, nickname, avatarUrl)            │
│  • sessions   (token, walletAddress, expiresAt)               │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────┐                                  ┌──────────┐
│ Frontend │                                  │  Backend │
└─────┬────┘                                  └────┬─────┘
      │                                            │
      │  1. Generate SIWE message                 │
      │     (with nonce, timestamp, domain)       │
      │                                            │
      │  2. Sign message with wallet              │
      │     → Get signature from MetaMask         │
      │                                            │
      │  POST /api/auth/login                     │
      │  { message, signature }                   │
      ├───────────────────────────────────────────>│
      │                                            │
      │                              3. Verify signature
      │                                 with ethers.js
      │                                            │
      │                              4. Extract wallet address
      │                                 from verified message
      │                                            │
      │                              5. Create/update user
      │                                 in database
      │                                            │
      │                              6. Generate JWT token
      │                                 with wallet address
      │                                            │
      │                              7. Store session
      │                                 in database
      │                                            │
      │  { success, token, user }                 │
      │<───────────────────────────────────────────┤
      │                                            │
      │  8. Store token in localStorage            │
      │     or secure cookie                       │
      │                                            │
      │  9. Include token in subsequent requests   │
      │     Authorization: Bearer <token>          │
      │                                            │
```

## Request/Response Flow

### 1. Login Request

```
POST /api/auth/login
├── Middleware: validateBody(schemas.login)
│   └── Validate message and signature format
├── Route Handler: authRoutes.login
│   ├── verifySiweMessage(message, signature)
│   │   ├── Parse SIWE message
│   │   ├── Verify cryptographic signature
│   │   └── Return verified wallet address
│   ├── prisma.user.upsert()
│   │   └── Create or update user record
│   ├── generateToken(walletAddress)
│   │   └── Create JWT with 7-day expiry
│   └── prisma.session.create()
│       └── Store session for logout tracking
└── Response: { token, user }
```

### 2. Authenticated Request

```
GET /api/profile
├── Middleware: authenticate
│   ├── Extract token from Authorization header
│   ├── verifyToken(token)
│   │   ├── Verify JWT signature
│   │   ├── Check expiry
│   │   └── Extract wallet address
│   └── Attach walletAddress to req
├── Route Handler: profileRoutes.get
│   └── prisma.user.findUnique({ walletAddress })
└── Response: { user }
```

### 3. Profile Update

```
POST /api/profile
├── Middleware: authenticate
│   └── Verify JWT and extract walletAddress
├── Middleware: validateBody(schemas.profileUpdate)
│   └── Validate nickname and avatarUrl
├── Route Handler: profileRoutes.update
│   └── prisma.user.update({ walletAddress })
└── Response: { user }
```

### 4. Avatar Upload

```
POST /api/profile/avatar
├── Middleware: authenticate
├── Middleware: validateBody(schemas.avatarUpload)
│   └── Validate base64 data URL format
├── Route Handler: profileRoutes.uploadAvatar
│   ├── uploadAvatarFromDataURL(dataUrl)
│   │   ├── Parse base64 data
│   │   ├── Validate image type & size
│   │   ├── Upload to IPFS (or mock storage)
│   │   └── Return { cid, url }
│   └── prisma.user.update({ avatarUrl })
└── Response: { user, upload }
```

## Data Models

### User Model

```typescript
{
  id: string            // Auto-generated CUID
  walletAddress: string // Lowercase Ethereum address (unique)
  nickname: string?     // Optional display name
  avatarUrl: string?    // Optional avatar URL
  createdAt: DateTime   // Auto-generated
  updatedAt: DateTime   // Auto-updated
}
```

**Indexes:**
- `walletAddress` (unique)

### Session Model

```typescript
{
  id: string            // Auto-generated CUID
  walletAddress: string // Associated wallet
  token: string         // JWT token (unique)
  expiresAt: DateTime   // Token expiry time
  createdAt: DateTime   // Auto-generated
}
```

**Indexes:**
- `token` (unique)
- `walletAddress` (for lookups)

## Security Layers

### Layer 1: Network Security

```
┌─────────────────────────────────────┐
│  Helmet - Security Headers          │
│  • X-Content-Type-Options           │
│  • X-Frame-Options                  │
│  • X-XSS-Protection                 │
│  • Strict-Transport-Security        │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  CORS - Cross-Origin Control        │
│  • Whitelist allowed origins        │
│  • Credentials support              │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Rate Limiting                      │
│  • 100 requests / 15 minutes        │
│  • Per IP address                   │
└─────────────────────────────────────┘
```

### Layer 2: Authentication

```
┌─────────────────────────────────────┐
│  SIWE Verification                  │
│  • Cryptographic signature check    │
│  • No passwords stored              │
│  • Replay protection (nonce)        │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  JWT Tokens                         │
│  • Short-lived (7 days)             │
│  • Stateless verification           │
│  • Signed with secret key           │
└─────────────────────────────────────┘
```

### Layer 3: Authorization

```
┌─────────────────────────────────────┐
│  Middleware: authenticate           │
│  • Verify JWT on protected routes   │
│  • Extract wallet address           │
│  • Attach to request context        │
└─────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Route-Level Checks                 │
│  • User can only update own profile │
│  • Public vs. private endpoints     │
└─────────────────────────────────────┘
```

### Layer 4: Input Validation

```
┌─────────────────────────────────────┐
│  Zod Schema Validation              │
│  • Type checking                    │
│  • Format validation                │
│  • Range validation                 │
│  • Detailed error messages          │
└─────────────────────────────────────┘
```

## File Structure

```
server/
├── src/
│   ├── index.ts                    # Express app setup
│   │   ├── Middleware configuration
│   │   ├── Route mounting
│   │   ├── Error handling
│   │   └── Server startup
│   │
│   ├── routes/
│   │   ├── auth.ts                 # Authentication endpoints
│   │   │   ├── POST /login
│   │   │   ├── POST /logout
│   │   │   ├── GET /verify
│   │   │   └── GET /nonce
│   │   │
│   │   └── profile.ts              # Profile endpoints
│   │       ├── GET /:address       (public)
│   │       ├── GET /               (authenticated)
│   │       ├── POST /              (authenticated)
│   │       ├── POST /avatar        (authenticated)
│   │       └── DELETE /avatar      (authenticated)
│   │
│   ├── middleware/
│   │   ├── auth.ts                 # JWT verification
│   │   │   ├── authenticate()      Required auth
│   │   │   └── optionalAuth()      Optional auth
│   │   │
│   │   ├── errorHandler.ts         # Global error handling
│   │   │   ├── errorHandler()      Catch-all errors
│   │   │   ├── notFoundHandler()   404 handler
│   │   │   └── createError()       Error factory
│   │   │
│   │   └── validation.ts           # Request validation
│   │       ├── validateBody()      Zod validation
│   │       └── schemas             Validation schemas
│   │
│   ├── utils/
│   │   ├── siwe.ts                 # SIWE utilities
│   │   │   ├── verifySiweMessage() Verify signature
│   │   │   ├── generateNonce()     Random nonce
│   │   │   ├── isValidAddress()    Address validation
│   │   │   └── normalizeAddress()  Lowercase address
│   │   │
│   │   ├── jwt.ts                  # JWT utilities
│   │   │   ├── generateToken()     Create JWT
│   │   │   ├── verifyToken()       Verify JWT
│   │   │   └── decodeToken()       Decode without verify
│   │   │
│   │   └── ipfs.ts                 # IPFS utilities
│   │       ├── uploadToIPFS()      Upload file
│   │       ├── uploadAvatarFromDataURL()
│   │       ├── deleteFromIPFS()    Delete file
│   │       └── extractCID()        Parse CID from URL
│   │
│   ├── db/
│   │   ├── client.ts               # Prisma singleton
│   │   └── seed.ts                 # Database seeding
│   │
│   └── types/
│       └── index.ts                # TypeScript types
│           ├── AuthenticatedRequest
│           ├── LoginRequest
│           ├── ProfileUpdateRequest
│           ├── JWTPayload
│           └── ApiResponse
│
└── prisma/
    └── schema.prisma               # Database schema
        ├── User model
        └── Session model
```

## Error Handling

```
Request
  │
  ├── Validation Error (400)
  │   └── Zod schema validation fails
  │       → { success: false, error, details }
  │
  ├── Authentication Error (401)
  │   ├── Missing token
  │   ├── Invalid token
  │   └── Expired token
  │       → { success: false, error }
  │
  ├── Not Found Error (404)
  │   ├── Route not found
  │   └── Resource not found
  │       → { success: false, error }
  │
  ├── Rate Limit Error (429)
  │   └── Too many requests
  │       → { success: false, error }
  │
  └── Server Error (500)
      ├── Database errors
      ├── IPFS upload errors
      └── Unexpected errors
          → { success: false, error }
          → (+ stack trace in development)
```

## Environment Configuration

```
┌──────────────────────────────────────┐
│  .env File                           │
├──────────────────────────────────────┤
│  PORT=3001                           │
│  NODE_ENV=development                │
│  JWT_SECRET=***                      │
│  SESSION_EXPIRY=7d                   │
│  CORS_ORIGIN=http://localhost:5173  │
│  DATABASE_URL=file:./dev.db         │
│  IPFS_MOCK=true                      │
│  IPFS_STORAGE_PATH=./uploads         │
│  RATE_LIMIT_WINDOW_MS=900000        │
│  RATE_LIMIT_MAX_REQUESTS=100        │
└──────────────────────────────────────┘
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js 20 | JavaScript runtime |
| Framework | Express 4 | Web server framework |
| Language | TypeScript 5 | Type safety |
| ORM | Prisma 5 | Database abstraction |
| Database | SQLite | Local development DB |
| Auth | SIWE + JWT | Wallet authentication |
| Validation | Zod | Schema validation |
| Security | Helmet, CORS | HTTP security |
| Crypto | ethers.js 6 | Ethereum utilities |
| Rate Limiting | express-rate-limit | DoS protection |

## Deployment Considerations

### Development
- SQLite for easy local setup
- Mock IPFS with local storage
- Detailed logging
- No HTTPS required

### Production
- **Database**: PostgreSQL or MySQL
- **IPFS**: Pinata, Web3.Storage, or Infura
- **HTTPS**: Required for secure cookies
- **Environment**: Proper secret management
- **Monitoring**: Error tracking (Sentry)
- **Logging**: Structured logging (Winston)
- **Rate Limiting**: Adjust per production load
- **CORS**: Whitelist production domains only

## Scaling Strategy

```
Current: Single Server
├── Good for: Development, small deployments
└── Limitations: Single point of failure

Future: Horizontal Scaling
├── Load Balancer
│   └── Multiple Express instances
├── Database
│   └── PostgreSQL with connection pooling
├── Session Store
│   └── Redis for JWT blacklist
└── File Storage
    └── S3 or IPFS for avatars
```
