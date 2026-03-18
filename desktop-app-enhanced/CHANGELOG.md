# Changelog

All notable changes to OpenClaw Mission Control will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-18

### Added
- Initial release of OpenClaw Mission Control
- **Server Status Monitoring**
  - Visual LED indicator in title bar (green/yellow/red)
  - Automatic health checks every 30 seconds
  - Connection details modal
  - Auto-reconnection with exponential backoff
  - Offline mode support
- **Auto-Update System**
  - GitHub Releases integration
  - In-app updater with progress bar
  - System tray notifications
  - One-click install and restart
  - Manual update check
- **Agent Control Panel**
  - Start/stop/restart agents
  - Real-time status monitoring
  - Agent logs with filtering
  - Performance metrics per agent
- **Task Management**
  - Task timeline visualization
  - Filter by status (pending, running, completed, failed)
  - Export tasks to JSON/CSV
  - Real-time updates via WebSocket
- **Performance Dashboard**
  - Token usage graphs
  - Response time charts
  - System metrics overview
  - Historical data (1h, 24h, 7d)
- **User Experience**
  - First-run interactive tutorial
  - Light/Dark/System theme support
  - Collapsible sidebar
  - Keyboard shortcuts
  - Desktop notifications
  - Minimize to system tray
- **Cross-Platform Support**
  - macOS (Intel & Apple Silicon)
  - Windows (64-bit & 32-bit)
  - Linux (AppImage & DEB)

### Technical
- Electron 28.0.0
- electron-updater for auto-updates
- electron-store for preferences
- WebSocket for real-time communication
- Canvas-based charts
- Secure preload script architecture

## [Unreleased]

### Planned
- Plugin system for custom widgets
- Advanced filtering and search
- Multi-server support
- Mobile companion app sync
- Custom dashboard layouts
- Agent grouping and tags
- Alert rules and webhooks
