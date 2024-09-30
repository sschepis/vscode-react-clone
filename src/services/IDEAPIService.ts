import { ToolSchema, ToolResult } from '../interfaces/Tool';
import { settingsService } from './SettingsService';
import * as fs from 'fs/promises';
import * as path from 'path';

export class IDEAPIService {
  private tools: Map<string, ToolSchema> = new Map();

  constructor() {
    this.registerDefaultTools();
  }

  async initialize(): Promise<void> {
    // Ensure settings are initialized before using them
    await settingsService.initialize();
    // Add any initialization logic that depends on settings
  }

  private registerDefaultTools() {
    this.registerTool({
      name: 'create_file',
      description: 'Create a new file at the specified path',
      input_schema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'The path where the file should be created' },
          content: { type: 'string', description: 'The initial content of the file' },
        },
        required: ['path'],
      },
    });

    this.registerTool({
      name: 'read_file',
      description: 'Read the contents of a file',
      input_schema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'The path of the file to read' },
        },
        required: ['path'],
      },
    });

    this.registerTool({
      name: 'write_file',
      description: 'Write content to a file, overwriting if it exists',
      input_schema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'The path of the file to write' },
          content: { type: 'string', description: 'The content to write to the file' },
        },
        required: ['path', 'content'],
      },
    });

    this.registerTool({
      name: 'delete_file',
      description: 'Delete a file at the specified path',
      input_schema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'The path of the file to delete' },
        },
        required: ['path'],
      },
    });

    this.registerTool({
      name: 'run_command',
      description: 'Run a command in the IDE terminal',
      input_schema: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'The command to run' },
        },
        required: ['command'],
      },
    });
  }

  registerTool(tool: ToolSchema) {
    this.tools.set(tool.name, tool);
  }

  getToolSchema(toolName: string): ToolSchema | undefined {
    return this.tools.get(toolName);
  }

  getAllToolSchemas(): ToolSchema[] {
    return Array.from(this.tools.values());
  }

  async executeTool(toolName: string, args: any): Promise<ToolResult> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return { success: false, output: '', error: `Unknown tool: ${toolName}` };
    }

    try {
      switch (toolName) {
        case 'create_file':
          return await this.createFile(args.path, args.content);
        case 'read_file':
          return await this.readFile(args.path);
        case 'write_file':
          return await this.writeFile(args.path, args.content);
        case 'delete_file':
          return await this.deleteFile(args.path);
        case 'run_command':
          return await this.runCommand(args.command);
        default:
          return { success: false, output: '', error: `Unimplemented tool: ${toolName}` };
      }
    } catch (error) {
      return { success: false, output: '', error: this.getErrorMessage(error) };
    }
  }

  private async createFile(filePath: string, content: string = ''): Promise<ToolResult> {
    try {
      const fullPath = path.resolve(process.cwd(), filePath);
      await fs.writeFile(fullPath, content, { flag: 'wx' }); // 'wx' flag ensures the file is created, fails if it already exists
      return { success: true, output: `File created successfully: ${filePath}` };
    } catch (error) {
      return { success: false, output: '', error: this.getErrorMessage(error) };
    }
  }

  private async readFile(filePath: string): Promise<ToolResult> {
    try {
      const fullPath = path.resolve(process.cwd(), filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      return { success: true, output: content };
    } catch (error) {
      return { success: false, output: '', error: this.getErrorMessage(error) };
    }
  }

  private async writeFile(filePath: string, content: string): Promise<ToolResult> {
    try {
      const fullPath = path.resolve(process.cwd(), filePath);
      await fs.writeFile(fullPath, content);
      return { success: true, output: `File written successfully: ${filePath}` };
    } catch (error) {
      return { success: false, output: '', error: this.getErrorMessage(error) };
    }
  }

  private async deleteFile(filePath: string): Promise<ToolResult> {
    try {
      const fullPath = path.resolve(process.cwd(), filePath);
      await fs.unlink(fullPath);
      return { success: true, output: `File deleted successfully: ${filePath}` };
    } catch (error) {
      return { success: false, output: '', error: this.getErrorMessage(error) };
    }
  }

  private async runCommand(command: string): Promise<ToolResult> {
    // TODO: Implement actual command execution
    console.log(`Executing command: ${command}`);
    return { success: true, output: `Mock execution of command: ${command}` };
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
  }
}

export const ideApiService = new IDEAPIService();