// @ts-ignore
import { app, BrowserWindow } from 'electron/main'
import isDev from 'electron-is-dev'
import path from 'path'
import url from 'url'

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1080,
    height: 810
  })

  // const startURL = isDev
  // ? 'http://localhost:8100'
  // : url.format({
  //   pathname: path.join(process.resourcesPath, 'out/renderer/index.html'),
  //   protocol: 'file:',
  //   slashes: true
  // });

  isDev ? win.loadURL('http://localhost:8100') : win.loadFile('out/renderer/index.html')
  // win.loadURL(startURL)
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on("ready-to-show", () => {
  app.webContents.openDevTools();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})