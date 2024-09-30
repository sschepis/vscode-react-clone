import { AIProviderInterface } from '../../interfaces/AIProvider';
import { AIPrompt, PromptResponse } from '../../interfaces/Prompt';
import { settingsService } from '../SettingsService';

export class GoogleVertexAnthropicProvider implements AIProviderInterface {
  name = 'Google Vertex Anthropic' as const;

  async executePrompt(prompt: AIPrompt): Promise<PromptResponse> {
    const projectId = settingsService.getSetting('ai.googleVertex.projectId');
    const location = settingsService.getSetting('ai.googleVertex.location');
    const modelId = settingsService.getSetting('ai.googleVertex.modelId');
    // TODO: Implement Google Vertex AI Anthropic API call using projectId, location, and modelId
    console.log('Executing Google Vertex Anthropic prompt:', prompt);
    return { result: 'Mock Google Vertex Anthropic response' };
  }
}