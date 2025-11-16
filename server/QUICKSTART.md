# Backend Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
JWT_SECRET=your-super-secret-key-change-this
CORS_ORIGIN=http://localhost:5173
IPFS_MOCK=true
```

### 3. Set Up Database

```bash
# Generate Prisma client
npm run prisma:generate

# Create database and run migrations
npm run prisma:migrate

# Optional: Seed with sample data
npm run db:seed
```

### 4. Start Server

```bash
npm run dev
```

Server starts at: **http://localhost:3001**

### 5. Test It

```bash
# Health check
curl http://localhost:3001/health
```

Expected output:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

## 📋 What You Get

✅ **SIWE Authentication** - Wallet-based login
✅ **JWT Sessions** - Secure token management
✅ **User Profiles** - Nickname & avatar storage
✅ **IPFS Upload** - Mock storage for avatars
✅ **SQLite Database** - Easy local development
✅ **Full TypeScript** - Type safety everywhere
✅ **Security** - Rate limiting, CORS, Helmet
✅ **Validation** - Zod schema validation

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - Sign in with Ethereum
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify` - Verify token
- `GET /api/auth/nonce` - Get nonce

### Profile
- `GET /api/profile/:address` - Get public profile
- `GET /api/profile` - Get own profile
- `POST /api/profile` - Update profile
- `POST /api/profile/avatar` - Upload avatar
- `DELETE /api/profile/avatar` - Remove avatar

## 🧪 Frontend Integration

```typescript
// 1. Sign SIWE message with wallet
import { SiweMessage } from 'siwe';

const message = new SiweMessage({
  domain: window.location.host,
  address: walletAddress,
  statement: 'Sign in to TokenFactory dApp',
  uri: window.location.origin,
  version: '1',
  chainId: 11155111,
  nonce: Math.random().toString(36).substring(2),
});

const messageString = message.prepareMessage();
const signature = await signer.signMessage(messageString);

// 2. Login
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: messageString, signature }),
});

const { data } = await response.json();
const token = data.token;

// 3. Use token for authenticated requests
const profile = await fetch('http://localhost:3001/api/profile', {
  headers: { 'Authorization': `Bearer ${token}` },
});
```

## 🔍 Database Management

```bash
# View database in GUI
npm run prisma:studio

# Reset database
rm -f prisma/dev.db
npm run prisma:migrate

# Create new migration
npm run prisma:migrate
```

## 📚 Next Steps

1. ✅ Server is running
2. 🔲 Integrate with frontend (see `/dapp`)
3. 🔲 Test SIWE flow end-to-end
4. 🔲 Deploy to production (Vercel/Railway/Render)

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Change PORT in .env
PORT=3002
```

**Database issues:**
```bash
rm -f prisma/dev.db
npm run prisma:migrate
```

**CORS errors:**
```bash
# Update CORS_ORIGIN in .env to match your frontend URL
CORS_ORIGIN=http://localhost:5173
```

---

Happy building! 🚀
