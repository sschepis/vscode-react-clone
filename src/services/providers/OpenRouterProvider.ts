import { AIProviderInterface } from '../../interfaces/AIProvider';
import { AIPrompt, PromptResponse } from '../../interfaces/Prompt';
import { settingsService } from '../SettingsService';

export class OpenRouterProvider implements AIProviderInterface {
  name = 'Open Router' as const;

  async executePrompt(prompt: AIPrompt): Promise<PromptResponse> {
    const apiKey = settingsService.getSetting('ai.openRouter.apiKey');
    // TODO: Implement Open Router API call using apiKey
    console.log('Executing Open Router prompt:', prompt);
    return { result: 'Mock Open Router response' };
  }
}