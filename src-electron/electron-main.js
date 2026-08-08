import { app, BrowserWindow, nativeTheme, Menu, MenuItem } from 'electron'
import path from 'path'
import fs from 'fs'

try {
  if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    fs.unlinkSync(path.join(app.getPath('userData'), 'DevTools Extensions'))
  }
} catch (_) { }

/** @type {BrowserWindow | null} */
let mainWindow

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: /quasar-cli/developing-electron-apps/electron-preload-script
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD)
    }
  })

  mainWindow.setMenuBarVisibility(false)

  void mainWindow.loadURL(process.env.APP_URL)

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.on('context-menu', (event, params) => {
    const menu = new Menu()

    for (const suggestion of params.dictionarySuggestions) {
      menu.append(new MenuItem({
        label: suggestion,
        click: () => mainWindow.webContents.replaceMisspelling(suggestion)
      }))
    }

    if (params.misspelledWord) {
      if (params.dictionarySuggestions.length > 0) {
        menu.append(new MenuItem({ type: 'separator' }))
      }
      menu.append(new MenuItem({
        label: 'Add to dictionary',
        click: () => mainWindow.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
      }))
      menu.append(new MenuItem({ type: 'separator' }))
    }

    menu.append(new MenuItem({ label: 'Cut', role: 'cut', enabled: params.editFlags.canCut }))
    menu.append(new MenuItem({ label: 'Copy', role: 'copy', enabled: params.editFlags.canCopy }))
    menu.append(new MenuItem({ label: 'Paste', role: 'paste', enabled: params.editFlags.canPaste }))
    menu.append(new MenuItem({ type: 'separator' }))
    menu.append(new MenuItem({ label: 'Select All', role: 'selectAll', enabled: params.editFlags.canSelectAll }))

    menu.popup()
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
