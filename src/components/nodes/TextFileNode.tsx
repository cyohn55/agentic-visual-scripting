import React, { useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow, NodeResizer } from 'reactflow';

interface TextFileData {
  label: string;
  content: string;
  fileType: string;
  width?: number;
  height?: number;
}

// Memoized TextFileNode for better performance
const TextFileNode: React.FC<NodeProps<TextFileData>> = React.memo(({
  data,
  id,
  selected,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editLabel, setEditLabel] = useState(data.label);
  const [editContent, setEditContent] = useState(data.content || '');
  const { setNodes } = useReactFlow();

  // Let React Flow control the dimensions completely

  // Optimized update function using global reference
  const updateNodeData = (updates: Partial<TextFileData>) => {
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

  const fileTypeIcons = {
    txt: '📄',
    md: '📝',
    json: '📋',
    csv: '📊',
    xml: '🏷️',
    yaml: '📄',
    log: '📜',
    config: '⚙️',
  };

  const getFileIcon = () => {
    return fileTypeIcons[data.fileType as keyof typeof fileTypeIcons] || '📄';
  };

  const handleLabelDoubleClick = () => {
    setIsEditing(true);
    setEditLabel(data.label);
  };

  const handleContentDoubleClick = () => {
    setIsEditingContent(true);
    setEditContent(data.content || '');
  };

  const handleLabelSave = () => {
    updateNodeData({ label: editLabel });
    setIsEditing(false);
  };

  const handleContentSave = () => {
    updateNodeData({ content: editContent });
    setIsEditingContent(false);
  };

  const handleLabelCancel = () => {
    setEditLabel(data.label);
    setIsEditing(false);
  };

  const handleContentCancel = () => {
    setEditContent(data.content || '');
    setIsEditingContent(false);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelSave();
    } else if (e.key === 'Escape') {
      handleLabelCancel();
    }
  };

  const handleContentKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleContentSave();
    } else if (e.key === 'Escape') {
      handleContentCancel();
    }
  };

  const getPreviewContent = (content: string, maxLines: number = 6): string => {
    const lines = content.split('\n');
    if (lines.length <= maxLines) return content;
    return lines.slice(0, maxLines).join('\n') + '\n...';
  };

  return (
    <div 
      className="bg-white border-2 border-gray-300 rounded-lg shadow-lg relative transition-shadow hover:shadow-xl flex flex-col w-full h-full"
      style={{ minWidth: 200, minHeight: 150 }}
    >
      {/* React Flow's built-in NodeResizer */}
      <NodeResizer 
        color="#3b82f6"
        isVisible={selected}
        minWidth={200}
        minHeight={150}
        handleStyle={{
          backgroundColor: '#3b82f6',
          border: '2px solid #1d4ed8',
          borderRadius: '3px',
          width: '8px',
          height: '8px',
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg flex-shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getFileIcon()}</span>
          {isEditing ? (
            <input
              type="text"
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onKeyDown={handleLabelKeyDown}
              onBlur={handleLabelSave}
              className="bg-transparent border-none outline-none font-medium text-gray-800"
              placeholder="File name"
              autoFocus
            />
          ) : (
            <h3 
              className="font-medium text-gray-800 cursor-pointer hover:bg-gray-200 px-2 py-1 rounded"
              onDoubleClick={handleLabelDoubleClick}
              title="Double-click to edit"
            >
              {data.label}
            </h3>
          )}
        </div>
        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
          {data.fileType.toUpperCase()}
        </span>
      </div>

      {/* Content - flexible height */}
      <div className="p-3 flex-1 overflow-hidden">
        {isEditingContent ? (
          <div className="h-full flex flex-col">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleContentKeyDown}
              className="flex-1 w-full border border-gray-300 rounded p-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
              placeholder="Enter file content... (Ctrl+Enter to save)"
            />
            <div className="flex justify-end space-x-2 mt-2 flex-shrink-0">
              <button
                onClick={handleContentCancel}
                className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleContentSave}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div 
            className="h-full overflow-auto cursor-pointer hover:bg-gray-50 p-2 rounded border-2 border-dashed border-gray-200"
            onDoubleClick={handleContentDoubleClick}
            title="Double-click to edit content"
          >
            {data.content ? (
              <pre className="text-sm font-mono text-black whitespace-pre-wrap break-words">
                {getPreviewContent(data.content)}
              </pre>
            ) : (
              <div className="text-gray-400 text-sm italic text-center py-4">
                Double-click to add content...
              </div>
            )}
          </div>
        )}
      </div>

      {/* File info */}
      {data.content && !isEditingContent && (
        <div className="px-3 pb-2 flex-shrink-0">
          <div className="text-xs text-gray-500">
            {data.content.split('\n').length} lines, {data.content.length} chars
          </div>
        </div>
      )}

      {/* Connection handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
});

TextFileNode.displayName = 'TextFileNode';

export default TextFileNode; 