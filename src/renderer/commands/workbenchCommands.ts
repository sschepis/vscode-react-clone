import { Command } from '../services/commandsService';

export const QUICK_OPEN = 'workbench.action.quickOpen';
export const TOGGLE_SIDEBAR = 'workbench.action.toggleSidebar';
export const OPEN_FILE = 'workbench.action.openFile';
export const CLOSE_FILE = 'workbench.action.closeFile';
export const UPDATE_FILE_CONTENT = 'workbench.action.updateFileContent';
export const SAVE_FILE = 'workbench.action.saveFile';
export const SEARCH = 'workbench.action.search';
export const REPLACE = 'workbench.action.replace';

export interface QuickOpenCommand extends Command {
  type: typeof QUICK_OPEN;
}

export interface ToggleSidebarCommand extends Command {
  type: typeof TOGGLE_SIDEBAR;
}

export interface OpenFileCommand extends Command {
  type: typeof OPEN_FILE;
  payload: {
    filePath: string;
  };
}

export interface CloseFileCommand extends Command {
  type: typeof CLOSE_FILE;
  payload: {
    filePath: string;
  };
}

export interface UpdateFileContentCommand extends Command {
  type: typeof UPDATE_FILE_CONTENT;
  payload: {
    fileName: string;
    content: string;
  };
}

export interface SaveFileCommand extends Command {
  type: typeof SAVE_FILE;
  payload: {
    fileName: string;
    content: string;
  };
}

export interface SearchOptions {
  useRegex: boolean;
  caseSensitive: boolean;
  wholeWord: boolean;
  fileWide: boolean;
}

export interface SearchCommand extends Command {
  type: typeof SEARCH;
  payload: {
    searchTerm: string;
    options: SearchOptions;
  };
}

export interface ReplaceCommand extends Command {
  type: typeof REPLACE;
  payload: {
    searchTerm: string;
    replaceTerm: string;
    options: SearchOptions;
  };
}

export type WorkbenchCommand =
  | QuickOpenCommand
  | ToggleSidebarCommand
  | OpenFileCommand
  | CloseFileCommand
  | UpdateFileContentCommand
  | SaveFileCommand
  | SearchCommand
  | ReplaceCommand;

export const createQuickOpenCommand = (): QuickOpenCommand => ({
  type: QUICK_OPEN,
});

export const createToggleSidebarCommand = (): ToggleSidebarCommand => ({
  type: TOGGLE_SIDEBAR,
});

export const createOpenFileCommand = (filePath: string): OpenFileCommand => ({
  type: OPEN_FILE,
  payload: { filePath },
});

export const createCloseFileCommand = (filePath: string): CloseFileCommand => ({
  type: CLOSE_FILE,
  payload: { filePath },
});

export const createUpdateFileContentCommand = (fileName: string, content: string): UpdateFileContentCommand => ({
  type: UPDATE_FILE_CONTENT,
  payload: { fileName, content },
});

export const createSaveFileCommand = (fileName: string, content: string): SaveFileCommand => ({
  type: SAVE_FILE,
  payload: { fileName, content },
});

export const createSearchCommand = (searchTerm: string, options: SearchOptions): SearchCommand => ({
  type: SEARCH,
  payload: { searchTerm, options },
});

export const createReplaceCommand = (searchTerm: string, replaceTerm: string, options: SearchOptions): ReplaceCommand => ({
  type: REPLACE,
  payload: { searchTerm, replaceTerm, options },
});
