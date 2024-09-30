import { app, BrowserWindow } from 'electron';
import path from 'path';
import { aiService } from './services/AIService';
import { ideApiService } from './services/IDEAPIService';
import { settingsService } from './services/SettingsService';

async function initializeServices() {
  await settingsService.initialize();
  await aiService.initialize();
  await ideApiService.initialize();
  // Add any other service initializations here if needed
}

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  return mainWindow;
}

async function main() {
  try {
    await app.whenReady();
    console.log('Initializing services...');
    await initializeServices();

    const mainWindow = await createWindow();

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });

    // Your existing main logic can go here
    console.log('Current AI provider:', settingsService.getSetting('ai.provider'));
    console.log('Available AI providers:', aiService.listAvailableProviders());

    // ... (rest of your existing logic)

  } catch (error) {
    console.error('Error initializing application:', error);
  }
}

main().catch(error => console.error('Unhandled error:', error));