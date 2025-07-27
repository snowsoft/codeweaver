import { ipcMain, dialog, shell } from 'electron';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

export function setupIPC() {
    // Execute weaver CLI commands
    ipcMain.handle('weaver:execute', async (event, command: string) => {
        return new Promise((resolve, reject) => {
            exec(`weaver ${command}`, (error, stdout, stderr) => {
                if (error) {
                    reject({ error: error.message, stderr });
                } else {
                    resolve({ stdout, stderr });
                }
            });
        });
    });

    // File operations
    ipcMain.handle('file:read', async (event, filePath: string) => {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return { success: true, content };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('file:write', async (event, filePath: string, content: string) => {
        try {
            await fs.writeFile(filePath, content, 'utf-8');
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Dialog operations
    ipcMain.handle('dialog:openFile', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                { name: 'Code Files', extensions: ['js', 'ts', 'py', 'go', 'rs', 'php', 'java'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        });
        return result;
    });

    ipcMain.handle('dialog:openDirectory', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory']
        });
        return result;
    });

    // Shell operations
    ipcMain.handle('shell:openExternal', async (event, url: string) => {
        await shell.openExternal(url);
    });
}