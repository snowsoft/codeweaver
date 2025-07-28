// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

// Güvenli API'leri renderer process'e expose et
contextBridge.exposeInMainWorld('electron', {
    // Dosya sistemi işlemleri
    readDirectory: (dirPath) => ipcRenderer.invoke('read-directory', dirPath),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
    createFile: (filePath) => ipcRenderer.invoke('create-file', filePath),
    createDirectory: (dirPath) => ipcRenderer.invoke('create-directory', dirPath),
    deleteFile: (filePath) => ipcRenderer.invoke('delete-file', filePath),
    renameFile: (oldPath, newPath) => ipcRenderer.invoke('rename-file', oldPath, newPath),

    // Proje açma
    openProject: () => ipcRenderer.invoke('open-project'),

    // Terminal işlemleri
    createTerminal: (id) => ipcRenderer.invoke('terminal-create', id),
    sendTerminalInput: (id, data) => ipcRenderer.invoke('terminal-input', id, data),
    killTerminal: (id) => ipcRenderer.invoke('terminal-kill', id),
    resizeTerminal: (id, cols, rows) => ipcRenderer.invoke('terminal-resize', id, cols, rows),

    // Terminal event listeners
    onTerminalOutput: (id, callback) => {
        ipcRenderer.on(`terminal-output-${id}`, callback);
        return () => ipcRenderer.removeListener(`terminal-output-${id}`, callback);
    },
    onTerminalExit: (id, callback) => {
        ipcRenderer.on(`terminal-exit-${id}`, callback);
        return () => ipcRenderer.removeListener(`terminal-exit-${id}`, callback);
    },

    // Weaver CLI işlemleri
    weaverNew: (fileName, task, contextFile) =>
        ipcRenderer.invoke('weaver-new', fileName, task, contextFile),
    weaverRefactor: (fileName, task, contextDir) =>
        ipcRenderer.invoke('weaver-refactor', fileName, task, contextDir),
    weaverDocument: (fileName, style) =>
        ipcRenderer.invoke('weaver-document', fileName, style),
    weaverTest: (fileName, framework) =>
        ipcRenderer.invoke('weaver-test', fileName, framework),
    weaverReview: (fileName, task) =>
        ipcRenderer.invoke('weaver-review', fileName, task),

    // Event listeners
    onFileChange: (callback) => {
        ipcRenderer.on('file-changed', callback);
        return () => ipcRenderer.removeListener('file-changed', callback);
    },

    onCommandOutput: (callback) => {
        ipcRenderer.on('command-output', callback);
        return () => ipcRenderer.removeListener('command-output', callback);
    }
});

// TypeScript için tip tanımlamaları
// src/types/electron.d.ts dosyasına eklenecek
/*
export interface ElectronAPI {
  readDirectory: (dirPath: string) => Promise<FileNode[]>;
  readFile: (filePath: string) => Promise<string>;
  writeFile: (filePath: string, content: string) => Promise<void>;
  createFile: (filePath: string) => Promise<void>;
  createDirectory: (dirPath: string) => Promise<void>;
  deleteFile: (filePath: string) => Promise<void>;
  renameFile: (oldPath: string, newPath: string) => Promise<void>;
  openProject: () => Promise<string | null>;
  runCommand: (command: string, cwd?: string) => Promise<{ stdout: string; stderr: string }>;
  weaverNew: (fileName: string, task: string, contextFile?: string) => Promise<string>;
  weaverRefactor: (fileName: string, task: string, contextDir?: string) => Promise<string>;
  weaverDocument: (fileName: string, style?: string) => Promise<string>;
  weaverTest: (fileName: string, framework?: string) => Promise<string>;
  weaverReview: (fileName: string, task?: string) => Promise<string>;
  onFileChange: (callback: (event: any, data: any) => void) => () => void;
  onCommandOutput: (callback: (event: any, data: any) => void) => () => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
*/