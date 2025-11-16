# TokenFactory SIWE Backend

> Sign-In with Ethereum (SIWE) authentication server with user profile management

## 🎯 Overview

This is a production-ready backend server that provides:

- ✅ **SIWE Authentication**: Secure wallet-based authentication
- ✅ **JWT Session Management**: Stateless authentication with JWTs
- ✅ **User Profiles**: Nickname and avatar management
- ✅ **IPFS Integration**: Avatar uploads (mock or real IPFS)
- ✅ **SQLite Database**: Lightweight database with Prisma ORM
- ✅ **TypeScript**: Full type safety
- ✅ **Security**: Rate limiting, CORS, Helmet, input validation

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
cd server
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this
CORS_ORIGIN=http://localhost:5173
DATABASE_URL="file:./dev.db"
IPFS_MOCK=true
```

### Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Optional: Seed database with sample data
npm run db:seed
```

### Start Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

Server will start at: **http://localhost:3001**

## 📚 API Documentation

### Base URL

```
http://localhost:3001/api
```

### Authentication

All authenticated endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### POST /api/auth/login

Sign in with Ethereum

**Request:**
```json
{
  "message": "<SIWE message string>",
  "signature": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "walletAddress": "0x1234...",
    "user": {
      "walletAddress": "0x1234...",
      "nickname": "Alice",
      "avatarUrl": "https://..."
    }
  },
  "message": "Login successful"
}
```

**SIWE Message Example:**

```javascript
// Frontend code to generate SIWE message
import { SiweMessage } from 'siwe';

const message = new SiweMessage({
  domain: window.location.host,
  address: walletAddress,
  statement: 'Sign in to TokenFactory dApp',
  uri: window.location.origin,
  version: '1',
  chainId: 11155111, // Sepolia
  nonce: Math.random().toString(36).substring(2),
});

const messageString = message.prepareMessage();

// Sign with wallet
const signature = await signer.signMessage(messageString);

// Send to backend
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: messageString,
    signature,
  }),
});
```

---

### POST /api/auth/logout

Logout and invalidate session

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### GET /api/auth/verify

Verify current token is valid

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x1234...",
    "user": {
      "walletAddress": "0x1234...",
      "nickname": "Alice",
      "avatarUrl": "https://...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### GET /api/auth/nonce

Get a random nonce for SIWE message (optional - can be generated client-side)

**Response:**
```json
{
  "success": true,
  "data": {
    "nonce": "abc123xyz"
  }
}
```

---

## 👤 Profile Endpoints

### GET /api/profile/:address

Get public profile by wallet address

**Parameters:**
- `address` - Ethereum wallet address

**Response:**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x1234...",
    "nickname": "Alice",
    "avatarUrl": "https://...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### GET /api/profile

Get authenticated user's own profile

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x1234...",
    "nickname": "Alice",
    "avatarUrl": "https://...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### POST /api/profile

Update authenticated user's profile

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "nickname": "Alice",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x1234...",
    "nickname": "Alice",
    "avatarUrl": "https://...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Profile updated successfully"
}
```

---

### POST /api/profile/avatar

Upload avatar image (base64 data URL)

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "dataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "walletAddress": "0x1234...",
      "nickname": "Alice",
      "avatarUrl": "/uploads/Qm...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "upload": {
      "cid": "Qm...",
      "url": "/uploads/Qm..."
    }
  },
  "message": "Avatar uploaded successfully"
}
```

**Notes:**
- Supported formats: JPEG, PNG, GIF, WebP
- Max size: 5MB
- Returns mock IPFS CID when `IPFS_MOCK=true`

---

### DELETE /api/profile/avatar

Remove avatar

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x1234...",
    "nickname": "Alice",
    "avatarUrl": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Avatar removed successfully"
}
```

---

## 🗄️ Database Schema

### User Model

```prisma
model User {
  id            String   @id @default(cuid())
  walletAddress String   @unique
  nickname      String?
  avatarUrl     String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### Session Model

```prisma
model Session {
  id            String   @id @default(cuid())
  walletAddress String
  token         String   @unique
  expiresAt     DateTime
  createdAt     DateTime @default(now())
}
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm start                # Start production server

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (GUI)
npm run prisma:push      # Push schema changes to DB
npm run db:seed          # Seed database with sample data

# Code Quality
npm run type-check       # TypeScript type checking
npm run lint             # Run ESLint
```

### Project Structure

```
server/
├── src/
│   ├── routes/
│   │   ├── auth.ts          # Authentication routes
│   │   └── profile.ts       # Profile management routes
│   ├── middleware/
│   │   ├── auth.ts          # JWT authentication middleware
│   │   ├── errorHandler.ts # Global error handler
│   │   └── validation.ts    # Request validation with Zod
│   ├── utils/
│   │   ├── siwe.ts          # SIWE verification utilities
│   │   ├── jwt.ts           # JWT token management
│   │   └── ipfs.ts          # IPFS upload (mock or real)
│   ├── db/
│   │   ├── client.ts        # Prisma client singleton
│   │   └── seed.ts          # Database seeding
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   └── index.ts             # Express app & server setup
├── prisma/
│   └── schema.prisma        # Prisma schema
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🔒 Security Features

### Authentication
- ✅ SIWE message verification with ethers.js
- ✅ JWT tokens with configurable expiry
- ✅ Session management in database
- ✅ Secure token storage

### Middleware
- ✅ **Helmet**: Security headers
- ✅ **CORS**: Configurable origin whitelist
- ✅ **Rate Limiting**: Prevent abuse (100 req/15min default)
- ✅ **Zod Validation**: Input validation with detailed errors

### Best Practices
- ✅ No passwords or private keys stored
- ✅ Wallet signature verification only
- ✅ httpOnly cookies option (if needed)
- ✅ Environment variable configuration
- ✅ Error handling and logging

## 📦 IPFS Integration

### Mock IPFS (Development)

Set `IPFS_MOCK=true` in `.env` to use local file storage:

```env
IPFS_MOCK=true
IPFS_STORAGE_PATH=./uploads
```

Files are stored locally and served via `/uploads/` endpoint.

### Real IPFS (Production)

To use real IPFS (e.g., Pinata):

1. Set `IPFS_MOCK=false`
2. Add your IPFS credentials:

```env
IPFS_MOCK=false
IPFS_API_URL=https://api.pinata.cloud
IPFS_API_KEY=your-pinata-api-key
IPFS_API_SECRET=your-pinata-secret
```

3. Update `src/utils/ipfs.ts` with real implementation (commented example provided)

## 🧪 Testing

### Manual Testing with curl

**Login:**
```bash
# First, sign a SIWE message with your wallet
# Then send the request:

curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "message": "<siwe-message>",
    "signature": "0x..."
  }'
```

**Get Profile:**
```bash
curl http://localhost:3001/api/profile/0x1234... \
  -H "Authorization: Bearer <token>"
```

**Update Profile:**
```bash
curl -X POST http://localhost:3001/api/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "Alice",
    "avatarUrl": "https://example.com/avatar.jpg"
  }'
```

## 🐛 Troubleshooting

### Database Issues

**Reset database:**
```bash
rm -f prisma/dev.db
npm run prisma:migrate
```

**View database:**
```bash
npm run prisma:studio
```

### CORS Errors

Update `CORS_ORIGIN` in `.env`:
```env
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### JWT Token Issues

Generate a new secret:
```bash
# Generate random JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📝 Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `3001` | No |
| `NODE_ENV` | Environment | `development` | No |
| `JWT_SECRET` | JWT signing secret | - | **Yes** |
| `SESSION_EXPIRY` | Token expiry time | `7d` | No |
| `CORS_ORIGIN` | Allowed origins (comma-separated) | `http://localhost:5173` | No |
| `DATABASE_URL` | Database connection string | `file:./dev.db` | **Yes** |
| `RPC_URL` | Ethereum RPC URL | - | No |
| `IPFS_MOCK` | Use mock IPFS | `true` | No |
| `IPFS_STORAGE_PATH` | Local storage path | `./uploads` | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | No |

## 🚀 Deployment

### Production Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Update `CORS_ORIGIN` to your production frontend URL
- [ ] Set `NODE_ENV=production`
- [ ] Use PostgreSQL instead of SQLite for production
- [ ] Set up real IPFS (Pinata, Web3.Storage, etc.)
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting for your needs
- [ ] Add database backups
- [ ] Review security headers

### Deploy to Vercel/Railway/Render

1. Set environment variables in platform dashboard
2. Update `DATABASE_URL` to PostgreSQL connection string
3. Run build command: `npm run build`
4. Run start command: `npm start`

## 📄 License

MIT

## 🤝 Contributing

This is a production-ready starter template. Feel free to customize for your needs!

## 📞 Support

For issues or questions:
- Check the [main README](../README.md)
- Review the [API documentation](./README.md#api-documentation)
- Verify environment variables

---

Built with ❤️ using Node.js, Express, Prisma, and SIWE
