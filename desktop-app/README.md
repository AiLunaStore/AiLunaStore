# Mission Control Desktop

A desktop application wrapper for the Mission Control agent monitoring dashboard, built with Electron.

![Mission Control](screenshot.png)

## Features

- 🎯 **Agent Dashboard** - Visualize your OpenClaw agents as floating bubbles
- 🔔 **Desktop Notifications** - Get alerted when agent status changes
- 📊 **System Tray** - Quick access from the menu bar
- ⚙️ **Settings Panel** - Customize refresh rate, theme, and behavior
- 🔄 **Auto-updates** - Automatic updates via GitHub releases
- 🚀 **Auto-start** - Launch on login option
- ⌨️ **Keyboard Shortcuts** - Quick access to common actions

## Installation

### macOS

Download the latest `.dmg` from [Releases](../../releases) and drag Mission Control to your Applications folder.

**Supports:** macOS 10.15+ (Intel & Apple Silicon)

### Windows

Download the latest `.exe` installer from [Releases](../../releases) and run it.

**Supports:** Windows 10/11 (64-bit)

### Linux

Download the latest `.AppImage` or `.deb` from [Releases](../../releases).

**Supports:** Ubuntu 18.04+, Debian 10+, Fedora 32+

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
cd desktop-app
npm install
```

### Run in Development Mode

```bash
npm run dev
```

### Build for Production

```bash
# Build for all platforms
npm run build

# Build for specific platform
npm run build:mac      # macOS (universal)
npm run build:mac-arm  # macOS (Apple Silicon only)
npm run build:win      # Windows
npm run build:linux    # Linux
```

## Project Structure

```
desktop-app/
├── main.js              # Electron main process
├── preload.js           # Secure preload script
├── index.html           # Main dashboard window
├── settings.html        # Settings panel
├── package.json         # Dependencies and build config
├── build/               # Build configuration
│   └── entitlements.mac.plist
└── icons/               # App icons
    ├── icon.icns        # macOS icon
    ├── icon.ico         # Windows icon
    ├── icon.png         # Linux icon
    └── tray.png         # Tray icon
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + ,` | Open Settings |
| `Cmd/Ctrl + N` | New Window |
| `Cmd/Ctrl + W` | Close Window |
| `Cmd/Ctrl + E` | Export Stats |
| `Cmd/Ctrl + R` | Reload |
| `F12` | Toggle Developer Tools |
| `Cmd/Ctrl + +` | Zoom In |
| `Cmd/Ctrl + -` | Zoom Out |
| `Cmd/Ctrl + 0` | Reset Zoom |
| `Esc` | Close Detail Modal |

## Settings

Access settings via:
- Menu: `File > Preferences` or `Edit > Preferences`
- Tray: Right-click tray icon > Settings
- Keyboard: `Cmd/Ctrl + ,`

### Available Options

- **Launch on Login** - Start automatically when you log in
- **Show in Dock** - Display app icon in dock/taskbar
- **Minimize to Tray** - Hide to tray when minimized
- **Refresh Rate** - How often to update agent data (500ms - 10s)
- **Theme** - Dark, Light, or Auto (system)
- **Always on Top** - Keep window above other apps
- **Notifications** - Enable/disable desktop notifications
- **Auto-update** - Automatically download and install updates

## Auto-Updates

The app checks for updates automatically on startup. When an update is available:

1. You'll receive a notification
2. The update downloads in the background
3. You'll be prompted to restart when ready

You can also manually check for updates via:
- Menu: `Help > Check for Updates`
- Tray: Right-click tray icon > Check for Updates

## Troubleshooting

### App won't start

1. Check that you have the correct version for your platform
2. On macOS, ensure the app is not quarantined: `xattr -d com.apple.quarantine /Applications/Mission\ Control.app`
3. Check the logs: `~/Library/Logs/Mission Control/` (macOS) or `%APPDATA%\Mission Control\logs\` (Windows)

### Notifications not showing

1. Check that notifications are enabled in Settings
2. On macOS, check System Preferences > Notifications > Mission Control
3. On Windows, check Settings > System > Notifications

### High CPU usage

1. Increase the refresh rate in Settings (try 5000ms)
2. Reduce the number of displayed agents
3. Disable connections visualization

## Building from Source

### macOS Code Signing (Optional)

To code sign the macOS app:

```bash
export CSC_LINK=/path/to/certificate.p12
export CSC_KEY_PASSWORD=certificate_password
npm run build:mac
```

### Notarization (macOS)

For distribution outside the App Store:

```bash
export APPLE_ID=your@email.com
export APPLE_APP_SPECIFIC_PASSWORD=app-specific-password
export APPLE_TEAM_ID=your-team-id
npm run build:mac
```

## License

MIT License - See [LICENSE](../LICENSE) for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

- Issues: [GitHub Issues](../../issues)
- Discussions: [GitHub Discussions](../../discussions)
