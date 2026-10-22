const { app, BrowserWindow, shell, Menu, dialog, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

const isDev = !app.isPackaged

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    title: 'Craft Animator',
    backgroundColor: '#2d2d2d',
    autoHideMenuBar: true,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    show: false,
  })
  win.setMenuBarVisibility(false)

  win.once('ready-to-show', () => win.show())

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://127.0.0.1:5173')
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Open .fla dropped onto the app icon / argv
  const openPath = process.argv.find((a) => /\.(fla|zip|xfl|json|caproj)$/i.test(a))
  if (openPath) {
    win.webContents.on('did-finish-load', () => {
      win.webContents.send('open-path', openPath)
    })
  }
}

ipcMain.handle('dialog:openRig', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Open Animate Rig',
    filters: [
      { name: 'Animate / Craft', extensions: ['fla', 'zip', 'xfl', 'json', 'caproj'] },
      { name: 'All Files', extensions: ['*'] },
    ],
    properties: ['openFile'],
  })
  if (result.canceled || !result.filePaths[0]) return null
  const filePath = result.filePaths[0]
  const buf = fs.readFileSync(filePath)
  return {
    name: path.basename(filePath),
    data: buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
  }
})

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
