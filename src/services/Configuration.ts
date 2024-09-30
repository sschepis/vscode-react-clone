import * as fs from 'fs';
import * as path from 'path';

export class Configuration {
    private config: Record<string, any>;
    private configPath: string;

    constructor(configPath: string | null = null) {
        this.config = {
            // Default configuration
            excludedFolders: ['node_modules', 'dist', 'build', '.git'],
            languages: ['javascript', 'typescript', 'python'],
            maxFileSize: 1024 * 1024, // 1MB
            analysisDepth: 'deep',
            aiProvider: 'openai',
            maxTokens: 2000,
            temperature: 0.7,
        };
        this.configPath = configPath || path.join(process.cwd(), 'config.json');
        this.load();
    }

    private load(): void {
        try {
            const fileContent = fs.readFileSync(this.configPath, 'utf8');
            const fileConfig = JSON.parse(fileContent);
            this.config = { ...this.config, ...fileConfig };
            console.log('Configuration loaded successfully');
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                console.log('No configuration file found, using defaults');
                this.save(); // Save default configuration
            } else {
                console.error('Error loading configuration:', error);
            }
        }
    }

    private save(): void {
        try {
            fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
            console.log('Configuration saved successfully');
        } catch (error) {
            console.error('Error saving configuration:', error);
        }
    }

    get(key: string): any {
        return this.config[key];
    }

    set(key: string, value: any): void {
        this.config[key] = value;
        this.save(); // Autosave on change
    }

    getAll(): Record<string, any> {
        return { ...this.config };
    }
}