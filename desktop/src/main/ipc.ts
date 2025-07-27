// src/main/ipc.ts
import { ipcMain, dialog, shell } from 'electron';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

export function setupIPC() {
    // Execute weaver CLI commands
    ipcMain.handle('weaver:execute', async (_, command: string) => {
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
    ipcMain.handle('file:read', async (_, filePath: string) => {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            return { success: true, content };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('file:write', async (_, filePath: string, content: string) => {
        try {
            await fs.writeFile(filePath, content, 'utf-8');
            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('file:list', async (_, dirPath: string) => {
        try {
            const items = await fs.readdir(dirPath, { withFileTypes: true });
            const files = await Promise.all(
                items.map(async (item) => {
                    const fullPath = path.join(dirPath, item.name);
                    const isDirectory = item.isDirectory();

                    let children = undefined;
                    if (isDirectory) {
                        try {
                            const subItems = await fs.readdir(fullPath, { withFileTypes: true });
                            children = subItems.map(subItem => ({
                                name: subItem.name,
                                path: path.join(fullPath, subItem.name),
                                type: subItem.isDirectory() ? 'directory' : 'file'
                            }));
                        } catch {
                            children = [];
                        }
                    }

                    return {
                        name: item.name,
                        path: fullPath,
                        type: isDirectory ? 'directory' : 'file',
                        children
                    };
                })
            );

            return { success: true, files };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('file:create', async (_, filePath: string) => {
        try {
            await fs.writeFile(filePath, '', 'utf-8');
            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('file:delete', async (_, filePath: string) => {
        try {
            const stats = await fs.stat(filePath);
            if (stats.isDirectory()) {
                await fs.rmdir(filePath, { recursive: true });
            } else {
                await fs.unlink(filePath);
            }
            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    });

    ipcMain.handle('file:rename', async (_, oldPath: string, newPath: string) => {
        try {
            await fs.rename(oldPath, newPath);
            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
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
    ipcMain.handle('shell:openExternal', async (_, url: string) => {
        await shell.openExternal(url);
    });
}