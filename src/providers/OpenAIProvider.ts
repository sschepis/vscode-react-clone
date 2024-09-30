import { Configuration } from '../services/Configuration';

export class OpenAIProvider {
    private config: Configuration;

    constructor(config: Configuration) {
        this.config = config;
    }

    async chat(messages: any[], options: any = {}): Promise<any> {
        // TODO: Implement actual OpenAI API call
        console.log('OpenAI chat called with messages:', messages, 'and options:', options);
        return {
            content: 'Mock OpenAI response',
            actions: []
        };
    }
}