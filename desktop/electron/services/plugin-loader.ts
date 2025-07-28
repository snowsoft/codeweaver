import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';

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
}