# Docker Deployment Guide

> Containerized deployment for TokenFactory dApp

## 🐳 Overview

This project includes complete Docker configuration for:

- ✅ **Backend** (SIWE API) - Node.js + Express + Prisma
- ✅ **Frontend** (React dApp) - Vite build served with nginx
- ✅ **Development** - Hot-reload development environment
- ✅ **Production** - Optimized multi-stage builds

## 🚀 Quick Start

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### Production Deployment

```bash
# 1. Configure environment
cp .env.docker.example .env.docker
# Edit .env.docker with your settings

# 2. Build and start services
docker-compose up -d

# 3. Check status
docker-compose ps

# 4. View logs
docker-compose logs -f
```

The application will be available at:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3001

### Development Mode

```bash
# Start development environment with hot-reload
docker-compose -f docker-compose.dev.yml up

# Stop services
docker-compose -f docker-compose.dev.yml down
```

Development servers:
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend**: http://localhost:3001 (tsx watch mode)

## 📁 Docker Files

```
/
├── docker-compose.yml          # Production orchestration
├── docker-compose.dev.yml      # Development orchestration
├── .env.docker.example         # Environment template
├── server/
│   ├── Dockerfile              # Production backend image
│   ├── Dockerfile.dev          # Development backend image
│   └── .dockerignore           # Exclude files
└── dapp/
    ├── Dockerfile              # Production frontend image
    ├── Dockerfile.dev          # Development frontend image
    ├── nginx.conf              # Nginx configuration
    └── .dockerignore           # Exclude files
```

## 🏗️ Architecture

### Production Stack

```
┌─────────────────────────────────────────────┐
│           Docker Network                     │
│                                             │
│  ┌──────────────┐      ┌──────────────┐   │
│  │   Frontend   │      │   Backend    │   │
│  │   (nginx)    │◄────►│  (Node.js)   │   │
│  │   Port 80    │      │  Port 3001   │   │
│  └──────────────┘      └──────┬───────┘   │
│                                │           │
│                         ┌──────▼───────┐   │
│                         │   Volumes    │   │
│                         │ - Database   │   │
│                         │ - Uploads    │   │
│                         └──────────────┘   │
└─────────────────────────────────────────────┘
```

### Multi-Stage Builds

**Backend Dockerfile:**
1. **deps** - Install dependencies
2. **builder** - Generate Prisma client, compile TypeScript
3. **runner** - Production image with only runtime files

**Frontend Dockerfile:**
1. **deps** - Install dependencies
2. **builder** - Build Vite production bundle
3. **runner** - Nginx serving static files

## 📝 Environment Variables

Create `.env.docker` from template:

```bash
cp .env.docker.example .env.docker
```

**Required Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | JWT signing secret | `random-secret-key` |
| `VITE_FACTORY_ADDRESS` | TokenFactory contract | `0x...` |
| `VITE_SWAP_ADDRESS` | SimpleSwap contract | `0x...` |

**Optional Variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `CORS_ORIGIN` | Allowed origins | `http://localhost` |
| `VITE_BACKEND_URL` | Backend API URL | `http://localhost:3001/api` |
| `VITE_SUBGRAPH_URL` | The Graph URL | - |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect ID | - |

## 🔧 Docker Commands

### Basic Operations

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Building

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build without cache
docker-compose build --no-cache
```

### Maintenance

```bash
# Check service status
docker-compose ps

# Execute command in container
docker-compose exec backend sh
docker-compose exec frontend sh

# View resource usage
docker stats

# Remove stopped containers
docker-compose rm

# Remove volumes
docker-compose down -v
```

## 🗄️ Volumes

### Production Volumes

- **backend-data**: SQLite database storage
- **backend-uploads**: IPFS mock storage (avatar uploads)

### Accessing Data

```bash
# Backup database
docker-compose exec backend cat /app/data/dev.db > backup.db

# View uploads
docker-compose exec backend ls -la /app/uploads

# Copy file from container
docker cp tokenfactory-backend:/app/data/dev.db ./local-backup.db
```

## 🌐 Nginx Configuration

The frontend uses nginx with:

- ✅ Gzip compression
- ✅ Security headers (X-Frame-Options, X-Content-Type-Options)
- ✅ Client-side routing support (React Router)
- ✅ Static asset caching (1 year)
- ✅ No cache for index.html

Custom nginx config at `dapp/nginx.conf`.

## 🔍 Health Checks

Both services include health checks:

**Backend:**
```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "http://localhost:3001/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

**Frontend:**
```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "http://localhost:80"]
  interval: 30s
  timeout: 10s
  retries: 3
```

Check health status:
```bash
docker-compose ps
```

## 🚀 Deployment Scenarios

### Local Development

```bash
# Hot-reload development
docker-compose -f docker-compose.dev.yml up
```

Features:
- Volume mounts for live code updates
- Development dependencies included
- Debug logging enabled

### Staging/Production

```bash
# Optimized production build
docker-compose up -d
```

Features:
- Multi-stage optimized builds
- Production dependencies only
- Security hardened
- Health monitoring

### CI/CD Integration

```bash
# Build images
docker-compose build

# Tag images
docker tag tokenfactory-backend:latest registry.com/backend:v1.0
docker tag tokenfactory-frontend:latest registry.com/frontend:v1.0

# Push to registry
docker push registry.com/backend:v1.0
docker push registry.com/frontend:v1.0
```

## 🔒 Security Best Practices

### Production Checklist

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Update `CORS_ORIGIN` to your domain
- [ ] Use HTTPS (add reverse proxy like Traefik/Caddy)
- [ ] Set up container resource limits
- [ ] Enable Docker security scanning
- [ ] Use non-root users (already configured)
- [ ] Regular security updates
- [ ] Backup volumes regularly

### Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## 📊 Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100

# Since timestamp
docker-compose logs --since 2024-01-01T00:00:00
```

### Resource Usage

```bash
# Real-time stats
docker stats

# Service-specific stats
docker stats tokenfactory-backend tokenfactory-frontend
```

## 🐛 Troubleshooting

### Services won't start

```bash
# Check logs
docker-compose logs

# Rebuild images
docker-compose build --no-cache
docker-compose up -d
```

### Database errors

```bash
# Reset database
docker-compose down -v
docker-compose up -d

# Run migrations manually
docker-compose exec backend npx prisma migrate dev
```

### Permission issues

```bash
# Fix volume permissions
docker-compose exec backend chown -R expressjs:nodejs /app/data
docker-compose exec backend chown -R expressjs:nodejs /app/uploads
```

### Port conflicts

```bash
# Check what's using the port
lsof -i :3001
lsof -i :80

# Change ports in docker-compose.yml
ports:
  - "8080:80"  # Map to different host port
```

### Network issues

```bash
# Recreate network
docker-compose down
docker network prune
docker-compose up -d
```

## 🔄 Updates & Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose build
docker-compose up -d

# Or use --build flag
docker-compose up -d --build
```

### Database Migrations

```bash
# Run migrations
docker-compose exec backend npx prisma migrate dev

# Generate Prisma client
docker-compose exec backend npx prisma generate

# Reset database
docker-compose exec backend npx prisma migrate reset
```

### Clean Up

```bash
# Remove all containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Remove unused Docker resources
docker system prune -a
```

## 📦 Production Deployment Platforms

### Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml tokenfactory
```

### Kubernetes

Convert to Kubernetes with Kompose:

```bash
# Install kompose
curl -L https://github.com/kubernetes/kompose/releases/download/v1.31.2/kompose-linux-amd64 -o kompose

# Convert
kompose convert -f docker-compose.yml
```

### Cloud Platforms

- **AWS ECS**: Use docker-compose.yml with ECS CLI
- **Google Cloud Run**: Deploy individual containers
- **Azure Container Instances**: Deploy with docker-compose
- **DigitalOcean Apps**: Use Dockerfiles directly

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Docker](https://hub.docker.com/_/nginx)
- [Node Docker](https://hub.docker.com/_/node)

## 🎯 Next Steps

1. Configure environment variables in `.env.docker`
2. Update contract addresses after deployment
3. Build and test locally with `docker-compose up`
4. Deploy to your production environment
5. Set up HTTPS with reverse proxy
6. Configure monitoring and alerts

---

Built with 🐳 Docker
