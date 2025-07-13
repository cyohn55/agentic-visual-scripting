import React, { useState, useEffect } from 'react';
import { canvasStore, NodeGroup } from '../store/canvasStore';

interface GroupingPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const GroupingPanel: React.FC<GroupingPanelProps> = ({ isOpen, onClose }) => {
  const [groups, setGroups] = useState<NodeGroup[]>([]);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  useEffect(() => {
    const updateGroups = () => {
      setGroups(canvasStore.getState().groups);
    };

    updateGroups();
    const unsubscribe = canvasStore.subscribe(updateGroups);
    return () => {
      unsubscribe();
    };
  }, []);

  const handleEditGroup = (group: NodeGroup) => {
    setEditingGroup(group.id);
    setEditName(group.name);
    setEditColor(group.color);
  };

  const handleSaveEdit = () => {
    if (editingGroup && editName.trim()) {
      const group = groups.find(g => g.id === editingGroup);
      if (group) {
        group.name = editName.trim();
        group.color = editColor;
        canvasStore.setState({ groups: [...groups] });
      }
    }
    setEditingGroup(null);
    setEditName('');
    setEditColor('');
  };

  const handleCancelEdit = () => {
    setEditingGroup(null);
    setEditName('');
    setEditColor('');
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm('Are you sure you want to delete this group? This will not delete the nodes.')) {
      canvasStore.deleteGroup(groupId);
    }
  };

  const handleToggleCollapse = (groupId: string) => {
    canvasStore.toggleGroupCollapse(groupId);
  };

  const handleSelectGroupNodes = (group: NodeGroup) => {
    canvasStore.selectMultipleNodes(group.nodeIds);
    onClose();
  };

  const getNodeInfo = (nodeId: string) => {
    const node = canvasStore.getNodeById(nodeId);
    return node ? { label: node.data.label || nodeId, type: node.type } : null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-4 w-80 bg-gray-900 border border-gray-600 rounded-lg shadow-2xl z-40 max-h-[70vh] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-600">
        <h3 className="text-white font-semibold">Node Groups</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-xl"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {groups.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-4">📦</div>
            <div className="text-sm">No groups created yet</div>
            <div className="text-xs mt-2">Select multiple nodes to create a group</div>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-3"
                style={{ borderLeftColor: group.color, borderLeftWidth: '4px' }}
              >
                {editingGroup === group.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                      autoFocus
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="w-8 h-8 rounded border border-gray-600 bg-gray-700"
                      />
                      <div className="flex space-x-1">
                        <button
                          onClick={handleSaveEdit}
                          className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleCollapse(group.id)}
                          className="text-gray-400 hover:text-white text-sm"
                        >
                          {group.collapsed ? '▶' : '▼'}
                        </button>
                        <span className="text-white font-medium text-sm">{group.name}</span>
                        <span className="text-xs text-gray-400">
                          ({group.nodeIds.length} node{group.nodeIds.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleSelectGroupNodes(group)}
                          className="text-gray-400 hover:text-blue-400 text-xs px-1"
                          title="Select all nodes in group"
                        >
                          🎯
                        </button>
                        <button
                          onClick={() => handleEditGroup(group)}
                          className="text-gray-400 hover:text-yellow-400 text-xs px-1"
                          title="Edit group"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group.id)}
                          className="text-gray-400 hover:text-red-400 text-xs px-1"
                          title="Delete group"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {!group.collapsed && (
                      <div className="space-y-1 ml-4">
                        {group.nodeIds.map((nodeId) => {
                          const nodeInfo = getNodeInfo(nodeId);
                          if (!nodeInfo) return null;
                          
                          return (
                            <div
                              key={nodeId}
                              className="flex items-center space-x-2 text-xs text-gray-300 bg-gray-700 rounded px-2 py-1"
                            >
                              <span className="text-gray-500">{nodeInfo.type}</span>
                              <span className="flex-1 truncate">{nodeInfo.label}</span>
                              <button
                                onClick={() => {
                                  canvasStore.selectNode(nodeId);
                                  onClose();
                                }}
                                className="text-gray-400 hover:text-blue-400"
                                title="Select node"
                              >
                                👁️
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-600">
        <div className="text-xs text-gray-400">
          <div>• Click 🎯 to select all group nodes</div>
          <div>• Click ✏️ to edit group name/color</div>
          <div>• Click 👁️ to focus on a specific node</div>
        </div>
      </div>
    </div>
  );
};

export default GroupingPanel; 