import { Configuration } from '../services/Configuration';

export class AnthropicProvider {
    private config: Configuration;

    constructor(config: Configuration) {
        this.config = config;
    }

    async chat(messages: any[], options: any = {}): Promise<any> {
        // TODO: Implement actual Anthropic API call
        console.log('Anthropic chat called with messages:', messages, 'and options:', options);
        return {
            content: 'Mock Anthropic response',
            actions: []
        };
    }
}