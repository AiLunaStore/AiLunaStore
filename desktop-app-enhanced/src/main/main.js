const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, dialog, Notification, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const Store = require('electron-store');
const log = require('electron-log');
const ServerMonitor = require('./server-monitor');
const AgentController = require('./agent-controller');

// Configure logging
log.transports.file.level = 'info';
log.transports.console.level = 'debug';

// Initialize store for preferences
const store = new Store({
  defaults: {
    windowBounds: { width: 1400, height: 900 },
    theme: 'system',
    serverUrl: 'http://localhost:8080',
    autoUpdate: true,
    notifications: true,
    firstRun: true,
    sidebarCollapsed: false,
    activeView: 'dashboard'
  }
});

class MissionControlApp {
  constructor() {
    this.mainWindow = null;
    this.tray = null;
    this.serverMonitor = null;
    this.agentController = null;
    this.isQuitting = false;
    this.updateAvailable = false;
    this.updateDownloaded = false;
  }

  async initialize() {
    await app.whenReady();

    // Setup IPC handlers FIRST before creating window
    this.setupIPC();

    await this.createWindow();
    this.createTray();
    this.setupServerMonitor();
    this.setupAgentController();
    this.setupAutoUpdater();
    this.setupAppEvents();

    // Check for first run
    if (store.get('firstRun')) {
      this.showFirstRunTutorial();
    }
  }

  async createWindow() {
    const bounds = store.get('windowBounds');
    
    this.mainWindow = new BrowserWindow({
      width: bounds.width,
      height: bounds.height,
      minWidth: 1000,
      minHeight: 700,
      titleBarStyle: 'hiddenInset',
      trafficLightPosition: { x: 20, y: 18 },
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '..', 'preload.js'),
        sandbox: false
      },
      show: false,
      icon: path.join(__dirname, '..', '..', 'assets', 'icon.png')
    });

    // Load the renderer
    await this.mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
      
      // Open DevTools in development
      if (process.env.NODE_ENV === 'development') {
        this.mainWindow.webContents.openDevTools();
      }
    });

    // Save window bounds on resize/move
    this.mainWindow.on('resize', () => {
      store.set('windowBounds', this.mainWindow.getBounds());
    });
    
    this.mainWindow.on('move', () => {
      store.set('windowBounds', this.mainWindow.getBounds());
    });

    // Handle close - minimize to tray instead
    this.mainWindow.on('close', (event) => {
      if (!this.isQuitting && process.platform === 'darwin') {
        event.preventDefault();
        this.mainWindow.hide();
      }
    });

    // Window state
    this.mainWindow.on('minimize', () => {
      if (store.get('minimizeToTray')) {
        this.mainWindow.hide();
      }
    });
  }

  createTray() {
    const iconPath = path.join(__dirname, '..', '..', 'assets', 'tray-icon.png');
    const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
    
    this.tray = new Tray(trayIcon);
    this.tray.setToolTip('OpenClaw Mission Control');
    
    this.updateTrayMenu();
    
    this.tray.on('click', () => {
      this.toggleWindow();
    });
    
    this.tray.on('double-click', () => {
      this.showWindow();
    });
  }

  updateTrayMenu() {
    const serverStatus = this.serverMonitor ? this.serverMonitor.getStatus() : { state: 'unknown' };
    const statusLabel = {
      'connected': '🟢 Server Online',
      'connecting': '🟡 Connecting...',
      'disconnected': '🔴 Server Offline',
      'unknown': '⚪ Unknown'
    }[serverStatus.state] || '⚪ Unknown';

    const template = [
      { label: 'OpenClaw Mission Control', enabled: false },
      { type: 'separator' },
      { label: statusLabel, enabled: false },
      { type: 'separator' },
      {
        label: 'Show Window',
        click: () => this.showWindow()
      },
      {
        label: 'Check for Updates',
        click: () => this.checkForUpdates()
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => this.quit()
      }
    ];

    if (this.updateAvailable) {
      template.splice(3, 0, {
        label: '⬇️ Update Available',
        click: () => this.showUpdateDialog()
      });
    }

    const contextMenu = Menu.buildFromTemplate(template);
    this.tray.setContextMenu(contextMenu);
  }

  toggleWindow() {
    if (this.mainWindow.isVisible()) {
      this.mainWindow.hide();
    } else {
      this.showWindow();
    }
  }

  showWindow() {
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }
      this.mainWindow.show();
      this.mainWindow.focus();
    }
  }

  setupServerMonitor() {
    this.serverMonitor = new ServerMonitor({
      serverUrl: store.get('serverUrl'),
      pingInterval: 30000, // 30 seconds
      onStatusChange: (status) => {
        this.broadcastToRenderer('server:status-change', status);
        this.updateTrayMenu();

        // Show notification on disconnect
        if (status.state === 'disconnected' && store.get('notifications')) {
          this.showNotification('Server Disconnected', 'Lost connection to OpenClaw server.');
        }
      },
      onMetrics: (metrics) => {
        this.broadcastToRenderer('server:metrics', metrics);
      }
    });

    this.serverMonitor.start();

    // Send initial status when renderer is ready
    this.mainWindow.webContents.on('dom-ready', () => {
      const status = this.serverMonitor.getStatus();
      this.broadcastToRenderer('server:status-change', status);
    });
  }

  setupAgentController() {
    this.agentController = new AgentController({
      serverUrl: store.get('serverUrl'),
      onAgentUpdate: (update) => {
        this.broadcastToRenderer('agent:update', update);
      },
      onTaskUpdate: (update) => {
        this.broadcastToRenderer('task:update', update);
      }
    });
  }

  setupAutoUpdater() {
    // Configure auto-updater
    autoUpdater.logger = log;
    autoUpdater.autoDownload = store.get('autoUpdate');
    autoUpdater.autoInstallOnAppQuit = true;

    // Check for updates on startup (delay to not slow down app launch)
    setTimeout(() => {
      this.checkForUpdates();
    }, 5000);

    // Auto-updater events
    autoUpdater.on('checking-for-update', () => {
      log.info('Checking for update...');
      this.broadcastToRenderer('update:checking');
    });

    autoUpdater.on('update-available', (info) => {
      log.info('Update available:', info);
      this.updateAvailable = true;
      this.broadcastToRenderer('update:available', info);
      this.updateTrayMenu();
      
      if (store.get('notifications')) {
        this.showNotification('Update Available', `Version ${info.version} is ready to download.`);
      }
    });

    autoUpdater.on('update-not-available', () => {
      log.info('Update not available');
      this.broadcastToRenderer('update:not-available');
    });

    autoUpdater.on('error', (err) => {
      log.error('Update error:', err);
      this.broadcastToRenderer('update:error', err.message);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      log.info('Download progress:', progressObj);
      this.broadcastToRenderer('update:progress', progressObj);
    });

    autoUpdater.on('update-downloaded', (info) => {
      log.info('Update downloaded:', info);
      this.updateDownloaded = true;
      this.broadcastToRenderer('update:downloaded', info);
      
      if (store.get('notifications')) {
        this.showNotification('Update Ready', 'Restart to install the latest version.');
      }
    });
  }

  async checkForUpdates() {
    try {
      await autoUpdater.checkForUpdates();
    } catch (err) {
      log.error('Failed to check for updates:', err);
    }
  }

  showUpdateDialog() {
    if (this.updateDownloaded) {
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Install Update',
        message: 'An update has been downloaded. Restart now to install?',
        buttons: ['Restart', 'Later'],
        defaultId: 0
      }).then(({ response }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    } else if (this.updateAvailable) {
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Update Available',
        message: 'An update is being downloaded. You\'ll be notified when it\'s ready.'
      });
    }
  }

  setupIPC() {
    // Server monitoring
    ipcMain.handle('server:get-status', () => {
      return this.serverMonitor ? this.serverMonitor.getStatus() : { state: 'unknown' };
    });

    ipcMain.handle('server:set-url', (event, url) => {
      store.set('serverUrl', url);
      if (this.serverMonitor) {
        this.serverMonitor.setServerUrl(url);
      }
      if (this.agentController) {
        this.agentController.setServerUrl(url);
      }
    });

    ipcMain.handle('server:reconnect', async () => {
      if (this.serverMonitor) {
        await this.serverMonitor.reconnect();
      }
    });

    // Agent control
    ipcMain.handle('agent:list', async () => {
      return this.agentController ? await this.agentController.listAgents() : [];
    });

    ipcMain.handle('agent:start', async (event, agentId) => {
      return this.agentController ? await this.agentController.startAgent(agentId) : null;
    });

    ipcMain.handle('agent:stop', async (event, agentId) => {
      return this.agentController ? await this.agentController.stopAgent(agentId) : null;
    });

    ipcMain.handle('agent:restart', async (event, agentId) => {
      return this.agentController ? await this.agentController.restartAgent(agentId) : null;
    });

    ipcMain.handle('agent:logs', async (event, agentId, options) => {
      return this.agentController ? await this.agentController.getLogs(agentId, options) : [];
    });

    // Tasks
    ipcMain.handle('task:list', async (event, options) => {
      return this.agentController ? await this.agentController.listTasks(options) : [];
    });

    ipcMain.handle('task:export', async (event, format) => {
      return this.exportTasks(format);
    });

    // Updates
    ipcMain.handle('update:check', () => {
      return this.checkForUpdates();
    });

    ipcMain.handle('update:install', () => {
      if (this.updateDownloaded) {
        autoUpdater.quitAndInstall();
      }
    });

    // Preferences
    ipcMain.handle('prefs:get', (event, key) => {
      return store.get(key);
    });

    ipcMain.handle('prefs:set', (event, key, value) => {
      store.set(key, value);
    });

    ipcMain.handle('prefs:get-all', () => {
      return store.store;
    });

    // Window control
    ipcMain.handle('window:minimize', () => {
      this.mainWindow.minimize();
    });

    ipcMain.handle('window:maximize', () => {
      if (this.mainWindow.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow.maximize();
      }
    });

    ipcMain.handle('window:close', () => {
      this.mainWindow.hide();
    });

    // System
    ipcMain.handle('system:show-notification', (event, title, body) => {
      this.showNotification(title, body);
    });

    ipcMain.handle('system:open-external', (event, url) => {
      shell.openExternal(url);
    });

    // Tutorial
    ipcMain.handle('tutorial:complete', () => {
      store.set('firstRun', false);
    });

    ipcMain.handle('tutorial:reset', () => {
      store.set('firstRun', true);
      this.showFirstRunTutorial();
    });
  }

  setupAppEvents() {
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      } else {
        this.showWindow();
      }
    });

    app.on('before-quit', () => {
      this.isQuitting = true;
    });

    // macOS dock menu
    if (process.platform === 'darwin') {
      app.dock.setMenu(Menu.buildFromTemplate([
        {
          label: 'Show Mission Control',
          click: () => this.showWindow()
        }
      ]));
    }
  }

  broadcastToRenderer(channel, data) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data);
    }
  }

  showNotification(title, body) {
    if (Notification.isSupported()) {
      new Notification({
        title,
        body,
        icon: path.join(__dirname, '..', '..', 'assets', 'icon.png')
      }).show();
    }
  }

  showFirstRunTutorial() {
    this.broadcastToRenderer('tutorial:start');
  }

  async exportTasks(format) {
    const { filePath } = await dialog.showSaveDialog(this.mainWindow, {
      defaultPath: `openclaw-tasks-${new Date().toISOString().split('T')[0]}.${format}`,
      filters: [
        { name: format === 'json' ? 'JSON' : 'CSV', extensions: [format] }
      ]
    });

    if (filePath) {
      const tasks = await this.agentController.listTasks({ limit: 10000 });
      
      if (format === 'json') {
        require('fs').writeFileSync(filePath, JSON.stringify(tasks, null, 2));
      } else {
        const csv = this.convertToCSV(tasks);
        require('fs').writeFileSync(filePath, csv);
      }
      
      return { success: true, path: filePath };
    }
    
    return { success: false };
  }

  convertToCSV(tasks) {
    if (!tasks.length) return '';
    
    const headers = Object.keys(tasks[0]).join(',');
    const rows = tasks.map(task => 
      Object.values(task).map(v => 
        typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
      ).join(',')
    );
    
    return [headers, ...rows].join('\n');
  }

  quit() {
    this.isQuitting = true;
    
    if (this.serverMonitor) {
      this.serverMonitor.stop();
    }
    
    app.quit();
  }
}

// Initialize app
const missionControl = new MissionControlApp();
missionControl.initialize().catch(err => {
  log.error('Failed to initialize app:', err);
  app.quit();
});
