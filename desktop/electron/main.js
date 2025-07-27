// electron/main.js içine eklenecek IPC handlers
const { ipcMain, dialog } = require('electron');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Dosya sistemi işlemleri için güvenli bir kök dizin
let projectRoot = process.cwd();

// Dosya ağacı okuma
ipcMain.handle('read-directory', async (event, dirPath) => {
    try {
        const fullPath = path.join(projectRoot, dirPath);
        const entries = await fs.readdir(fullPath, { withFileTypes: true });

        const fileTree = await Promise.all(
            entries
                .filter(entry => !entry.name.startsWith('.') && entry.name !== 'node_modules')
                .map(async (entry) => {
                    const entryPath = path.join(dirPath, entry.name);
                    const node = {
                        name: entry.name,
                        path: entryPath,
                        type: entry.isDirectory() ? 'directory' : 'file',
                        extension: entry.isFile() ? path.extname(entry.name) : undefined
                    };

                    if (entry.isDirectory()) {
                        try {
                            node.children = await readDirectoryRecursive(entryPath, 2); // Max 2 levels deep
                        } catch (err) {
                            node.children = [];
                        }
                    }

                    return node;
                })
        );

        return fileTree.sort((a, b) => {
            // Directories first, then files
            if (a.type !== b.type) {
                return a.type === 'directory' ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });
    } catch (error) {
        console.error('Error reading directory:', error);
        throw error;
    }
});

// Recursive directory reader with depth limit
async function readDirectoryRecursive(dirPath, maxDepth = 2, currentDepth = 0) {
    if (currentDepth >= maxDepth) return [];

    try {
        const fullPath = path.join(projectRoot, dirPath);
        const entries = await fs.readdir(fullPath, { withFileTypes: true });

        const fileTree = await Promise.all(
            entries
                .filter(entry => !entry.name.startsWith('.') && entry.name !== 'node_modules')
                .map(async (entry) => {
                    const entryPath = path.join(dirPath, entry.name);
                    const node = {
                        name: entry.name,
                        path: entryPath,
                        type: entry.isDirectory() ? 'directory' : 'file',
                        extension: entry.isFile() ? path.extname(entry.name) : undefined
                    };

                    if (entry.isDirectory() && currentDepth < maxDepth - 1) {
                        node.children = await readDirectoryRecursive(entryPath, maxDepth, currentDepth + 1);
                    }

                    return node;
                })
        );

        return fileTree.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'directory' ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });
    } catch (error) {
        return [];
    }
}

// Dosya okuma
ipcMain.handle('read-file', async (event, filePath) => {
    try {
        const fullPath = path.join(projectRoot, filePath);
        const content = await fs.readFile(fullPath, 'utf-8');
        return content;
    } catch (error) {
        console.error('Error reading file:', error);
        throw error;
    }
});

// Dosya yazma
ipcMain.handle('write-file', async (event, filePath, content) => {
    try {
        const fullPath = path.join(projectRoot, filePath);
        await fs.writeFile(fullPath, content, 'utf-8');
        return true;
    } catch (error) {
        console.error('Error writing file:', error);
        throw error;
    }
});

// Yeni dosya oluşturma
ipcMain.handle('create-file', async (event, filePath) => {
    try {
        const fullPath = path.join(projectRoot, filePath);
        await fs.writeFile(fullPath, '', 'utf-8');
        return true;
    } catch (error) {
        console.error('Error creating file:', error);
        throw error;
    }
});

// Yeni klasör oluşturma
ipcMain.handle('create-directory', async (event, dirPath) => {
    try {
        const fullPath = path.join(projectRoot, dirPath);
        await fs.mkdir(fullPath, { recursive: true });
        return true;
    } catch (error) {
        console.error('Error creating directory:', error);
        throw error;
    }
});

// Dosya silme
ipcMain.handle('delete-file', async (event, filePath) => {
    try {
        const fullPath = path.join(projectRoot, filePath);
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
            await fs.rmdir(fullPath, { recursive: true });
        } else {
            await fs.unlink(fullPath);
        }

        return true;
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
});

// Dosya yeniden adlandırma
ipcMain.handle('rename-file', async (event, oldPath, newPath) => {
    try {
        const fullOldPath = path.join(projectRoot, oldPath);
        const fullNewPath = path.join(projectRoot, newPath);
        await fs.rename(fullOldPath, fullNewPath);
        return true;
    } catch (error) {
        console.error('Error renaming file:', error);
        throw error;
    }
});

// Proje açma
ipcMain.handle('open-project', async (event) => {
    try {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
            title: 'Select Project Directory'
        });

        if (!result.canceled && result.filePaths.length > 0) {
            projectRoot = result.filePaths[0];
            return projectRoot;
        }

        return null;
    } catch (error) {
        console.error('Error opening project:', error);
        throw error;
    }
});

// Komut çalıştırma
ipcMain.handle('run-command', async (event, command, cwd) => {
    try {
        const execPath = cwd ? path.join(projectRoot, cwd) : projectRoot;
        const { stdout, stderr } = await execPromise(command, {
            cwd: execPath,
            encoding: 'utf-8'
        });

        return { stdout, stderr };
    } catch (error) {
        return {
            stdout: '',
            stderr: error.message || 'Command failed'
        };
    }
});

// Weaver CLI komutları
ipcMain.handle('weaver-new', async (event, fileName, task, contextFile) => {
    try {
        let command = `weaver new "${fileName}" --task "${task}"`;
        if (contextFile) {
            command += ` --context-file "${contextFile}"`;
        }

        const { stdout, stderr } = await execPromise(command, {
            cwd: projectRoot,
            encoding: 'utf-8'
        });

        return stdout || stderr;
    } catch (error) {
        throw new Error(error.message || 'Weaver command failed');
    }
});

ipcMain.handle('weaver-refactor', async (event, fileName, task, contextDir) => {
    try {
        let command = `weaver refactor "${fileName}" --task "${task}"`;
        if (contextDir) {
            command += ` --context-dir "${contextDir}"`;
        }

        const { stdout, stderr } = await execPromise(command, {
            cwd: projectRoot,
            encoding: 'utf-8'
        });

        return stdout || stderr;
    } catch (error) {
        throw new Error(error.message || 'Weaver command failed');
    }
});

ipcMain.handle('weaver-document', async (event, fileName, style) => {
    try {
        let command = `weaver document "${fileName}"`;
        if (style) {
            command += ` --style "${style}"`;
        }

        const { stdout, stderr } = await execPromise(command, {
            cwd: projectRoot,
            encoding: 'utf-8'
        });

        return stdout || stderr;
    } catch (error) {
        throw new Error(error.message || 'Weaver command failed');
    }
});

// Dosya değişikliklerini izleme (opsiyonel)
const chokidar = require('chokidar');
let watcher = null;

function startFileWatcher(win) {
    if (watcher) {
        watcher.close();
    }

    watcher = chokidar.watch(projectRoot, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        ignoreInitial: true
    });

    watcher
        .on('add', path => win.webContents.send('file-changed', { type: 'add', path }))
        .on('change', path => win.webContents.send('file-changed', { type: 'change', path }))
        .on('unlink', path => win.webContents.send('file-changed', { type: 'unlink', path }));
}