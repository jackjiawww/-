const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('pet', {
  menu: () => ipcRenderer.send('pet-menu'),
  onPhoto: callback => ipcRenderer.on('pet-photo', (_event, photo) => callback(photo)),
  onAction: callback => ipcRenderer.on('pet-action', (_event, action) => callback(action))
});
