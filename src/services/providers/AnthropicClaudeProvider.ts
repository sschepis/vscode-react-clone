import { AIProviderInterface } from '../../interfaces/AIProvider';
import { AIPrompt, PromptResponse } from '../../interfaces/Prompt';
import { settingsService } from '../SettingsService';
import Anthropic from '@anthropic-ai/sdk';

export class AnthropicClaudeProvider implements AIProviderInterface {
  name = 'Anthropic Claude' as const;
  private client: Anthropic;

  constructor() {
    const apiKey = settingsService.getSetting('ai.anthropic.apiKey');
    this.client = new Anthropic({ apiKey });
  }

  async executePrompt(prompt: AIPrompt): Promise<PromptResponse> {
    try {
      const { system, user } = prompt;

      const fullPrompt = `${Anthropic.HUMAN_PROMPT} ${system}\n\nHuman: ${user}${Anthropic.AI_PROMPT}`;

      const response = await this.client.completions.create({
        model: 'claude-2', // You can change this to the specific Claude model you want to use
        prompt: fullPrompt,
        max_tokens_to_sample: 1000,
        temperature: 0.7,
        stop_sequences: [Anthropic.HUMAN_PROMPT],
      });

      const result = response.completion.trim();

      // Attempt to parse the result as JSON if a responseFormat is provided
      if (prompt.responseFormat) {
        try {
          const parsedResult = JSON.parse(result);
          return parsedResult;
        } catch (error) {
          console.warn('Failed to parse AI response as JSON. Returning raw string.');
          return { result };
        }
      }

      return { result };
    } catch (error) {
      console.error('Error executing Anthropic Claude prompt:', error);
      throw new Error('Failed to execute Anthropic Claude prompt');
    }
  }
}