# Mission Control - Live Agent Monitor

Real-time monitoring dashboard for OpenClaw agents with live data integration.

## Overview

Mission Control provides a visual interface for monitoring OpenClaw agents in real-time. It connects to the OpenClaw system to display active sessions, subagents, and their status.

## Architecture

```
mission-control-live/
├── backend/          # Express.js API server with WebSocket
├── frontend/         # Live dashboard HTML/JS
├── monitoring/       # Agent status collection scripts
└── README.md         # This file
```

## Quick Start

### 1. Start the Backend Server

```bash
cd backend
npm install
npm start
```

The server will start on port 8080:
- REST API: http://localhost:8080/api/agents
- WebSocket: ws://localhost:8080/ws
- Health Check: http://localhost:8080/api/health

### 2. Open the Dashboard

Open `frontend/index.html` in a browser, or serve it with a local server:

```bash
cd frontend
python3 -m http.server 3000
# Then open http://localhost:3000
```

### 3. Monitor Agents (Optional)

Use the monitoring scripts to view agent data in the terminal:

```bash
# Bash version
cd monitoring
chmod +x agent-monitor.sh
./agent-monitor.sh monitor

# Node.js version
node agent-monitor.js monitor
```

## API Endpoints

### REST API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agents` | GET | Get all agents and metrics |
| `/api/agents/:id` | GET | Get specific agent details |
| `/api/metrics` | GET | Get system metrics only |
| `/api/health` | GET | Health check |

### WebSocket

Connect to `ws://localhost:8080/ws` for real-time updates.

**Message Types:**
- `init` - Initial data on connection
- `update` - Periodic updates (every 5 seconds)

## Data Structure

### Agent Object

```javascript
{
  id: "triage",
  name: "Triage",
  model: "GPT-5-nano",
  status: "active",        // active, thinking, idle, error
  task: "System health check",
  tokens: 1250,
  duration: "45s",
  lastActivity: "2026-03-18T02:37:00Z",
  type: "session"          // session, subagent, simulated
}
```

### Metrics Object

```javascript
{
  totalAgents: 8,
  activeAgents: 3,
  totalTokens: 45000,
  successRate: 98.5
}
```

## Features

### Live Dashboard
- **Real-time Updates**: WebSocket connection for instant status changes
- **Visual Bubbles**: Floating agent representation with status colors
- **Connection Lines**: Visual links between related agents
- **Stats Overlay**: System-wide metrics display
- **Agent Details**: Click any agent for detailed information
- **Error Handling**: Graceful fallback to simulated data

### Status Colors
- 🟢 **Active**: Agent is working
- 🟡 **Thinking**: Agent is processing
- ⚪ **Idle**: Agent is waiting
- 🔴 **Error**: Agent encountered an error

### Data Sources

The system attempts to connect to OpenClaw in this order:
1. **Live Data**: Real OpenClaw sessions and subagents
2. **Simulated Data**: Fallback when OpenClaw is unavailable

The dashboard shows the current data source (LIVE or SIMULATED) in the top-left corner.

## Configuration

### Backend

Environment variables:
- `PORT` - Server port (default: 8080)

### Monitoring Scripts

Environment variables:
- `API_URL` - API server URL (default: http://localhost:8080)
- `UPDATE_INTERVAL` - Update interval in ms (default: 5000)
- `LOG_LEVEL` - Log level: debug, info (default: info)

## Troubleshooting

### Dashboard shows "Disconnected"
- Ensure the backend server is running on port 8080
- Check browser console for WebSocket errors
- Click "Reconnect" button to retry connection

### Shows "SIMULATED" instead of "LIVE"
- OpenClaw CLI may not be available or configured
- The system falls back to simulated data automatically
- Check that `openclaw` command works in terminal

### API Server Won't Start
- Check if port 8080 is already in use
- Try a different port: `PORT=3000 npm start`
- Check Node.js version (requires v14+)

## Development

### Backend Development

```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development

The frontend is a static HTML file. Simply refresh the browser after making changes.

For live reload:
```bash
npm install -g browser-sync
browser-sync start --server --files "frontend/*"
```

## Integration with OpenClaw

The backend attempts to fetch real data using:

```bash
openclaw sessions_list --json
openclaw subagents --json
```

If these commands fail, it falls back to simulated data.

## License

MIT