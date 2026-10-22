const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('craftAnimator', {
  platform: process.platform,
  isDesktop: true,
  openRigDialog: () => ipcRenderer.invoke('dialog:openRig'),
  onOpenPath: (cb) => {
    ipcRenderer.on('open-path', (_e, p) => cb(p))
  },
})
