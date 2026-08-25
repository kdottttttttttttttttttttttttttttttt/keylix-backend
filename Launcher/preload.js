const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('keylix', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (c) => ipcRenderer.invoke('save-config', c),
  selectPath: () => ipcRenderer.invoke('select-path'),
  checkBackend: (url) => ipcRenderer.invoke('check-backend', url),
  downloadBuild: (opts) => ipcRenderer.invoke('download-build', opts),
  launch: (opts) => ipcRenderer.invoke('launch', opts),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  onProgress: (cb) => ipcRenderer.on('download:progress', (e, d) => cb(d)),
  onStatus: (cb) => ipcRenderer.on('download:status', (e, d) => cb(d)),
  minimize: () => ipcRenderer.send('win:minimize'),
  close: () => ipcRenderer.send('win:close'),
  epicDownload: (opts) => ipcRenderer.invoke('epic:download', opts),
  epicSaveManifest: (id) => ipcRenderer.invoke('epic:save-manifest', id),
  epicGetManifest: () => ipcRenderer.invoke('epic:get-manifest'),
  keylixRegister: (opts) => ipcRenderer.invoke('keylix:register', opts),
  keylixLogin: (opts) => ipcRenderer.invoke('keylix:login', opts)
});
