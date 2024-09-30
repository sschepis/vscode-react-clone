import { AIService } from './AIService';
import { IDEAPIService } from './IDEAPIService';
import { BuildStatusService } from './BuildStatusService';
import { Prompt, BuildAction, PromptResponse } from '../interfaces/Prompt';

export class BuildActionService {
  private actions: Map<string, BuildAction> = new Map();
  private aiService: AIService;
  private ideApiService: IDEAPIService;
  private buildStatusService: BuildStatusService;

  constructor(
    aiService: AIService,
    ideApiService: IDEAPIService,
    buildStatusService: BuildStatusService
  ) {
    this.aiService = aiService;
    this.ideApiService = ideApiService;
    this.buildStatusService = buildStatusService;
  }

  registerAction(action: BuildAction) {
    this.actions.set(action.name, action);
  }

  async executeBuildAction(actionName: string) {
    const action = this.actions.get(actionName);
    if (!action) {
      throw new Error(`Build action "${actionName}" not found`);
    }

    this.buildStatusService.updateStatus(`Starting build action: ${action.name}`);

    let lastResponse: PromptResponse | null = null;
    let currentPromptIndex = 0;

    while (currentPromptIndex < action.prompts.length) {
      const prompt = action.prompts[currentPromptIndex];
      this.buildStatusService.updateStatus(`Executing prompt: ${prompt.structuredPrompt.name}`);
      
      const aiResponse = await this.executeStructuredPrompt(prompt, lastResponse);
      lastResponse = aiResponse;

      if (prompt.apiAccess.length > 0) {
        for (const toolName of prompt.apiAccess) {
          if (aiResponse[toolName]) {
            const result = await this.ideApiService.executeTool(toolName, aiResponse[toolName]);
            if (!result.success) {
              this.buildStatusService.updateStatus(`Error executing tool ${toolName}: ${result.error}`);
            } else {
              this.buildStatusService.updateStatus(`Tool ${toolName} executed successfully: ${result.output}`);
            }
          }
        }
      }

      if (prompt.structuredPrompt.routing) {
        const { condition, promptName } = prompt.structuredPrompt.routing;
        if (this.evaluateCondition(condition, aiResponse)) {
          const nextPromptIndex = action.prompts.findIndex(p => p.structuredPrompt.name === promptName);
          if (nextPromptIndex !== -1) {
            currentPromptIndex = nextPromptIndex;
            continue;
          } else {
            this.buildStatusService.updateStatus(`Warning: Routed prompt "${promptName}" not found`);
          }
        }
      }

      currentPromptIndex++;
    }

    this.buildStatusService.updateStatus(`Build action "${action.name}" completed`);
  }

  private async executeStructuredPrompt(prompt: Prompt, lastResponse: PromptResponse | null): Promise<PromptResponse> {
    const { system, user, responseFormat } = prompt.structuredPrompt;
    
    const filledSystem = this.fillTemplate(system, lastResponse);
    const filledUser = this.fillTemplate(user, lastResponse);

    return this.aiService.executePrompt({
      system: filledSystem,
      user: filledUser,
      responseFormat
    });
  }

  private fillTemplate(template: string, data: PromptResponse | null): string {
    if (!data) return template;
    return template.replace(/{(\w+)}/g, (match, key) => {
      return data.hasOwnProperty(key) ? data[key] : match;
    });
  }

  private evaluateCondition(condition: string, response: PromptResponse): boolean {
    // Simple evaluation for now, can be expanded for more complex conditions
    return !!response[condition];
  }
}