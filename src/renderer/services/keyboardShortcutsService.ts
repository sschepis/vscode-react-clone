import { commandsService } from './commandsService';
import {
  createSaveFileCommand,
  createToggleSidebarCommand,
  createQuickOpenCommand,
} from '../commands/workbenchCommands';

interface ShortcutMap {
  [key: string]: () => void;
}

class KeyboardShortcutsService {
  private shortcuts: ShortcutMap = {};

  constructor() {
    this.registerDefaultShortcuts();
  }

  private registerDefaultShortcuts() {
    this.registerShortcut('Control+S', () => {
      const activeElement = document.activeElement as HTMLTextAreaElement;
      if (activeElement && activeElement.tagName === 'TEXTAREA') {
        const fileName = activeElement.getAttribute('data-file-name');
        const content = activeElement.value;
        if (fileName) {
          commandsService.executeCommand(createSaveFileCommand(fileName, content));
        }
      }
    });

    this.registerShortcut('Control+B', () => {
      commandsService.executeCommand(createToggleSidebarCommand());
    });

    this.registerShortcut('Control+P', () => {
      commandsService.executeCommand(createQuickOpenCommand());
    });
  }

  registerShortcut(key: string, callback: () => void) {
    this.shortcuts[key] = callback;
  }

  handleKeyDown(event: KeyboardEvent) {
    const key = this.getKeyString(event);
    const shortcut = this.shortcuts[key];
    if (shortcut) {
      event.preventDefault();
      shortcut();
    }
  }

  private getKeyString(event: KeyboardEvent): string {
    const modifiers = [];
    if (event.ctrlKey) modifiers.push('Control');
    if (event.altKey) modifiers.push('Alt');
    if (event.shiftKey) modifiers.push('Shift');
    if (event.metaKey) modifiers.push('Meta');
    modifiers.push(event.key);
    return modifiers.join('+');
  }
}

export const keyboardShortcutsService = new KeyboardShortcutsService();