import { Configuration } from '../services/Configuration';

export class AzureOpenAIProvider {
    private config: Configuration;

    constructor(config: Configuration) {
        this.config = config;
    }

    async chat(messages: any[], options: any = {}): Promise<any> {
        // TODO: Implement actual Azure OpenAI API call
        console.log('Azure OpenAI chat called with messages:', messages, 'and options:', options);
        return {
            content: 'Mock Azure OpenAI response',
            actions: []
        };
    }
}