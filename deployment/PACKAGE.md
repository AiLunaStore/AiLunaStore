# Mission Control Deployment Package

## Quick Start

### Option 1: One-Command Setup (Recommended)

```bash
cd deployment
./scripts/setup.sh
```

### Option 2: Manual Setup

```bash
cd deployment
npm install
cp .env.example .env
npm start
```

Then open: http://localhost:8080

---

## Package Contents

```
deployment/
├── server.js                    # Main server entry point
├── package.json                 # Dependencies and scripts
├── .env.example                 # Environment configuration template
├── README.md                    # Main documentation
│
├── backend/
│   └── integrated-agent-system.js   # Core agent system module
│
├── frontend/
│   ├── index.html               # Dashboard HTML
│   ├── styles.css               # Dashboard styles
│   └── app.js                   # Dashboard JavaScript
│
├── config/
│   ├── models.json              # Model definitions
│   ├── agents.json              # Agent configurations
│   ├── strategies.json          # Strategy definitions
│   └── fallback-chains.json     # Fallback chain configurations
│
├── scripts/
│   ├── setup.sh                 # One-command setup script
│   └── validate-config.js       # Configuration validator
│
├── tests/
│   ├── integration.test.js      # API integration tests
│   └── cost-savings.test.js     # Cost savings verification
│
└── docs/
    ├── API.md                   # API documentation
    └── TROUBLESHOOTING.md       # Troubleshooting guide
```

---

## Features

### ✅ Integrated Agent System
- Confidence-based task routing
- Cost optimization (23-60% savings)
- Progressive refinement
- Intelligent fallback chains

### ✅ Real-time Dashboard
- Live cost visualization
- Budget monitoring with alerts
- Agent status tracking
- Performance metrics
- WebSocket-powered updates

### ✅ Production Ready
- Security middleware (Helmet, CORS, rate limiting)
- Error handling and recovery
- Comprehensive logging
- Health checks
- Graceful shutdown

### ✅ Easy Deployment
- One-command setup
- Environment configuration
- Comprehensive documentation
- Troubleshooting guide

---

## System Requirements

- Node.js 18+
- npm or yarn
- 512MB RAM minimum
- 100MB disk space

---

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and customize:

```env
PORT=8080
DEFAULT_BUDGET=10.00
EXECUTION_MODE=progressive
CORS_ORIGINS=http://localhost:3000
```

### Agent Configuration

Edit files in `config/` directory:
- `models.json` - Add/modify models
- `agents.json` - Configure agents
- `strategies.json` - Define strategies
- `fallback-chains.json` - Set fallback paths

---

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Validate configuration
npm run validate
```

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| GET /api/health | Health check |
| GET /api/agents | List agents |
| GET /api/metrics | Dashboard metrics |
| POST /api/execute | Execute task |

WebSocket: `ws://localhost:8080/ws`

---

## Cost Savings

| Metric | Kimi Only | Optimized | Savings |
|--------|-----------|-----------|---------|
| Avg Cost/Task | $0.0057 | $0.0025 | **56%** |
| 100 Tasks | $0.57 | $0.25 | $0.32 |
| 1000 Tasks | $5.70 | $2.50 | $3.20 |

---

## Support

- Documentation: `docs/`
- Troubleshooting: `docs/TROUBLESHOOTING.md`
- API Reference: `docs/API.md`

## License

MIT
