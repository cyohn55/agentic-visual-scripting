import React, { useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow, NodeResizer } from 'reactflow';

interface ShapeData {
  label: string;
  shape: 'rectangle' | 'circle' | 'triangle' | 'diamond' | 'star';
  color: string;
  width?: number;
  height?: number;
}

// Memoized ShapeNode for better performance
const ShapeNode: React.FC<NodeProps<ShapeData>> = React.memo(({
  data,
  id,
  selected,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const { setNodes } = useReactFlow();

  // Let React Flow control the dimensions completely

  // Optimized update function using global reference
  const updateNodeData = (updates: Partial<ShapeData>) => {
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

  const getShapeStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      width: '100%',
      height: '100%',
      backgroundColor: data.color,
      border: '2px solid',
      borderColor: selected ? '#3b82f6' : '#64748b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
    };

    switch (data.shape) {
      case 'circle':
        return {
          ...baseStyle,
          borderRadius: '50%',
        };
      case 'triangle':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          border: 'none',
          position: 'relative',
        };
      case 'diamond':
        return {
          ...baseStyle,
          transform: 'rotate(45deg)',
        };
      case 'star':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          border: 'none',
          position: 'relative',
        };
      case 'rectangle':
      default:
        return {
          ...baseStyle,
          borderRadius: '8px',
        };
    }
  };

  const renderShape = () => {
    const style = getShapeStyle();

    if (data.shape === 'triangle') {
      return (
        <div className="relative flex items-center justify-center w-full h-full">
          <svg width="100%" height="100%" className="absolute" preserveAspectRatio="none">
            <polygon
              points="50,5 5,95 95,95"
              fill={data.color}
              stroke={selected ? '#3b82f6' : '#64748b'}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="relative z-10 text-center p-2">
            {isEditing ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                className="bg-transparent border-none outline-none text-center text-white placeholder-gray-300 text-sm w-full"
                placeholder="Enter label..."
                autoFocus
              />
            ) : (
              <span className="text-sm font-semibold break-words px-2">
                {data.label}
              </span>
            )}
          </div>
        </div>
      );
    }

    if (data.shape === 'star') {
      return (
        <div className="relative flex items-center justify-center w-full h-full">
          <svg width="100%" height="100%" className="absolute" preserveAspectRatio="none">
            <polygon
              points="50,2 60,35 95,35 70,57 80,90 50,75 20,90 30,57 5,35 40,35"
              fill={data.color}
              stroke={selected ? '#3b82f6' : '#64748b'}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="relative z-10 text-center p-2">
            {isEditing ? (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                className="bg-transparent border-none outline-none text-center text-white placeholder-gray-300 text-sm w-full"
                placeholder="Enter label..."
                autoFocus
              />
            ) : (
              <span className="text-sm font-semibold break-words px-2">
                {data.label}
              </span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div 
        style={style}
        className="transition-all duration-200 hover:shadow-lg cursor-pointer w-full h-full"
        onDoubleClick={handleDoubleClick}
      >
        <div className={`text-center p-2 w-full h-full flex items-center justify-center ${data.shape === 'diamond' ? 'transform -rotate-45' : ''}`}>
          {isEditing ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="bg-transparent border-none outline-none text-center text-white placeholder-gray-300 text-sm w-full"
              placeholder="Enter label..."
              autoFocus
            />
          ) : (
            <span className="text-sm font-semibold break-words px-2">
              {data.label}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-full relative" style={{ minWidth: 100, minHeight: 100 }}>
      {/* React Flow's built-in NodeResizer */}
      <NodeResizer 
        color="#3b82f6"
        isVisible={selected}
        minWidth={100}
        minHeight={100}
        handleStyle={{
          backgroundColor: '#3b82f6',
          border: '2px solid #1d4ed8',
          borderRadius: '3px',
          width: '8px',
          height: '8px',
        }}
      />

      <div className="flex-1 w-full">
        {renderShape()}
      </div>

      {/* Connection handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

ShapeNode.displayName = 'ShapeNode';

export default ShapeNode; 