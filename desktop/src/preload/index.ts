import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
    // Weaver commands
    weaver: {
        execute: (command: string) => ipcRenderer.invoke('weaver:execute', command)
    },

    // File operations
    file: {
        read: (filePath: string) => ipcRenderer.invoke('file:read', filePath),
        write: (filePath: string, content: string) => ipcRenderer.invoke('file:write', filePath, content)
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
    on: (channel: string, callback: Function) => {
        const validChannels = [
            'menu:newFile', 'menu:openFile', 'menu:openFolder', 'menu:save', 'menu:about',
            'weaver:generate', 'weaver:refactor', 'weaver:document', 'weaver:test', 'weaver:review',
            'shell:openExternal'
        ];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => callback(...args));
        }
    },

    removeAllListeners: (channel: string) => {
        ipcRenderer.removeAllListeners(channel);
    }
});