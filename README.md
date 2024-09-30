# VSCode React Clone

A simplified clone of Visual Studio Code built with React and Electron, implementing a command-based architecture.

## Development

```bash
yarn start
```

Webpack is used to develop and build primarily because we want HMR when working on UI (components and styles).

Note: currently the folder structure as `main` versus `renderer` is dictated by `electron-webpack`. We'll probably find time to fork it at some point so that we can fully customize webpack.

## Architecture (High-level Design)

- **Commands** are intents. They are objects representing "requests" of things we want to happen.
  - Use imperative verb i.e. intent something to be done
  - All commands do not cause function calls. They always cause two of the things to happen: an event being emitted from a domain object or nothing happens at all.
  - Any part of the system can issue a command.
  - All parts of the system always "react" to the events being emitted from the domain objects.
  - The domain objects contain all the business logic.

- **Services** are abstraction layers for interacting with a business domain. We don't care if it's in-process or remote calls. We always treat it as communicating across boundary of services and must embrace that it could fail, be unavailable, delayed, eventually consistent (cannot guarantee strong consistency), or be non-deterministic.

## Current Implementation

- Implemented a robust command system using `CommandsService` with error handling and logging
- Created `workbenchCommands` for common actions (open file, close file, toggle sidebar, update file content, save file, search, replace, etc.)
- Refactored the App component into smaller components (Sidebar, MainPanel, SearchReplace)
- Implemented basic file exploration and editing functionality
- Added error handling and display in the App component
- Improved the file path handling in the FileExplorer component
- Implemented basic syntax highlighting for common programming languages in the TextEditor component
- Added file saving functionality with a save button in the TextEditor component
- Implemented basic search and replace functionality
- Added keyboard shortcuts for common actions (save, toggle sidebar, quick open)
- Implemented actual file system operations using Electron's fs module
- Updated FileExplorer to work with the real file system

## Project Structure

- `src/main`: Contains the main Electron process code
- `src/renderer`: Contains the React application code
  - `components`: React components (App, Sidebar, MainPanel, FileExplorer, TextEditor, SearchReplace, etc.)
  - `services`: Application services (commandsService, keyboardShortcutsService, fileSystemService)
  - `commands`: Command definitions and creators
  - `types`: TypeScript type definitions
  - `utils`: Utility functions and helpers

## Features

- File Explorer with real file system integration
- Text Editor with basic editing capabilities and syntax highlighting
- Tab system for managing open files
- Sidebar toggle functionality
- Error display for better user feedback
- Basic syntax highlighting for JavaScript, TypeScript, HTML, CSS, and JSON
- File saving functionality with real file system integration
- Basic search and replace functionality
- Keyboard shortcuts for common actions:
  - Ctrl+S: Save file
  - Ctrl+B: Toggle sidebar
  - Ctrl+P: Quick open

## Next Steps

1. Enhance search and replace functionality with regex support and file-wide operations
2. Add more keyboard shortcuts and make them customizable
3. Enhance syntax highlighting with more languages and advanced features
4. Add support for multiple windows
5. Implement a simple extension system
6. Add tests for components and services
7. Implement undo/redo functionality
8. Add support for themes and user preferences
9. Implement code folding functionality
10. Add support for git integration
11. Implement a terminal component
12. Add support for debugging

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Todos

- [ ] Use implicit use strict in tsconfig
- [ ] Audit `tsconfig.json -> compilerOptions` and see if there're stricter rules that should be added
- [ ] Dockerize dev env because I ran into node version mismatch and electron needs to be rebuild a few times already
- [ ] See if any of the services belong to electron's "main" rather than "renderer" (need to read more)
- [ ] Setup [devtron](https://github.com/electron/devtron) and ensure that it works with webpack - i.e. `__dirname`
- [ ] Setup tslint after ts, webpack and jest setups are all good.
- [ ] Organize project by features (e.g. editor, quickopen) rather than by types (e.g. components, services)
- [ ] Improve syntax highlighting performance for large files
- [ ] Implement minimap functionality
- [ ] Add support for multiple cursors and selections
- [ ] Implement auto-completion and IntelliSense-like features
