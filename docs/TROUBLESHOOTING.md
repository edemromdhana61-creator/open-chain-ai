# Open Chain AI - Troubleshooting

## Common Issues

### Agent Not Responding

**Symptoms:**
- Agent status shows "error"
- No heartbeats received
- Tasks not completing

**Solutions:**

1. Check agent logs:
```bash
docker-compose logs -f api | grep "agent-${AGENT_ID}"
```

2. Restart agent:
```bash
curl -X POST http://localhost:3000/api/v1/agents/${AGENT_ID}/resume
```

3. Check resource usage:
```bash
docker stats | grep sandbox
```

### Circuit Breaker Triggered

**Symptoms:**
- Task status shows "blocked"
- Error 423 on revision

**Solutions:**

1. Check revision count:
```bash
curl http://localhost:3000/api/v1/tasks/${TASK_ID}
```

2. Reset circuit breaker:
```bash
# Restart the task
curl -X POST http://localhost:3000/api/v1/tasks/${TASK_ID}/block
curl -X POST http://localhost:3000/api/v1/tasks/${TASK_ID}/resume
```

3. Adjust limit:
```bash
# Edit .env
CIRCUIT_BREAKER_MAX_REVISIONS=5
```

### High Token Usage

**Symptoms:**
- Budget limit reached
- API errors

**Solutions:**

1. Check usage:
```bash
curl http://localhost:3000/api/v1/dashboard/budget
```

2. Adjust limits:
```bash
# Edit docker-compose.yml
# Increase memory limit
SANDBOX_MEMORY_LIMIT=1g
```

3. Review agent settings:
```bash
# Check agent config
curl http://localhost:3000/api/v1/agents/${AGENT_ID}
```

### Sandbox Fails

**Symptoms:**
- Task execution errors
- Container not starting

**Solutions:**

1. Check Docker:
```bash
docker ps | grep sandbox
docker logs sandbox-${TASK_ID}
```

2. Rebuild sandbox image:
```bash
docker build -t open-chain-ai/sandbox:latest -f apps/api/Dockerfile.sandbox .
```

3. Check permissions:
```bash
ls -la /var/run/docker.sock
docker-compose exec api id
```

### Database Connection Failed

**Symptoms:**
- API errors
- Health check fails

**Solutions:**

1. Check PostgreSQL:
```bash
docker-compose ps db
docker-compose logs db
```

2. Test connection:
```bash
docker-compose exec db psql -U openchain -c "SELECT 1"
```

3. Reset (WARNING: data loss):
```bash
docker-compose down -v
docker-compose up -d db
```

### NATS Connection Failed

**Symptoms:**
- Messages not delivered
- Events not received

**Solutions:**

1. Check NATS:
```bash
docker-compose ps nats
docker-compose logs nats
```

2. Test NATS:
```bash
docker-compose exec nats nats-server --version
```

3. Restart:
```bash
docker-compose restart nats
```

### WebSocket Connection Failed

**Symptoms:**
- No real-time updates
- Chat not working

**Solutions:**

1. Check API:
```bash
curl http://localhost:3000/health
```

2. Test WebSocket:
```bash
wscat -c ws://localhost:3000/api/v1/ws
```

3. Check firewall:
```bash
sudo ufw status | grep 3000
```

### Performance Issues

**Symptoms:**
- Slow responses
- High CPU usage

**Solutions:**

1. Monitor resources:
```bash
docker stats
top
```

2. Optimize queries:
```bash
# Check slow queries
docker-compose exec db psql -U openchain -c "SELECT query, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

3. Scale up:
```bash
# Edit docker-compose.yml
# Increase replicas
# Add more resources
```

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request body |
| 401 | Unauthorized | Check JWT token |
| 403 | Forbidden | Check permissions |
| 404 | Not Found | Check resource ID |
| 423 | Locked | Circuit breaker triggered |
| 500 | Server Error | Check logs |
| 502 | Bad Gateway | Check upstream |
| 503 | Service Unavailable | Check health |

## Debug Mode

### Enable Debug Logging

```bash
# Edit docker-compose.yml
environment:
  - LOG_LEVEL=debug
```

### API Debug

```bash
# Enable request logging
curl -v http://localhost:3000/api/v1/agents
```

### Database Debug

```bash
# Enable query logging
docker-compose exec db psql -U openchain -c "ALTER SYSTEM SET log_statement = 'all';"
docker-compose restart db
```

## Getting Help

1. Check logs: `docker-compose logs -f`
2. Check health: `curl http://localhost:3000/health`
3. Check docs: https://docs.open-chain-ai.com
4. Open issue: https://github.com/YOUR-USERNAME/open-chain-ai/issues

## Emergency Procedures

### System Down

1. Check services: `docker-compose ps`
2. Check logs: `docker-compose logs -f`
3. Restart: `docker-compose restart`
4. If still down: `docker-compose down && docker-compose up -d`

### Data Loss

1. Check backups: `ls -la backups/`
2. Restore from backup
3. Contact support

### Security Incident

1. Stop services: `docker-compose down`
2. Check logs: `docker-compose logs | grep ERROR`
3. Change secrets
4. Restart: `docker-compose up -d`
5. Report: https://github.com/YOUR-USERNAME/open-chain-ai/security
