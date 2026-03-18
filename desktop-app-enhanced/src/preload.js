const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload script - Securely exposes main process APIs to renderer
 * All communication between main and renderer goes through here
 */

// Server API
const serverAPI = {
  getStatus: () => ipcRenderer.invoke('server:get-status'),
  setUrl: (url) => ipcRenderer.invoke('server:set-url', url),
  reconnect: () => ipcRenderer.invoke('server:reconnect'),
  onStatusChange: (callback) => {
    ipcRenderer.on('server:status-change', (event, status) => callback(status));
  },
  onMetrics: (callback) => {
    ipcRenderer.on('server:metrics', (event, metrics) => callback(metrics));
  },
  removeListeners: () => {
    ipcRenderer.removeAllListeners('server:status-change');
    ipcRenderer.removeAllListeners('server:metrics');
  }
};

// Agent API
const agentAPI = {
  list: () => ipcRenderer.invoke('agent:list'),
  start: (agentId) => ipcRenderer.invoke('agent:start', agentId),
  stop: (agentId) => ipcRenderer.invoke('agent:stop', agentId),
  restart: (agentId) => ipcRenderer.invoke('agent:restart', agentId),
  getLogs: (agentId, options) => ipcRenderer.invoke('agent:logs', agentId, options),
  onUpdate: (callback) => {
    ipcRenderer.on('agent:update', (event, update) => callback(update));
  },
  removeListeners: () => {
    ipcRenderer.removeAllListeners('agent:update');
  }
};

// Task API
const taskAPI = {
  list: (options) => ipcRenderer.invoke('task:list', options),
  export: (format) => ipcRenderer.invoke('task:export', format),
  onUpdate: (callback) => {
    ipcRenderer.on('task:update', (event, update) => callback(update));
  },
  removeListeners: () => {
    ipcRenderer.removeAllListeners('task:update');
  }
};

// Update API
const updateAPI = {
  check: () => ipcRenderer.invoke('update:check'),
  install: () => ipcRenderer.invoke('update:install'),
  onChecking: (callback) => {
    ipcRenderer.on('update:checking', () => callback());
  },
  onAvailable: (callback) => {
    ipcRenderer.on('update:available', (event, info) => callback(info));
  },
  onNotAvailable: (callback) => {
    ipcRenderer.on('update:not-available', () => callback());
  },
  onProgress: (callback) => {
    ipcRenderer.on('update:progress', (event, progress) => callback(progress));
  },
  onDownloaded: (callback) => {
    ipcRenderer.on('update:downloaded', (event, info) => callback(info));
  },
  onError: (callback) => {
    ipcRenderer.on('update:error', (event, error) => callback(error));
  },
  removeListeners: () => {
    ipcRenderer.removeAllListeners('update:checking');
    ipcRenderer.removeAllListeners('update:available');
    ipcRenderer.removeAllListeners('update:not-available');
    ipcRenderer.removeAllListeners('update:progress');
    ipcRenderer.removeAllListeners('update:downloaded');
    ipcRenderer.removeAllListeners('update:error');
  }
};

// Preferences API
const prefsAPI = {
  get: (key) => ipcRenderer.invoke('prefs:get', key),
  set: (key, value) => ipcRenderer.invoke('prefs:set', key, value),
  getAll: () => ipcRenderer.invoke('prefs:get-all')
};

// Window API
const windowAPI = {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close')
};

// System API
const systemAPI = {
  showNotification: (title, body) => ipcRenderer.invoke('system:show-notification', title, body),
  openExternal: (url) => ipcRenderer.invoke('system:open-external', url)
};

// Tutorial API
const tutorialAPI = {
  complete: () => ipcRenderer.invoke('tutorial:complete'),
  reset: () => ipcRenderer.invoke('tutorial:reset'),
  onStart: (callback) => {
    ipcRenderer.on('tutorial:start', () => callback());
  },
  removeListeners: () => {
    ipcRenderer.removeAllListeners('tutorial:start');
  }
};

// App Info
const appInfo = {
  version: process.env.npm_package_version || '1.0.0',
  platform: process.platform,
  arch: process.arch
};

// Expose APIs to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  server: serverAPI,
  agent: agentAPI,
  task: taskAPI,
  update: updateAPI,
  prefs: prefsAPI,
  window: windowAPI,
  system: systemAPI,
  tutorial: tutorialAPI,
  app: appInfo
});
