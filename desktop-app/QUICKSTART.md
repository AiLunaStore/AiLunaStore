# Quick Start

## Install Dependencies

```bash
cd desktop-app
npm install
```

## Run in Development

```bash
npm run dev
```

## Build for Production

```bash
# macOS (Universal - works on Intel and Apple Silicon)
npm run build:mac

# macOS (Apple Silicon only)
npm run build:mac-arm

# Windows
npm run build:win

# Linux
npm run build:linux

# All platforms
npm run build
```

## Project Structure

```
desktop-app/
├── main.js              # Electron main process
├── preload.js           # Secure IPC bridge
├── index.html           # Main dashboard
├── settings.html        # Settings panel
├── package.json         # Dependencies & build config
├── build/
│   └── entitlements.mac.plist  # macOS signing
└── icons/               # App icons
    ├── icon.icns        # macOS
    ├── icon.ico         # Windows
    ├── icon.png         # Linux
    └── tray.png         # System tray
```

## Features

- ✅ System tray integration
- ✅ Native menus (File, Edit, View, Window, Help)
- ✅ Settings panel with persistent storage
- ✅ Desktop notifications for agent status
- ✅ Auto-updater (GitHub releases)
- ✅ Auto-start on login
- ✅ Keyboard shortcuts
- ✅ Cross-platform (macOS, Windows, Linux)

## macOS Specific

- Optimized for Apple Silicon (M1/M2/M3)
- Hidden title bar with drag region
- Vibrancy effects
- Native menu bar
- Tray icon with template support

## Next Steps

1. Update `package.json` with your GitHub repo info for auto-updates
2. Replace placeholder icons with designed versions
3. Code sign the app for distribution (optional)
4. Create GitHub releases for auto-updater
