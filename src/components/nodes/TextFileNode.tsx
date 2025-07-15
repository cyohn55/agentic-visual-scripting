import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';

interface TextFileNodeProps {
  data: {
    label: string;
    content?: string;
    fileType?: string;
    width?: number;
    height?: number;
  };
  selected: boolean;
  id: string;
}

const TextFileNode: React.FC<TextFileNodeProps> = ({ data, selected, id }) => {
  const [isEditingFilename, setIsEditingFilename] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [filename, setFilename] = useState(data.label);
  const [content, setContent] = useState(data.content || '');
  const [isResizing, setIsResizing] = useState(false);
  
  const filenameRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const { setNodes } = useReactFlow();

  const width = data.width || 250;
  const height = data.height || 200;
  
  // Determine file type from extension
  const getFileType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'py':
        return 'python';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      default:
        return 'text';
    }
  };

  const fileType = getFileType(filename);

  // Update node data when filename or content changes
  const updateNodeData = useCallback((updates: Partial<typeof data>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
  }, [id, setNodes]);

  // Handle filename editing
  const handleFilenameDoubleClick = () => {
    setIsEditingFilename(true);
  };

  const handleFilenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditingFilename(false);
      updateNodeData({ label: filename, fileType: getFileType(filename) });
    }
    if (e.key === 'Escape') {
      setFilename(data.label);
      setIsEditingFilename(false);
    }
  };

  const handleFilenameBlur = () => {
    setIsEditingFilename(false);
    updateNodeData({ label: filename, fileType: getFileType(filename) });
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
    if (isEditingFilename && filenameRef.current) {
      filenameRef.current.focus();
      filenameRef.current.select();
    }
  }, [isEditingFilename]);

  useEffect(() => {
    if (isEditingContent && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isEditingContent]);

  // Get file icon based on type
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'javascript':
        return '🟨';
      case 'typescript':
        return '🔵';
      case 'python':
        return '🐍';
      case 'html':
        return '🌐';
      case 'css':
        return '🎨';
      case 'json':
        return '📋';
      case 'markdown':
        return '📝';
      default:
        return '📄';
    }
  };

  return (
    <div
      className={`bg-blue-50 border-2 border-blue-300 rounded-lg shadow-lg relative ${
        selected ? 'ring-2 ring-blue-500' : ''
      } ${isResizing ? 'cursor-nw-resize' : 'cursor-default'}`}
      style={{
        width: width,
        height: height,
        minWidth: 200,
        minHeight: 150,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500 border-2 border-blue-600"
      />
      
      <div className="p-3 h-full flex flex-col">
        {/* Header with file icon and name */}
        <div className="flex items-center mb-2 pb-2 border-b border-blue-200">
          <span className="text-lg mr-2">{getFileIcon(fileType)}</span>
          {isEditingFilename ? (
            <input
              ref={filenameRef}
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              onKeyDown={handleFilenameKeyDown}
              onBlur={handleFilenameBlur}
              className="flex-1 bg-transparent border-none outline-none font-semibold text-sm text-gray-800 p-0"
              style={{ background: 'transparent' }}
            />
          ) : (
            <span
              className="flex-1 font-semibold text-sm text-gray-800 cursor-text hover:bg-blue-100 rounded px-1 py-0.5"
              onDoubleClick={handleFilenameDoubleClick}
              title="Double-click to edit filename"
            >
              {filename}
            </span>
          )}
          <span className="text-xs text-gray-500 ml-2">{fileType}</span>
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
              className="w-full h-full bg-white border border-blue-200 rounded text-xs text-gray-700 resize-none p-2 font-mono"
              placeholder="Enter your file content... (Ctrl+Enter to save)"
              spellCheck={false}
            />
          ) : (
            <div
              className="bg-white border border-blue-200 rounded p-2 h-full overflow-y-auto cursor-text hover:bg-blue-50"
              onDoubleClick={handleContentDoubleClick}
              title="Double-click to edit content"
            >
              {content ? (
                <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap">
                  {content}
                </pre>
              ) : (
                <div className="text-xs text-gray-400 font-mono">
                  Click to add file content...
                </div>
              )}
            </div>
          )}
        </div>

        {/* File stats */}
        <div className="mt-2 pt-2 border-t border-blue-200 text-xs text-gray-500">
          Lines: {content.split('\n').length} | Characters: {content.length}
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
              const newWidth = Math.max(200, startWidth + (moveEvent.clientX - startX));
              const newHeight = Math.max(150, startHeight + (moveEvent.clientY - startY));
              
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
        className="w-3 h-3 bg-blue-500 border-2 border-blue-600"
      />
    </div>
  );
};

export default TextFileNode; 