import * as React from 'react';
import { Watermark } from './Watermark';
import { TextEditor } from './TextEditor';
import { TabBar } from './TabBar';
import { FileNode } from '../types/FileTypes';
import { commandsService } from '../services/commandsService';
import { createQuickOpenCommand, createToggleSidebarCommand } from '../commands/workbenchCommands';

interface MainPanelProps {
  openFiles: FileNode[];
  activeFileId: string | null;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onCreateNewWindow: () => void;
  searchResults: { [fileName: string]: string[] };
}

export const MainPanel: React.FC<MainPanelProps> = ({
  openFiles,
  activeFileId,
  onTabClick,
  onTabClose,
  onCreateNewWindow,
  searchResults,
}) => {
  const activeFile = openFiles.find(file => file.name === activeFileId);

  return (
    <div className="MainPanel">
      <TabBar
        tabs={openFiles.map(file => ({ id: file.name, name: file.name }))}
        activeTabId={activeFileId || ''}
        onTabClick={onTabClick}
        onTabClose={onTabClose}
      />
      {activeFile ? (
        <div className="editor-container">
          <TextEditor
            content={activeFile.content || ''}
            fileName={activeFile.name}
          />
          {searchResults[activeFile.name] && (
            <div className="search-results">
              <h3>Search Results:</h3>
              <ul>
                {searchResults[activeFile.name].map((result, index) => (
                  <li key={index}>{result}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="welcome-screen">
          <Watermark />
          <h2>Welcome to VSCode React Clone</h2>
          <p>Select a file from the explorer to start editing.</p>
          <button onClick={() => commandsService.executeCommand(createQuickOpenCommand())}>Open Quick Open</button>
          <button onClick={() => commandsService.executeCommand(createToggleSidebarCommand())}>Toggle Sidebar</button>
          <button onClick={onCreateNewWindow}>Create New Window</button>
        </div>
      )}
    </div>
  );
};