import { EventEmitter } from 'events';
import { Configuration } from './Configuration';
import { ResourceMonitor } from './ResourceMonitor';
import { Initialization } from './Initialization';
import { PromptExecution } from './PromptExecution';
import { AIProviders } from './AIProviders';
import { ToolManagement } from './ToolManagement';

function mapToRecord<K extends string, V>(map: Map<K, V>): Record<K, V> {
    const record: Record<K, V> = {} as Record<K, V>;
    map.forEach((value, key) => {
        record[key] = value;
    });
    return record;
}

export class DynamicAISystem extends EventEmitter {
    protected config: Configuration;
    protected resourceMonitor: ResourceMonitor;
    protected initialization: Initialization;
    protected toolManagement: ToolManagement;
    protected aiProviders: AIProviders;
    protected prompts: Record<string, any> = {};
    protected cache: Map<string, any> = new Map();
    protected state: Record<string, any> = {};
    protected promptExecution: PromptExecution | undefined;

    constructor(configPath: string | null) {
        super();
        this.config = new Configuration(configPath);
        this.resourceMonitor = new ResourceMonitor();
        this.initialization = new Initialization(this.config);
        this.toolManagement = new ToolManagement();
        this.aiProviders = new AIProviders(this.config);
    }

    async init(): Promise<this> {
        try {
            const customPlugins = this.config.get('customPlugins') || [];
            await this.initialization.loadPlugins(customPlugins);
            
            const promptsPath = this.config.get('promptsPath') || 'prompts.json';
            const toolsPath = this.config.get('toolsPath') || 'tools.json';
            
            this.prompts = await this.initialization.loadPrompts(promptsPath);
            const tools = await this.initialization.loadTools(toolsPath);
            
            // Convert tools Map to Record
            const toolsRecord = mapToRecord(tools);
            
            this.toolManagement.initializeTools(toolsRecord);
            this.promptExecution = new PromptExecution(
                this.toolManagement.getTools(),
                this.prompts,
                this.aiProviders.chat.bind(this.aiProviders)
            );
            
            this.setupEventListeners();
            this.resourceMonitor.start();
            
            // Initialize prompt executors
            for (const [promptName, promptData] of Object.entries(this.prompts)) {
                this.prompts[promptName].exec = this.promptExecution.createDynamicPromptExecutor(promptData);
            }
            
            return this;
        } catch (error) {
            console.error('Error initializing DynamicAISystem:', error);
            throw error;
        }
    }

    protected setupEventListeners(): void {
        this.on('highLoad', this.handleHighLoad.bind(this));
        this.on('normalLoad', this.handleNormalLoad.bind(this));
    }

    protected handleHighLoad(data: any): void {
        console.warn('High system load detected:', data);
        // Implement load management strategies here
    }

    protected handleNormalLoad(data: any): void {
        console.log('System load returned to normal:', data);
        // Implement normal load operations here
    }

    async chat(messages: any[], options: Record<string, any> = {}): Promise<any> {
        const cacheKey = JSON.stringify({ messages, options });
        if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

        try {
            const toolSchemas = this.toolManagement.getToolSchemas();
            const response = await this.aiProviders.chat(messages, { ...options, tools: toolSchemas });
            this.cache.set(cacheKey, response);
            return response;
        } catch (error) {
            console.error('Error in chat method:', error);
            throw new Error('Failed to get response from AI provider');
        }
    }

    addTool(name: string, tool: any): any {
        return this.toolManagement.addTool(name, tool);
    }

    getTools(): Record<string, any> {
        return this.toolManagement.getTools();
    }

    getPrompts(): Record<string, any> {
        return this.prompts;
    }
}