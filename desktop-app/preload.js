const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
  resetSettings: () => ipcRenderer.invoke('reset-settings'),
  
  // Notifications
  showNotification: (title, body, options) => 
    ipcRenderer.invoke('show-notification', title, body, options),
  notifyAgentStatus: (agentName, status, message) => 
    ipcRenderer.invoke('notify-agent-status', agentName, status, message),
  
  // Updates
  checkForUpdates: () => ipcRenderer.invoke('check-updates'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // File operations
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
  
  // External links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // App control
  quitApp: () => ipcRenderer.invoke('quit-app'),
  
  // Event listeners
  onMenuExportStats: (callback) => ipcRenderer.on('menu-export-stats', callback),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Expose platform info
contextBridge.exposeInMainWorld('platform', {
  isMac: process.platform === 'darwin',
  isWindows: process.platform === 'win32',
  isLinux: process.platform === 'linux'
});
