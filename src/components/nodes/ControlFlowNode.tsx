import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';

interface ControlFlowNodeProps {
  data: {
    label: string;
    type: 'start' | 'end' | 'decision' | 'process';
    condition?: string;
    width?: number;
    height?: number;
  };
  selected: boolean;
  id: string;
}

const ControlFlowNode: React.FC<ControlFlowNodeProps> = ({ data, selected, id }) => {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingCondition, setIsEditingCondition] = useState(false);
  const [label, setLabel] = useState(data.label);
  const [condition, setCondition] = useState(data.condition || '');
  const [isResizing, setIsResizing] = useState(false);
  
  const labelRef = useRef<HTMLInputElement>(null);
  const conditionRef = useRef<HTMLInputElement>(null);
  const { setNodes } = useReactFlow();

  const width = data.width || 120;
  const height = data.height || 60;

  // Update node data when label or condition changes
  const updateNodeData = useCallback((updates: Partial<typeof data>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
  }, [id, setNodes]);

  // Handle label editing
  const handleLabelDoubleClick = () => {
    setIsEditingLabel(true);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditingLabel(false);
      updateNodeData({ label });
    }
    if (e.key === 'Escape') {
      setLabel(data.label);
      setIsEditingLabel(false);
    }
  };

  const handleLabelBlur = () => {
    setIsEditingLabel(false);
    updateNodeData({ label });
  };

  // Handle condition editing for decision nodes
  const handleConditionDoubleClick = () => {
    if (data.type === 'decision') {
      setIsEditingCondition(true);
    }
  };

  const handleConditionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditingCondition(false);
      updateNodeData({ condition });
    }
    if (e.key === 'Escape') {
      setCondition(data.condition || '');
      setIsEditingCondition(false);
    }
  };

  const handleConditionBlur = () => {
    setIsEditingCondition(false);
    updateNodeData({ condition });
  };

  // Auto-focus when editing starts
  useEffect(() => {
    if (isEditingLabel && labelRef.current) {
      labelRef.current.focus();
      labelRef.current.select();
    }
  }, [isEditingLabel]);

  useEffect(() => {
    if (isEditingCondition && conditionRef.current) {
      conditionRef.current.focus();
      conditionRef.current.select();
    }
  }, [isEditingCondition]);

  // Get shape and styling based on control flow type
  const getNodeStyle = () => {
    const baseStyle = {
      width: width,
      height: height,
      minWidth: 100,
      minHeight: 50,
    };

    switch (data.type) {
      case 'start':
        return {
          ...baseStyle,
          backgroundColor: '#10b981',
          borderColor: '#059669',
          borderRadius: '50%',
        };
      case 'end':
        return {
          ...baseStyle,
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
          borderRadius: '50%',
        };
      case 'decision':
        return {
          ...baseStyle,
          backgroundColor: '#f59e0b',
          borderColor: '#d97706',
          transform: 'rotate(45deg)',
          borderRadius: '8px',
        };
      case 'process':
      default:
        return {
          ...baseStyle,
          backgroundColor: '#3b82f6',
          borderColor: '#2563eb',
          borderRadius: '8px',
        };
    }
  };

  const nodeStyle = getNodeStyle();
  const isDecision = data.type === 'decision';
  const isStart = data.type === 'start';
  const isEnd = data.type === 'end';

  // Get icon for the node type
  const getIcon = () => {
    switch (data.type) {
      case 'start': return '▶️';
      case 'end': return '⏹️';
      case 'decision': return '❓';
      case 'process': return '⚙️';
      default: return '📦';
    }
  };

  return (
    <div className="relative">
      <div
        className={`border-2 shadow-lg relative flex items-center justify-center ${
          selected ? 'ring-2 ring-blue-500' : ''
        } ${isResizing ? 'cursor-nw-resize' : 'cursor-default'}`}
        style={nodeStyle}
      >
        {/* Input Handle - not for start nodes */}
        {!isStart && (
          <Handle
            type="target"
            position={Position.Top}
            className="w-3 h-3 border-2 border-white"
            style={{ backgroundColor: nodeStyle.borderColor }}
          />
        )}
        
        {/* Content */}
        <div className={`text-center text-white ${isDecision ? 'transform -rotate-45' : ''}`}>
          <div className="flex flex-col items-center space-y-1">
            <span className="text-lg">{getIcon()}</span>
            {isEditingLabel ? (
              <input
                ref={labelRef}
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={handleLabelKeyDown}
                onBlur={handleLabelBlur}
                className="bg-transparent border-none outline-none font-semibold text-xs text-white text-center p-0"
                style={{ background: 'transparent', width: '80px' }}
              />
            ) : (
              <div
                className="font-semibold text-xs cursor-text hover:bg-black hover:bg-opacity-20 rounded px-1"
                onDoubleClick={handleLabelDoubleClick}
                title="Double-click to edit"
              >
                {label}
              </div>
            )}
          </div>
        </div>

        {/* Output Handles - not for end nodes */}
        {!isEnd && (
          <>
            {isDecision ? (
              // Decision nodes have Yes/No outputs
              <>
                <Handle
                  type="source"
                  position={Position.Right}
                  id="yes"
                  className="w-3 h-3 border-2 border-white"
                  style={{ backgroundColor: '#10b981', transform: 'rotate(-45deg)' }}
                />
                <Handle
                  type="source"
                  position={Position.Left}
                  id="no"
                  className="w-3 h-3 border-2 border-white"
                  style={{ backgroundColor: '#ef4444', transform: 'rotate(-45deg)' }}
                />
              </>
            ) : (
              <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 border-2 border-white"
                style={{ backgroundColor: nodeStyle.borderColor }}
              />
            )}
          </>
        )}

        {/* Resize Handle */}
        {selected && (
          <div
            className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 cursor-nw-resize opacity-70 hover:opacity-100"
            style={{ transform: 'rotate(45deg)', transformOrigin: 'center' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsResizing(true);
              
              const startX = e.clientX;
              const startY = e.clientY;
              const startWidth = width;
              const startHeight = height;

              const handleMouseMove = (moveEvent: MouseEvent) => {
                const newWidth = Math.max(100, startWidth + (moveEvent.clientX - startX));
                const newHeight = Math.max(50, startHeight + (moveEvent.clientY - startY));
                
                updateNodeData({ width: newWidth, height: newHeight });
              };

              const handleMouseUp = () => {
                setIsResizing(false);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
        )}
      </div>

      {/* Condition input for decision nodes */}
      {isDecision && selected && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs">
          {isEditingCondition ? (
            <input
              ref={conditionRef}
              type="text"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              onKeyDown={handleConditionKeyDown}
              onBlur={handleConditionBlur}
              placeholder="condition"
              className="bg-transparent border-none outline-none text-white text-center"
              style={{ width: '80px' }}
            />
          ) : (
            <div
              className="cursor-text"
              onDoubleClick={handleConditionDoubleClick}
              title="Double-click to edit condition"
            >
              {condition || 'condition'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ControlFlowNode; 