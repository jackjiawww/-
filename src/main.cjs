const { app, BrowserWindow, ipcMain, Menu, screen, dialog } = require('electron');
const path = require('node:path');
let win;
let dragOrigin;
function createPet() {
  const area = screen.getPrimaryDisplay().workArea;
  win = new BrowserWindow({
    width: 300, height: 460,
    x: area.x + area.width - 320, y: area.y + area.height - 480,
    transparent: true, frame: false, resizable: false, alwaysOnTop: true,
    skipTaskbar: true, webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true, nodeIntegration: false, sandbox: true
    }
  });
  win.loadFile(path.join(__dirname, 'index.html'));
  win.webContents.on('did-finish-load', async () => {
    try {
      const text = await require('node:fs/promises').readFile(path.join(app.getPath('userData'), 'photo.json'), 'utf8');
      if (win) win.webContents.send('pet-photo', JSON.parse(text).photo);
    } catch {}
  });
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', event => event.preventDefault());
  win.on('closed', () => { win = null; });
}
function fromPet(event) { return win && event.sender === win.webContents; }
ipcMain.on('drag-start', event => {
  if (!fromPet(event)) return;
  dragOrigin = { cursor: screen.getCursorScreenPoint(), position: win.getPosition() };
});
ipcMain.on('drag-move', event => {
  if (!fromPet(event) || !dragOrigin) return;
  const cursor = screen.getCursorScreenPoint();
  win.setPosition(dragOrigin.position[0] + cursor.x - dragOrigin.cursor.x,
    dragOrigin.position[1] + cursor.y - dragOrigin.cursor.y);
});
ipcMain.on('drag-end', event => { if (fromPet(event)) dragOrigin = null; });
ipcMain.on('pet-menu', event => {
  if (!fromPet(event)) return;
  Menu.buildFromTemplate([
    { label: '选择真人照片…', click: async () => {
      const result = await dialog.showOpenDialog(win, { properties: ['openFile'], filters: [{ name: '图片', extensions: ['png', 'jpg', 'jpeg', 'webp'] }] });
      if (result.canceled || !win) return;
      const fs = require('node:fs/promises');
      try {
        const file = result.filePaths[0];
        const data = await fs.readFile(file);
        if (data.length > 20 * 1024 * 1024) throw new Error('请选择小于 20 MB 的图片');
        const ext = path.extname(file).toLowerCase();
        const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp' }[ext];
        const photo = `data:${mime};base64,${data.toString('base64')}`;
        await fs.writeFile(path.join(app.getPath('userData'), 'photo.json'), JSON.stringify({ photo }));
        if (win) win.webContents.send('pet-photo', photo);
      } catch (error) { dialog.showErrorBox('无法打开图片', error.message); }
    } },
    { label: '摸摸它', click: () => win.webContents.send('pet-action', 'love') },
    { label: '睡觉 / 醒来', click: () => win.webContents.send('pet-action', 'sleep') },
    { label: '保持置顶', type: 'checkbox', checked: win.isAlwaysOnTop(),
      click: item => win.setAlwaysOnTop(item.checked) },
    { label: '回到屏幕右下角', click: () => {
      const a = screen.getPrimaryDisplay().workArea;
      win.setPosition(a.x + a.width - 320, a.y + a.height - 480);
    } },
    { type: 'separator' },
    { label: '退出桌宠', click: () => app.quit() }
  ]).popup({ window: win });
});
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (win) { win.show(); win.focus(); } });
  app.whenReady().then(createPet);
  app.on('window-all-closed', () => app.quit());
}
