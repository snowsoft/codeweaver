import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';

export class WeaverBridge extends EventEmitter {
    private weaverPath: string;

    constructor() {
        super();
        this.weaverPath = this.getWeaverBinaryPath();
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