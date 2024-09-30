import { AppSettings } from '../interfaces/Settings';
import { ValidationError } from '../errors/SettingsErrors';

export function validateSetting<K extends keyof AppSettings>(key: K, value: unknown): asserts value is AppSettings[K] {
  switch (key) {
    case "editor.fontSize":
    case "terminal.integrated.fontSize":
      if (typeof value !== 'number' || value <= 0) {
        throw new ValidationError(`${key} must be a positive number`);
      }
      break;
    case "editor.tabSize":
      if (typeof value !== 'number' || value <= 0 || !Number.isInteger(value)) {
        throw new ValidationError(`${key} must be a positive integer`);
      }
      break;
    case "editor.insertSpaces":
    case "explorer.autoReveal":
      if (typeof value !== 'boolean') {
        throw new ValidationError(`${key} must be a boolean`);
      }
      break;
    case "editor.wordWrap":
      if (value !== 'off' && value !== 'on' && value !== 'wordWrapColumn' && value !== 'bounded') {
        throw new ValidationError(`${key} must be one of: off, on, wordWrapColumn, bounded`);
      }
      break;
    case "editor.lineNumbers":
      if (value !== 'off' && value !== 'on' && value !== 'relative') {
        throw new ValidationError(`${key} must be one of: off, on, relative`);
      }
      break;
    case "ai.provider":
      if (value !== 'Anthropic Claude' && value !== 'Google Vertex Anthropic' && value !== 'Open Router') {
        throw new ValidationError(`${key} must be one of: Anthropic Claude, Google Vertex Anthropic, Open Router`);
      }
      break;
    case "explorer.sortOrder":
      if (value !== 'default' && value !== 'mixed' && value !== 'filesFirst' && value !== 'type' && value !== 'modified') {
        throw new ValidationError(`${key} must be one of: default, mixed, filesFirst, type, modified`);
      }
      break;
    case "build.parallelJobs":
      if (typeof value !== 'number' || value <= 0 || !Number.isInteger(value)) {
        throw new ValidationError(`${key} must be a positive integer`);
      }
      break;
    case "editor.fontFamily":
    case "terminal.integrated.fontFamily":
    case "workbench.colorTheme":
    case "workbench.iconTheme":
    case "build.defaultAction":
    case "ai.anthropic.apiKey":
    case "ai.googleVertex.projectId":
    case "ai.googleVertex.location":
    case "ai.googleVertex.modelId":
    case "ai.openRouter.apiKey":
      if (typeof value !== 'string') {
        throw new ValidationError(`${key} must be a string`);
      }
      break;
    default:
      throw new ValidationError(`Unknown setting: ${key}`);
  }
}