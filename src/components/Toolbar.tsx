import React, { useState, useEffect } from 'react';
import { ViewMode } from '../types';
import { canvasStore } from '../store/canvasStore';
import ExportImportDialog from './ExportImportDialog';

interface ToolbarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenCommandPalette: () => void;
  selectedNode?: any;
  onOpenProperties?: () => void;
  onOpenGroupingPanel?: () => void;
  onOpenExecutionPanel?: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  currentView, 
  onViewChange, 
  onOpenCommandPalette, 
  selectedNode,
  onOpenProperties,
  onOpenGroupingPanel,
  onOpenExecutionPanel
}) => {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [showExportImport, setShowExportImport] = useState(false);
  const [nodeCount, setNodeCount] = useState(0);
  const [groupCount, setGroupCount] = useState(0);

  useEffect(() => {
    const updateUndoRedoState = () => {
      setCanUndo(canvasStore.canUndo());
      setCanRedo(canvasStore.canRedo());
      
      const state = canvasStore.getState();
      setNodeCount(state.nodes.length);
      setGroupCount(state.groups.length);
    };

    updateUndoRedoState();
    const unsubscribe = canvasStore.subscribe(updateUndoRedoState);
    return () => {
      unsubscribe();
    };
  }, []);

  const handleUndo = () => {
    canvasStore.undo();
  };

  const handleRedo = () => {
    canvasStore.redo();
  };

  const viewModes: { key: ViewMode; label: string; icon: string }[] = [
    { key: 'mindmap', label: 'Mind Map', icon: '🧠' },
    { key: 'filesystem', label: 'File System', icon: '📁' },
    { key: 'execution', label: 'Execution', icon: '▶️' },
    { key: 'dataflow', label: 'Data Flow', icon: '🔄' },
  ];

  return (
    <>
      <div className="bg-gray-800 border-b border-gray-600 px-4 py-2 flex items-center justify-between">
        {/* Left section - Title and Stats */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-white">
            Agentic Visual Scripting
          </h1>
          <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">
            Phase 3
          </span>
          <div className="flex items-center space-x-3 text-xs text-gray-400">
            <span>{nodeCount} nodes</span>
            <span>{groupCount} groups</span>
          </div>
        </div>

        {/* Center section - View Mode Switcher */}
        <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
          {viewModes.map((mode) => (
            <button
              key={mode.key}
              onClick={() => onViewChange(mode.key)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                currentView === mode.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-600'
              }`}
              title={mode.label}
            >
              <span className="mr-1">{mode.icon}</span>
              {mode.label}
            </button>
          ))}
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center space-x-2">
          {/* Undo/Redo */}
          <div className="flex items-center space-x-1 mr-2">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-sm transition-colors"
              title="Undo (Ctrl+Z)"
            >
              ↶
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white px-2 py-1 rounded text-sm transition-colors"
              title="Redo (Ctrl+Y)"
            >
              ↷
            </button>
          </div>

          {/* Node-specific actions */}
          {selectedNode && (
            <div className="flex items-center space-x-2 mr-4">
              <span className="text-sm text-gray-400">
                Selected: {selectedNode.type}
              </span>
              {onOpenProperties && (
                <button
                  onClick={onOpenProperties}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                  title="Open Properties (P)"
                >
                  ⚙️ Properties
                </button>
              )}
            </div>
          )}

          {/* Grouping Panel */}
          {onOpenGroupingPanel && (
            <button
              onClick={onOpenGroupingPanel}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
              title="Open Groups Panel (G)"
            >
              <span>📦</span>
              <span>Groups</span>
            </button>
          )}

          {/* Execution Panel */}
          {onOpenExecutionPanel && (
            <button
              onClick={onOpenExecutionPanel}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
              title="Open Execution Panel (E)"
            >
              <span>⚙️</span>
              <span>Execution</span>
            </button>
          )}

          {/* Export/Import */}
          <button
            onClick={() => setShowExportImport(true)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
            title="Export/Import Canvas"
          >
            <span>💾</span>
            <span>Save/Load</span>
          </button>

          {/* Command Palette Button */}
          <button
            onClick={onOpenCommandPalette}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors flex items-center space-x-1"
            title="Open Command Palette (Ctrl/Cmd + K)"
          >
            <span>⌘</span>
            <span>Commands</span>
          </button>

          {/* Quick Actions */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                const actions = (window as any).canvasActions;
                if (actions) actions.createNode('sticky-note');
              }}
              className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-sm transition-colors"
              title="Create Sticky Note"
            >
              📝
            </button>
            <button
              onClick={() => {
                const actions = (window as any).canvasActions;
                if (actions) actions.createNode('text-file');
              }}
              className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-sm transition-colors"
              title="Create Text File"
            >
              📄
            </button>
            <button
              onClick={() => {
                const actions = (window as any).canvasActions;
                if (actions) actions.createNode('shape');
              }}
              className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-sm transition-colors"
              title="Create Shape"
            >
              🔷
            </button>
          </div>
        </div>
      </div>

      {/* Export/Import Dialog */}
      {showExportImport && (
        <ExportImportDialog
          isOpen={showExportImport}
          onClose={() => setShowExportImport(false)}
        />
      )}
    </>
  );
};

export default Toolbar; 