import { jsonrepair } from '../utils/utility-functions';

interface ToolSchema {
    name: string;
    schema: any;
    exec: (params: any) => Promise<any>;
}

interface PromptTemplate {
    requestFormat?: Record<string, string>;
    system: string;
    user: string;
    options?: any;
}

type ChatFunction = (messages: any[], options: any) => Promise<any>;

export class PromptExecution {
    private tools: Record<string, ToolSchema>;
    private prompts: Record<string, any>;
    private chat: ChatFunction;

    constructor(tools: Record<string, ToolSchema>, prompts: Record<string, any>, chat: ChatFunction) {
        this.tools = tools;
        this.prompts = prompts;
        this.chat = chat;
    }

    createDynamicPromptExecutor(promptTemplate: PromptTemplate) {
        return async (requestObject: any, state: Record<string, any> = {}, userOptions: any = {}) => {
            if (promptTemplate.requestFormat) {
                this.validateRequestFormat(requestObject, promptTemplate.requestFormat);
            }
            const messages = this.createMessages(promptTemplate, requestObject, state);
            const options = { ...promptTemplate.options, ...userOptions };
            return this.executePrompt(messages, options, state);
        };
    }

    private validateRequestFormat(requestObject: any, requestFormat: Record<string, string>) {
        for (const [key, type] of Object.entries(requestFormat)) {
            if (Array.isArray(type)) {
                if (!type.includes(typeof requestObject[key])) {
                    throw new Error(`Invalid request format: ${key} should be one of types ${type.join(', ')} but is ${typeof requestObject[key]}`);
                }
            } else if (typeof requestObject[key] !== type) {
                throw new Error(`Invalid request format: ${key} should be of type ${type} but is ${typeof requestObject[key]}`);
            }
        }
    }

    private createMessages(promptTemplate: PromptTemplate, requestObject: any, state: Record<string, any>) {
        return [
            {
                role: 'system',
                content: JSON.stringify({
                    system: this.interpolate(promptTemplate.system, { ...requestObject, ...state }),
                    response_format: {
                        type: "json_object",
                        options: ["JSON_OUTPUT_ONLY", "DISABLE_COMMENTARY", "DISABLE_CODEBLOCKS"]
                    },
                    tools: this.getToolsSource(),
                    prompts: this.prompts,
                    actions: 'To use a tool or a prompt, add an actions parameter to your response containing an array of action objects. Action objects have the format { name: "<tool or prompt name>", data: { key: value } }.'
                }),
            },
            {
                role: 'user',
                content: JSON.stringify({
                    system: this.interpolate(promptTemplate.user, { ...requestObject, ...state }),
                    response_format: {
                        type: "json_object",
                        options: ["JSON_OUTPUT_ONLY", "DISABLE_COMMENTARY", "DISABLE_CODEBLOCKS"]
                    },
                    state
                }),
            },
        ];
    }

    private async executePrompt(messages: any[], options: any, state: Record<string, any>): Promise<any> {
        const response = await this.chat(messages, options);
        let result = this.parseResponse(response);
        messages.push({ role: 'assistant', content: JSON.stringify(result) });

        if (result.actions) {
            for (const action of result.actions) {
                const actionResult = await this.executeAction(action, state);
                if (action.echo) {
                    messages.push({ role: 'user', content: JSON.stringify(actionResult) });
                    return this.executePrompt(messages, options, state);
                }
            }
        }

        return result;
    }

    private parseResponse(response: string | any): any {
        if (typeof response === 'string') {
            try {
                return JSON.parse(jsonrepair(response));
            } catch (error) {
                console.warn('Failed to parse response as JSON, treating as raw text');
                return { content: response };
            }
        }
        return response;
    }

    private async executeAction(action: { name: string; data: any }, state: Record<string, any>) {
        if (this.tools[action.name]) {
            return await this.tools[action.name].exec(action.data);
        } else if (this.prompts[action.name]) {
            return await this.prompts[action.name](action.data, state);
        } else {
            throw new Error(`Unknown action type: ${action.name}`);
        }
    }

    private interpolate(template: string, data: Record<string, any>) {
        return template.replace(/\${(\w+)}|\{(\w+)\}/g, (_, p1, p2) => {
            const key = p1 || p2;
            return data[key] !== undefined ? data[key] : '';
        });
    }

    private getToolsSource() {
        return Object.entries(this.tools).map(([name, tool]) => ({
            [name]: {
                type: tool.schema.type,
                schema: tool.schema,
                script: tool.schema.script
            }
        }));
    }
}