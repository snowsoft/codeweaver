// src/main/updater.ts
import { autoUpdater } from 'electron-updater';
import { dialog } from 'electron';

export function setupUpdater() {
    // Configure auto-updater
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;

    // Check for updates
    autoUpdater.checkForUpdates();

    // Update events
    autoUpdater.on('update-available', () => {
        dialog.showMessageBox({
            type: 'info',
            title: 'Update Available',
            message: 'A new version of CodeWeaver is available. Would you like to download it?',
            buttons: ['Download', 'Later']
        }).then(result => {
            if (result.response === 0) {
                autoUpdater.downloadUpdate();
            }
        });
    });

    autoUpdater.on('update-downloaded', () => {
        dialog.showMessageBox({
            type: 'info',
            title: 'Update Ready',
            message: 'Update downloaded. The application will restart to apply the update.',
            buttons: ['Restart Now', 'Later']
        }).then(result => {
            if (result.response === 0) {
                autoUpdater.quitAndInstall();
            }
        });
    });

    autoUpdater.on('error', (error) => {
        console.error('Update error:', error);
    });
}