export interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: FileNode[];
    extension?: string;
}

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
    onFileChange: (callback: (event: any, data: any) => void) => () => void;
    onCommandOutput: (callback: (event: any, data: any) => void) => () => void;
}

declare global {
    interface Window {
        electron: ElectronAPI;
    }
}