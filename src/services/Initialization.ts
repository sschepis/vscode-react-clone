import * as path from 'path';
import * as fs from 'fs/promises';
import { Configuration } from './Configuration';

export class Initialization {
    private config: Configuration;

    constructor(config: Configuration) {
        this.config = config;
    }

    async loadPlugins(customPlugins: string[]): Promise<void> {
        for (const plugin of customPlugins) {
            try {
                const pluginModule = await import(plugin);
                await pluginModule.init(this);
                console.log(`Loaded plugin: ${plugin}`);
            } catch (error) {
                console.error(`Error loading plugin ${plugin}:`, error);
            }
        }
    }

    async loadPrompts(promptsPath: string): Promise<Record<string, any>> {
        try {
            const ppath = path.resolve(process.cwd(), promptsPath);
            if (await this.fileExists(ppath)) {
                const promptSource = JSON.parse(await fs.readFile(ppath, 'utf8'));
                return promptSource.reduce((acc: Record<string, any>, prompt: Record<string, any>) => {
                    const pName = Object.keys(prompt)[0];
                    acc[pName] = prompt[pName];
                    return acc;
                }, {});
            } else {
                console.warn(`Prompts file not found at ${ppath}. Using empty prompts object.`);
                return {};
            }
        } catch (error) {
            console.error('Error loading prompts:', error);
            return {};
        }
    }

    async loadTools(toolsPath: string): Promise<Record<string, any>> {
        try {
            const tpath = path.resolve(process.cwd(), toolsPath);
            if (await this.fileExists(tpath)) {
                return JSON.parse(await fs.readFile(tpath, 'utf8'));
            } else {
                console.warn(`Tools file not found at ${tpath}. Using empty tools object.`);
                return {};
            }
        } catch (error) {
            console.error('Error loading tools:', error);
            return {};
        }
    }

    async loadSystemRequirements(): Promise<string> {
        try {
            const reqPath = path.resolve(process.cwd(), 'requirements.txt');
            if (await this.fileExists(reqPath)) {
                return await fs.readFile(reqPath, 'utf8');
            } else {
                console.warn(`Requirements file not found at ${reqPath}. Using empty string.`);
                return '';
            }
        } catch (error) {
            console.error('Error loading system requirements:', error);
            return '';
        }
    }

    private async fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
}