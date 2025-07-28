// electron/terminal-handlers.js - main.js'e eklenecek
const { ipcMain } = require('electron');
const { spawn } = require('child_process');
const os = require('os');
const path = require('path');

// Terminal process'leri saklamak için
const terminals = new Map();

// Terminal oluştur
ipcMain.handle('terminal-create', (event, id) => {
    try {
        // İşletim sistemine göre shell belirle
        let shell, args;

        if (process.platform === 'win32') {
            shell = process.env.COMSPEC || 'cmd.exe';
            args = [];
        } else if (process.platform === 'darwin') {
            shell = process.env.SHELL || '/bin/zsh';
            args = ['--login'];
        } else {
            shell = process.env.SHELL || '/bin/bash';
            args = ['--login'];
        }

        // Terminal process'i oluştur
        const pty = spawn(shell, args, {
            cwd: projectRoot || os.homedir(),
            env: {
                ...process.env,
                TERM: 'xterm-256color',
                COLORTERM: 'truecolor'
            }
        });

        // Process'i sakla
        terminals.set(id, pty);

        // Output'u renderer'a gönder
        pty.stdout.on('data', (data) => {
            event.sender.send(`terminal-output-${id}`, data.toString());
        });

        pty.stderr.on('data', (data) => {
            event.sender.send(`terminal-output-${id}`, data.toString());
        });

        // Process kapandığında
        pty.on('exit', (code) => {
            terminals.delete(id);
            event.sender.send(`terminal-exit-${id}`, code);
        });

        return { success: true };
    } catch (error) {
        console.error('Terminal creation error:', error);
        return { success: false, error: error.message };
    }
});

// Terminal'e input gönder
ipcMain.handle('terminal-input', (event, id, data) => {
    const pty = terminals.get(id);
    if (pty && !pty.killed) {
        pty.stdin.write(data);
        return { success: true };
    }
    return { success: false, error: 'Terminal not found or killed' };
});

// Terminal'i kapat
ipcMain.handle('terminal-kill', (event, id) => {
    const pty = terminals.get(id);
    if (pty) {
        pty.kill();
        terminals.delete(id);
        return { success: true };
    }
    return { success: false, error: 'Terminal not found' };
});

// Terminal'i yeniden boyutlandır
ipcMain.handle('terminal-resize', (event, id, cols, rows) => {
    const pty = terminals.get(id);
    if (pty && pty.resize) {
        pty.resize(cols, rows);
        return { success: true };
    }
    return { success: false, error: 'Terminal not found or resize not supported' };
});

// Tüm terminal'leri temizle (uygulama kapanırken)
app.on('before-quit', () => {
    terminals.forEach((pty, id) => {
        if (!pty.killed) {
            pty.kill();
        }
    });
    terminals.clear();
});