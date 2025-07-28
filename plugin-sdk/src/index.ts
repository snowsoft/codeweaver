// plugin-sdk/src/index.ts
export interface CodeWeaverPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: {
    name: string;
    email?: string;
    url?: string;
  };
  engines: {
    codeweaver: string;
    node?: string;
  };
  activationEvents: string[];
  main: string;
  contributes?: PluginContributions;
  dependencies?: Record<string, string>;
  icon?: string;
  categories?: string[];
  keywords?: string[];
  license?: string;
  repository?: {
    type: string;
    url: string;
  };
}

export interface PluginContributions {
  commands?: PluginCommand[];
  templates?: PluginTemplate[];
  aiPrompts?: AIPrompt[];
  views?: PluginView[];
  languages?: LanguageSupport[];
  themes?: Theme[];
  snippets?: Snippet[];
  keybindings?: Keybinding[];
  configuration?: Configuration[];
}

export interface PluginCommand {
  command: string;
  title: string;
  category?: string;
  icon?: string;
  enablement?: string;
  args?: CommandArgument[];
}

export interface PluginTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  files: TemplateFile[];
  variables?: TemplateVariable[];
  commands?: string[];
}

export interface AIPrompt {
  id: string;
  name: string;
  description: string;
  prompt: string;
  context?: string[];
  parameters?: PromptParameter[];
}

// Plugin API
export class CodeWeaverPluginAPI {
  private context: PluginContext;

  constructor(context: PluginContext) {
    this.context = context;
  }

  // Commands
  registerCommand(command: string, callback: (...args: any[]) => any): Disposable {
    return this.context.subscriptions.push(
      commands.registerCommand(command, callback)
    );
  }

  executeCommand(command: string, ...args: any[]): Promise<any> {
    return commands.executeCommand(command, ...args);
  }

  // Templates
  registerTemplate(template: PluginTemplate): Disposable {
    return templates.register(template);
  }

  // AI Integration
  registerAIPrompt(prompt: AIPrompt): Disposable {
    return ai.registerPrompt(prompt);
  }

  async generateCode(options: GenerateOptions): Promise<GenerateResult> {
    return ai.generate(options);
  }

  async refactorCode(options: RefactorOptions): Promise<RefactorResult> {
    return ai.refactor(options);
  }

  // File System
  async readFile(path: string): Promise<string> {
    return fs.readFile(path, 'utf-8');
  }

  async writeFile(path: string, content: string): Promise<void> {
    return fs.writeFile(path, content);
  }

  // UI
  showInformationMessage(message: string, ...items: string[]): Promise<string | undefined> {
    return window.showInformationMessage(message, ...items);
  }

  showErrorMessage(message: string, ...items: string[]): Promise<string | undefined> {
    return window.showErrorMessage(message, ...items);
  }

  showInputBox(options: InputBoxOptions): Promise<string | undefined> {
    return window.showInputBox(options);
  }

  createWebviewPanel(viewType: string, title: string, options?: WebviewOptions): WebviewPanel {
    return window.createWebviewPanel(viewType, title, options);
  }

  // Configuration
  getConfiguration(section?: string): WorkspaceConfiguration {
    return workspace.getConfiguration(section);
  }

  // Events
  onDidChangeConfiguration(listener: (e: ConfigurationChangeEvent) => any): Disposable {
    return workspace.onDidChangeConfiguration(listener);
  }

  onDidChangeActiveTextEditor(listener: (editor: TextEditor | undefined) => any): Disposable {
    return window.onDidChangeActiveTextEditor(listener);
  }
}

// Plugin Manager
export class PluginManager {
  private plugins: Map<string, LoadedPlugin> = new Map();
  private api: CodeWeaverPluginAPI;

  constructor() {
    this.api = new CodeWeaverPluginAPI(this.createContext());
  }

  async loadPlugin(pluginPath: string): Promise<void> {
    try {
      // Load plugin manifest
      const manifestPath = path.join(pluginPath, 'package.json');
      const manifest: CodeWeaverPlugin = JSON.parse(
        await fs.readFile(manifestPath, 'utf-8')
      );

      // Validate plugin
      this.validatePlugin(manifest);

      // Load plugin module
      const mainPath = path.join(pluginPath, manifest.main);
      const pluginModule = require(mainPath);

      // Create plugin context
      const context = this.createPluginContext(manifest);

      // Activate plugin
      if (typeof pluginModule.activate === 'function') {
        await pluginModule.activate(context);
      }

      // Store loaded plugin
      this.plugins.set(manifest.id, {
        manifest,
        module: pluginModule,
        context,
        path: pluginPath
      });

      // Register contributions
      this.registerContributions(manifest);

      console.log(`Plugin loaded: ${manifest.name} v${manifest.version}`);
    } catch (error) {
      console.error(`Failed to load plugin from ${pluginPath}:`, error);
      throw error;
    }
  }

  async unloadPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    // Deactivate plugin
    if (typeof plugin.module.deactivate === 'function') {
      await plugin.module.deactivate();
    }

    // Dispose subscriptions
    plugin.context.subscriptions.forEach(sub => sub.dispose());

    // Remove from registry
    this.plugins.delete(pluginId);

    console.log(`Plugin unloaded: ${pluginId}`);
  }

  private validatePlugin(manifest: CodeWeaverPlugin): void {
    if (!manifest.id || !manifest.name || !manifest.version) {
      throw new Error('Plugin must have id, name, and version');
    }

    if (!manifest.main) {
      throw new Error('Plugin must specify main entry point');
    }

    // Validate version compatibility
    const requiredVersion = manifest.engines.codeweaver;
    if (!this.isVersionCompatible(requiredVersion)) {
      throw new Error(`Plugin requires CodeWeaver ${requiredVersion}`);
    }
  }

  private createPluginContext(manifest: CodeWeaverPlugin): PluginContext {
    return {
      pluginId: manifest.id,
      pluginPath: '', // Will be set during load
      subscriptions: [],
      globalState: new MemoryState(),
      workspaceState: new MemoryState(),
      extensionUri: Uri.file(''),
      api: this.api
    };
  }

  private registerContributions(manifest: CodeWeaverPlugin): void {
    const contributions = manifest.contributes;
    if (!contributions) return;

    // Register commands
    contributions.commands?.forEach(cmd => {
      this.registerCommand(cmd);
    });

    // Register templates
    contributions.templates?.forEach(template => {
      this.registerTemplate(template);
    });

    // Register AI prompts
    contributions.aiPrompts?.forEach(prompt => {
      this.registerAIPrompt(prompt);
    });

    // Register views
    contributions.views?.forEach(view => {
      this.registerView(view);
    });

    // Register language support
    contributions.languages?.forEach(lang => {
      this.registerLanguage(lang);
    });

    // Register themes
    contributions.themes?.forEach(theme => {
      this.registerTheme(theme);
    });
  }

  // ... Additional registration methods
}