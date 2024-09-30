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