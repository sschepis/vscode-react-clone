import * as React from 'react';
import { hot } from 'react-hot-loader';
import { ipcRenderer } from 'electron';
import { QuickOpen } from './QuickOpen';
import { Statusbar } from './Statusbar';
import { Sidebar } from './Sidebar';
import { MainPanel } from './MainPanel';
import { SearchReplace } from './SearchReplace';
import { commandsService, Command } from '../services/commandsService';
import { keyboardShortcutsService } from '../services/keyboardShortcutsService';
import { fileSystemService } from '../services/fileSystemService';
import {
  createOpenFileCommand,
  createCloseFileCommand,
  createSaveFileCommand,
  WorkbenchCommand,
  SearchOptions,
} from '../commands/workbenchCommands';
import { FileNode } from '../types/FileTypes';
import './base.css';
import './App.css';

interface AppState {
  fileStructure: FileNode[];
  openFiles: FileNode[];
  activeFileId: string | null;
  isSidebarVisible: boolean;
  isSearchReplaceVisible: boolean;
  error: string | null;
  searchResults: { [fileName: string]: string[] };
}

class App extends React.Component<{}, AppState> {
  state: AppState = {
    fileStructure: [],
    openFiles: [],
    activeFileId: null,
    isSidebarVisible: true,
    isSearchReplaceVisible: false,
    error: null,
    searchResults: {},
  };

  async componentDidMount() {
    commandsService.onCommand(this.handleCommand);
    document.addEventListener('keydown', this.handleKeyDown);
    await this.loadFileStructure();
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  loadFileStructure = async () => {
    try {
      const fileStructure = await fileSystemService.readDirectory('/');
      this.setState({ fileStructure });
    } catch (error) {
      this.setState({ error: `Error loading file structure: ${error.message}` });
    }
  };

  handleKeyDown = (event: KeyboardEvent) => {
    keyboardShortcutsService.handleKeyDown(event);
  };

  handleCommand = async (command: Command) => {
    try {
      switch (command.type) {
        case 'workbench.action.openFile':
          await this.openFile(command.payload.filePath);
          break;
        case 'workbench.action.closeFile':
          this.closeFile(command.payload.filePath);
          break;
        case 'workbench.action.quickOpen':
          this.openQuickOpen();
          break;
        case 'workbench.action.toggleSidebar':
          this.toggleSidebar();
          break;
        case 'workbench.action.updateFileContent':
          await this.updateFileContent(command.payload.fileName, command.payload.content);
          break;
        case 'workbench.action.saveFile':
          await this.saveFile(command.payload.fileName, command.payload.content);
          break;
        case 'workbench.action.search':
          await this.search(command.payload.searchTerm, command.payload.options);
          break;
        case 'workbench.action.replace':
          await this.replace(command.payload.searchTerm, command.payload.replaceTerm, command.payload.options);
          break;
        default:
          console.warn(`Unhandled command type: ${command.type}`);
      }
    } catch (error) {
      this.setState({ error: `Error handling command: ${error.message}` });
    }
  };

  handleButtonClick = () => {
    ipcRenderer.send('window:create');
  };

  handleTabClick = (tabId: string) => {
    this.setState({ activeFileId: tabId });
  };

  handleTabClose = (tabId: string) => {
    commandsService.executeCommand(createCloseFileCommand(tabId));
  };

  openFile = async (filePath: string) => {
    try {
      const content = await fileSystemService.readFile(filePath);
      const newFile: FileNode = { name: filePath, type: 'file', content };
      this.setState(prevState => ({
        openFiles: [...prevState.openFiles, newFile],
        activeFileId: filePath,
      }));
    } catch (error) {
      this.setState({ error: `Error opening file: ${error.message}` });
    }
  };

  closeFile = (filePath: string) => {
    this.setState(prevState => ({
      openFiles: prevState.openFiles.filter(file => file.name !== filePath),
      activeFileId: prevState.activeFileId === filePath
        ? (prevState.openFiles.length > 1
          ? prevState.openFiles.find(file => file.name !== filePath)?.name || null
          : null)
        : prevState.activeFileId,
    }));
  };

  openQuickOpen = () => {
    // Implement Quick Open functionality
    console.log('Quick Open triggered');
  };

  toggleSidebar = () => {
    this.setState(prevState => ({ isSidebarVisible: !prevState.isSidebarVisible }));
  };

  updateFileContent = async (fileName: string, newContent: string) => {
    this.setState(prevState => ({
      openFiles: prevState.openFiles.map(file =>
        file.name === fileName ? { ...file, content: newContent } : file
      ),
    }));
  };

  saveFile = async (fileName: string, content: string) => {
    try {
      await fileSystemService.writeFile(fileName, content);
      this.setState({ error: `File ${fileName} saved successfully!` });
      setTimeout(() => {
        this.setState({ error: null });
      }, 3000);
    } catch (error) {
      this.setState({ error: `Error saving file: ${error.message}` });
    }
  };

  search = async (searchTerm: string, options: SearchOptions) => {
    const searchResults: { [fileName: string]: string[] } = {};
    for (const file of this.state.openFiles) {
      if (file.content) {
        const results = this.searchInContent(file.content, searchTerm, options);
        if (results.length > 0) {
          searchResults[file.name] = results;
        }
      }
    }
    this.setState({ searchResults });
  };

  replace = async (searchTerm: string, replaceTerm: string, options: SearchOptions) => {
    const updatedFiles = this.state.openFiles.map(file => {
      if (file.content) {
        const newContent = this.replaceInContent(file.content, searchTerm, replaceTerm, options);
        return { ...file, content: newContent };
      }
      return file;
    });
    this.setState({ openFiles: updatedFiles });
  };

  searchInContent(content: string, searchTerm: string, options: SearchOptions): string[] {
    let regex: RegExp;
    if (options.useRegex) {
      const flags = options.caseSensitive ? 'g' : 'gi';
      regex = new RegExp(searchTerm, flags);
    } else {
      const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const flags = options.caseSensitive ? 'g' : 'gi';
      regex = new RegExp(options.wholeWord ? `\\b${escapedTerm}\\b` : escapedTerm, flags);
    }

    const lines = content.split('\n');
    return lines.filter(line => regex.test(line));
  }

  replaceInContent(content: string, searchTerm: string, replaceTerm: string, options: SearchOptions): string {
    let regex: RegExp;
    if (options.useRegex) {
      const flags = options.caseSensitive ? 'g' : 'gi';
      regex = new RegExp(searchTerm, flags);
    } else {
      const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const flags = options.caseSensitive ? 'g' : 'gi';
      regex = new RegExp(options.wholeWord ? `\\b${escapedTerm}\\b` : escapedTerm, flags);
    }

    return content.replace(regex, replaceTerm);
  }

  toggleSearchReplace = () => {
    this.setState(prevState => ({ isSearchReplaceVisible: !prevState.isSearchReplaceVisible }));
  };

  render() {
    const { fileStructure, openFiles, activeFileId, isSidebarVisible, isSearchReplaceVisible, error, searchResults } = this.state;

    return (
      <div className="App">
        <div className="App__PositionContext">
          <QuickOpen />
          <Sidebar files={fileStructure} isVisible={isSidebarVisible} />
          <div className="MainContent">
            <SearchReplace isVisible={isSearchReplaceVisible} />
            <MainPanel
              openFiles={openFiles}
              activeFileId={activeFileId}
              onTabClick={this.handleTabClick}
              onTabClose={this.handleTabClose}
              onCreateNewWindow={this.handleButtonClick}
              searchResults={searchResults}
            />
          </div>
          <Statusbar />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button className="toggle-search-replace" onClick={this.toggleSearchReplace}>
          {isSearchReplaceVisible ? 'Hide' : 'Show'} Search/Replace
        </button>
      </div>
    );
  }
}

export default hot(module)(App);
