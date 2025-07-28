import { app, BrowserWindow } from 'electron';
import { AppWindow } from './app-window';
import { MenuBuilder } from './menu-builder';
import { setupIpcHandlers } from './ipc-handlers';
import { AutoUpdater } from './auto-updater';
import { TrayManager } from './tray-manager';

class CodeWeaverApp {
    private mainWindow: AppWindow | null = null;
    private trayManager: TrayManager | null = null;

    async init() {
        await app.whenReady();

        // Setup IPC handlers
        setupIpcHandlers();

        // Create main window
        this.mainWindow = new AppWindow();

        // Build application menu
        new MenuBuilder(this.mainWindow).buildMenu();

        // Setup system tray
        this.trayManager = new TrayManager(this.mainWindow);

        // Check for updates
        new AutoUpdater().checkForUpdates();
    }
}

// Initialize app
new CodeWeaverApp().init();