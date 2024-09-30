import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AppSettings, SettingsChangedListener, SettingsResetListener } from '../interfaces/Settings';
import { ValidationError, SettingsSaveError, SettingsLoadError } from '../errors/SettingsErrors';
import { validateSetting } from '../utils/SettingsValidator';

export class SettingsService {
  private settings: AppSettings;
  private eventEmitter: EventEmitter;
  private settingsFilePath: string;
  private initialized: boolean = false;

  constructor(settingsFilePath: string = 'settings.json') {
    this.settingsFilePath = path.resolve(process.cwd(), settingsFilePath);
    this.settings = this.getDefaultSettings();
    this.eventEmitter = new EventEmitter();
  }

  public async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.loadSettings();
      this.initialized = true;
    }
  }

  private getDefaultSettings(): AppSettings {
    return {
      "editor.fontSize": 14,
      "editor.fontFamily": "Consolas, 'Courier New', monospace",
      "editor.tabSize": 4,
      "editor.insertSpaces": true,
      "editor.wordWrap": "off",
      "editor.lineNumbers": "on",
      "ai.provider": "Anthropic Claude",
      "ai.anthropic.apiKey": "",
      "ai.googleVertex.projectId": "",
      "ai.googleVertex.location": "",
      "ai.googleVertex.modelId": "",
      "ai.openRouter.apiKey": "",
      "explorer.autoReveal": true,
      "explorer.sortOrder": "default",
      "terminal.integrated.fontSize": 14,
      "terminal.integrated.fontFamily": "monospace",
      "workbench.colorTheme": "Default Dark+",
      "workbench.iconTheme": "vs-seti",
      "build.defaultAction": "build",
      "build.parallelJobs": 4
    };
  }

  private async saveSettings(): Promise<void> {
    try {
      await fs.writeFile(this.settingsFilePath, JSON.stringify(this.settings, null, 2));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new SettingsSaveError('Failed to save settings');
    }
  }

  private async loadSettings(): Promise<void> {
    try {
      const data = await fs.readFile(this.settingsFilePath, 'utf8');
      const loadedSettings = JSON.parse(data) as Record<string, unknown>;
      
      // Validate and merge loaded settings with default settings
      for (const [key, value] of Object.entries(loadedSettings)) {
        if (key in this.settings) {
          try {
            validateSetting(key as keyof AppSettings, value);
            (this.settings as any)[key] = value;
          } catch (error) {
            console.warn(`Invalid setting ${key}, using default value`);
          }
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.log('Settings file not found, using default settings');
        await this.saveSettings(); // Create the settings file with default values
      } else {
        console.error('Error loading settings:', error);
        throw new SettingsLoadError('Failed to load settings');
      }
    }
  }

  public getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
    if (!this.initialized) {
      throw new Error('SettingsService is not initialized. Call initialize() first.');
    }
    return this.settings[key];
  }

  public async updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> {
    if (!this.initialized) {
      throw new Error('SettingsService is not initialized. Call initialize() first.');
    }
    validateSetting(key, value);
    this.settings[key] = value;
    this.eventEmitter.emit('settingsChanged', key, value);
    await this.saveSettings();
  }

  public getAll(): AppSettings {
    if (!this.initialized) {
      throw new Error('SettingsService is not initialized. Call initialize() first.');
    }
    return { ...this.settings };
  }

  public async resetToDefault(): Promise<void> {
    if (!this.initialized) {
      throw new Error('SettingsService is not initialized. Call initialize() first.');
    }
    this.settings = this.getDefaultSettings();
    this.eventEmitter.emit('settingsReset');
    await this.saveSettings();
  }

  public onSettingsChanged(listener: SettingsChangedListener): void {
    this.eventEmitter.on('settingsChanged', listener);
  }

  public onSettingsReset(listener: SettingsResetListener): void {
    this.eventEmitter.on('settingsReset', listener);
  }

  public removeSettingsChangedListener(listener: SettingsChangedListener): void {
    this.eventEmitter.removeListener('settingsChanged', listener);
  }

  public removeSettingsResetListener(listener: SettingsResetListener): void {
    this.eventEmitter.removeListener('settingsReset', listener);
  }
}

export const settingsService = new SettingsService();