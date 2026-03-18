const { app, BrowserWindow, Tray, Menu, ipcMain, dialog, shell, nativeImage, Notification } = require('electron');
const path = require('path');
const Store = require('electron-store');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');

// Configure logging
log.transports.file.level = 'info';
log.transports.console.level = 'debug';

// Initialize settings store
const store = new Store({
  defaults: {
    refreshRate: 2000,
    theme: 'dark',
    startup: false,
    notifications: true,
    windowBounds: { width: 1200, height: 800 },
    alwaysOnTop: false,
    showInDock: true
  }
});

// Global references
let mainWindow = null;
let settingsWindow = null;
let tray = null;
let isQuitting = false;

// App metadata
const appName = 'Mission Control';
const appVersion = app.getVersion();

// ==================== WINDOW MANAGEMENT ====================

function createMainWindow() {
  const bounds = store.get('windowBounds');
  
  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    minWidth: 800,
    minHeight: 600,
    title: appName,
    icon: getIconPath(),
    show: false, // Don't show until ready
    backgroundColor: '#0a0a0f',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    },
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    alwaysOnTop: store.get('alwaysOnTop'),
    vibrancy: process.platform === 'darwin' ? 'under-window' : undefined,
    transparent: process.platform === 'darwin',
    visualEffectState: 'active'
  });

  // Load the app
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Save window bounds on resize/move
  const saveBounds = () => {
    if (mainWindow && !mainWindow.isMinimized()) {
      store.set('windowBounds', mainWindow.getBounds());
    }
  };
  
  mainWindow.on('resize', saveBounds);
  mainWindow.on('move', saveBounds);

  // Handle close button (minimize to tray instead)
  mainWindow.on('close', (event) => {
    if (!isQuitting && process.platform !== 'darwin') {
      event.preventDefault();
      mainWindow.hide();
      log.info('Window hidden to tray');
    }
  });

  // Handle window minimize
  mainWindow.on('minimize', (event) => {
    if (store.get('minimizeToTray')) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  return mainWindow;
}

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 500,
    height: 600,
    title: 'Settings - Mission Control',
    icon: getIconPath(),
    parent: mainWindow,
    modal: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  settingsWindow.loadFile(path.join(__dirname, 'settings.html'));

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

// ==================== TRAY MANAGEMENT ====================

function createTray() {
  const iconPath = getTrayIconPath();
  tray = new Tray(iconPath);
  
  tray.setToolTip(appName);
  updateTrayMenu();

  // Toggle window on tray click (macOS: Cmd+click, Windows/Linux: click)
  tray.on('click', (event, bounds) => {
    if (process.platform === 'darwin' && event.metaKey) {
      toggleWindow();
    } else if (process.platform !== 'darwin') {
      toggleWindow();
    }
  });

  tray.on('double-click', toggleWindow);
  tray.on('right-click', () => {
    tray.popUpContextMenu();
  });
}

function updateTrayMenu() {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Mission Control',
      click: showWindow
    },
    {
      label: 'Hide Mission Control',
      click: hideWindow
    },
    { type: 'separator' },
    {
      label: 'Settings...',
      click: createSettingsWindow
    },
    { type: 'separator' },
    {
      label: 'Check for Updates',
      click: checkForUpdates
    },
    { type: 'separator' },
    {
      label: `Version ${appVersion}`,
      enabled: false
    },
    {
      label: 'Quit',
      accelerator: 'Command+Q',
      click: quitApp
    }
  ]);

  tray.setContextMenu(contextMenu);
}

function toggleWindow() {
  if (mainWindow) {
    if (mainWindow.isVisible() && mainWindow.isFocused()) {
      hideWindow();
    } else {
      showWindow();
    }
  } else {
    createMainWindow();
  }
}

function showWindow() {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
  } else {
    createMainWindow();
  }
}

function hideWindow() {
  if (mainWindow) {
    mainWindow.hide();
  }
}

// ==================== MENU BAR ====================

function createApplicationMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',
          click: createMainWindow
        },
        {
          label: 'Close Window',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            if (mainWindow) mainWindow.close();
          }
        },
        { type: 'separator' },
        {
          label: 'Export Stats',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-export-stats');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: quitApp
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'CmdOrCtrl+,',
          click: createSettingsWindow
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) mainWindow.webContents.reload();
          }
        },
        {
          label: 'Force Reload',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            if (mainWindow) mainWindow.webContents.reloadIgnoringCache();
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'F12',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.toggleDevTools();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Actual Size',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            if (mainWindow) mainWindow.webContents.setZoomLevel(0);
          }
        },
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            if (mainWindow) {
              const level = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(level + 1);
            }
          }
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            if (mainWindow) {
              const level = mainWindow.webContents.getZoomLevel();
              mainWindow.webContents.setZoomLevel(level - 1);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Toggle Full Screen',
          accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11',
          click: () => {
            if (mainWindow) {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          }
        },
        {
          label: 'Always on Top',
          type: 'checkbox',
          checked: store.get('alwaysOnTop'),
          click: (menuItem) => {
            store.set('alwaysOnTop', menuItem.checked);
            if (mainWindow) {
              mainWindow.setAlwaysOnTop(menuItem.checked);
            }
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: 'Show in Tray',
          click: hideWindow
        },
        { type: 'separator' },
        {
          label: 'Bring All to Front',
          role: 'front'
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: () => {
            shell.openExternal('https://github.com/levinolonan/mission-control-desktop#readme');
          }
        },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/levinolonan/mission-control-desktop/issues');
          }
        },
        { type: 'separator' },
        {
          label: 'Check for Updates',
          click: checkForUpdates
        },
        { type: 'separator' },
        {
          label: 'About Mission Control',
          click: showAboutDialog
        }
      ]
    }
  ];

  // macOS-specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: appName,
      submenu: [
        {
          label: `About ${appName}`,
          click: showAboutDialog
        },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'Cmd+,',
          click: createSettingsWindow
        },
        { type: 'separator' },
        {
          label: 'Services',
          role: 'services',
          submenu: []
        },
        { type: 'separator' },
        {
          label: `Hide ${appName}`,
          accelerator: 'Cmd+H',
          role: 'hide'
        },
        {
          label: 'Hide Others',
          accelerator: 'Cmd+Shift+H',
          role: 'hideothers'
        },
        {
          label: 'Show All',
          role: 'unhide'
        },
        { type: 'separator' },
        {
          label: `Quit ${appName}`,
          accelerator: 'Cmd+Q',
          click: quitApp
        }
      ]
    });

    // Window menu
    template[4].submenu.push(
      { type: 'separator' },
      {
        label: 'Bring All to Front',
        role: 'front'
      }
    );
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ==================== NOTIFICATIONS ====================

function showNotification(title, body, options = {}) {
  if (!store.get('notifications')) return;

  const notification = new Notification({
    title,
    body,
    icon: getIconPath(),
    silent: options.silent || false,
    urgency: options.urgency || 'normal'
  });

  notification.on('click', () => {
    showWindow();
  });

  notification.show();
}

function notifyAgentStatus(agentName, status, message) {
  const statusIcons = {
    active: '✅',
    thinking: '💭',
    idle: '⏸️',
    error: '❌'
  };

  const icon = statusIcons[status] || 'ℹ️';
  showNotification(
    `${icon} Agent Status Change`,
    `${agentName} is now ${status}: ${message}`,
    { urgency: status === 'error' ? 'critical' : 'normal' }
  );
}

// ==================== UPDATES ====================

function checkForUpdates() {
  log.info('Checking for updates...');
  
  autoUpdater.checkForUpdatesAndNotify().catch(err => {
    log.error('Update check failed:', err);
    dialog.showErrorBox('Update Error', 'Failed to check for updates. Please try again later.');
  });
}

function setupAutoUpdater() {
  autoUpdater.logger = log;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for update...');
  });

  autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info);
    showNotification(
      'Update Available',
      `Version ${info.version} is available and will be downloaded.`
    );
  });

  autoUpdater.on('update-not-available', () => {
    log.info('Update not available');
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'No Updates',
      message: 'You are running the latest version.',
      detail: `Current version: ${appVersion}`
    });
  });

  autoUpdater.on('error', (err) => {
    log.error('Update error:', err);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    log.info(`Download progress: ${progressObj.percent}%`);
  });

  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded:', info);
    showNotification(
      'Update Ready',
      'The update will be installed when you quit the app.'
    );
    
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: 'A new version has been downloaded.',
      detail: 'The update will be installed when you restart the application.',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0
    }).then(({ response }) => {
      if (response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });
}

// ==================== UTILITY FUNCTIONS ====================

function getIconPath() {
  const iconName = process.platform === 'win32' ? 'icon.ico' : 'icon.png';
  return path.join(__dirname, 'icons', iconName);
}

function getTrayIconPath() {
  const iconName = process.platform === 'darwin' 
    ? 'trayTemplate.png' 
    : process.platform === 'win32' 
      ? 'tray.ico' 
      : 'tray.png';
  return path.join(__dirname, 'icons', iconName);
}

function showAboutDialog() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: `About ${appName}`,
    message: appName,
    detail: `Version: ${appVersion}\n\nA desktop application for monitoring OpenClaw agents.\n\nBuilt with Electron.`,
    buttons: ['OK', 'Visit Website'],
    defaultId: 0
  }).then(({ response }) => {
    if (response === 1) {
      shell.openExternal('https://github.com/levinolonan/mission-control-desktop');
    }
  });
}

function quitApp() {
  isQuitting = true;
  app.quit();
}

function setupStartup() {
  const loginItemSettings = app.getLoginItemSettings();
  
  if (store.get('startup') !== loginItemSettings.openAtLogin) {
    app.setLoginItemSettings({
      openAtLogin: store.get('startup'),
      openAsHidden: true,
      path: app.getPath('exe')
    });
  }
}

// ==================== IPC HANDLERS ====================

ipcMain.handle('get-settings', () => {
  return store.store;
});

ipcMain.handle('set-setting', (event, key, value) => {
  store.set(key, value);
  
  // Apply certain settings immediately
  if (key === 'alwaysOnTop' && mainWindow) {
    mainWindow.setAlwaysOnTop(value);
  }
  
  if (key === 'startup') {
    app.setLoginItemSettings({
      openAtLogin: value,
      openAsHidden: true
    });
  }
  
  return true;
});

ipcMain.handle('reset-settings', () => {
  store.clear();
  return store.store;
});

ipcMain.handle('show-notification', (event, title, body, options) => {
  showNotification(title, body, options);
  return true;
});

ipcMain.handle('notify-agent-status', (event, agentName, status, message) => {
  notifyAgentStatus(agentName, status, message);
  return true;
});

ipcMain.handle('check-updates', () => {
  checkForUpdates();
  return true;
});

ipcMain.handle('get-app-version', () => {
  return appVersion;
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('write-file', async (event, filePath, data) => {
  const fs = require('fs').promises;
  await fs.writeFile(filePath, data, 'utf8');
  return true;
});

ipcMain.handle('open-external', (event, url) => {
  shell.openExternal(url);
  return true;
});

ipcMain.handle('quit-app', () => {
  quitApp();
  return true;
});

// ==================== APP EVENTS ====================

app.whenReady().then(() => {
  log.info('App starting...');
  
  createMainWindow();
  createTray();
  createApplicationMenu();
  setupAutoUpdater();
  setupStartup();

  // Check for updates on startup (after 5 seconds)
  setTimeout(() => {
    if (process.env.NODE_ENV !== 'development') {
      autoUpdater.checkForUpdates();
    }
  }, 5000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    } else {
      showWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  // Cleanup
  if (tray) {
    tray.destroy();
  }
});

// Handle second instance (Windows/Linux)
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    showWindow();
  });
}

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});
