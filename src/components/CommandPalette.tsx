import React, { useState, useEffect, useRef } from 'react';
import { canvasStore } from '../store/canvasStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNode?: any;
  onOpenProperties?: () => void;
}

interface Command {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  category: string;
  keywords: string[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  isOpen, 
  onClose, 
  selectedNode, 
  onOpenProperties 
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    // Node creation commands
    {
      id: 'create-sticky-note',
      label: 'Create Sticky Note',
      icon: '📝',
      action: () => {
        const actions = (window as any).canvasActions;
        if (actions) actions.createNode('sticky-note');
        onClose();
      },
      category: 'Create',
      keywords: ['create', 'sticky', 'note', 'new']
    },
    {
      id: 'create-text-file',
      label: 'Create Text File',
      icon: '📄',
      action: () => {
        const actions = (window as any).canvasActions;
        if (actions) actions.createNode('text-file');
        onClose();
      },
      category: 'Create',
      keywords: ['create', 'text', 'file', 'new']
    },
    {
      id: 'create-shape',
      label: 'Create Shape',
      icon: '🔷',
      action: () => {
        const actions = (window as any).canvasActions;
        if (actions) actions.createNode('shape');
        onClose();
      },
      category: 'Create',
      keywords: ['create', 'shape', 'new']
    },
    {
      id: 'create-start-node',
      label: 'Create Start Node',
      icon: '▶️',
      action: () => {
        const actions = (window as any).canvasActions;
        if (actions) {
          actions.createNode('control-flow');
          // Update the node to be a start node
          setTimeout(() => {
            const state = canvasStore.getState();
            const node = state.nodes.find((n: any) => n.type === 'control-flow' && n.data.label === 'Process');
            if (node) {
              canvasStore.executeCommand({
                type: 'UPDATE_NODE',
                payload: {
                  nodeId: node.id,
                  updates: { data: { ...node.data, label: 'Start', type: 'start' } }
                },
                timestamp: Date.now(),
              });
            }
          }, 10);
        }
        onClose();
      },
      category: 'Flow',
      keywords: ['create', 'start', 'begin', 'flow', 'control']
    },
    {
      id: 'create-end-node',
      label: 'Create End Node',
      icon: '⏹️',
      action: () => {
        const actions = (window as any).canvasActions;
        if (actions) {
          actions.createNode('control-flow');
          setTimeout(() => {
            const state = canvasStore.getState();
            const node = state.nodes.find((n: any) => n.type === 'control-flow' && n.data.label === 'Process');
            if (node) {
              canvasStore.executeCommand({
                type: 'UPDATE_NODE',
                payload: {
                  nodeId: node.id,
                  updates: { data: { ...node.data, label: 'End', type: 'end' } }
                },
                timestamp: Date.now(),
              });
            }
          }, 10);
        }
        onClose();
      },
      category: 'Flow',
      keywords: ['create', 'end', 'stop', 'finish', 'flow', 'control']
    },
    {
      id: 'create-decision-node',
      label: 'Create Decision Node',
      icon: '❓',
      action: () => {
        const actions = (window as any).canvasActions;
        if (actions) {
          actions.createNode('control-flow');
          setTimeout(() => {
            const state = canvasStore.getState();
            const node = state.nodes.find((n: any) => n.type === 'control-flow' && n.data.label === 'Process');
            if (node) {
              canvasStore.executeCommand({
                type: 'UPDATE_NODE',
                payload: {
                  nodeId: node.id,
                  updates: { data: { ...node.data, label: 'Decision', type: 'decision', condition: 'x > 0' } }
                },
                timestamp: Date.now(),
              });
            }
          }, 10);
        }
        onClose();
      },
      category: 'Flow',
      keywords: ['create', 'decision', 'condition', 'if', 'flow', 'control']
    },
    {
      id: 'create-process-node',
      label: 'Create Process Node',
      icon: '⚙️',
      action: () => {
        const actions = (window as any).canvasActions;
        if (actions) actions.createNode('control-flow');
        onClose();
      },
      category: 'Flow',
      keywords: ['create', 'process', 'action', 'flow', 'control']
    },
    {
      id: 'create-code-block',
      label: 'Create Code Block',
      icon: '💻',
      action: () => {
        const actions = (window as any).canvasActions;
        if (actions) actions.createNode('code');
        onClose();
      },
      category: 'Create',
      keywords: ['create', 'code', 'editor', 'programming', 'script', 'javascript', 'python']
    },
    
    // Node editing commands
    ...(selectedNode ? [
      {
        id: 'open-properties',
        label: `Edit ${selectedNode.type} Properties`,
        icon: '⚙️',
        action: () => {
          if (onOpenProperties) onOpenProperties();
          onClose();
        },
        category: 'Edit',
        keywords: ['edit', 'properties', 'settings', 'configure']
      },
      {
        id: 'delete-node',
        label: `Delete ${selectedNode.type}`,
        icon: '🗑️',
        action: () => {
          const actions = (window as any).canvasActions;
          if (actions) actions.deleteNode(selectedNode.id);
          onClose();
        },
        category: 'Edit',
        keywords: ['delete', 'remove', 'trash']
      }
    ] : []),
    
    // Canvas commands
    {
      id: 'clear-canvas',
      label: 'Clear Canvas',
      icon: '🧹',
      action: () => {
        const actions = (window as any).canvasActions;
        if (actions) actions.clearCanvas();
        onClose();
      },
      category: 'Canvas',
      keywords: ['clear', 'clean', 'reset', 'canvas']
    },
    
    // View commands
    {
      id: 'view-mindmap',
      label: 'Switch to Mind Map View',
      icon: '🧠',
      action: () => {
        console.log('Switched to Mind Map view');
        onClose();
      },
      category: 'View',
      keywords: ['view', 'mindmap', 'mind', 'map']
    },
    {
      id: 'view-filesystem',
      label: 'Switch to File System View',
      icon: '📁',
      action: () => {
        console.log('Switched to File System view');
        onClose();
      },
      category: 'View',
      keywords: ['view', 'filesystem', 'file', 'system']
    },
    {
      id: 'view-execution',
      label: 'Switch to Execution View',
      icon: '▶️',
      action: () => {
        console.log('Switched to Execution view');
        onClose();
      },
      category: 'View',
      keywords: ['view', 'execution', 'run', 'execute']
    },
    {
      id: 'view-dataflow',
      label: 'Switch to Data Flow View',
      icon: '🔄',
      action: () => {
        console.log('Switched to Data Flow view');
        onClose();
      },
      category: 'View',
      keywords: ['view', 'dataflow', 'data', 'flow']
    }
  ];

  const filteredCommands = commands.filter(command => 
    command.label.toLowerCase().includes(query.toLowerCase()) ||
    command.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-32 z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="p-4 border-b border-gray-600">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
            className="w-full bg-transparent text-white placeholder-gray-400 text-lg outline-none"
          />
        </div>

        {/* Command List */}
        <div className="max-h-96 overflow-y-auto">
          {Object.entries(groupedCommands).map(([category, commands]) => (
            <div key={category}>
              <div className="px-4 py-2 text-xs text-gray-400 uppercase tracking-wide font-semibold bg-gray-700">
                {category}
              </div>
              {commands.map((command, index) => {
                const globalIndex = filteredCommands.findIndex(c => c.id === command.id);
                return (
                  <button
                    key={command.id}
                    onClick={() => command.action()}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-700 flex items-center space-x-3 ${
                      globalIndex === selectedIndex ? 'bg-blue-600' : ''
                    }`}
                  >
                    <span className="text-xl">{command.icon}</span>
                    <span className="text-white">{command.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
          
          {filteredCommands.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              No commands found for "{query}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-600 text-xs text-gray-400">
          <div className="flex items-center justify-between">
            <span>
              {selectedNode ? `Selected: ${selectedNode.type} node` : 'No node selected'}
            </span>
            <span>
              Press ↑↓ to navigate • Enter to select • Esc to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette; 