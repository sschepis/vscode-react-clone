import { app, ipcMain, BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs/promises';

const isDevelopment = process.env.NODE_ENV !== 'production';
const isHeadless = process.env.HEADLESS === 'true';

if (isHeadless) {
  app.disableHardwareAcceleration();
}

const windowsById: Map<number, Electron.BrowserWindow | null> = new Map();

const devEntry = `http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`;
const prodEntry = url.format({
  protocol: 'file',
  pathname: path.join(__dirname, '../renderer/index.html'),
  slashes: true,
});
const entry = isDevelopment ? devEntry : prodEntry;

function createWindow() {
  if (isHeadless) {
    console.log('Running in headless mode. Skipping window creation.');
    return;
  }

  const window = new BrowserWindow({
    webPreferences: { 
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const { id } = window;

  windowsById.set(id, window);

  window.on('closed', () => {
    windowsById.delete(id);
  });

  window.loadURL(entry);
  window.focus();
}

function runHeadless() {
  console.log('Application is ready in headless mode.');
  setTimeout(() => {
    console.log('Quitting headless application after timeout');
    app.quit();
  }, 5000);
}

app.on('ready', () => {
  if (isHeadless) {
    runHeadless();
  } else {
    createWindow();
    ipcMain.on('window:create', createWindow);
  }

  // File system operations
  ipcMain.handle('read-directory', async (_, dirPath: string) => {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries.map(entry => ({
      name: entry.name,
      type: entry.isDirectory() ? 'directory' : 'file',
    }));
  });

  ipcMain.handle('read-file', async (_, filePath: string) => {
    return fs.readFile(filePath, 'utf-8');
  });

  ipcMain.handle('write-file', async (_, filePath: string, content: string) => {
    await fs.writeFile(filePath, content, 'utf-8');
  });

  ipcMain.handle('create-directory', async (_, dirPath: string) => {
    await fs.mkdir(dirPath, { recursive: true });
  });

  ipcMain.handle('delete-file', async (_, filePath: string) => {
    await fs.unlink(filePath);
  });

  ipcMain.handle('delete-directory', async (_, dirPath: string) => {
    await fs.rmdir(dirPath, { recursive: true });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' || isHeadless) {
    app.quit();
  }
});

app.on('activate', () => {
  if (windowsById.size === 0 && !isHeadless) {
    createWindow();
  }
});
