import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';

export class WeaverBridge extends EventEmitter {
    private weaverPath: string;

    constructor() {
        super();
        this.weaverPath = this.getWeaverBinaryPath();
    }

    private buildArgs(options: Record<string, any>): string[] {
        const args: string[] = [];
        const skip = new Set(['filePath', 'task']);
        for (const [key, value] of Object.entries(options)) {
            if (value === undefined || skip.has(key)) continue;
            const flag = '--' + key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());
            args.push(flag);
            args.push(String(value));
        }
        return args;
    }

    private parseOutput(output: string): any {
        const trimmed = output.trim();
        if (!trimmed) return {};
        try {
            return JSON.parse(trimmed);
        } catch {
            return { code: trimmed };
        }
    }

    private getWeaverBinaryPath(): string {
        const binary = process.platform === 'win32' ? 'weaver.exe' : 'weaver';
        const possible = [
            path.join(process.resourcesPath || '', binary),
            path.join(__dirname, '..', '..', '..', binary)
        ];
        for (const p of possible) {
            if (p && fs.existsSync(p)) {
                return p;
            }
        }
        return binary;
    }

    async generateCode(options: GenerateOptions): Promise<GenerateResult> {
        return this.executeCommand('new', [
            options.filePath,
            '--task', options.task,
            ...this.buildArgs(options)
        ]);
    }

    async refactorCode(options: RefactorOptions): Promise<RefactorResult> {
        return this.executeCommand('refactor', [
            options.filePath,
            '--task', options.task,
            ...this.buildArgs(options)
        ]);
    }

    private executeCommand(command: string, args: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            const process = spawn(this.weaverPath, [command, ...args]);
            let output = '';
            let error = '';

            process.stdout.on('data', (data) => {
                const chunk = data.toString();
                output += chunk;
                this.emit('output', chunk);
            });

            process.stderr.on('data', (data) => {
                error += data.toString();
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve(this.parseOutput(output));
                } else {
                    reject(new Error(error || `Process exited with code ${code}`));
                }
            });
        });
    }
}

export interface GenerateOptions {
    filePath: string;
    task: string;
    contextFile?: string;
    contextDir?: string;
    provider?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
}

export interface GenerateResult {
    [key: string]: string;
}

export interface RefactorOptions {
    filePath: string;
    task: string;
    contextDir?: string;
    provider?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
}

export interface RefactorResult {
    [key: string]: string;
}
