export type ViewMode = 'mindmap' | 'filesystem' | 'execution' | 'dataflow';

export type NodeType = 'sticky-note' | 'text-file' | 'shape' | 'control-flow' | 'code';

export type ConnectionType = 'association' | 'parent-child' | 'execution' | 'data-flow';

export interface CanvasNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    content?: string;
    color?: string;
    width?: number;
    height?: number;
    [key: string]: any;
  };
}

export interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: {
    connectionType: ConnectionType;
    label?: string;
    [key: string]: any;
  };
}

export interface CanvasState {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewMode: ViewMode;
  isCommandPaletteOpen: boolean;
  selectedNodeId: string | null;
} 