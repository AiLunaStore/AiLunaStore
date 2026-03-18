# Icon Generation Script

This directory contains the application icons for all platforms.

## Icon Files Required

### macOS
- `icon.icns` - Main app icon (1024x1024 source, multiple sizes)
- `trayTemplate.png` - Tray icon (16x16, 32x32 @2x, should be template style)

### Windows
- `icon.ico` - Main app icon (256x256, 128x128, 64x64, 48x48, 32x32, 16x16)
- `tray.ico` - Tray icon (16x16, 32x32)

### Linux
- `icon.png` - Main app icon (512x512, 256x256, 128x128, 64x64, 48x48, 32x32, 16x16)
- `tray.png` - Tray icon (22x22, 24x24)

## Icon Design

The Mission Control icon should represent:
- A mission control / dashboard concept
- Agent monitoring / orchestration
- Modern, clean design
- Dark theme compatibility

## Recommended Tools

1. **Figma** - Design the source icon
2. **Icon Kitchen** (https://icon.kitchen) - Generate platform-specific icons
3. **Iconset** - macOS icon management
4. **icns Creator** - Create .icns files for macOS

## Quick Generation

You can use the following ImageMagick commands to create placeholder icons:

```bash
# macOS icon.png (1024x1024)
convert -size 1024x1024 xc:'#0a0a0f' -pointsize 400 -fill '#63b3ed' -gravity center -annotate +0+0 "🎯" icon.png

# Convert to .icns (requires iconutil on macOS)
mkdir icon.iconset
cp icon.png icon.iconset/icon_512x512@2x.png
sips -z 512 512 icon.png --out icon.iconset/icon_512x512.png
sips -z 256 256 icon.png --out icon.iconset/icon_256x256.png
sips -z 128 128 icon.png --out icon.iconset/icon_128x128.png
sips -z 64 64 icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 32 32 icon.png --out icon.iconset/icon_32x32.png
sips -z 16 16 icon.png --out icon.iconset/icon_16x16.png
iconutil -c icns icon.iconset -o icon.icns

# Windows .ico
convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico

# Tray icons
convert -size 32x32 xc:'#0a0a0f' -pointsize 20 -fill '#63b3ed' -gravity center -annotate +0+0 "🎯" tray.png
convert tray.png tray.ico
```

## Note

For production, create a proper designed icon. Placeholder icons are provided for development.
