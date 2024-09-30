import * as vm from 'vm';

interface ToolSchema {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: {
            [key: string]: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
}

interface Tool {
    schema: ToolSchema;
    exec: (params: any) => Promise<any>;
}

export class ToolManagement {
    private tools: Map<string, Tool> = new Map();
    private safeExecutionEnvironment: vm.Context;

    constructor() {
        this.safeExecutionEnvironment = vm.createContext({
            console,
            setTimeout,
            setInterval,
            clearTimeout,
            clearInterval,
        });
    }

    initializeTools(toolsData: Record<string, any>): void {
        for (const [toolName, tool] of Object.entries(toolsData)) {
            this.addTool(toolName, {
                schema: tool.schema,
                exec: async (params: any) => {
                    return await this.executeSafely(tool.script, params);
                }
            });
            console.log(`Tool initialized: ${toolName}`);
        }
    }

    addTool(name: string, toolData: Tool): this {
        if (!toolData.schema || !toolData.exec) {
            throw new Error(`Invalid tool data for ${name}. Both schema and exec function are required.`);
        }
        this.tools.set(name, toolData);
        return this;
    }

    async executeSafely(script: string, params: any): Promise<any> {
        const context = {
            ...this.safeExecutionEnvironment,
            params,
            tools: this.getToolsSource(),
        };

        return vm.runInContext(script, vm.createContext(context));
    }

    getTools(): Map<string, Tool> {
        return this.tools;
    }

    getToolSchemas(): ToolSchema[] {
        return Array.from(this.tools.entries()).map(([name, tool]) => ({
            name,
            description: tool.schema.description,
            parameters: tool.schema.parameters
        }));
    }

    private getToolsSource(): Record<string, any> {
        const toolsSource: Record<string, any> = {};
        for (const [name, tool] of this.tools.entries()) {
            toolsSource[name] = {
                type: tool.schema.parameters.type,
                schema: tool.schema,
                // We're not including the script here as it's not part of the tool's schema
                // and should not be exposed to other parts of the system
            };
        }
        return toolsSource;
    }
}