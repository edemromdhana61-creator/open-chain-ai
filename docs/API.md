# Open Chain AI - API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Agents

#### GET /agents
List all agents.

**Response:**
```json
{
  "agents": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "OpenClaw",
      "adapterType": "openclaw",
      "role": "CEO",
      "status": "working",
      "lastHeartbeat": "2026-04-29T08:00:00Z"
    }
  ]
}
```

#### POST /agents
Create a new agent.

**Body:**
```json
{
  "name": "Hermes",
  "adapterType": "hermes",
  "companyId": "550e8400-e29b-41d4-a716-446655440000",
  "role": "CTO"
}
```

#### GET /agents/:id
Get agent by ID.

#### PUT /agents/:id
Update agent.

#### DELETE /agents/:id
Delete agent.

#### POST /agents/:id/pause
Pause agent.

#### POST /agents/:id/resume
Resume agent.

### Tasks

#### GET /tasks
List all tasks.

#### POST /tasks
Create a new task.

**Body:**
```json
{
  "title": "Design API",
  "goalId": "550e8400-e29b-41d4-a716-446655440000",
  "priority": "high"
}
```

#### POST /tasks/:id/assign
Assign task to agent.

**Body:**
```json
{
  "assigneeId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### POST /tasks/:id/complete
Mark task as done.

#### POST /tasks/:id/revision
Increment revision count (max 3).

#### POST /tasks/:id/block
Block task.

### Heartbeats

#### POST /heartbeat
Send agent heartbeat.

**Body:**
```json
{
  "agentId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "healthy",
  "progress": 75
}
```

#### GET /heartbeat/:agentId
Get agent heartbeats.

### Messages

#### POST /messages
Send message.

**Body:**
```json
{
  "from": "550e8400-e29b-41d4-a716-446655440000",
  "to": "broadcast",
  "type": "status",
  "payload": {}
}
```

#### GET /messages
List messages (filter by from/to/threadId).

### Dashboard

#### GET /dashboard
Get dashboard overview.

**Response:**
```json
{
  "overview": {
    "companies": 1,
    "agents": 5,
    "goals": 3,
    "tasks": 12
  },
  "agentStatus": {
    "idle": 2,
    "working": 3
  },
  "budget": {
    "total": 500,
    "used": 120
  }
}
```

## WebSocket

Connect to:
```
ws://localhost:3000/api/v1/ws
```

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 404 | Not Found |
| 423 | Circuit Breaker Triggered |
| 500 | Server Error |
