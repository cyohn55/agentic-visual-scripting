import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  useNodesState,
  useEdgesState,
  Connection,
  NodeTypes,
  OnSelectionChangeParams,
  addEdge,
  Edge,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { NodeType } from '../types';
import StickyNoteNode from './nodes/StickyNoteNode';
import TextFileNode from './nodes/TextFileNode';
import ShapeNode from './nodes/ShapeNode';
import ControlFlowNode from './nodes/ControlFlowNode';
import CodeNode from './nodes/CodeNode';
import PropertiesPanel from './PropertiesPanel';
import MultiSelectOverlay from './MultiSelectOverlay';
import GroupingPanel from './GroupingPanel';
import ConnectionTypeModal from './ConnectionTypeModal';
import { ConnectionType } from '../types';

// Memoized node types to prevent recreation on every render
const nodeTypes: NodeTypes = {
  'sticky-note': StickyNoteNode,
  'text-file': TextFileNode,
  'shape': ShapeNode,
  'control-flow': ControlFlowNode,
  'code': CodeNode,
};

interface CanvasProps {
  onCreateNode?: (type: NodeType, position?: { x: number; y: number }) => void;
  onDeleteNode?: (id: string) => void;
  onClearCanvas?: () => void;
  onNodeSelect?: (node: Node) => void;
  onNodeDeselect?: () => void;
  selectedNode?: Node | null;
  showPropertiesPanel?: boolean;
  onClosePropertiesPanel?: () => void;
}

// Memoized Canvas component to prevent unnecessary re-renders
const Canvas: React.FC<CanvasProps> = React.memo(({ 
  onCreateNode, 
  onDeleteNode, 
  onClearCanvas,
  onNodeSelect,
  onNodeDeselect,
  selectedNode: externalSelectedNode,
  showPropertiesPanel: externalShowPropertiesPanel,
  onClosePropertiesPanel
}) => {
  // PRIMARY STATE: Only React Flow's state management (no competing stores)
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // UI state only (not duplicated in external stores)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedNodes] = useState<Node[]>([]);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [showMultiSelectOverlay, setShowMultiSelectOverlay] = useState(false);
  const [showGroupingPanel, setShowGroupingPanel] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<{
    sourceNode: Node;
    targetNode: Node;
    params: Connection;
  } | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // Use external state if provided, otherwise use internal state
  const currentSelectedNode = externalSelectedNode !== undefined ? externalSelectedNode : selectedNode;
  const currentShowPropertiesPanel = externalShowPropertiesPanel !== undefined ? externalShowPropertiesPanel : showPropertiesPanel;

  // Optimized node change handler (no competing updates)
  const handleNodesChange = useCallback((changes: any[]) => {
    onNodesChange(changes);
  }, [onNodesChange]);

  // Optimized edge change handler
  const handleEdgesChange = useCallback((changes: any[]) => {
    onEdgesChange(changes);
  }, [onEdgesChange]);

  // Node update function using only React Flow's state
  const updateNodeData = useCallback((nodeId: string, updates: any) => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...updates } } : node
      )
    );
  }, [setNodes]);

  // Expose updateNodeData to child nodes via context or ref
  useEffect(() => {
    (window as any).__updateNodeData = updateNodeData;
    return () => {
      delete (window as any).__updateNodeData;
    };
  }, [updateNodeData]);

  // Resize event handlers removed - React Flow manages this natively

  // Handle edge connections - show modal to define connection type
  const onConnect = useCallback((params: Connection) => {
    if (!params.source || !params.target) return;
    
    // Find source and target nodes
    const sourceNode = nodes.find(n => n.id === params.source);
    const targetNode = nodes.find(n => n.id === params.target);
    
    if (!sourceNode || !targetNode) return;
    
    // Store pending connection and show modal
    setPendingConnection({
      sourceNode,
      targetNode,
      params,
    });
    setShowConnectionModal(true);
  }, [nodes]);

  // Create connection with specified type
  const handleConnectionConfirm = useCallback((connectionType: ConnectionType, customLabel?: string) => {
    if (!pendingConnection) return;
    
    const { params } = pendingConnection;
    
    // Create new edge with connection metadata
    const newEdge: Edge = {
      id: `edge-${params.source}-${params.target}`,
      source: params.source!,
      target: params.target!,
      type: 'smoothstep',
      style: { 
        strokeWidth: 2, 
        stroke: '#8b5cf6' 
      },
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#8b5cf6',
      },
      data: {
        connectionType,
        label: customLabel,
      },
    };

    // Add to React Flow state
    setEdges((eds) => addEdge(newEdge, eds));

    // Persist to canvasStore
    // canvasStore.executeCommand({
    //   type: 'ADD_EDGE',
    //   payload: { edge: newEdge },
    //   timestamp: Date.now(),
    // });

    // Save to localStorage
    // canvasStore.saveToLocalStorage();
    
    // Close modal and clear pending connection
    setShowConnectionModal(false);
    setPendingConnection(null);
  }, [pendingConnection, setEdges]);

  // Cancel connection creation
  const handleConnectionCancel = useCallback(() => {
    setShowConnectionModal(false);
    setPendingConnection(null);
  }, []);

  // Sync with canvas store
  useEffect(() => {
    const updateFromStore = () => {
      // Don't update React Flow state while user is actively dragging
      // This state is no longer needed as React Flow manages dragging
      // if (isDraggingRef.current) {
      //   return;
      // }
      
      // const state = canvasStore.getState();
      
      // // Only update nodes if there's a significant change to avoid overriding position changes
      // // during dragging or interactions
      // const currentNodeIds = nodesRef.current.map(n => n.id).sort();
      // const storeNodeIds = state.nodes.map(n => n.id).sort();
      // const nodesChanged = currentNodeIds.length !== storeNodeIds.length || 
      //   currentNodeIds.some((id, index) => id !== storeNodeIds[index]);
      
      // if (nodesChanged || nodesRef.current.length === 0) {
      //   setNodes(state.nodes);
      // }
      
      // setEdges(state.edges);
      
      // // Update selected nodes
      // const selected = state.nodes.filter(node => 
      //   canvasStore.isNodeSelected(node.id)
      // );
      // setSelectedNodes(selected);
      
      // if (selected.length === 1) {
      //   setSelectedNode(selected[0]);
      // } else {
      //   setSelectedNode(null);
      // }
    };

    // Load from localStorage on mount
    // canvasStore.loadFromLocalStorage();
    updateFromStore();

    // const unsubscribe = canvasStore.subscribe(updateFromStore);
    // return () => {
    //   unsubscribe();
    // };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // setNodes and setEdges are stable functions from React Flow hooks

  const generateId = () => {
    // This function is no longer needed as React Flow generates IDs
    // return canvasStore.generateId(); 
    return 'node-' + Math.random().toString(36).substring(7);
  };

  const createNode = useCallback((type: NodeType, position?: { x: number; y: number }) => {
    const id = generateId();
    
    // Use center of canvas as default position if none provided
    const nodePosition = position || { x: 100, y: 100 };
    
    let nodeData: Node;
    
    switch (type) {
      case 'sticky-note':
        nodeData = {
          id,
          type,
          position: nodePosition,
          data: { label: 'New Sticky Note', content: 'Double-click to edit content...' },
        };
        break;
      case 'text-file':
        nodeData = {
          id,
          type,
          position: nodePosition,
          data: { label: 'new-file.txt', content: '// Add your file content here...', fileType: 'txt' },
        };
        break;
      case 'shape':
        nodeData = {
          id,
          type: 'shape',
          position: nodePosition,
          data: { 
            label: 'New Shape',
            color: '#8b5cf6',
            shape: 'rectangle'
          },
        };
        break;
      case 'control-flow':
        nodeData = {
          id,
          type: 'control-flow',
          position: nodePosition,
          data: { 
            label: 'Process',
            type: 'process'
          },
        };
        break;
      case 'code':
        nodeData = {
          id,
          type: 'code',
          position: nodePosition,
          data: { 
            label: 'Code Block',
            code: '',
            language: 'javascript'
          },
        };
        break;
      default:
        return;
    }

    // Add node to React Flow state
    setNodes((nodes) => [...nodes, nodeData]);

    if (onCreateNode) onCreateNode(type, nodePosition);
  }, [onCreateNode, setNodes]);

  const deleteNode = useCallback((id: string) => {
    // Remove node and related edges from React Flow state
    setNodes((nodes) => nodes.filter(node => node.id !== id));
    setEdges((edges) => edges.filter(edge => edge.source !== id && edge.target !== id));

    if (onDeleteNode) onDeleteNode(id);
  }, [onDeleteNode, setNodes, setEdges]);

  const deleteSelectedNodes = useCallback(() => {
    if (selectedNodes.length > 0) {
      selectedNodes.forEach(node => {
        deleteNode(node.id);
      });
      // canvasStore.clearSelection();
      setShowMultiSelectOverlay(false);
    }
  }, [selectedNodes, deleteNode]);

  const clearCanvas = useCallback(() => {
    // Clear all nodes and edges from React Flow state
    setNodes([]);
    setEdges([]);

    if (onClearCanvas) onClearCanvas();
  }, [onClearCanvas, setNodes, setEdges]);

  const createGroup = useCallback((name: string, color: string) => {
    if (selectedNodes.length > 0) {
      // canvasStore.createGroup(name, selectedNodes.map(n => n.id), color);
      // canvasStore.clearSelection();
      setShowMultiSelectOverlay(false);
    }
  }, [selectedNodes]);

  // Expose canvas actions to global scope for command palette
  const canvasActions = useMemo(() => ({
    createNode,
    deleteNode,
    clearCanvas,
    undo: () => {}, // canvasStore.undo(),
    redo: () => {}, // canvasStore.redo(),
    canUndo: () => false, // canvasStore.canUndo(),
    canRedo: () => false, // canvasStore.canRedo(),
  }), [createNode, deleteNode, clearCanvas]);

  // Expose actions to global scope for CommandPalette access
  useEffect(() => {
    (window as any).canvasActions = canvasActions;
    
    // Cleanup function to clear any pending drag timeouts
    return () => {
      // if (dragTimeoutRef.current) {
      //   clearTimeout(dragTimeoutRef.current);
      //   dragTimeoutRef.current = null;
      // }
    };
  }, [canvasActions]);

  // Close context menu on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Delete selected nodes with Delete key
      if (event.key === 'Delete' && selectedNodes.length > 0) {
        deleteSelectedNodes();
        return;
      }

      // Toggle properties panel with P key
      if (event.key === 'p' && currentSelectedNode) {
        if (externalShowPropertiesPanel !== undefined) {
          if (onClosePropertiesPanel && currentShowPropertiesPanel) {
            onClosePropertiesPanel();
          }
        } else {
          setShowPropertiesPanel(!showPropertiesPanel);
        }
        return;
      }

      // Toggle grouping panel with G key
      if (event.key === 'g') {
        setShowGroupingPanel(!showGroupingPanel);
        return;
      }

      // Multi-select with M key
      if (event.key === 'm' && selectedNodes.length > 1) {
        setShowMultiSelectOverlay(true);
        return;
      }

      // Undo with Ctrl+Z
      if (event.key === 'z' && (event.ctrlKey || event.metaKey) && !event.shiftKey) {
        event.preventDefault();
        // canvasStore.undo();
        return;
      }

      // Redo with Ctrl+Shift+Z or Ctrl+Y
      if (((event.key === 'z' && event.shiftKey) || event.key === 'y') && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        // canvasStore.redo();
        return;
      }

      // Close panels with Escape key
      if (event.key === 'Escape') {
        if (showMultiSelectOverlay) {
          setShowMultiSelectOverlay(false);
        } else if (showGroupingPanel) {
          setShowGroupingPanel(false);
        } else if (currentShowPropertiesPanel) {
          if (onClosePropertiesPanel) {
            onClosePropertiesPanel();
          } else {
            setShowPropertiesPanel(false);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedNodes,
    currentSelectedNode,
    currentShowPropertiesPanel,
    showMultiSelectOverlay,
    showGroupingPanel,
    deleteSelectedNodes,
    onClosePropertiesPanel,
    showPropertiesPanel,
    externalShowPropertiesPanel
  ]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;
    
    if (isCtrlOrCmd) {
      // Multi-select mode
      // if (canvasStore.isNodeSelected(node.id)) {
      //   canvasStore.deselectNode(node.id);
      // } else {
      //   canvasStore.selectNode(node.id, true);
      // }
    } else {
      // Single select mode
      // canvasStore.selectNode(node.id, false);
      
      if (onNodeSelect) {
        onNodeSelect(node);
      } else {
        setSelectedNode(node);
        setShowPropertiesPanel(true);
      }
    }
  }, [onNodeSelect]);

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    const selectedNodeIds = params.nodes.map(node => node.id);
    // canvasStore.selectMultipleNodes(selectedNodeIds);
    
    if (selectedNodeIds.length > 1) {
      setShowMultiSelectOverlay(false); // Will be shown via keyboard shortcut
    }
  }, []);

  const onPaneClick = useCallback((event: React.MouseEvent) => {
    setContextMenu(null);
    
    if (!event.ctrlKey && !event.metaKey) {
      // canvasStore.clearSelection();
      
      if (onNodeDeselect) {
        onNodeDeselect();
      } else {
        setSelectedNode(null);
        setShowPropertiesPanel(false);
      }
      
      setShowMultiSelectOverlay(false);
    }
  }, [onNodeDeselect]);

  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    
    // Use viewport coordinates for fixed positioning
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
    });
  }, []);

  const handleContextMenuAction = useCallback((type: NodeType) => {
    if (contextMenu && canvasRef.current) {
      // Convert viewport coordinates to canvas coordinates
      const rect = canvasRef.current.getBoundingClientRect();
      const position = {
        x: contextMenu.x - rect.left - 100, // Offset to center the node
        y: contextMenu.y - rect.top - 100,
      };
      
      createNode(type, position);
      setContextMenu(null);
    }
  }, [contextMenu, createNode]);

  const handleClosePropertiesPanel = useCallback(() => {
    if (onClosePropertiesPanel) {
      onClosePropertiesPanel();
    } else {
      setShowPropertiesPanel(false);
    }
  }, [onClosePropertiesPanel]);

  return (
    <div className="w-full h-full bg-canvas-bg relative" ref={canvasRef} style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onSelectionChange={onSelectionChange}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid={true}
        snapGrid={[10, 10]}
        attributionPosition="bottom-left"
        className="bg-canvas-bg"
        connectionLineStyle={{ stroke: '#8b5cf6', strokeWidth: 2 }}
        defaultEdgeOptions={{
          style: { strokeWidth: 2, stroke: '#8b5cf6' },
          type: 'smoothstep',
        }}
        multiSelectionKeyCode={['Control', 'Meta']}
        deleteKeyCode={['Delete', 'Backspace']}
        selectionOnDrag={true}
        maxZoom={3}
        minZoom={0.1}
        elevateNodesOnSelect={false}
        disableKeyboardA11y={true}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={true}
        selectNodesOnDrag={false}
      >
        <Background 
          color="#2a2a2a" 
          gap={20} 
          size={1}
          style={{ backgroundColor: '#1a1a1a' }}
        />
        <Controls 
          className="bg-gray-800 border-gray-600"
        />
        <MiniMap 
          className="bg-gray-800 border-gray-600"
          maskColor="rgba(0, 0, 0, 0.3)"
          nodeColor="#8b5cf6"
          style={{ backgroundColor: '#1f2937' }}
        />
      </ReactFlow>
      
      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-2 z-50 min-w-48"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleContextMenuAction('sticky-note')}
            className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center space-x-3"
          >
            <span className="text-lg">📝</span>
            <span className="text-white">Create Sticky Note</span>
          </button>
          <button
            onClick={() => handleContextMenuAction('text-file')}
            className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center space-x-3"
          >
            <span className="text-lg">📄</span>
            <span className="text-white">Create Text File</span>
          </button>
          <button
            onClick={() => handleContextMenuAction('shape')}
            className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center space-x-3"
          >
            <span className="text-lg">🔷</span>
            <span className="text-white">Create Shape</span>
          </button>
          <hr className="border-gray-600 my-1" />
          <button
            onClick={() => handleContextMenuAction('control-flow')}
            className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center space-x-3"
          >
            <span className="text-lg">⚙️</span>
            <span className="text-white">Control Flow Node</span>
          </button>
          <hr className="border-gray-600 my-1" />
          <button
            onClick={() => handleContextMenuAction('code')}
            className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center space-x-3"
          >
            <span className="text-lg">💻</span>
            <span className="text-white">Code Block</span>
          </button>
        </div>
      )}

      {/* Properties Panel */}
      {currentShowPropertiesPanel && currentSelectedNode && (
        <PropertiesPanel
          selectedNode={currentSelectedNode}
          onClose={handleClosePropertiesPanel}
        />
      )}

      {/* Multi-Select Overlay */}
      {showMultiSelectOverlay && selectedNodes.length > 1 && (
        <MultiSelectOverlay
          selectedNodes={selectedNodes}
          onClose={() => setShowMultiSelectOverlay(false)}
          onCreateGroup={createGroup}
          onDeleteSelected={deleteSelectedNodes}
        />
      )}

      {/* Grouping Panel */}
      {showGroupingPanel && (
        <GroupingPanel
          isOpen={showGroupingPanel}
          onClose={() => setShowGroupingPanel(false)}
        />
      )}

      {/* Help Text */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-400 bg-gray-900 bg-opacity-80 p-2 rounded max-w-sm">
        <div className="font-semibold mb-1">Phase 3 Features:</div>
        <div>• Ctrl+Click for multi-select • M for multi-select actions</div>
        <div>• G for groups panel • P for properties • Del to delete</div>
        <div>• Ctrl+Z/Y for undo/redo • Drag to select multiple</div>
      </div>

      {/* Multi-select indicator */}
      {selectedNodes.length > 1 && !showMultiSelectOverlay && (
        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <span>📋</span>
          <span>{selectedNodes.length} nodes selected</span>
          <button
            onClick={() => setShowMultiSelectOverlay(true)}
            className="bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded text-xs ml-2"
          >
            Actions
          </button>
        </div>
      )}

      {/* Connection Type Modal */}
      <ConnectionTypeModal
        isOpen={showConnectionModal}
        sourceNode={pendingConnection?.sourceNode ? {
          id: pendingConnection.sourceNode.id,
          type: pendingConnection.sourceNode.type || 'unknown',
          label: pendingConnection.sourceNode.data?.label
        } : undefined}
        targetNode={pendingConnection?.targetNode ? {
          id: pendingConnection.targetNode.id,
          type: pendingConnection.targetNode.type || 'unknown',
          label: pendingConnection.targetNode.data?.label
        } : undefined}
        onConfirm={handleConnectionConfirm}
        onCancel={handleConnectionCancel}
      />
    </div>
  );
});

export default Canvas; 