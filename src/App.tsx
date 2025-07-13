import React, { useState, useEffect } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { ThemeProvider } from './context/ThemeContext';
import Canvas from './components/Canvas';
import CommandPalette from './components/CommandPalette';
import Toolbar from './components/Toolbar';
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp';
import ExecutionPanel from './components/ExecutionPanel';
import SettingsPanel from './components/SettingsPanel';
import GroupingPanel from './components/GroupingPanel';
import { ViewMode } from './types';
import { canvasStore } from './store/canvasStore';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('mindmap');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [showGroupingPanel, setShowGroupingPanel] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Sync with canvas store
  useEffect(() => {
    const updateFromStore = () => {
      const state = canvasStore.getState();
      setCurrentView(state.viewMode);
      setIsCommandPaletteOpen(state.isCommandPaletteOpen);
      setShowPropertiesPanel(state.showPropertiesPanel);
      
      // Update selected nodes
      const selected = state.nodes.filter(node => 
        canvasStore.isNodeSelected(node.id)
      );
      
      if (selected.length === 1) {
        setSelectedNode(selected[0]);
      } else {
        setSelectedNode(null);
      }
    };

    updateFromStore();
    const unsubscribe = canvasStore.subscribe(updateFromStore);
    return () => {
      unsubscribe();
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      
      // Groups panel
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        setShowGroupingPanel(true);
      }

      // Keyboard shortcuts help
      if (e.key === '?') {
        e.preventDefault();
        setShowKeyboardHelp(!showKeyboardHelp);
      }

      // Execution panel
      if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        setShowExecutionPanel(!showExecutionPanel);
      }

      // Settings panel
      if (e.key === ',' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowSettings(!showSettings);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showKeyboardHelp, showExecutionPanel, showSettings]);

  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view);
    canvasStore.setState({ viewMode: view });
  };

  const handleOpenProperties = () => {
    setShowPropertiesPanel(true);
    canvasStore.setState({ showPropertiesPanel: true });
  };

  const handleNodeSelect = (node: any) => {
    setSelectedNode(node);
    setShowPropertiesPanel(true);
    canvasStore.selectNode(node.id, false);
    canvasStore.setState({ showPropertiesPanel: true });
  };

  const handleNodeDeselect = () => {
    setSelectedNode(null);
    setShowPropertiesPanel(false);
    canvasStore.clearSelection();
    canvasStore.setState({ showPropertiesPanel: false });
  };

  const handleClosePropertiesPanel = () => {
    setShowPropertiesPanel(false);
    canvasStore.setState({ showPropertiesPanel: false });
  };

  const handleOpenGroupingPanel = () => {
    setShowGroupingPanel(true);
  };

  const handleOpenCommandPalette = () => {
    setIsCommandPaletteOpen(true);
    canvasStore.setState({ isCommandPaletteOpen: true });
  };

  const handleCloseCommandPalette = () => {
    setIsCommandPaletteOpen(false);
    canvasStore.setState({ isCommandPaletteOpen: false });
  };

  const handleOpenExecutionPanel = () => {
    setShowExecutionPanel(true);
  };

  return (
    <ReactFlowProvider>
      <ThemeProvider>
        <div className="flex flex-col h-screen bg-gray-900 text-white">
          {/* Toolbar */}
          <Toolbar 
            currentView={currentView} 
            onViewChange={handleViewChange}
            onOpenCommandPalette={handleOpenCommandPalette}
            selectedNode={selectedNode}
            onOpenProperties={handleOpenProperties}
            onOpenGroupingPanel={handleOpenGroupingPanel}
            onOpenExecutionPanel={handleOpenExecutionPanel}
          />
          
          {/* Canvas */}
          <div className="flex-1 relative">
            <Canvas
              onNodeSelect={handleNodeSelect}
              onNodeDeselect={handleNodeDeselect}
              selectedNode={selectedNode}
              showPropertiesPanel={showPropertiesPanel}
              onClosePropertiesPanel={handleClosePropertiesPanel}
            />
          </div>

          {/* Command Palette */}
          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={handleCloseCommandPalette}
            selectedNode={selectedNode}
            onOpenProperties={handleOpenProperties}
          />

          {/* Keyboard Shortcuts Help */}
          <KeyboardShortcutsHelp
            isOpen={showKeyboardHelp}
            onClose={() => setShowKeyboardHelp(false)}
          />

          {/* Execution Panel */}
          <ExecutionPanel
            isOpen={showExecutionPanel}
            onClose={() => setShowExecutionPanel(false)}
          />

          {/* Settings Panel */}
          <SettingsPanel
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />

          {/* Grouping Panel */}
          <GroupingPanel
            isOpen={showGroupingPanel}
            onClose={() => setShowGroupingPanel(false)}
          />

          {/* Phase 3 Status Indicator */}
          <div className="absolute top-20 right-4 bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-lg z-30">
            Phase 3: Advanced Canvas Features ✅
          </div>
        </div>
      </ThemeProvider>
    </ReactFlowProvider>
  );
}

export default App; 