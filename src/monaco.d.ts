declare module 'monaco-editor' {
  export namespace languages {
    export interface ILanguageExtensionPoint {
      id: string;
      extensions?: string[];
      filenames?: string[];
      filenamePatterns?: string[];
      firstLine?: string;
      aliases?: string[];
      mimetypes?: string[];
    }

    export function register(language: ILanguageExtensionPoint): void;
    export function setMonarchTokensProvider(languageId: string, provider: any): void;
    export function setLanguageConfiguration(languageId: string, configuration: any): void;
  }

  export namespace editor {
    export interface IStandaloneCodeEditor {
      getValue(): string;
      setValue(value: string): void;
      getModel(): ITextModel | null;
      onDidChangeModelContent(listener: (e: any) => void): IDisposable;
      dispose(): void;
    }

    export interface ITextModel {
      getValue(): string;
    }

    export interface IDisposable {
      dispose(): void;
    }

    export interface IStandaloneEditorConstructionOptions {
      value?: string;
      language?: string;
      theme?: string;
      automaticLayout?: boolean;
      minimap?: { enabled?: boolean };
      folding?: boolean;
      foldingStrategy?: string;
    }

    export interface IStandaloneThemeData {
      name: string;
      base: string;
      inherit: boolean;
      rules: Array<{
        token: string;
        foreground?: string;
        background?: string;
        fontStyle?: string;
      }>;
      colors: { [colorId: string]: string };
    }

    export function create(element: HTMLElement, options?: IStandaloneEditorConstructionOptions): IStandaloneCodeEditor;
    export function defineTheme(themeName: string, themeData: IStandaloneThemeData): void;
    export function setTheme(themeName: string): void;
    export function setModelLanguage(model: ITextModel, languageId: string): void;
  }
}