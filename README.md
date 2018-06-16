# Visual Studio Code React Clone

When I think of projects with best UX, VSCode always come to mind first. This is a project to clone VSCode using React (reactive view) - for my own learning in architectural/design for large, complex, interactive application (and the extension model).

## Development

```base
yarn start
```

Webpack is used to develop and build primarily because I want HMR when working on UI (components and styles).

Note: currently the folder structure as `main` versus `renderer` is dictated by `electron-webpack`. I'll probably find time to fork it at some point so that I can fully customize webpack.

## Design ideas

- **Commands** defines what happens (handlers) within Code. Commands can be executed by other entities like KeybindingsService or MenuService. It will not be invoked by other modules but rather having an "index" (actor pattern) that other entities will push command messages (requests) to. It should not couple to keybindings.
- **KeyInputsService** are just a global singleton service that listen to user keyboard inputs and broadcast such events. It's just a boundary entity (imperative shell) that bridges I/O to the data stream in the system. It should not make decision (aim for zero logic). It should be *de*coupled from keybindings service and context service.
- **ContextService** is a stateful service. First support came to mind is to combine with keybindings result to support issuing different commands based on "where" or "when" like "when `editorTextFocus`".
- **KeybindingsService** depends on KeyInputsService and ContextService. It's just a simple map - given event stream of key inputs and current context, issue a command (handler). Probably aim for every keybinding will map to a command - never an adhoc function.

## Todos

- [ ] Fork `electron-webpack` for more flexible control of project structure
- [ ] Organize project by features (e.g. editor, quickopen) rather than by types (e.g. components, services)
