import { languages, editor } from 'monaco-editor';
import React from 'react';

export interface Extension {
  id: string;
  name: string;
  version: string;
  description: string;
  activationEvents: string[];
  dependencies: string[];
  contributes: {
    commands?: Array<{ command: string; title: string }>;
    languages?: languages.ILanguageExtensionPoint[];
    themes?: editor.IStandaloneThemeData[];
    views?: Array<{ id: string; name: string; component: React.ComponentType<any> }>;
    statusBarItems?: Array<StatusBarItem>;
  };
  activate: (api: ExtensionAPI) => Promise<void>;
  deactivate?: () => Promise<void>;
}

export interface ExtensionAPI {
  registerCommand: (name: string, callback: () => void) => void;
  registerLanguage: (language: languages.ILanguageExtensionPoint) => void;
  registerTheme: (theme: editor.IStandaloneThemeData) => void;
  registerView: (view: { id: string; name: string; component: React.ComponentType<any> }) => void;
  registerStatusBarItem: (item: StatusBarItem) => void;
  getConfiguration: (extensionId: string) => any;
  setConfiguration: (extensionId: string, config: any) => void;
}

export interface ExtensionManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  main: string;
  activationEvents: string[];
  dependencies: string[];
  contributes: {
    commands?: Array<{ command: string; title: string }>;
    languages?: languages.ILanguageExtensionPoint[];
    themes?: editor.IStandaloneThemeData[];
    views?: Array<{ id: string; name: string }>;
    statusBarItems?: Array<StatusBarItem>;
  };
}

export interface StatusBarItem {
  id: string;
  text: string;
  tooltip?: string;
  command?: string;
  priority?: number;
}

export class ExtensionService {
  private extensions: Map<string, Extension> = new Map();
  private activatedExtensions: Set<string> = new Set();
  private commands: Map<string, () => void> = new Map();
  private views: Map<string, React.ComponentType<any>> = new Map();
  private statusBarItems: Map<string, StatusBarItem> = new Map();
  private configurations: Map<string, any> = new Map();

  constructor() {
    this.initializeAPI();
  }

  private initializeAPI(): ExtensionAPI {
    return {
      registerCommand: this.registerCommand.bind(this),
      registerLanguage: this.registerLanguage.bind(this),
      registerTheme: this.registerTheme.bind(this),
      registerView: this.registerView.bind(this),
      registerStatusBarItem: this.registerStatusBarItem.bind(this),
      getConfiguration: this.getConfiguration.bind(this),
      setConfiguration: this.setConfiguration.bind(this),
    };
  }

  async loadExtension(manifest: ExtensionManifest): Promise<void> {
    const extensionModule = await import(`../extensions/${manifest.main}`);
    const extension: Extension = {
      ...manifest,
      activate: extensionModule.activate,
      deactivate: extensionModule.deactivate,
      contributes: {
        ...manifest.contributes,
        views: manifest.contributes.views?.map(view => ({
          ...view,
          component: extensionModule[view.id] as React.ComponentType<any>,
        })),
      },
    };
    this.extensions.set(extension.id, extension);

    // Activate the extension if it has no activation events
    if (extension.activationEvents.length === 0) {
      await this.activateExtension(extension.id);
    }
  }

  async activateExtension(extensionId: string): Promise<void> {
    if (this.activatedExtensions.has(extensionId)) {
      return;
    }

    const extension = this.extensions.get(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} not found`);
    }

    // Activate dependencies first
    for (const dependencyId of extension.dependencies) {
      await this.activateExtension(dependencyId);
    }

    await extension.activate(this.initializeAPI());
    this.activatedExtensions.add(extensionId);
  }

  async deactivateExtension(extensionId: string): Promise<void> {
    if (!this.activatedExtensions.has(extensionId)) {
      return;
    }

    const extension = this.extensions.get(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} not found`);
    }

    if (extension.deactivate) {
      await extension.deactivate();
    }

    this.activatedExtensions.delete(extensionId);

    // Clean up registered commands, views, status bar items, etc.
    this.commands.forEach((_, key) => {
      if (key.startsWith(`${extensionId}.`)) {
        this.commands.delete(key);
      }
    });

    this.views.forEach((_, key) => {
      if (key.startsWith(`${extensionId}.`)) {
        this.views.delete(key);
      }
    });

    this.statusBarItems.forEach((_, key) => {
      if (key.startsWith(`${extensionId}.`)) {
        this.statusBarItems.delete(key);
      }
    });

    this.configurations.delete(extensionId);
  }

  registerCommand(name: string, callback: () => void) {
    this.commands.set(name, callback);
  }

  executeCommand(name: string) {
    const command = this.commands.get(name);
    if (command) {
      command();
    } else {
      console.warn(`Command "${name}" not found`);
    }
  }

  registerLanguage(language: languages.ILanguageExtensionPoint) {
    languages.register(language);
  }

  registerTheme(theme: editor.IStandaloneThemeData) {
    editor.defineTheme(theme.name, theme);
  }

  registerView(view: { id: string; name: string; component: React.ComponentType<any> }) {
    this.views.set(view.id, view.component);
  }

  registerStatusBarItem(item: StatusBarItem) {
    this.statusBarItems.set(item.id, item);
  }

  getView(id: string): React.ComponentType<any> | undefined {
    return this.views.get(id);
  }

  getConfiguration(extensionId: string): any {
    return this.configurations.get(extensionId) || {};
  }

  setConfiguration(extensionId: string, config: any) {
    this.configurations.set(extensionId, config);
  }

  getLoadedExtensions() {
    return Array.from(this.extensions.values()).map(ext => ({
      id: ext.id,
      name: ext.name,
      version: ext.version,
      description: ext.description,
    }));
  }

  getRegisteredCommands() {
    return Array.from(this.commands.keys());
  }

  getStatusBarItems() {
    return Array.from(this.statusBarItems.values());
  }

  async triggerActivationEvent(event: string) {
    for (const [extensionId, extension] of this.extensions) {
      if (extension.activationEvents.includes(event) && !this.activatedExtensions.has(extensionId)) {
        await this.activateExtension(extensionId);
      }
    }
  }
}

export const extensionService = new ExtensionService();