// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

// Window API tipini genişlet
declare global {
    interface Window {
        api: {
            weaver: {
                execute: (command: string) => Promise<{stdout: string, stderr: string}>
            },
            file: {
                read: (filePath: string) => Promise<{success: boolean, content?: string, error?: string}>,
                write: (filePath: string, content: string) => Promise<{success: boolean, error?: string}>,
                list: (dirPath: string) => Promise<{success: boolean, files?: any[], error?: string}>,
                create: (filePath: string) => Promise<{success: boolean, error?: string}>,
                delete: (filePath: string) => Promise<{success: boolean, error?: string}>,
                rename: (oldPath: string, newPath: string) => Promise<{success: boolean, error?: string}>
            },
            dialog: {
                openFile: () => Promise<Electron.OpenDialogReturnValue>,
                openDirectory: () => Promise<Electron.OpenDialogReturnValue>
            },
            shell: {
                openExternal: (url: string) => Promise<void>
            },
            on: (channel: string, callback: (...args: any[]) => void) => void,
            removeAllListeners: (channel: string) => void
        }
    }
}

contextBridge.exposeInMainWorld('api', {
    // Weaver commands
    weaver: {
        execute: (command: string) => ipcRenderer.invoke('weaver:execute', command)
    },

    // File operations
    file: {
        read: (filePath: string) => ipcRenderer.invoke('file:read', filePath),
        write: (filePath: string, content: string) => ipcRenderer.invoke('file:write', filePath, content),
        list: (dirPath: string) => ipcRenderer.invoke('file:list', dirPath),
        create: (filePath: string) => ipcRenderer.invoke('file:create', filePath),
        delete: (filePath: string) => ipcRenderer.invoke('file:delete', filePath),
        rename: (oldPath: string, newPath: string) => ipcRenderer.invoke('file:rename', oldPath, newPath)
    },

    // Dialog operations
    dialog: {
        openFile: () => ipcRenderer.invoke('dialog:openFile'),
        openDirectory: () => ipcRenderer.invoke('dialog:openDirectory')
    },

    // Shell operations
    shell: {
        openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url)
    },

    // Menu events
    on: (channel: string, callback: (...args: any[]) => void) => {
        const validChannels = [
            'menu:newFile', 'menu:openFile', 'menu:openFolder', 'menu:save', 'menu:about',
            'weaver:generate', 'weaver:refactor', 'weaver:document', 'weaver:test', 'weaver:review',
            'shell:openExternal'
        ];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (_, ...args) => callback(...args));
        }
    },

    removeAllListeners: (channel: string) => {
        ipcRenderer.removeAllListeners(channel);
    }
});