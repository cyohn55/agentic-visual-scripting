import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';

interface StickyNoteNodeProps {
  data: {
    label: string;
    content?: string;
    color?: string;
    width?: number;
    height?: number;
  };
  selected: boolean;
  id: string;
}

const StickyNoteNode: React.FC<StickyNoteNodeProps> = ({ data, selected, id }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [title, setTitle] = useState(data.label);
  const [content, setContent] = useState(data.content || '');
  const [isResizing, setIsResizing] = useState(false);
  
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { setNodes } = useReactFlow();

  const width = data.width || 200;
  const height = data.height || 120;
  const bgColor = data.color || '#fef3c7';
  const borderColor = data.color || '#f59e0b';

  // Update node data when title or content changes
  const updateNodeData = useCallback((updates: Partial<typeof data>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
  }, [id, setNodes]);

  // Handle title editing
  const handleTitleDoubleClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false);
      updateNodeData({ label: title });
    }
    if (e.key === 'Escape') {
      setTitle(data.label);
      setIsEditingTitle(false);
    }
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    updateNodeData({ label: title });
  };

  // Handle content editing
  const handleContentDoubleClick = () => {
    setIsEditingContent(true);
  };

  const handleContentKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setContent(data.content || '');
      setIsEditingContent(false);
    }
    // Allow Ctrl+Enter to save
    if (e.key === 'Enter' && e.ctrlKey) {
      setIsEditingContent(false);
      updateNodeData({ content });
    }
  };

  const handleContentBlur = () => {
    setIsEditingContent(false);
    updateNodeData({ content });
  };

  // Auto-focus when editing starts
  useEffect(() => {
    if (isEditingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingContent && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isEditingContent]);

  return (
    <div
      className={`rounded-lg shadow-lg border-2 relative ${
        selected ? 'ring-2 ring-blue-500' : ''
      } ${isResizing ? 'cursor-nw-resize' : 'cursor-default'}`}
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        width: width,
        height: height,
        minWidth: 150,
        minHeight: 80,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 border-2"
        style={{ backgroundColor: borderColor, borderColor: borderColor }}
      />
      
      <div className="p-3 h-full flex flex-col">
        {/* Title */}
        <div className="mb-2">
          {isEditingTitle ? (
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              onBlur={handleTitleBlur}
              className="w-full bg-transparent border-none outline-none font-semibold text-sm text-gray-800 p-0"
              style={{ background: 'transparent' }}
            />
          ) : (
            <div
              className="font-semibold text-sm text-gray-800 cursor-text hover:bg-black hover:bg-opacity-10 rounded px-1 py-0.5"
              onDoubleClick={handleTitleDoubleClick}
              title="Double-click to edit"
            >
              {title}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isEditingContent ? (
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleContentKeyDown}
              onBlur={handleContentBlur}
              className="w-full h-full bg-transparent border-none outline-none text-xs text-gray-700 resize-none p-0"
              style={{ background: 'transparent' }}
              placeholder="Enter your note content... (Ctrl+Enter to save)"
            />
          ) : (
            <div
              className="text-xs text-gray-700 cursor-text hover:bg-black hover:bg-opacity-10 rounded px-1 py-0.5 h-full overflow-y-auto"
              onDoubleClick={handleContentDoubleClick}
              title="Double-click to edit"
            >
              {content || 'Click to add content...'}
            </div>
          )}
        </div>
      </div>

      {/* Resize Handle */}
      {selected && (
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
              const newWidth = Math.max(150, startWidth + (moveEvent.clientX - startX));
              const newHeight = Math.max(80, startHeight + (moveEvent.clientY - startY));
              
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

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 border-2"
        style={{ backgroundColor: borderColor, borderColor: borderColor }}
      />
    </div>
  );
};

export default StickyNoteNode; 