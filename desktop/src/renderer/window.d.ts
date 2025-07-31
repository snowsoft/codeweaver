// src/renderer/window.d.ts
export interface IElectronAPI {
    weaver: {
        execute: (command: string) => Promise<{stdout: string, stderr: string}>
    },
    file: {
        read: (filePath: string) => Promise<{success: boolean, content?: string, error?: string}>,
        write: (filePath: string, content: string) => Promise<{success: boolean, error?: string}>
    },
    dialog: {
        openFile: () => Promise<Electron.OpenDialogReturnValue>,
        openDirectory: () => Promise<Electron.OpenDialogReturnValue>
    },
    shell: {
        openExternal: (url: string) => Promise<void>
        openPath: (filePath: string) => Promise<void>
    },
    on: (channel: string, callback: (...args: any[]) => void) => void,
    removeAllListeners: (channel: string) => void
}

declare global {
    interface Window {
        api: IElectronAPI
    }
}