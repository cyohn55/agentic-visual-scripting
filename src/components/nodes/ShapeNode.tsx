import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';

interface ShapeNodeProps {
  data: {
    label: string;
    color?: string;
    shape?: string;
    width?: number;
    height?: number;
  };
  selected: boolean;
  id: string;
}

const ShapeNode: React.FC<ShapeNodeProps> = ({ data, selected, id }) => {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isShowingColorPicker, setIsShowingColorPicker] = useState(false);
  const [isShowingShapePicker, setIsShowingShapePicker] = useState(false);
  const [label, setLabel] = useState(data.label);
  const [isResizing, setIsResizing] = useState(false);
  
  const labelRef = useRef<HTMLInputElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const shapePickerRef = useRef<HTMLDivElement>(null);
  const { setNodes } = useReactFlow();

  const width = data.width || 120;
  const height = data.height || 80;
  const color = data.color || '#8b5cf6';
  const shape = data.shape || 'rectangle';

  const predefinedColors = [
    '#8b5cf6', '#ef4444', '#f59e0b', '#10b981',
    '#3b82f6', '#f97316', '#06b6d4', '#8b5cf6',
    '#ec4899', '#6b7280', '#000000', '#ffffff'
  ];

  const shapeTypes = [
    { key: 'rectangle', label: 'Rectangle', icon: '▬' },
    { key: 'circle', label: 'Circle', icon: '●' },
    { key: 'triangle', label: 'Triangle', icon: '▲' },
    { key: 'diamond', label: 'Diamond', icon: '◆' },
    { key: 'hexagon', label: 'Hexagon', icon: '⬡' }
  ];

  // Update node data
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

  // Handle color change
  const handleColorChange = (newColor: string) => {
    updateNodeData({ color: newColor });
    setIsShowingColorPicker(false);
  };

  // Handle shape change
  const handleShapeChange = (newShape: string) => {
    updateNodeData({ shape: newShape });
    setIsShowingShapePicker(false);
  };

  // Auto-focus when editing starts
  useEffect(() => {
    if (isEditingLabel && labelRef.current) {
      labelRef.current.focus();
      labelRef.current.select();
    }
  }, [isEditingLabel]);

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setIsShowingColorPicker(false);
      }
      if (shapePickerRef.current && !shapePickerRef.current.contains(event.target as Node)) {
        setIsShowingShapePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get shape styling based on type
  const getShapeStyle = () => {
    const baseStyle = {
      backgroundColor: color,
      borderColor: color,
      width: width,
      height: height,
      minWidth: 80,
      minHeight: 60,
    };

    switch (shape) {
      case 'circle':
        return {
          ...baseStyle,
          borderRadius: '50%',
        };
      case 'triangle':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderBottom: `${height}px solid ${color}`,
          borderLeft: `${width / 2}px solid transparent`,
          borderRight: `${width / 2}px solid transparent`,
          borderTop: 'none',
          height: 0,
        };
      case 'diamond':
        return {
          ...baseStyle,
          transform: 'rotate(45deg)',
          borderRadius: '8px',
        };
      case 'hexagon':
        return {
          ...baseStyle,
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
        };
      default: // rectangle
        return {
          ...baseStyle,
          borderRadius: '8px',
        };
    }
  };

  const shapeStyle = getShapeStyle();
  const isTriangle = shape === 'triangle';

  return (
    <div className="relative">
      <div
        className={`border-2 shadow-lg relative flex items-center justify-center ${
          selected ? 'ring-2 ring-blue-500' : ''
        } ${isResizing ? 'cursor-nw-resize' : 'cursor-default'}`}
        style={shapeStyle}
      >
        {!isTriangle && (
          <Handle
            type="target"
            position={Position.Top}
            className="w-3 h-3 border-2 border-white"
            style={{ backgroundColor: color }}
          />
        )}
        
        {/* Label */}
        <div className={`text-center ${shape === 'diamond' ? 'transform -rotate-45' : ''}`}>
          {isEditingLabel ? (
            <input
              ref={labelRef}
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={handleLabelKeyDown}
              onBlur={handleLabelBlur}
              className="bg-transparent border-none outline-none font-semibold text-sm text-white text-center p-0"
              style={{ 
                background: 'transparent',
                color: color === '#ffffff' ? '#000000' : '#ffffff',
                width: '100%'
              }}
            />
          ) : (
            <div
              className="font-semibold text-sm cursor-text hover:bg-black hover:bg-opacity-20 rounded px-1 py-0.5"
              onDoubleClick={handleLabelDoubleClick}
              title="Double-click to edit"
              style={{ 
                color: color === '#ffffff' ? '#000000' : '#ffffff',
                wordWrap: 'break-word',
                maxWidth: width - 20
              }}
            >
              {label}
            </div>
          )}
        </div>

        {!isTriangle && (
          <Handle
            type="source"
            position={Position.Bottom}
            className="w-3 h-3 border-2 border-white"
            style={{ backgroundColor: color }}
          />
        )}
      </div>

      {/* Control buttons (only show when selected) */}
      {selected && (
        <div className="absolute -top-10 left-0 flex space-x-1 z-10">
          {/* Color picker button */}
          <button
            onClick={() => {
              setIsShowingColorPicker(!isShowingColorPicker);
              setIsShowingShapePicker(false);
            }}
            className="bg-gray-800 text-white px-2 py-1 rounded text-xs hover:bg-gray-700"
            title="Change color"
          >
            🎨
          </button>
          
          {/* Shape picker button */}
          <button
            onClick={() => {
              setIsShowingShapePicker(!isShowingShapePicker);
              setIsShowingColorPicker(false);
            }}
            className="bg-gray-800 text-white px-2 py-1 rounded text-xs hover:bg-gray-700"
            title="Change shape"
          >
            🔷
          </button>
        </div>
      )}

      {/* Color picker dropdown */}
      {isShowingColorPicker && (
        <div
          ref={colorPickerRef}
          className="absolute -top-16 left-0 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-2 z-20"
        >
          <div className="grid grid-cols-4 gap-1">
            {predefinedColors.map((c) => (
              <button
                key={c}
                onClick={() => handleColorChange(c)}
                className={`w-6 h-6 rounded border-2 ${
                  c === color ? 'border-white' : 'border-gray-600'
                } hover:border-gray-400`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>
      )}

      {/* Shape picker dropdown */}
      {isShowingShapePicker && (
        <div
          ref={shapePickerRef}
          className="absolute -top-16 left-0 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-2 z-20 min-w-32"
        >
          {shapeTypes.map((s) => (
            <button
              key={s.key}
              onClick={() => handleShapeChange(s.key)}
              className={`w-full px-2 py-1 text-left hover:bg-gray-700 flex items-center space-x-2 ${
                s.key === shape ? 'bg-gray-700' : ''
              }`}
            >
              <span>{s.icon}</span>
              <span className="text-white text-xs">{s.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Resize handle */}
      {selected && !isTriangle && (
        <div
          className="absolute bottom-0 right-0 w-3 h-3 bg-gray-600 cursor-nw-resize nodrag z-10"
          style={{ transform: 'rotate(45deg)', transformOrigin: 'center' }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsResizing(true);
            
            // Dispatch resize start event
            window.dispatchEvent(new CustomEvent('nodeResizeStart'));
            
            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = width;
            const startHeight = height;

            const handleMouseMove = (moveEvent: MouseEvent) => {
              const newWidth = Math.max(80, startWidth + (moveEvent.clientX - startX));
              const newHeight = Math.max(60, startHeight + (moveEvent.clientY - startY));
              
              // Use requestAnimationFrame for smooth updates
              requestAnimationFrame(() => {
                updateNodeData({ width: newWidth, height: newHeight });
              });
            };

            const handleMouseUp = () => {
              setIsResizing(false);
              // Dispatch resize end event
              window.dispatchEvent(new CustomEvent('nodeResizeEnd'));
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />
      )}
    </div>
  );
};

export default ShapeNode; 