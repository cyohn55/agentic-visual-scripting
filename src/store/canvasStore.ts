import { Node, Edge } from 'reactflow';
import { ViewMode } from '../types';

export interface CanvasState {
  nodes: Node[];
  edges: Edge[];
  viewMode: ViewMode;
  selectedNodeIds: string[];
  isCommandPaletteOpen: boolean;
  showPropertiesPanel: boolean;
  groups: NodeGroup[];
}

export interface NodeGroup {
  id: string;
  name: string;
  nodeIds: string[];
  color: string;
  collapsed: boolean;
}

export interface Command {
  type: string;
  payload: any;
  timestamp: number;
}

class CanvasStore {
  private state: CanvasState = {
    nodes: [],
    edges: [],
    viewMode: 'mindmap',
    selectedNodeIds: [],
    isCommandPaletteOpen: false,
    showPropertiesPanel: false,
    groups: [],
  };

  private history: Command[] = [];
  private historyIndex: number = -1;
  private maxHistorySize: number = 50;
  private listeners: Set<() => void> = new Set();

  // State management
  getState(): CanvasState {
    return { ...this.state };
  }

  setState(newState: Partial<CanvasState>) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
    this.saveToLocalStorage();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // Command pattern for undo/redo
  executeCommand(command: Command) {
    // Remove any commands after current index (when undoing then doing new action)
    this.history = this.history.slice(0, this.historyIndex + 1);
    
    // Add new command
    this.history.push(command);
    this.historyIndex++;

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
      this.historyIndex--;
    }

    this.applyCommand(command);
    this.saveToLocalStorage();
  }

  undo(): boolean {
    if (this.historyIndex >= 0) {
      const command = this.history[this.historyIndex];
      this.applyReverseCommand(command);
      this.historyIndex--;
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  redo(): boolean {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const command = this.history[this.historyIndex];
      this.applyCommand(command);
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  canUndo(): boolean {
    return this.historyIndex >= 0;
  }

  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  private applyCommand(command: Command) {
    switch (command.type) {
      case 'ADD_NODE':
        this.state.nodes.push(command.payload.node);
        break;
      case 'DELETE_NODE':
        this.state.nodes = this.state.nodes.filter(n => n.id !== command.payload.nodeId);
        this.state.edges = this.state.edges.filter(e => 
          e.source !== command.payload.nodeId && e.target !== command.payload.nodeId
        );
        break;
      case 'UPDATE_NODE':
        const nodeIndex = this.state.nodes.findIndex(n => n.id === command.payload.nodeId);
        if (nodeIndex >= 0) {
          this.state.nodes[nodeIndex] = { ...this.state.nodes[nodeIndex], ...command.payload.updates };
        }
        break;
      case 'ADD_EDGE':
        this.state.edges.push(command.payload.edge);
        break;
      case 'DELETE_EDGE':
        this.state.edges = this.state.edges.filter(e => e.id !== command.payload.edgeId);
        break;
      case 'MOVE_NODES':
        command.payload.movements.forEach(({ nodeId, newPosition }: any) => {
          const node = this.state.nodes.find(n => n.id === nodeId);
          if (node) {
            node.position = newPosition;
          }
        });
        break;
      case 'CREATE_GROUP':
        this.state.groups.push(command.payload.group);
        break;
      case 'DELETE_GROUP':
        this.state.groups = this.state.groups.filter(g => g.id !== command.payload.groupId);
        break;
      case 'CLEAR_CANVAS':
        this.state.nodes = [];
        this.state.edges = [];
        this.state.groups = [];
        this.state.selectedNodeIds = [];
        break;
    }
    this.notifyListeners();
  }

  private applyReverseCommand(command: Command) {
    switch (command.type) {
      case 'ADD_NODE':
        this.state.nodes = this.state.nodes.filter(n => n.id !== command.payload.node.id);
        break;
      case 'DELETE_NODE':
        this.state.nodes.push(command.payload.node);
        if (command.payload.edges) {
          this.state.edges.push(...command.payload.edges);
        }
        break;
      case 'UPDATE_NODE':
        const nodeIndex = this.state.nodes.findIndex(n => n.id === command.payload.nodeId);
        if (nodeIndex >= 0) {
          this.state.nodes[nodeIndex] = command.payload.previousNode;
        }
        break;
      case 'ADD_EDGE':
        this.state.edges = this.state.edges.filter(e => e.id !== command.payload.edge.id);
        break;
      case 'DELETE_EDGE':
        this.state.edges.push(command.payload.edge);
        break;
      case 'MOVE_NODES':
        command.payload.movements.forEach(({ nodeId, previousPosition }: any) => {
          const node = this.state.nodes.find(n => n.id === nodeId);
          if (node) {
            node.position = previousPosition;
          }
        });
        break;
      case 'CREATE_GROUP':
        this.state.groups = this.state.groups.filter(g => g.id !== command.payload.group.id);
        break;
      case 'DELETE_GROUP':
        this.state.groups.push(command.payload.group);
        break;
      case 'CLEAR_CANVAS':
        this.state.nodes = command.payload.previousNodes || [];
        this.state.edges = command.payload.previousEdges || [];
        this.state.groups = command.payload.previousGroups || [];
        break;
    }
    this.notifyListeners();
  }

  // Multi-select functionality
  selectNode(nodeId: string, addToSelection = false) {
    if (addToSelection) {
      if (!this.state.selectedNodeIds.includes(nodeId)) {
        this.state.selectedNodeIds.push(nodeId);
      }
    } else {
      this.state.selectedNodeIds = [nodeId];
    }
    this.notifyListeners();
  }

  deselectNode(nodeId: string) {
    this.state.selectedNodeIds = this.state.selectedNodeIds.filter(id => id !== nodeId);
    this.notifyListeners();
  }

  clearSelection() {
    this.state.selectedNodeIds = [];
    this.notifyListeners();
  }

  selectMultipleNodes(nodeIds: string[]) {
    this.state.selectedNodeIds = [...nodeIds];
    this.notifyListeners();
  }

  isNodeSelected(nodeId: string): boolean {
    return this.state.selectedNodeIds.includes(nodeId);
  }

  getSelectedNodes(): Node[] {
    return this.state.nodes.filter(node => this.state.selectedNodeIds.includes(node.id));
  }

  // Group functionality
  createGroup(name: string, nodeIds: string[], color: string = '#8b5cf6'): NodeGroup {
    const group: NodeGroup = {
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      nodeIds: [...nodeIds],
      color,
      collapsed: false,
    };

    this.executeCommand({
      type: 'CREATE_GROUP',
      payload: { group },
      timestamp: Date.now(),
    });

    return group;
  }

  deleteGroup(groupId: string) {
    const group = this.state.groups.find(g => g.id === groupId);
    if (group) {
      this.executeCommand({
        type: 'DELETE_GROUP',
        payload: { groupId, group },
        timestamp: Date.now(),
      });
    }
  }

  addNodesToGroup(groupId: string, nodeIds: string[]) {
    const group = this.state.groups.find(g => g.id === groupId);
    if (group) {
      const newNodeIds = nodeIds.filter(id => !group.nodeIds.includes(id));
      group.nodeIds.push(...newNodeIds);
      this.notifyListeners();
      this.saveToLocalStorage();
    }
  }

  removeNodesFromGroup(groupId: string, nodeIds: string[]) {
    const group = this.state.groups.find(g => g.id === groupId);
    if (group) {
      group.nodeIds = group.nodeIds.filter(id => !nodeIds.includes(id));
      this.notifyListeners();
      this.saveToLocalStorage();
    }
  }

  toggleGroupCollapse(groupId: string) {
    const group = this.state.groups.find(g => g.id === groupId);
    if (group) {
      group.collapsed = !group.collapsed;
      this.notifyListeners();
      this.saveToLocalStorage();
    }
  }

  // Persistence
  saveToLocalStorage() {
    try {
      const dataToSave = {
        nodes: this.state.nodes,
        edges: this.state.edges,
        groups: this.state.groups,
        viewMode: this.state.viewMode,
        timestamp: Date.now(),
      };
      localStorage.setItem('agentic-visual-scripting-canvas', JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('Failed to save canvas to localStorage:', error);
    }
  }

  loadFromLocalStorage(): boolean {
    try {
      const saved = localStorage.getItem('agentic-visual-scripting-canvas');
      if (saved) {
        const data = JSON.parse(saved);
        this.state.nodes = data.nodes || [];
        this.state.edges = data.edges || [];
        this.state.groups = data.groups || [];
        this.state.viewMode = data.viewMode || 'mindmap';
        this.notifyListeners();
        return true;
      }
    } catch (error) {
      console.warn('Failed to load canvas from localStorage:', error);
    }
    return false;
  }

  exportCanvas(): string {
    return JSON.stringify({
      nodes: this.state.nodes,
      edges: this.state.edges,
      groups: this.state.groups,
      viewMode: this.state.viewMode,
      exportedAt: new Date().toISOString(),
      version: '2.0',
    }, null, 2);
  }

  importCanvas(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      // Store current state for undo
      const previousState = {
        previousNodes: [...this.state.nodes],
        previousEdges: [...this.state.edges],
        previousGroups: [...this.state.groups],
      };

      this.executeCommand({
        type: 'CLEAR_CANVAS',
        payload: previousState,
        timestamp: Date.now(),
      });

      this.state.nodes = data.nodes || [];
      this.state.edges = data.edges || [];
      this.state.groups = data.groups || [];
      this.state.viewMode = data.viewMode || 'mindmap';
      this.state.selectedNodeIds = [];
      
      this.notifyListeners();
      this.saveToLocalStorage();
      return true;
    } catch (error) {
      console.error('Failed to import canvas:', error);
      return false;
    }
  }

  // Utility methods
  generateId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getNodeById(id: string): Node | undefined {
    return this.state.nodes.find(node => node.id === id);
  }

  getGroupById(id: string): NodeGroup | undefined {
    return this.state.groups.find(group => group.id === id);
  }

  getGroupsForNode(nodeId: string): NodeGroup[] {
    return this.state.groups.filter(group => group.nodeIds.includes(nodeId));
  }
}

// Create singleton instance
export const canvasStore = new CanvasStore(); 