// Reserved for future native bridges (file dialogs, etc.)
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('craftAnimator', {
  platform: process.platform,
  isDesktop: true,
})
