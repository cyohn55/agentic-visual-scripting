import React, { useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow, NodeResizer } from 'reactflow';

interface ControlFlowData {
  label: string;
  type: 'start' | 'end' | 'process' | 'decision';
  condition?: string;
  width?: number;
  height?: number;
}

// Memoized ControlFlowNode for better performance
const ControlFlowNode: React.FC<NodeProps<ControlFlowData>> = React.memo(({
  data,
  id,
  selected,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const { setNodes } = useReactFlow();

  // Let React Flow control the dimensions completely

  // Optimized update function using global reference
  const updateNodeData = (updates: Partial<ControlFlowData>) => {
    if ((window as any).__updateNodeData) {
      (window as any).__updateNodeData(id, updates);
    } else {
      // Fallback to direct React Flow update
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, ...updates } } : node
        )
      );
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(data.label);
  };

  const handleSave = () => {
    updateNodeData({ label: editValue });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(data.label);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const getNodeStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      backgroundColor: '#3b82f6',
      border: '2px solid',
      borderColor: selected ? '#3b82f6' : '#64748b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
    };

    switch (data.type) {
      case 'start':
        return {
          ...baseStyle,
          backgroundColor: '#10b981',
          borderColor: '#059669',
          color: 'white',
          borderRadius: '50%',
        };
      case 'end':
        return {
          ...baseStyle,
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
          color: 'white',
          borderRadius: '50%',
        };
      case 'decision':
        return {
          ...baseStyle,
          backgroundColor: '#f59e0b',
          borderColor: '#d97706',
          color: 'white',
          borderRadius: '8px',
          transform: 'rotate(45deg)',
        };
      case 'process':
      default:
        return {
          ...baseStyle,
          backgroundColor: '#3b82f6',
          borderColor: '#2563eb',
          color: 'white',
          borderRadius: '8px',
        };
    }
  };

  const nodeStyle = getNodeStyle();
  const minSize = data.type === 'decision' ? 100 : 120;

  return (
    <div 
      className="border-2 shadow-lg relative flex items-center justify-center cursor-pointer transition-shadow hover:shadow-xl w-full h-full"
      style={{ 
        ...nodeStyle,
        minWidth: minSize, 
        minHeight: minSize 
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* React Flow's built-in NodeResizer */}
      <NodeResizer 
        color="#3b82f6"
        isVisible={selected}
        minWidth={minSize}
        minHeight={minSize}
        handleStyle={{
          backgroundColor: '#3b82f6',
          border: '2px solid #1d4ed8',
          borderRadius: '3px',
          width: '8px',
          height: '8px',
        }}
      />

      {/* Content - scales with container */}
      <div className={`text-center p-2 w-full h-full flex items-center justify-center ${data.type === 'decision' ? 'transform -rotate-45' : ''}`}>
        <div className="flex flex-col items-center justify-center">
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="bg-transparent border-none outline-none text-center text-white placeholder-gray-300 w-full text-sm"
              placeholder="Enter label..."
              autoFocus
            />
          ) : (
            <div className="font-semibold break-words text-sm">
              {data.label}
            </div>
          )}
          
          {data.type === 'decision' && data.condition && !isEditing && (
            <div className="mt-1 opacity-75 text-xs">
              {data.condition}
            </div>
          )}
        </div>
      </div>

      {/* Connection handles */}
      {data.type !== 'start' && (
        <Handle 
          type="target" 
          position={Position.Top}
          className="w-3 h-3"
          style={{ backgroundColor: nodeStyle.borderColor }}
        />
      )}
      
      {data.type !== 'end' && (
        <>
          {data.type === 'decision' ? (
            <>
              <Handle 
                type="source" 
                position={Position.Right}
                id="yes"
                className="w-3 h-3"
                style={{ backgroundColor: nodeStyle.borderColor }}
              />
              <Handle 
                type="source" 
                position={Position.Bottom}
                id="no"
                className="w-3 h-3"
                style={{ backgroundColor: nodeStyle.borderColor }}
              />
            </>
          ) : (
            <Handle 
              type="source" 
              position={Position.Bottom}
              className="w-3 h-3"
              style={{ backgroundColor: nodeStyle.borderColor }}
            />
          )}
        </>
      )}
    </div>
  );
});

ControlFlowNode.displayName = 'ControlFlowNode';

export default ControlFlowNode; 