import * as React from 'react';
import { commandsService } from '../services/commandsService';
import { extensionService } from '../../services/ExtensionService';
import { createUpdateFileContentCommand, createSaveFileCommand } from '../commands/workbenchCommands';
import MonacoEditor from './MonacoEditor';
import './TextEditor.css';

interface TextEditorProps {
  content: string;
  fileName: string;
}

const getLanguageFromFileName = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    default:
      return 'plaintext';
  }
};

const customTheme = {
  name: 'customTheme',
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6A9955' },
    { token: 'keyword', foreground: '569CD6' },
    { token: 'string', foreground: 'CE9178' },
  ],
  colors: {
    'editor.background': '#1E1E1E',
    'editor.foreground': '#D4D4D4',
  },
};

export const TextEditor: React.FC<TextEditorProps> = ({ content, fileName }) => {
  const [localContent, setLocalContent] = React.useState(content);
  const [currentTheme, setCurrentTheme] = React.useState('vs-dark');
  const language = getLanguageFromFileName(fileName);

  React.useEffect(() => {
    setLocalContent(content);
  }, [content]);

  React.useEffect(() => {
    extensionService.registerTheme(customTheme);
  }, []);

  React.useEffect(() => {
    const handleSearchResults = (results: { [fileName: string]: string[] }) => {
      if (results[fileName]) {
        // TODO: Implement search highlighting in Monaco Editor
      }
    };

    commandsService.onCommand((command: any) => {
      if (command.type === 'workbench.action.search') {
        handleSearchResults(command.payload.results);
      }
    });
  }, [fileName]);

  const handleChange = (newContent: string) => {
    setLocalContent(newContent);
    commandsService.executeCommand(createUpdateFileContentCommand(fileName, newContent));
  };

  const handleSave = () => {
    commandsService.executeCommand(createSaveFileCommand(fileName, localContent));
  };

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentTheme(event.target.value);
  };

  return (
    <div className="text-editor">
      <div className="text-editor-header">
        <span className="file-name">{fileName}</span>
        <span className="language">{language}</span>
        <button className="save-button" onClick={handleSave}>Save</button>
        <select value={currentTheme} onChange={handleThemeChange}>
          <option value="vs">Light</option>
          <option value="vs-dark">Dark</option>
          <option value="hc-black">High Contrast</option>
          <option value="customTheme">Custom Theme</option>
        </select>
      </div>
      <div className="editor-container">
        <MonacoEditor
          language={language}
          value={localContent}
          onChange={handleChange}
          theme={currentTheme}
        />
      </div>
    </div>
  );
};