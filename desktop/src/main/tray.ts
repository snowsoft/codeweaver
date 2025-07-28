// src/main/tray.ts
import { Tray, Menu, BrowserWindow, app, nativeImage } from 'electron';
import path from 'path';
import fs from 'fs';

export function setupTray(mainWindow: BrowserWindow): Tray | null {
    // Check if icon exists
    const iconPath = path.join(__dirname, '../../assets/icons/icon.png');

    // Create a default icon if it doesn't exist
    let trayIcon;
    if (fs.existsSync(iconPath)) {
        trayIcon = nativeImage.createFromPath(iconPath);
    } else {
        // Create a 1x1 transparent icon as fallback
        const buffer = Buffer.from([
            0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
            0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41,
            0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
            0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d,
            0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
            0x44, 0xae, 0x42, 0x60, 0x82
        ]);
        trayIcon = nativeImage.createFromBuffer(buffer);
        console.warn('Tray icon not found, using default icon');
    }

    try {
        const tray = new Tray(trayIcon);

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Show CodeWeaver',
                click: () => {
                    mainWindow.show();
                }
            },
            {
                label: 'Generate Code',
                click: () => {
                    mainWindow.show();
                    mainWindow.webContents.send('weaver:generate');
                }
            },
            { type: 'separator' },
            {
                label: 'Quit',
                click: () => {
                    app.quit();
                }
            }
        ]);

        tray.setToolTip('CodeWeaver - AI Code Generation');
        tray.setContextMenu(contextMenu);

        // Click on tray icon shows window
        tray.on('click', () => {
            mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
        });

        return tray;
    } catch (error) {
        console.error('Failed to create tray:', error);
        return null;
    }
}