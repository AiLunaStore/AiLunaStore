# OpenClaw Mission Control

Enhanced desktop application for managing OpenClaw agents with real-time monitoring, auto-updates, and comprehensive system control.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Electron](https://img.shields.io/badge/electron-28.0.0-9feaf9)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### 🔌 Server Status Monitoring
- **Visual LED indicator** in title bar (green=live, yellow=connecting, red=offline)
- **Automatic health checks** every 30 seconds
- **Connection details modal** with latency metrics
- **Auto-reconnection** with exponential backoff
- **Offline mode** support

### ⬆️ Auto-Update System
- **GitHub Releases integration** - automatic update checking
- **In-app updater** with download progress
- **System tray notifications** for available updates
- **One-click install** and restart
- **Manual update check** via settings

### 🤖 Agent Control Panel
- **Start/stop/restart** agents with one click
- **Real-time status** monitoring
- **Agent logs** with filtering
- **Performance metrics** per agent

### 📊 Task Management
- **Task timeline** visualization
- **Filter by status** (pending, running, completed, failed)
- **Export tasks** to JSON/CSV
- **Real-time updates** via WebSocket

### 📈 Performance Dashboard
- **Token usage graphs**
- **Response time charts**
- **System metrics** overview
- **Historical data** (1h, 24h, 7d)

### 🎨 User Experience
- **First-run tutorial** - interactive walkthrough
- **Light/Dark/System** theme support
- **Customizable layout** - collapsible sidebar
- **Keyboard shortcuts** for quick navigation
- **Desktop notifications** for critical events

## Installation

### Download Pre-built Binaries

Download the latest release from [GitHub Releases](https://github.com/thizz23much/openclaw-mission-control/releases).

Available for:
- macOS (Intel & Apple Silicon)
- Windows (64-bit & 32-bit)
- Linux (AppImage & DEB)

### Build from Source

```bash
# Clone the repository
git clone https://github.com/thizz23much/openclaw-mission-control.git
cd openclaw-mission-control

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for current platform
npm run build

# Build for specific platforms
npm run build:mac
npm run build:win
npm run build:linux
```

## Configuration

### Server Settings

1. Open **Settings** view (⚙️ icon or `Ctrl/Cmd + ,`)
2. Configure **Server URL** (default: `http://localhost:3000`)
3. Adjust **Ping Interval** (default: 30 seconds)
4. Click **Save**

### Appearance

- **Theme**: System Default, Light, or Dark
- **Minimize to tray**: Keep app running in background
- **Sidebar**: Collapsible for more workspace

### Notifications

- Enable/disable desktop notifications
- Configure alerts for server disconnects
- Update notifications

### Auto-Update

- Automatically download updates (enabled by default)
- Manual check via Settings or system tray menu

## Usage

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + 1` | Dashboard view |
| `Ctrl/Cmd + 2` | Agents view |
| `Ctrl/Cmd + 3` | Tasks view |
| `Ctrl/Cmd + 4` | Performance view |
| `Ctrl/Cmd + 5` | Logs view |
| `Ctrl/Cmd + ,` | Settings view |
| `Ctrl/Cmd + R` | Refresh data |
| `Esc` | Close modals |

### Managing Agents

1. Navigate to **Agents** view (`Ctrl/Cmd + 2`)
2. View all connected agents with their status
3. Click **Start**, **Stop**, or **Restart** to control agents
4. View agent details including uptime and task count

### Monitoring Tasks

1. Navigate to **Tasks** view (`Ctrl/Cmd + 3`)
2. View task timeline with status indicators
3. Filter by status using dropdown
4. Export tasks using **Export** button

### Viewing Performance

1. Navigate to **Performance** view (`Ctrl/Cmd + 4`)
2. View token usage and response time charts
3. Select time period (1h, 24h, 7d)

## Development

### Project Structure

```
desktop-app-enhanced/
├── src/
│   ├── main/              # Main process (Node.js)
│   │   ├── main.js        # Entry point
│   │   ├── server-monitor.js    # Server connection monitoring
│   │   └── agent-controller.js  # Agent lifecycle management
│   ├── renderer/          # Renderer process (UI)
│   │   ├── index.html     # Main HTML
│   │   ├── styles.css     # Styles
│   │   └── app.js         # UI logic
│   ├── preload.js         # Preload script (secure bridge)
│   └── shared/            # Shared utilities
├── assets/                # Icons and images
├── build/                 # Build configuration
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

### Architecture

The app follows Electron's multi-process architecture:

- **Main Process** (`main.js`): Node.js environment with full system access
  - Server monitoring with WebSocket
  - Auto-updater integration
  - Agent control API
  - System notifications

- **Renderer Process** (`app.js`): Chromium environment for UI
  - React-like component structure
  - Canvas-based charts
  - Event-driven updates

- **Preload Script** (`preload.js`): Secure bridge between processes
  - Exposes limited API to renderer
  - All IPC communication goes through here

### API Integration

The app expects an OpenClaw server running with the following endpoints:

```
GET  /api/health           - Health check
GET  /api/agents           - List all agents
POST /api/agents/:id/start    - Start agent
POST /api/agents/:id/stop     - Stop agent
POST /api/agents/:id/restart  - Restart agent
GET  /api/agents/:id/logs     - Get agent logs
GET  /api/tasks            - List tasks
GET  /api/system/metrics   - System metrics
WS   /ws                   - WebSocket for real-time updates
```

## Auto-Update Configuration

Updates are distributed via GitHub Releases. To enable:

1. Ensure `publish` config in `package.json` is correct:
```json
"publish": {
  "provider": "github",
  "owner": "thizz23much",
  "repo": "openclaw-mission-control"
}
```

2. Create a GitHub personal access token with `repo` scope
3. Set `GH_TOKEN` environment variable
4. Run `npm run build` to create release artifacts
5. Upload to GitHub Releases

## Troubleshooting

### Server Connection Issues

1. Check server URL in Settings
2. Verify OpenClaw server is running
3. Check firewall/network settings
4. View connection details by clicking status LED

### Update Issues

1. Check internet connection
2. Verify GitHub Releases access
3. Check app logs: `%APPDATA%/openclaw-mission-control/logs` (Windows)
   - `~/Library/Logs/openclaw-mission-control` (macOS)
   - `~/.config/openclaw-mission-control/logs` (Linux)

### Performance Issues

1. Reduce ping interval in Settings
2. Clear logs periodically
3. Check system resources

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://github.com/thizz23much/openclaw-mission-control/wiki)
- 🐛 [Issue Tracker](https://github.com/thizz23much/openclaw-mission-control/issues)
- 💬 [Discussions](https://github.com/thizz23much/openclaw-mission-control/discussions)

---

Built with ❤️ for the OpenClaw ecosystem
