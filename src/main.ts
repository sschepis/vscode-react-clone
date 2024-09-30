import { aiService } from './services/AIService';
import { aiProviderManager } from './services/AIProviderManager';
import { ideApiService } from './services/IDEAPIService';
import { settingsService } from './services/SettingsService';
import { AIProvider, AIPrompt } from './interfaces';

async function initializeServices() {
  await settingsService.initialize();
  await aiService.initialize();
  await ideApiService.initialize();
  // Add any other service initializations here if needed
}

async function main() {
  try {
    console.log('Initializing services...');
    await initializeServices();

    console.log('Current AI provider:', settingsService.getSetting('ai.provider'));

    try {
      await settingsService.updateSetting('ai.provider', 'Open Router' as AIProvider);
      console.log('Updated AI provider:', settingsService.getSetting('ai.provider'));
    } catch (error) {
      console.error('Error updating AI provider:', error);
    }

    console.log('Available AI providers:', aiService.listAvailableProviders());
    aiService.setProvider('Anthropic Claude');
    console.log('Current AI provider set to Anthropic Claude');

    const samplePrompt: AIPrompt = {
      system: "You are an AI assistant helping with file creation in an IDE.",
      user: "Create a new file named 'example.js' with a simple 'Hello, World!' program.",
      responseFormat: `
      {
        "tool": "create_file",
        "input": {
          "path": string,
          "content": string
        }
      }
      `
    };

    try {
      const response = await aiService.executePrompt(samplePrompt);
      console.log('AI Response:', response);

      if ('tool' in response && 'input' in response) {
        const toolResult = await ideApiService.executeTool(response.tool, response.input);
        console.log('Tool execution result:', toolResult);
      } else {
        console.error('Invalid AI response format');
      }
    } catch (error) {
      console.error('Error executing AI prompt:', error);
    }

    // Demonstrate file operations
    try {
      // Create a file
      const createFileResult = await ideApiService.executeTool('create_file', {
        path: 'test.txt',
        content: 'This is a test file.'
      });
      console.log('Create file result:', createFileResult);

      // Read the file
      const readFileResult = await ideApiService.executeTool('read_file', {
        path: 'test.txt'
      });
      console.log('Read file result:', readFileResult);

      // Write to the file
      const writeFileResult = await ideApiService.executeTool('write_file', {
        path: 'test.txt',
        content: 'This is updated content.'
      });
      console.log('Write file result:', writeFileResult);

      // Read the file again to verify the changes
      const readUpdatedFileResult = await ideApiService.executeTool('read_file', {
        path: 'test.txt'
      });
      console.log('Read updated file result:', readUpdatedFileResult);

      // Delete the file
      const deleteFileResult = await ideApiService.executeTool('delete_file', {
        path: 'test.txt'
      });
      console.log('Delete file result:', deleteFileResult);

      // Try to read the deleted file (should fail)
      const readDeletedFileResult = await ideApiService.executeTool('read_file', {
        path: 'test.txt'
      });
      console.log('Read deleted file result:', readDeletedFileResult);

    } catch (error) {
      console.error('Error executing IDE tools:', error);
    }
  } catch (error) {
    console.error('Error initializing application:', error);
  }
}

main().catch(error => console.error('Unhandled error:', error));