export interface StructuredPrompt {
  name: string;
  system: string;
  user: string;
  responseFormat: string;
  routing?: {
    condition: string;
    promptName: string;
  };
}

export interface PromptResponse {
  [key: string]: any;
}

export interface Prompt {
  instruction: string;
  context?: any;
  apiAccess: string[];
  structuredPrompt: StructuredPrompt;
}

export interface BuildAction {
  name: string;
  description: string;
  prompts: Prompt[];
}

export interface AIPrompt {
  system: string;
  user: string;
  responseFormat: string;
}

export interface ToolSchema {
  name: string;
  description: string;
  input_schema: {
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

export interface ToolResult {
  success: boolean;
  output: string;
  error?: string;
}