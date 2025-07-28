// src/main/index.ts
import { app, BrowserWindow } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, '../preload/index.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    // Development URL'i her zaman yükle (şimdilik)
    const url = 'http://localhost:5173';

    mainWindow.loadURL(url).catch(err => {
        console.error('Failed to load URL:', url);
        console.error('Error:', err);
        // Fallback olarak bir HTML göster
        mainWindow?.loadURL(`data:text/html,
      <h1>Vite server is not running!</h1>
      <p>Please run: npm run dev:vite</p>
      <p>Then refresh this window (Ctrl+R)</p>
    `);
    });

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});