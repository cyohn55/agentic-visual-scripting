import { Node, Edge } from 'reactflow';
import { NodeGroup } from './canvasStore';

export interface CanvasTab {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  groups: NodeGroup[];
  lastModified: number;
  isActive: boolean;
  isUnsaved: boolean;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  nodes: Node[];
  edges: Edge[];
  groups: NodeGroup[];
  category: 'workflow' | 'ui' | 'data' | 'custom';
  tags: string[];
  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  tabs: CanvasTab[];
  activeTabId: string;
  createdAt: number;
  lastModified: number;
  version: string;
}

class ProjectStore {
  private currentProject: Project = this.createDefaultProject();
  private templates: ProjectTemplate[] = this.getDefaultTemplates();
  private listeners: Set<() => void> = new Set();

  // Subscribe to project changes
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // Project management
  getCurrentProject(): Project {
    return { ...this.currentProject };
  }

  createNewProject(name: string, description?: string): Project {
    const project: Project = {
      id: this.generateId(),
      name,
      description,
      tabs: [this.createNewTab('Main Canvas')],
      activeTabId: '',
      createdAt: Date.now(),
      lastModified: Date.now(),
      version: '1.0.0',
    };
    
    project.activeTabId = project.tabs[0].id;
    this.currentProject = project;
    this.saveProject();
    this.notifyListeners();
    return project;
  }

  saveProject(): void {
    this.currentProject.lastModified = Date.now();
    localStorage.setItem('currentProject', JSON.stringify(this.currentProject));
    this.notifyListeners();
  }

  loadProject(): boolean {
    try {
      const saved = localStorage.getItem('currentProject');
      if (saved) {
        this.currentProject = JSON.parse(saved);
        // Ensure we have at least one tab
        if (this.currentProject.tabs.length === 0) {
          this.currentProject.tabs.push(this.createNewTab('Main Canvas'));
          this.currentProject.activeTabId = this.currentProject.tabs[0].id;
        }
        this.notifyListeners();
        return true;
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    }
    return false;
  }

  exportProject(): string {
    return JSON.stringify(this.currentProject, null, 2);
  }

  importProject(jsonData: string): boolean {
    try {
      const project: Project = JSON.parse(jsonData);
      
      // Validate project structure
      if (!project.id || !project.name || !Array.isArray(project.tabs)) {
        throw new Error('Invalid project format');
      }

      // Ensure we have at least one tab
      if (project.tabs.length === 0) {
        project.tabs.push(this.createNewTab('Main Canvas'));
      }

      // Set active tab if none specified
      if (!project.activeTabId || !project.tabs.find(t => t.id === project.activeTabId)) {
        project.activeTabId = project.tabs[0].id;
      }

      this.currentProject = project;
      this.saveProject();
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to import project:', error);
      return false;
    }
  }

  // Tab management
  createNewTab(name: string): CanvasTab {
    const tab: CanvasTab = {
      id: this.generateId(),
      name,
      nodes: [],
      edges: [],
      groups: [],
      lastModified: Date.now(),
      isActive: false,
      isUnsaved: false,
    };
    
    this.currentProject.tabs.push(tab);
    this.setActiveTab(tab.id);
    this.saveProject();
    return tab;
  }

  setActiveTab(tabId: string): void {
    // Deactivate all tabs
    this.currentProject.tabs.forEach(tab => {
      tab.isActive = false;
    });
    
    // Activate the selected tab
    const tab = this.currentProject.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.isActive = true;
      this.currentProject.activeTabId = tabId;
      this.saveProject();
      this.notifyListeners();
    }
  }

  getActiveTab(): CanvasTab | null {
    return this.currentProject.tabs.find(t => t.id === this.currentProject.activeTabId) || null;
  }

  updateTabContent(tabId: string, nodes: Node[], edges: Edge[], groups: NodeGroup[]): void {
    const tab = this.currentProject.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.nodes = nodes;
      tab.edges = edges;
      tab.groups = groups;
      tab.lastModified = Date.now();
      tab.isUnsaved = true;
      this.saveProject();
    }
  }

  renameTab(tabId: string, newName: string): void {
    const tab = this.currentProject.tabs.find(t => t.id === tabId);
    if (tab) {
      tab.name = newName;
      tab.isUnsaved = true;
      this.saveProject();
    }
  }

  closeTab(tabId: string): boolean {
    if (this.currentProject.tabs.length <= 1) {
      return false; // Can't close the last tab
    }

    const tabIndex = this.currentProject.tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return false;

    // If closing the active tab, switch to another one
    if (this.currentProject.activeTabId === tabId) {
      const newActiveIndex = tabIndex > 0 ? tabIndex - 1 : tabIndex + 1;
      this.setActiveTab(this.currentProject.tabs[newActiveIndex].id);
    }

    this.currentProject.tabs.splice(tabIndex, 1);
    this.saveProject();
    return true;
  }

  duplicateTab(tabId: string): CanvasTab | null {
    const sourceTab = this.currentProject.tabs.find(t => t.id === tabId);
    if (!sourceTab) return null;

    const newTab: CanvasTab = {
      ...sourceTab,
      id: this.generateId(),
      name: `${sourceTab.name} (Copy)`,
      isUnsaved: true,
      lastModified: Date.now(),
    };

    this.currentProject.tabs.push(newTab);
    this.setActiveTab(newTab.id);
    return newTab;
  }

  // Template management
  getTemplates(): ProjectTemplate[] {
    return [...this.templates];
  }

  createTemplate(name: string, description: string, category: ProjectTemplate['category'], tags: string[] = []): ProjectTemplate {
    const activeTab = this.getActiveTab();
    if (!activeTab) throw new Error('No active tab to create template from');

    const template: ProjectTemplate = {
      id: this.generateId(),
      name,
      description,
      nodes: activeTab.nodes,
      edges: activeTab.edges,
      groups: activeTab.groups,
      category,
      tags,
      createdAt: Date.now(),
    };

    this.templates.push(template);
    this.saveTemplates();
    this.notifyListeners();
    return template;
  }

  applyTemplate(templateId: string): boolean {
    const template = this.templates.find(t => t.id === templateId);
    const activeTab = this.getActiveTab();
    
    if (!template || !activeTab) return false;

    // Create new IDs for all nodes and edges to avoid conflicts
    const nodeIdMap = new Map<string, string>();
    const newNodes = template.nodes.map(node => {
      const newId = this.generateId();
      nodeIdMap.set(node.id, newId);
      return { ...node, id: newId };
    });

    const newEdges = template.edges.map(edge => ({
      ...edge,
      id: this.generateId(),
      source: nodeIdMap.get(edge.source) || edge.source,
      target: nodeIdMap.get(edge.target) || edge.target,
    }));

    const newGroups = template.groups.map(group => ({
      ...group,
      id: this.generateId(),
      nodeIds: group.nodeIds.map(nodeId => nodeIdMap.get(nodeId) || nodeId),
    }));

    this.updateTabContent(activeTab.id, newNodes, newEdges, newGroups);
    return true;
  }

  private saveTemplates(): void {
    localStorage.setItem('projectTemplates', JSON.stringify(this.templates));
  }

  private loadTemplates(): void {
    try {
      const saved = localStorage.getItem('projectTemplates');
      if (saved) {
        this.templates = [...this.getDefaultTemplates(), ...JSON.parse(saved)];
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  }

  // Export formats
  exportAsJSON(includeAllTabs = false): string {
    if (includeAllTabs) {
      return this.exportProject();
    } else {
      const activeTab = this.getActiveTab();
      if (!activeTab) throw new Error('No active tab to export');
      
      return JSON.stringify({
        name: activeTab.name,
        nodes: activeTab.nodes,
        edges: activeTab.edges,
        groups: activeTab.groups,
        exportedAt: Date.now(),
      }, null, 2);
    }
  }

  exportAsPNG(): Promise<string> {
    return new Promise((resolve, reject) => {
      // This would need integration with React Flow's toImage functionality
      // For now, return a placeholder
      setTimeout(() => {
        resolve('data:image/png;base64,placeholder');
      }, 1000);
    });
  }

  exportAsSVG(): Promise<string> {
    return new Promise((resolve, reject) => {
      // This would need integration with React Flow's SVG export
      setTimeout(() => {
        resolve('<svg>placeholder</svg>');
      }, 1000);
    });
  }

  // Utility methods
  private createDefaultProject(): Project {
    const tab: CanvasTab = {
      id: this.generateId(),
      name: 'Main Canvas',
      nodes: [],
      edges: [],
      groups: [],
      lastModified: Date.now(),
      isActive: true,
      isUnsaved: false,
    };
    
    return {
      id: this.generateId(),
      name: 'Untitled Project',
      tabs: [tab],
      activeTabId: tab.id,
      createdAt: Date.now(),
      lastModified: Date.now(),
      version: '1.0.0',
    };
  }

  private getDefaultTemplates(): ProjectTemplate[] {
    return [
      {
        id: 'basic-workflow',
        name: 'Basic Workflow',
        description: 'Simple start-to-end workflow template',
        nodes: [
          {
            id: 'start-1',
            type: 'control-flow',
            position: { x: 100, y: 100 },
            data: { label: 'Start', type: 'start' },
          },
          {
            id: 'process-1',
            type: 'control-flow',
            position: { x: 300, y: 100 },
            data: { label: 'Process', type: 'process' },
          },
          {
            id: 'end-1',
            type: 'control-flow',
            position: { x: 500, y: 100 },
            data: { label: 'End', type: 'end' },
          },
        ],
        edges: [
          {
            id: 'edge-1',
            source: 'start-1',
            target: 'process-1',
            type: 'smoothstep',
          },
          {
            id: 'edge-2',
            source: 'process-1',
            target: 'end-1',
            type: 'smoothstep',
          },
        ],
        groups: [],
        category: 'workflow',
        tags: ['basic', 'workflow', 'starter'],
        createdAt: Date.now(),
      },
      {
        id: 'decision-tree',
        name: 'Decision Tree',
        description: 'Branching workflow with decision nodes',
        nodes: [
          {
            id: 'start-2',
            type: 'control-flow',
            position: { x: 200, y: 50 },
            data: { label: 'Start', type: 'start' },
          },
          {
            id: 'decision-2',
            type: 'control-flow',
            position: { x: 200, y: 150 },
            data: { label: 'Decision', type: 'decision', condition: 'x > 10' },
          },
          {
            id: 'process-yes',
            type: 'control-flow',
            position: { x: 100, y: 250 },
            data: { label: 'Yes Path', type: 'process' },
          },
          {
            id: 'process-no',
            type: 'control-flow',
            position: { x: 300, y: 250 },
            data: { label: 'No Path', type: 'process' },
          },
          {
            id: 'end-2',
            type: 'control-flow',
            position: { x: 200, y: 350 },
            data: { label: 'End', type: 'end' },
          },
        ],
        edges: [
          { id: 'edge-start', source: 'start-2', target: 'decision-2', type: 'smoothstep' },
          { id: 'edge-yes', source: 'decision-2', sourceHandle: 'yes', target: 'process-yes', type: 'smoothstep' },
          { id: 'edge-no', source: 'decision-2', sourceHandle: 'no', target: 'process-no', type: 'smoothstep' },
          { id: 'edge-yes-end', source: 'process-yes', target: 'end-2', type: 'smoothstep' },
          { id: 'edge-no-end', source: 'process-no', target: 'end-2', type: 'smoothstep' },
        ],
        groups: [],
        category: 'workflow',
        tags: ['decision', 'branching', 'conditional'],
        createdAt: Date.now(),
      },
    ];
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const projectStore = new ProjectStore(); 