import * as React from 'react';
import { commandsService } from '../services/commandsService';
import { createUpdateFileContentCommand, createSaveFileCommand } from '../commands/workbenchCommands';
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

const highlightSyntax = (content: string, language: string, searchResults: string[]): string => {
  let highlightedContent = content;

  // Highlight search results
  if (searchResults.length > 0) {
    const searchRegex = new RegExp(searchResults.join('|'), 'gi');
    highlightedContent = highlightedContent.replace(searchRegex, match => `<span class="search-highlight">${match}</span>`);
  }

  switch (language) {
    case 'javascript':
    case 'typescript':
      return highlightedContent.replace(
        /(const|let|var|function|return|if|else|for|while|class|import|export|from|=>)(?=[^\w])/g,
        '<span class="keyword">$1</span>'
      ).replace(
        /(["'`])(?:(?=(\\?))\2.)*?\1/g,
        '<span class="string">$&</span>'
      ).replace(
        /\/\/.*/g,
        '<span class="comment">$&</span>'
      );
    case 'html':
      return highlightedContent.replace(
        /(<\/?[a-z-]+(?:\s+[a-z-]+(?:=(?:".*?"|'.*?'|[^'">\s]+))?)*\s*\/?>)/gi,
        '<span class="tag">$1</span>'
      );
    case 'css':
      return highlightedContent.replace(
        /([\w-]+\s*:)/g,
        '<span class="property">$1</span>'
      ).replace(
        /(#[a-f0-9]{3,6})/gi,
        '<span class="value">$1</span>'
      );
    case 'json':
      return highlightedContent.replace(
        /"(\w+)"\s*:/g,
        '<span class="property">"$1"</span>:'
      ).replace(
        /(["'`])(?:(?=(\\?))\2.)*?\1/g,
        '<span class="string">$&</span>'
      );
    default:
      return highlightedContent;
  }
};

export const TextEditor: React.FC<TextEditorProps> = ({ content, fileName }) => {
  const [localContent, setLocalContent] = React.useState(content);
  const language = getLanguageFromFileName(fileName);
  const [searchResults, setSearchResults] = React.useState<string[]>([]);

  React.useEffect(() => {
    setLocalContent(content);
  }, [content]);

  React.useEffect(() => {
    const handleSearchResults = (results: { [fileName: string]: string[] }) => {
      if (results[fileName]) {
        setSearchResults(results[fileName]);
      } else {
        setSearchResults([]);
      }
    };

    commandsService.onCommand((command: any) => {
      if (command.type === 'workbench.action.search') {
        handleSearchResults(command.payload.results);
      }
    });
  }, [fileName]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    setLocalContent(newContent);
    commandsService.executeCommand(createUpdateFileContentCommand(fileName, newContent));
  };

  const handleSave = () => {
    commandsService.executeCommand(createSaveFileCommand(fileName, localContent));
  };

  return (
    <div className="text-editor">
      <div className="text-editor-header">
        <span className="file-name">{fileName}</span>
        <span className="language">{language}</span>
        <button className="save-button" onClick={handleSave}>Save</button>
      </div>
      <div className="editor-container">
        <textarea
          className="text-editor-content"
          value={localContent}
          onChange={handleChange}
          data-file-name={fileName}
        />
        <pre className="syntax-highlight" dangerouslySetInnerHTML={{ __html: highlightSyntax(localContent, language, searchResults) }} />
      </div>
    </div>
  );
};