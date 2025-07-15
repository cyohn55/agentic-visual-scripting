import React, { useState, useRef } from 'react';
import { Handle, Position, NodeProps, useReactFlow, NodeResizer } from 'reactflow';

interface StickyNoteData {
  label: string;
  content: string;
  color: string;
  width?: number;
  height?: number;
}

// Memoized StickyNoteNode for better performance
const StickyNoteNode: React.FC<NodeProps<StickyNoteData>> = React.memo(({
  data,
  id,
  selected,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.content || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setNodes } = useReactFlow();

  // Let React Flow control the dimensions completely

  // Optimized update function using global reference
  const updateNodeData = (updates: Partial<StickyNoteData>) => {
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
    setEditValue(data.content || '');
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleSave = () => {
    updateNodeData({ content: editValue });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(data.content || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const colorClasses = {
    yellow: 'bg-yellow-200 border-yellow-400',
    blue: 'bg-blue-200 border-blue-400',
    green: 'bg-green-200 border-green-400',
    pink: 'bg-pink-200 border-pink-400',
    purple: 'bg-purple-200 border-purple-400',
    orange: 'bg-orange-200 border-orange-400',
  };

  const colorClass = colorClasses[data.color as keyof typeof colorClasses] || colorClasses.yellow;

  return (
    <div 
      className={`${colorClass} rounded-lg shadow-lg border-2 relative cursor-pointer transition-shadow hover:shadow-xl flex flex-col w-full h-full`}
      style={{ minWidth: 150, minHeight: 100 }}
      onDoubleClick={handleDoubleClick}
    >
      {/* React Flow's built-in NodeResizer */}
      <NodeResizer 
        color="#3b82f6"
        isVisible={selected}
        minWidth={150}
        minHeight={100}
        handleStyle={{
          backgroundColor: '#3b82f6',
          border: '2px solid #1d4ed8',
          borderRadius: '3px',
          width: '8px',
          height: '8px',
        }}
      />

      {/* Header */}
      <div className="p-2 border-b border-gray-300 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-800 truncate">
          {data.label}
        </h3>
      </div>

      {/* Content - flexible height */}
      <div className="p-3 flex-1 overflow-hidden">
        {isEditing ? (
          <div className="h-full flex flex-col">
            <textarea
              ref={textareaRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 w-full bg-transparent border-none outline-none resize-none text-gray-800 text-sm"
              placeholder="Enter your note..."
            />
            <div className="flex justify-end space-x-2 mt-2 flex-shrink-0">
              <button
                onClick={handleCancel}
                className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words">
              {data.content || 'Double-click to edit...'}
            </pre>
          </div>
        )}
      </div>

      {/* Connection handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

StickyNoteNode.displayName = 'StickyNoteNode';

export default StickyNoteNode; 