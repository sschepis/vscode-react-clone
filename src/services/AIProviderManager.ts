import { AIProviderInterface } from '../interfaces/AIProvider';
import { AIProvider } from '../interfaces/Settings';
import { settingsService } from './SettingsService';
import { AnthropicClaudeProvider } from './providers/AnthropicClaudeProvider';
import { GoogleVertexAnthropicProvider } from './providers/GoogleVertexAnthropicProvider';
import { OpenRouterProvider } from './providers/OpenRouterProvider';

export class AIProviderManager {
  private providers: Map<AIProvider, AIProviderInterface> = new Map();
  private currentProvider: AIProvider;

  constructor() {
    this.initializeProviders();
    this.currentProvider = settingsService.getSetting('ai.provider');
  }

  private initializeProviders() {
    this.addProvider(new AnthropicClaudeProvider());
    this.addProvider(new GoogleVertexAnthropicProvider());
    this.addProvider(new OpenRouterProvider());
  }

  addProvider(provider: AIProviderInterface): void {
    this.providers.set(provider.name, provider);
  }

  getProvider(name: AIProvider): AIProviderInterface | undefined {
    return this.providers.get(name);
  }

  listProviders(): AIProvider[] {
    return Array.from(this.providers.keys());
  }

  getCurrentProvider(): AIProviderInterface {
    const provider = this.getProvider(this.currentProvider);
    if (!provider) {
      throw new Error(`AI provider "${this.currentProvider}" not found`);
    }
    return provider;
  }

  setCurrentProvider(providerName: AIProvider): void {
    if (!this.providers.has(providerName)) {
      throw new Error(`AI provider "${providerName}" not found`);
    }
    this.currentProvider = providerName;
  }
}

export const aiProviderManager = new AIProviderManager();