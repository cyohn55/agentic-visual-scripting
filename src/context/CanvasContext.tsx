import React, { createContext, useContext, ReactNode } from 'react';
import { NodeType } from '../types';

interface CanvasContextType {
  createNode: (type: NodeType, position?: { x: number; y: number }) => void;
  deleteNode: (id: string) => void;
  clearCanvas: () => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};

interface CanvasProviderProps {
  children: ReactNode;
  createNode: (type: NodeType, position?: { x: number; y: number }) => void;
  deleteNode: (id: string) => void;
  clearCanvas: () => void;
}

export const CanvasProvider: React.FC<CanvasProviderProps> = ({
  children,
  createNode,
  deleteNode,
  clearCanvas,
}) => {
  return (
    <CanvasContext.Provider value={{ createNode, deleteNode, clearCanvas }}>
      {children}
    </CanvasContext.Provider>
  );
}; 