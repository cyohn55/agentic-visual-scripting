import { Node, Edge } from 'reactflow';
import { ViewMode } from '../types';

export interface LayoutOptions {
  nodeSpacing: number;
  levelSpacing: number;
  containerPadding: number;
}

export interface LayoutResult {
  nodes: Node[];
  edges: Edge[];
}

export class LayoutEngine {
  private defaultOptions: LayoutOptions = {
    nodeSpacing: 150,
    levelSpacing: 200,
    containerPadding: 50,
  };

  /**
   * Apply layout algorithm based on view mode
   */
  applyLayout(
    nodes: Node[], 
    edges: Edge[], 
    viewMode: ViewMode, 
    options?: Partial<LayoutOptions>
  ): LayoutResult {
    const layoutOptions = { ...this.defaultOptions, ...options };

    switch (viewMode) {
      case 'mindmap':
        return this.applyMindMapLayout(nodes, edges, layoutOptions);
      case 'filesystem':
        return this.applyFileSystemLayout(nodes, edges, layoutOptions);
      case 'execution':
        return this.applyExecutionOrderLayout(nodes, edges, layoutOptions);
      case 'dataflow':
        return this.applyDataFlowLayout(nodes, edges, layoutOptions);
      default:
        return { nodes, edges };
    }
  }

  /**
   * Mind Map: Radial layout with central focus
   */
  private applyMindMapLayout(nodes: Node[], edges: Edge[], options: LayoutOptions): LayoutResult {
    if (nodes.length === 0) return { nodes, edges };

    // Find central node (could be start node or most connected)
    const centralNode = this.findCentralNode(nodes, edges);
    const layoutNodes = [...nodes];
    
    // Position central node at center
    const centerX = 400;
    const centerY = 300;
    
    const centralIndex = layoutNodes.findIndex(n => n.id === centralNode.id);
    if (centralIndex !== -1) {
      layoutNodes[centralIndex] = {
        ...centralNode,
        position: { x: centerX, y: centerY }
      };
    }

    // Arrange other nodes in concentric circles
    const remainingNodes = layoutNodes.filter(n => n.id !== centralNode.id);
    const nodesPerRing = Math.ceil(Math.sqrt(remainingNodes.length));
    
    remainingNodes.forEach((node, index) => {
      const ring = Math.floor(index / nodesPerRing) + 1;
      const positionInRing = index % nodesPerRing;
      const angle = (2 * Math.PI * positionInRing) / Math.min(nodesPerRing, remainingNodes.length - (ring - 1) * nodesPerRing);
      const radius = ring * options.nodeSpacing;
      
      const nodeIndex = layoutNodes.findIndex(n => n.id === node.id);
      if (nodeIndex !== -1) {
        layoutNodes[nodeIndex] = {
          ...node,
          position: {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
          }
        };
      }
    });

    return { nodes: layoutNodes, edges };
  }

  /**
   * File System: Hierarchical tree layout
   */
  private applyFileSystemLayout(nodes: Node[], edges: Edge[], options: LayoutOptions): LayoutResult {
    if (nodes.length === 0) return { nodes, edges };

    // Build hierarchy from edges
    const hierarchy = this.buildHierarchy(nodes, edges);
    const layoutNodes = [...nodes];
    
    // Layout tree starting from roots
    let currentY = options.containerPadding;
    
    hierarchy.roots.forEach(root => {
      currentY = this.layoutTreeNode(root, hierarchy, layoutNodes, options.containerPadding, currentY, 0, options);
      currentY += options.levelSpacing;
    });

    return { nodes: layoutNodes, edges };
  }

  /**
   * Execution Order: Top-to-bottom flow layout
   */
  private applyExecutionOrderLayout(nodes: Node[], edges: Edge[], options: LayoutOptions): LayoutResult {
    if (nodes.length === 0) return { nodes, edges };

    // Find execution path starting from start nodes
    const startNodes = nodes.filter(n => 
      n.type === 'control-flow' && n.data.type === 'start'
    );
    
    const layoutNodes = [...nodes];
    const visited = new Set<string>();
    let currentLevel = 0;
    
    if (startNodes.length > 0) {
      // Layout from start nodes
      startNodes.forEach((startNode, index) => {
        this.layoutExecutionPath(
          startNode, 
          layoutNodes, 
          edges, 
          visited, 
          index * (options.nodeSpacing * 2), 
          currentLevel, 
          options
        );
      });
    } else {
      // Fallback: simple top-to-bottom grid
      this.layoutGrid(layoutNodes, options);
    }

    return { nodes: layoutNodes, edges };
  }

  /**
   * Data Flow: Left-to-right flow layout optimized for data movement
   */
  private applyDataFlowLayout(nodes: Node[], edges: Edge[], options: LayoutOptions): LayoutResult {
    if (nodes.length === 0) return { nodes, edges };

    // Perform topological sort to determine flow order
    const sortedNodes = this.topologicalSort(nodes, edges);
    const layoutNodes = [...nodes];
    
    // Group nodes by flow level
    const levels = this.groupNodesByFlowLevel(sortedNodes, edges);
    
    // Layout nodes left to right
    let currentX = options.containerPadding;
    
    levels.forEach(level => {
      let currentY = options.containerPadding;
      
      level.forEach(node => {
        const nodeIndex = layoutNodes.findIndex(n => n.id === node.id);
        if (nodeIndex !== -1) {
          layoutNodes[nodeIndex] = {
            ...node,
            position: { x: currentX, y: currentY }
          };
          currentY += options.nodeSpacing;
        }
      });
      
      currentX += options.levelSpacing;
    });

    return { nodes: layoutNodes, edges };
  }

  // Helper methods
  private findCentralNode(nodes: Node[], edges: Edge[]): Node {
    // Find start node first
    const startNode = nodes.find(n => n.type === 'control-flow' && n.data.type === 'start');
    if (startNode) return startNode;
    
    // Find most connected node
    const connectionCounts = new Map<string, number>();
    edges.forEach(edge => {
      connectionCounts.set(edge.source, (connectionCounts.get(edge.source) || 0) + 1);
      connectionCounts.set(edge.target, (connectionCounts.get(edge.target) || 0) + 1);
    });
    
    let maxConnections = 0;
    let centralNode = nodes[0];
    
    nodes.forEach(node => {
      const connections = connectionCounts.get(node.id) || 0;
      if (connections > maxConnections) {
        maxConnections = connections;
        centralNode = node;
      }
    });
    
    return centralNode;
  }

  private buildHierarchy(nodes: Node[], edges: Edge[]) {
    const children = new Map<string, string[]>();
    const parents = new Map<string, string>();
    
    // Build parent-child relationships
    edges.forEach(edge => {
      if (!children.has(edge.source)) {
        children.set(edge.source, []);
      }
      children.get(edge.source)!.push(edge.target);
      parents.set(edge.target, edge.source);
    });
    
    // Find root nodes (nodes with no parents)
    const roots = nodes.filter(node => !parents.has(node.id));
    
    return { children, parents, roots };
  }

  private layoutTreeNode(
    node: Node, 
    hierarchy: any, 
    layoutNodes: Node[], 
    x: number, 
    y: number, 
    level: number, 
    options: LayoutOptions
  ): number {
    // Position current node
    const nodeIndex = layoutNodes.findIndex(n => n.id === node.id);
    if (nodeIndex !== -1) {
      layoutNodes[nodeIndex] = {
        ...node,
        position: { x: x + level * options.levelSpacing, y }
      };
    }
    
    // Layout children
    const childIds = hierarchy.children.get(node.id) || [];
    let currentY = y + options.nodeSpacing;
    
    childIds.forEach((childId: string) => {
      const child = layoutNodes.find(n => n.id === childId);
      if (child) {
        currentY = this.layoutTreeNode(child, hierarchy, layoutNodes, x, currentY, level + 1, options);
      }
    });
    
    return Math.max(currentY, y + options.nodeSpacing);
  }

  private layoutExecutionPath(
    node: Node,
    layoutNodes: Node[],
    edges: Edge[],
    visited: Set<string>,
    x: number,
    level: number,
    options: LayoutOptions
  ) {
    if (visited.has(node.id)) return;
    visited.add(node.id);
    
    // Position current node
    const nodeIndex = layoutNodes.findIndex(n => n.id === node.id);
    if (nodeIndex !== -1) {
      layoutNodes[nodeIndex] = {
        ...node,
        position: { x, y: options.containerPadding + level * options.levelSpacing }
      };
    }
    
    // Follow edges to next nodes
    const outgoingEdges = edges.filter(e => e.source === node.id);
    outgoingEdges.forEach((edge, index) => {
      const nextNode = layoutNodes.find(n => n.id === edge.target);
      if (nextNode && !visited.has(nextNode.id)) {
        this.layoutExecutionPath(
          nextNode,
          layoutNodes,
          edges,
          visited,
          x + index * options.nodeSpacing,
          level + 1,
          options
        );
      }
    });
  }

  private layoutGrid(layoutNodes: Node[], options: LayoutOptions) {
    const columns = Math.ceil(Math.sqrt(layoutNodes.length));
    
    layoutNodes.forEach((node, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      
      layoutNodes[index] = {
        ...node,
        position: {
          x: options.containerPadding + col * options.nodeSpacing,
          y: options.containerPadding + row * options.nodeSpacing
        }
      };
    });
  }

  private topologicalSort(nodes: Node[], edges: Edge[]): Node[] {
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();
    
    // Initialize
    nodes.forEach(node => {
      inDegree.set(node.id, 0);
      adjList.set(node.id, []);
    });
    
    // Build adjacency list and calculate in-degrees
    edges.forEach(edge => {
      adjList.get(edge.source)!.push(edge.target);
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });
    
    // Kahn's algorithm
    const queue: string[] = [];
    const result: Node[] = [];
    
    // Find nodes with no incoming edges
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });
    
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const node = nodes.find(n => n.id === nodeId)!;
      result.push(node);
      
      // Process neighbors
      adjList.get(nodeId)!.forEach(neighborId => {
        inDegree.set(neighborId, inDegree.get(neighborId)! - 1);
        if (inDegree.get(neighborId) === 0) {
          queue.push(neighborId);
        }
      });
    }
    
    return result;
  }

  private groupNodesByFlowLevel(sortedNodes: Node[], edges: Edge[]): Node[][] {
    const levels: Node[][] = [];
    const nodeToLevel = new Map<string, number>();
    
    sortedNodes.forEach(node => {
      // Find the maximum level of all predecessors
      const incomingEdges = edges.filter(e => e.target === node.id);
      let maxPredecessorLevel = -1;
      
      incomingEdges.forEach(edge => {
        const predecessorLevel = nodeToLevel.get(edge.source);
        if (predecessorLevel !== undefined) {
          maxPredecessorLevel = Math.max(maxPredecessorLevel, predecessorLevel);
        }
      });
      
      const currentLevel = maxPredecessorLevel + 1;
      nodeToLevel.set(node.id, currentLevel);
      
      // Ensure level exists
      while (levels.length <= currentLevel) {
        levels.push([]);
      }
      
      levels[currentLevel].push(node);
    });
    
    return levels;
  }
}

export const layoutEngine = new LayoutEngine(); 