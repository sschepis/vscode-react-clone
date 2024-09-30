export type AIProvider = 'Anthropic Claude' | 'Google Vertex Anthropic' | 'Open Router';

export interface AppSettings {
  // General settings
  "editor.fontSize": number;
  "editor.fontFamily": string;
  "editor.tabSize": number;
  "editor.insertSpaces": boolean;
  "editor.wordWrap": "off" | "on" | "wordWrapColumn" | "bounded";
  "editor.lineNumbers": "off" | "on" | "relative";
  
  // AI Provider settings
  "ai.provider": AIProvider;
  "ai.anthropic.apiKey": string;
  "ai.googleVertex.projectId": string;
  "ai.googleVertex.location": string;
  "ai.googleVertex.modelId": string;
  "ai.openRouter.apiKey": string;
  
  // File explorer settings
  "explorer.autoReveal": boolean;
  "explorer.sortOrder": "default" | "mixed" | "filesFirst" | "type" | "modified";
  
  // Terminal settings
  "terminal.integrated.fontSize": number;
  "terminal.integrated.fontFamily": string;
  
  // Theme settings
  "workbench.colorTheme": string;
  "workbench.iconTheme": string;
  
  // Build system settings
  "build.defaultAction": string;
  "build.parallelJobs": number;
}

export type SettingsChangedListener = (key: keyof AppSettings, value: any) => void;
export type SettingsResetListener = () => void;