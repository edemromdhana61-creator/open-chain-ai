# Open Chain AI - Deployment Guide

## Prerequisites

- Docker 24.0+
- Docker Compose 2.20+
- Node.js 20+ (for development)
- pnpm 8+ (for development)

## Quick Deploy

### 1. Clone Repository

```bash
git clone https://github.com/eddie/open-chain-ai.git
cd open-chain-ai
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env`:
```bash
# Required
OLLAMA_TOKEN=your-ollama-cloud-token

# Optional (defaults shown)
PORT=3000
DATABASE_URL=postgres://openchain:openchain@db:5432/openchain
NATS_URL=nats://nats:4222
JWT_SECRET=change-this-in-production
```

### 3. Start Services

```bash
# Production
docker-compose up -d

# Development
docker-compose up -d db nats
pnpm install
pnpm dev
```

### 4. Verify

```bash
# Check health
curl http://localhost:3000/health

# Check dashboard
curl http://localhost:3000/api/v1/dashboard
```

## Production Deployment

### 1. SSL/TLS

```bash
# Using Let's Encrypt
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 2. Database Migrations

```bash
# Run migrations
docker-compose exec api pnpm db:migrate

# Seed data (optional)
docker-compose exec api pnpm db:seed
```

### 3. Monitoring

```bash
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access:
# - Grafana: http://localhost:3001
# - Prometheus: http://localhost:9090
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OLLAMA_TOKEN` | Yes | - | Ollama Cloud API token |
| `JWT_SECRET` | Yes | - | JWT signing secret |
| `DATABASE_URL` | No | `postgres://openchain:openchain@db:5432/openchain` | PostgreSQL URL |
| `NATS_URL` | No | `nats://nats:4222` | NATS broker URL |
| `PORT` | No | `3000` | API server port |
| `SANDBOX_CPU_LIMIT` | No | `1` | Max CPU per sandbox |
| `SANDBOX_MEMORY_LIMIT` | No | `512m` | Max memory per sandbox |
| `CIRCUIT_BREAKER_MAX_REVISIONS` | No | `3` | Max revisions per task |

## Docker Images

### Build

```bash
# API
docker build -t open-chain-ai/api:latest ./apps/api

# Web
docker build -t open-chain-ai/web:latest ./apps/web

# Sandbox
docker build -t open-chain-ai/sandbox:latest -f apps/api/Dockerfile.sandbox .
```

### Push

```bash
# Tag
docker tag open-chain-ai/api:latest registry.example.com/open-chain-ai/api:latest

# Push
docker push registry.example.com/open-chain-ai/api:latest
```

## Kubernetes

### 1. Namespace

```bash
kubectl create namespace open-chain-ai
```

### 2. Secrets

```bash
kubectl create secret generic open-chain-ai-secrets \
  --from-literal=OLLAMA_TOKEN=your-token \
  --from-literal=JWT_SECRET=your-secret \
  -n open-chain-ai
```

### 3. Deploy

```bash
kubectl apply -f k8s/ -n open-chain-ai
```

## Backup

### Database

```bash
# Backup
docker-compose exec db pg_dump -U openchain openchain > backup.sql

# Restore
docker-compose exec -T db psql -U openchain openchain < backup.sql
```

### Volumes

```bash
# Backup volume
docker run --rm -v open-chain-ai_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres.tar.gz -C /data .

# Restore volume
docker run --rm -v open-chain-ai_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres.tar.gz -C /data
```

## Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose ps db

# Check logs
docker-compose logs db

# Reset database (WARNING: data loss!)
docker-compose down -v
docker-compose up -d db
```

#### NATS Connection Failed
```bash
# Check NATS
docker-compose ps nats
docker-compose logs nats

# Restart NATS
docker-compose restart nats
```

#### Sandbox Fails
```bash
# Check Docker socket
docker-compose exec api ls -la /var/run/docker.sock

# Check sandbox image
docker images | grep sandbox

# Build sandbox
docker build -t open-chain-ai/sandbox:latest -f apps/api/Dockerfile.sandbox .
```

#### High Memory Usage
```bash
# Check containers
docker stats

# Restart API
docker-compose restart api

# Scale down
# Edit docker-compose.yml and reduce replicas
```

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api

# Since last start
docker-compose logs -f --since 1h api
```

## Updates

### Rolling Update

```bash
# Pull new images
docker-compose pull

# Update
docker-compose up -d

# Verify
curl http://localhost:3000/health
```

### Database Migrations

```bash
# Check pending migrations
docker-compose exec api pnpm db:migrate:status

# Run migrations
docker-compose exec api pnpm db:migrate

# Rollback (if needed)
docker-compose exec api pnpm db:migrate:rollback
```

## Security Checklist

- [ ] Change default JWT secret
- [ ] Enable HTTPS
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Database backups
- [ ] Log monitoring
- [ ] Resource limits
- [ ] Network policies

## Support

For issues and questions:
- GitHub Issues: https://github.com/eddie/open-chain-ai/issues
- Documentation: https://docs.open-chain-ai.com
- Discord: https://discord.gg/open-chain-ai
