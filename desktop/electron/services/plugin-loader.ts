import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';

export interface Plugin {
    id: string;
    manifest: any;
    path: string;
    module: any;
    activate?: (...args: any[]) => any;
    deactivate?: (...args: any[]) => any;
}

export class PluginLoader {
    private plugins: Map<string, Plugin> = new Map();
    private pluginDir: string;

    constructor() {
        this.pluginDir = path.join(app.getPath('userData'), 'plugins');
    }

    async loadPlugins() {
        await this.ensurePluginDir();
        const pluginFolders = await fs.readdir(this.pluginDir);

        for (const folder of pluginFolders) {
            const pluginPath = path.join(this.pluginDir, folder);
            const manifestPath = path.join(pluginPath, 'manifest.json');

            try {
                const manifest = JSON.parse(
                    await fs.readFile(manifestPath, 'utf-8')
                );

                const plugin = await this.loadPlugin(pluginPath, manifest);
                this.plugins.set(manifest.id, plugin);
            } catch (error) {
                console.error(`Failed to load plugin ${folder}:`, error);
            }
        }
    }

    private async ensurePluginDir() {
        try {
            await fs.access(this.pluginDir);
        } catch {
            await fs.mkdir(this.pluginDir, { recursive: true });
        }
    }

    private async loadPlugin(pluginPath: string, manifest: any): Promise<Plugin> {
        const entry = manifest.main ? path.join(pluginPath, manifest.main) : path.join(pluginPath, 'index.js');
        const module = await import(entry);

        const plugin: Plugin = {
            id: manifest.id,
            manifest,
            path: pluginPath,
            module,
            activate: module.activate,
            deactivate: module.deactivate,
        };

        return plugin;
    }

    getPlugin(id: string): Plugin | undefined {
        return this.plugins.get(id);
    }

    listPlugins(): Plugin[] {
        return Array.from(this.plugins.values());
    }
}
