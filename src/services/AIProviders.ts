import { Configuration } from './Configuration';
import { OpenAIProvider } from '../providers/OpenAIProvider';
import { AnthropicProvider } from '../providers/AnthropicProvider';
import { GeminiProvider } from '../providers/VertexGeminiProvider';
import { AzureOpenAIProvider } from '../providers/AzureOpenAIProvider';
import { VertexAnthropicProvider } from '../providers/VertexAnthropicProvider';

interface AIProvider {
    chat(messages: any[], options: any): Promise<any>;
}

export class AIProviders {
    private config: Configuration;
    private providers: Record<string, AIProvider>;

    constructor(config: Configuration) {
        this.config = config;
        this.providers = {
            openai: new OpenAIProvider(config),
            anthropic: new AnthropicProvider(config),
            gemini: new GeminiProvider(config),
            vertexanthropic: new VertexAnthropicProvider(config),
            azureopenai: new AzureOpenAIProvider(config)
        };
    }

    async chat(messages: any[], options: any = {}): Promise<any> {
        const aiProvider = options.aiProvider || this.config.get('aiProvider');
        const provider = this.getProvider(aiProvider);

        try {
            const toolSchemas = this.validateAndPrepareTools(options.tools || []);
            console.log('Prepared tool schemas:', JSON.stringify(toolSchemas, null, 2));
            const response = await provider.chat(messages, { ...options, tools: toolSchemas });
            this.validateResponse(response);
            return response;
        } catch (error) {
            console.error('Error in chat method:', error);
            throw new Error('Failed to get response from AI provider');
        }
    }

    private getProvider(aiProvider: string): AIProvider {
        const provider = this.providers[aiProvider];
        if (!provider) {
            throw new Error(`Unsupported AI provider: ${aiProvider}`);
        }
        return provider;
    }

    private validateAndPrepareTools(tools: any[]): any[] {
        return tools.map(tool => {
            if (!tool.name || !tool.description || !tool.parameters) {
                console.error('Invalid tool schema:', JSON.stringify(tool));
                throw new Error(`Invalid tool schema: ${JSON.stringify(tool)}`);
            }
            return {
                type: "function",
                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: {
                        type: "object",
                        properties: tool.parameters.properties,
                        required: tool.parameters.required
                    }
                }
            };
        });
    }

    private validateResponse(response: any): void {
        if (!response || (typeof response !== 'object' && typeof response !== 'string')) {
            throw new Error('Invalid response format');
        }
        if (typeof response === 'object' && !response.content && !response.actions) {
            throw new Error('Response missing required fields');
        }
    }
}