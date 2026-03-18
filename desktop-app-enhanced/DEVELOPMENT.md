# OpenClaw Mission Control - Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

## Development Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the app |
| `npm run dev` | Start with dev tools and logging |
| `npm run build` | Build for current platform |
| `npm run build:mac` | Build for macOS |
| `npm run build:win` | Build for Windows |
| `npm run build:linux` | Build for Linux |
| `npm run dist` | Alias for build |

## Project Architecture

### Main Process (Node.js)

Located in `src/main/`:

- **main.js** - Application entry point
  - Window management
  - IPC handlers
  - Menu/tray setup
  - Auto-updater integration

- **server-monitor.js** - Server connection monitoring
  - Health check polling
  - WebSocket management
  - Reconnection logic

- **agent-controller.js** - Agent lifecycle
  - API communication
  - Agent state management
  - Task operations

### Renderer Process (Chromium)

Located in `src/renderer/`:

- **index.html** - Main UI structure
- **styles.css** - All styling with CSS variables for theming
- **app.js** - UI logic and event handling

### Preload Script

- **preload.js** - Secure bridge between main and renderer
  - Exposes limited API via `contextBridge`
  - All IPC communication defined here

## Key Features Implementation

### Server Status Monitoring

The `ServerMonitor` class handles:
- Periodic health checks (default 30s)
- Visual status LED updates
- Exponential backoff reconnection
- WebSocket for real-time updates

```javascript
// In main process
const monitor = new ServerMonitor({
  serverUrl: 'http://localhost:3000',
  pingInterval: 30000,
  onStatusChange: (status) => { /* update UI */ }
});
```

### Auto-Update System

Uses `electron-updater` with GitHub Releases:

```javascript
// Configuration in package.json
"publish": {
  "provider": "github",
  "owner": "thizz23much",
  "repo": "openclaw-mission-control"
}
```

Events:
- `checking-for-update` - Started checking
- `update-available` - New version found
- `download-progress` - Download percentage
- `update-downloaded` - Ready to install

### Theming

CSS variables in `:root` support light/dark modes:

```css
:root {
  --bg-primary: #ffffff;
  --text-primary: #0f172a;
  /* ... */
}

[data-theme="dark"] {
  --bg-primary: #0f172a;
  --text-primary: #f8fafc;
  /* ... */
}
```

Toggle via `document.documentElement.setAttribute('data-theme', 'dark')`

### Keyboard Shortcuts

Defined in `app.js`:

```javascript
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === '1') {
    this.switchView('dashboard');
  }
  // ...
});
```

## IPC Communication

### Main → Renderer

```javascript
// Main process
mainWindow.webContents.send('channel', data);

// Renderer process (via preload)
window.electronAPI.channel.onEvent((data) => { });
```

### Renderer → Main

```javascript
// Renderer process (via preload)
const result = await window.electronAPI.channel.action(params);

// Main process
ipcMain.handle('channel:action', (event, params) => {
  return result;
});
```

## Adding New Views

1. Add nav item in `index.html`:
```html
<li class="nav-item" data-view="newview">
  <span class="nav-icon">🔧</span>
  <span class="nav-label">New View</span>
</li>
```

2. Add view container:
```html
<div class="view" id="newviewView">
  <!-- content -->
</div>
```

3. Add switch case in `app.js`:
```javascript
switchView(viewName) {
  // ...
  if (viewName === 'newview') {
    this.initNewView();
  }
}
```

## Building Releases

### Prerequisites

- macOS: Xcode Command Line Tools
- Windows: Windows SDK
- Linux: build-essential

### Environment Variables

```bash
# GitHub token for publishing
# Set your GitHub token as environment variable
# export GH_TOKEN=your_actual_token_here

# Code signing (macOS)
# export CSC_LINK=path/to/certificate.p12
# export CSC_KEY_PASSWORD=your_certificate_password

# Code signing (Windows)
# export WIN_CSC_LINK=path/to/certificate.p12
# export WIN_CSC_KEY_PASSWORD=your_certificate_password
```

### Build Commands

```bash
# Build all platforms
npm run build

# Build specific platform
npm run build:mac
npm run build:win
npm run build:linux

# Publish to GitHub (requires GH_TOKEN)
npm run build -- --publish always
```

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Debugging

### Main Process

```bash
# Run with dev tools
npm run dev

# Or attach debugger
node --inspect=5858 node_modules/.bin/electron .
```

### Renderer Process

DevTools open automatically in development mode (`NODE_ENV=development`).

### Logs

Location varies by platform:

- **macOS**: `~/Library/Logs/openclaw-mission-control/`
- **Windows**: `%APPDATA%\openclaw-mission-control\logs\`
- **Linux**: `~/.config/openclaw-mission-control/logs/`

## Common Issues

### Build Failures

1. Clear node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```

2. Rebuild native modules:
```bash
npm run postinstall
```

### Code Signing

macOS requires notarization for distribution:

```bash
# Set env vars
# export APPLE_ID=your@email.com
# export APPLE_ID_PASSWORD=your_app_specific_password
# export TEAM_ID=your_team_id
```

### Auto-Update Not Working

1. Verify `publish` config in package.json
2. Check GitHub token has `repo` scope
3. Ensure release is published (not draft)
4. Check version follows semver

## Best Practices

1. **Always use preload script** - Never enable `nodeIntegration`
2. **Validate IPC inputs** - Sanitize all data from renderer
3. **Handle errors gracefully** - Show user-friendly messages
4. **Use CSS variables** - For consistent theming
5. **Clean up listeners** - Remove IPC listeners on unload
6. **Test on all platforms** - Before releasing

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [electron-builder](https://www.electron.build/)
- [electron-updater](https://www.electron.build/auto-update)
- [Security Best Practices](https://www.electronjs.org/docs/tutorial/security)
