# Open Chain AI - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   React     │  │   WebSocket │  │   CLI (optional)    │ │
│  │   Frontend  │  │   Real-time │  │                     │ │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────┘ │
└─────────┼────────────────┼──────────────────────────────────┘
          │                │
          ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                        API LAYER                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                   Fastify Server                         │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────────────┐ │ │
│  │  │  Auth   │ │  CORS   │ │ WebSocket│ │   Routes      │ │
│  │  │ (JWT)   │ │         │ │         │ │               │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └───────────────┘ │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────┬─────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────────┐ ┌──────────┐ ┌─────────────────┐
│   DATABASE        │ │  NATS    │ │   DOCKER        │
│   PostgreSQL      │ │  Broker  │ │   Sandbox       │
│  ┌─────────────┐  │ │          │ │  ┌───────────┐  │
│  │   Agents    │  │ │  Events  │ │  │  Isolate  │  │
│  │   Tasks     │  │ │  Tasks   │ │  │  Limit    │  │
│  │   Messages  │  │ │  Heartbeats│ │  │  Execute  │  │
│  │   Heartbeats│  │ │          │ │  └───────────┘  │
│  └─────────────┘  │ └──────────┘ └─────────────────┘
│  pgvector (768D) │
└─────────────────┘
```

## Data Flow

### 1. Task Assignment Flow
```
User → API → NATS → Agent
              ↓
         PostgreSQL
```

### 2. Heartbeat Flow
```
Agent → API → PostgreSQL
         ↓
      Dashboard
```

### 3. Message Flow
```
Agent → API → NATS → Broadcast
              ↓
         PostgreSQL
```

## Component Details

### API Server (Fastify)
- **Port:** 3000
- **Protocol:** HTTP/1.1 + WebSocket
- **Auth:** JWT
- **CORS:** Configured for frontend

### PostgreSQL + pgvector
- **Port:** 5432
- **Extensions:** pgvector (768 dimensions)
- **Schema:** See `apps/api/src/db/schema.ts`

### NATS
- **Port:** 4222 (client), 8222 (monitoring)
- **Features:** JetStream for persistence

### Docker Sandbox
- **Security:** Rootless, read-only, network isolated
- **Limits:** 1 CPU, 512MB RAM
- **Cleanup:** Every 5 minutes

## Scaling

### Horizontal Scaling
```
┌─────────┐     ┌─────────┐     ┌─────────┐
│  API 1  │     │  API 2  │     │  API 3  │
└────┬────┘     └────┬────┘     └────┬────┘
     │               │               │
     └───────────────┼───────────────┘
                     │
              ┌──────┴──────┐
              │   Load      │
              │   Balancer  │
              └──────┬──────┘
                     │
                  Clients
```

### Database Scaling
- Read replicas for queries
- Connection pooling (PgBouncer)
- Partitioning for large tables

## Security

### Authentication
- JWT tokens (RS256)
- Token expiry: 24h
- Refresh tokens: 7d

### Authorization
- Role-based access control (RBAC)
- Agent permissions
- Company isolation

### Sandbox Security
- Rootless containers
- Read-only filesystem
- Network isolation
- Resource limits
- Zombie cleanup

## Monitoring

### Health Checks
- `/health` - Overall health
- `/health/db` - Database health
- `/health/nats` - NATS health

### Metrics
- Prometheus metrics endpoint
- Custom business metrics
- Performance metrics

## Backup

### Database
- Daily automated backups
- Point-in-time recovery
- Cross-region replication

### Configuration
- Infrastructure as Code (IaC)
- Version controlled
- Automated deployments
