import React, { useState, useEffect } from 'react';
import { Node, useReactFlow } from 'reactflow';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onClose: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedNode, onClose }) => {
  const { setNodes } = useReactFlow();
  const [properties, setProperties] = useState<any>({});

  useEffect(() => {
    if (selectedNode) {
      setProperties(selectedNode.data);
    }
  }, [selectedNode]);

  const updateNodeData = (updates: any) => {
    if (!selectedNode) return;
    
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
    setProperties({ ...properties, ...updates });
  };

  if (!selectedNode) return null;

  const renderPropertyEditor = () => {
    switch (selectedNode.type) {
      case 'sticky-note':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={properties.label || ''}
                onChange={(e) => updateNodeData({ label: e.target.value })}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content
              </label>
              <textarea
                value={properties.content || ''}
                onChange={(e) => updateNodeData({ content: e.target.value })}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                rows={4}
                placeholder="Enter note content..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Background Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={properties.color || '#fef3c7'}
                  onChange={(e) => updateNodeData({ color: e.target.value })}
                  className="w-12 h-8 rounded border border-gray-600 bg-gray-700"
                />
                <input
                  type="text"
                  value={properties.color || '#fef3c7'}
                  onChange={(e) => updateNodeData({ color: e.target.value })}
                  className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Width
                </label>
                <input
                  type="number"
                  value={properties.width || 200}
                  onChange={(e) => updateNodeData({ width: parseInt(e.target.value) || 200 })}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                  min="150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Height
                </label>
                <input
                  type="number"
                  value={properties.height || 120}
                  onChange={(e) => updateNodeData({ height: parseInt(e.target.value) || 120 })}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                  min="80"
                />
              </div>
            </div>
          </div>
        );

      case 'text-file':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                File Name
              </label>
              <input
                type="text"
                value={properties.label || ''}
                onChange={(e) => updateNodeData({ label: e.target.value })}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                File Content
              </label>
              <textarea
                value={properties.content || ''}
                onChange={(e) => updateNodeData({ content: e.target.value })}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none resize-none font-mono"
                rows={6}
                placeholder="Enter file content..."
                spellCheck={false}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Width
                </label>
                <input
                  type="number"
                  value={properties.width || 250}
                  onChange={(e) => updateNodeData({ width: parseInt(e.target.value) || 250 })}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                  min="200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Height
                </label>
                <input
                  type="number"
                  value={properties.height || 200}
                  onChange={(e) => updateNodeData({ height: parseInt(e.target.value) || 200 })}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                  min="150"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                File Stats
              </label>
              <div className="text-sm text-gray-400 bg-gray-800 p-2 rounded">
                <div>Lines: {(properties.content || '').split('\n').length}</div>
                <div>Characters: {(properties.content || '').length}</div>
                <div>File Type: {properties.fileType || 'text'}</div>
              </div>
            </div>
          </div>
        );

      case 'shape':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Label
              </label>
              <input
                type="text"
                value={properties.label || ''}
                onChange={(e) => updateNodeData({ label: e.target.value })}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Shape Type
              </label>
              <select
                value={properties.shape || 'rectangle'}
                onChange={(e) => updateNodeData({ shape: e.target.value })}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="rectangle">Rectangle</option>
                <option value="circle">Circle</option>
                <option value="triangle">Triangle</option>
                <option value="diamond">Diamond</option>
                <option value="hexagon">Hexagon</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={properties.color || '#8b5cf6'}
                  onChange={(e) => updateNodeData({ color: e.target.value })}
                  className="w-12 h-8 rounded border border-gray-600 bg-gray-700"
                />
                <input
                  type="text"
                  value={properties.color || '#8b5cf6'}
                  onChange={(e) => updateNodeData({ color: e.target.value })}
                  className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Width
                </label>
                <input
                  type="number"
                  value={properties.width || 120}
                  onChange={(e) => updateNodeData({ width: parseInt(e.target.value) || 120 })}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                  min="80"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Height
                </label>
                <input
                  type="number"
                  value={properties.height || 80}
                  onChange={(e) => updateNodeData({ height: parseInt(e.target.value) || 80 })}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                  min="60"
                />
              </div>
            </div>
          </div>
        );

      default:
        return <div className="text-gray-400 text-sm">No properties available</div>;
    }
  };

  return (
    <div className="fixed top-4 right-4 w-80 bg-gray-900 border border-gray-600 rounded-lg shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b border-gray-600">
        <h3 className="text-white font-semibold">
          Properties: {selectedNode.type}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-xl"
        >
          ×
        </button>
      </div>
      
      <div className="p-4">
        {renderPropertyEditor()}
      </div>
      
      <div className="p-4 border-t border-gray-600">
        <div className="text-xs text-gray-400">
          <div>Node ID: {selectedNode.id}</div>
          <div>Position: ({Math.round(selectedNode.position.x)}, {Math.round(selectedNode.position.y)})</div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel; 