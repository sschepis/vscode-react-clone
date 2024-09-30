import { AIPrompt, PromptResponse, AIProvider } from '../interfaces';
import { aiProviderManager } from './AIProviderManager';
import { ideApiService } from './IDEAPIService';
import { settingsService } from './SettingsService';

export class AIService {
  constructor() {}

  async initialize(): Promise<void> {
    // Ensure settings are initialized before using them
    await settingsService.initialize();
    const defaultProvider = settingsService.getSetting('ai.provider');
    this.setProvider(defaultProvider);
  }

  async executePrompt(prompt: AIPrompt): Promise<PromptResponse> {
    const currentProvider = aiProviderManager.getCurrentProvider();
    const toolSchemas = ideApiService.getAllToolSchemas();
    const enhancedPrompt = this.enhancePromptWithTools(prompt, toolSchemas);

    return currentProvider.executePrompt(enhancedPrompt);
  }

  private enhancePromptWithTools(prompt: AIPrompt, toolSchemas: any[]): AIPrompt {
    const toolInstructions = toolSchemas.map(schema => 
      `Tool Name: ${schema.name}\nDescription: ${schema.description}\nInput Schema: ${JSON.stringify(schema.input_schema, null, 2)}\n`
    ).join('\n');

    const enhancedSystemPrompt = `
${prompt.system}

You have access to the following tools:

${toolInstructions}

To use a tool, output a JSON object with the following structure:
{
  "tool": "tool_name",
  "input": {
    // tool-specific input parameters
  }
}
`;

    return {
      ...prompt,
      system: enhancedSystemPrompt,
    };
  }

  listAvailableProviders(): AIProvider[] {
    return aiProviderManager.listProviders();
  }

  setProvider(providerName: AIProvider): void {
    aiProviderManager.setCurrentProvider(providerName);
    settingsService.updateSetting('ai.provider', providerName);
  }
}

export const aiService = new AIService();