import React, { useState } from 'react';
import { Node } from 'reactflow';
import { canvasStore } from '../store/canvasStore';

interface MultiSelectOverlayProps {
  selectedNodes: Node[];
  onClose: () => void;
  onCreateGroup: (name: string, color: string) => void;
  onDeleteSelected: () => void;
}

const MultiSelectOverlay: React.FC<MultiSelectOverlayProps> = ({
  selectedNodes,
  onClose,
  onCreateGroup,
  onDeleteSelected,
}) => {
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupColor, setGroupColor] = useState('#8b5cf6');

  const predefinedColors = [
    '#8b5cf6', '#ef4444', '#f59e0b', '#10b981',
    '#3b82f6', '#f97316', '#06b6d4', '#ec4899',
    '#6b7280', '#000000'
  ];

  const handleCreateGroup = () => {
    if (groupName.trim()) {
      onCreateGroup(groupName.trim(), groupColor);
      setGroupName('');
      setShowGroupDialog(false);
      onClose();
    }
  };

  const handleBulkEdit = (property: string, value: any) => {
    selectedNodes.forEach(node => {
      const command = {
        type: 'UPDATE_NODE',
        payload: {
          nodeId: node.id,
          previousNode: { ...node },
          updates: { data: { ...node.data, [property]: value } }
        },
        timestamp: Date.now(),
      };
      canvasStore.executeCommand(command);
    });
    onClose();
  };

  const nodeTypes = Array.from(new Set(selectedNodes.map(node => node.type)));
  const canBulkEdit = nodeTypes.length === 1; // Only allow bulk edit for same type nodes

  if (selectedNodes.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">
            {selectedNodes.length} Node{selectedNodes.length > 1 ? 's' : ''} Selected
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {!showGroupDialog ? (
          <div className="space-y-4">
            {/* Node Summary */}
            <div className="bg-gray-700 rounded p-3">
              <div className="text-sm text-gray-300 mb-2">Selected Nodes:</div>
              <div className="space-y-1">
                {nodeTypes.map(type => {
                  const count = selectedNodes.filter(n => n.type === type).length;
                  return (
                    <div key={type} className="text-xs text-gray-400">
                      {count} {type} node{count > 1 ? 's' : ''}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => setShowGroupDialog(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors flex items-center justify-center space-x-2"
              >
                <span>📦</span>
                <span>Create Group</span>
              </button>

              {canBulkEdit && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-300">Bulk Edit ({nodeTypes[0]}):</div>
                  
                  {nodeTypes[0] === 'sticky-note' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleBulkEdit('color', '#fef3c7')}
                        className="bg-yellow-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-yellow-300"
                      >
                        Yellow
                      </button>
                      <button
                        onClick={() => handleBulkEdit('color', '#fecaca')}
                        className="bg-red-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-red-300"
                      >
                        Red
                      </button>
                      <button
                        onClick={() => handleBulkEdit('color', '#bbf7d0')}
                        className="bg-green-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-green-300"
                      >
                        Green
                      </button>
                      <button
                        onClick={() => handleBulkEdit('color', '#ddd6fe')}
                        className="bg-purple-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-purple-300"
                      >
                        Purple
                      </button>
                    </div>
                  )}

                  {nodeTypes[0] === 'shape' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleBulkEdit('shape', 'circle')}
                        className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm"
                      >
                        ● Circle
                      </button>
                      <button
                        onClick={() => handleBulkEdit('shape', 'rectangle')}
                        className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm"
                      >
                        ▬ Rectangle
                      </button>
                      <button
                        onClick={() => handleBulkEdit('shape', 'triangle')}
                        className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm"
                      >
                        ▲ Triangle
                      </button>
                      <button
                        onClick={() => handleBulkEdit('shape', 'diamond')}
                        className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm"
                      >
                        ◆ Diamond
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={onDeleteSelected}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors flex items-center justify-center space-x-2"
              >
                <span>🗑️</span>
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="Enter group name..."
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Group Color
              </label>
              <div className="grid grid-cols-5 gap-2 mb-3">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setGroupColor(color)}
                    className={`w-8 h-8 rounded border-2 ${
                      groupColor === color ? 'border-white' : 'border-gray-600'
                    } hover:border-gray-400`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={groupColor}
                onChange={(e) => setGroupColor(e.target.value)}
                className="w-full h-8 rounded border border-gray-600 bg-gray-700"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowGroupDialog(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors"
              >
                Create Group
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelectOverlay; 