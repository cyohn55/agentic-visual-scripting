# Agentic Visual Scripting

A multi-schema visual programming environment that supports different view modes and AI-powered collaboration.

## Features

### Phase 1 - Core Canvas & UI ✨
- **Infinite Canvas**: Pan and zoom with React Flow
- **Multi-Schema Views**: Switch between Mind Map, File System, Execution Order, and Data Flow views
- **Command Palette**: Quick access to all features with Ctrl/Cmd+K
- **Context Menus**: Right-click to create and manage objects
- **Basic Objects**: Sticky notes, text files, and shapes

### Planned Features
- **Phase 2**: Smart objects (Code editor, AI models), semantic connections
- **Phase 3**: Execution engine, AI agents, templating system
- **Phase 4**: Real-time collaboration, versioning, marketplace

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

- **Create Objects**: Right-click on canvas or use Ctrl/Cmd+K
- **Switch Views**: Use the dropdown in the top toolbar
- **Connect Objects**: Drag from one object to another
- **Move Objects**: Click and drag objects around the canvas

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Canvas**: React Flow for node-based interactions
- **Styling**: Tailwind CSS
- **State Management**: Zustand (planned)
- **Build Tool**: Create React App

## Project Structure

```
src/
  components/
    Canvas.tsx          # Main canvas component
    Toolbar.tsx         # Top toolbar with view switcher
    CommandPalette.tsx  # Ctrl+K command interface
    ContextMenu.tsx     # Right-click menu
    nodes/
      StickyNoteNode.tsx
      TextFileNode.tsx
      ShapeNode.tsx
  types/
    index.ts           # Type definitions
  store/
    canvasStore.ts     # State management
```

## Development

This project follows a phased development approach:

1. **Phase 1** (Current): Core canvas and UI foundation
2. **Phase 2**: Smart objects and semantic connections
3. **Phase 3**: Execution engine and AI agents
4. **Phase 4**: Collaboration and enterprise features

## Contributing

This is a demonstration project following the roadmap outlined in the project specification.

## License

MIT License 