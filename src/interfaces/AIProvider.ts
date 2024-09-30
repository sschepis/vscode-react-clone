import { AIPrompt, PromptResponse } from './Prompt';
import { AIProvider as AIProviderType } from './Settings';

export interface AIProviderInterface {
  name: AIProviderType;
  executePrompt(prompt: AIPrompt): Promise<PromptResponse>;
}

export interface AIProviderConfig {
  anthropic: {
    apiKey: string;
  };
  googleVertex: {
    projectId: string;
    location: string;
    modelId: string;
  };
  openRouter: {
    apiKey: string;
  };
}