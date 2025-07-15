import React, { useState, useEffect } from 'react';
import { ConnectionType } from '../types';

interface ConnectionTypeModalProps {
  isOpen: boolean;
  sourceNode?: { id: string; type: string; label?: string };
  targetNode?: { id: string; type: string; label?: string };
  onConfirm: (connectionType: ConnectionType, label?: string) => void;
  onCancel: () => void;
}

const ConnectionTypeModal: React.FC<ConnectionTypeModalProps> = ({
  isOpen,
  sourceNode,
  targetNode,
  onConfirm,
  onCancel,
}) => {
  const [selectedType, setSelectedType] = useState<ConnectionType>('association');
  const [customLabel, setCustomLabel] = useState('');

  // Smart connection type suggestions based on node types
  const connectionTypes: Array<{
    value: ConnectionType;
    label: string;
    icon: string;
    description: string;
    suggestedFor?: string[];
  }> = [
    {
      value: 'association',
      label: 'Association',
      icon: '🔗',
      description: 'General relationship or connection',
      suggestedFor: ['sticky-note', 'shape'],
    },
    {
      value: 'parent-child',
      label: 'Parent-Child',
      icon: '🌳',
      description: 'Hierarchical relationship',
      suggestedFor: ['text-file', 'shape'],
    },
    {
      value: 'execution',
      label: 'Execution Flow',
      icon: '▶️',
      description: 'Sequential execution order',
      suggestedFor: ['control-flow'],
    },
    {
      value: 'data-flow',
      label: 'Data Flow',
      icon: '🔄',
      description: 'Data passing between components',
      suggestedFor: ['control-flow', 'text-file'],
    },
  ];

  // Auto-suggest connection type based on node types
  useEffect(() => {
    if (sourceNode && targetNode) {
      // If connecting control-flow nodes, suggest execution
      if (sourceNode.type === 'control-flow' && targetNode.type === 'control-flow') {
        setSelectedType('execution');
      }
      // If connecting file nodes, suggest data-flow
      else if (sourceNode.type === 'text-file' || targetNode.type === 'text-file') {
        setSelectedType('data-flow');
      }
      // If one is sticky-note, suggest association
      else if (sourceNode.type === 'sticky-note' || targetNode.type === 'sticky-note') {
        setSelectedType('association');
      }
      // Default to association
      else {
        setSelectedType('association');
      }
    }
  }, [sourceNode, targetNode]);

  const handleConfirm = () => {
    onConfirm(selectedType, customLabel.trim() || undefined);
    setCustomLabel('');
  };

  const handleCancel = () => {
    onCancel();
    setCustomLabel('');
  };

  if (!isOpen || !sourceNode || !targetNode) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="p-6 border-b border-gray-600">
          <h2 className="text-lg font-bold text-white mb-2">
            Define Connection Type
          </h2>
          <div className="text-sm text-gray-300">
            <span className="font-medium">{sourceNode.label || sourceNode.id}</span>
            <span className="mx-2">→</span>
            <span className="font-medium">{targetNode.label || targetNode.id}</span>
          </div>
        </div>

        {/* Connection Types */}
        <div className="p-6">
          <div className="space-y-3">
            {connectionTypes.map((type) => {
              const isSuggested = type.suggestedFor?.includes(sourceNode.type) || 
                                 type.suggestedFor?.includes(targetNode.type);
              
              return (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedType === type.value
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  } ${isSuggested ? 'ring-2 ring-yellow-500 ring-opacity-50' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-xl">{type.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{type.label}</span>
                        {isSuggested && (
                          <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded">
                            Suggested
                          </span>
                        )}
                      </div>
                      <p className="text-sm opacity-75 mt-1">
                        {type.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Label */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom Label (Optional)
            </label>
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="e.g., 'triggers', 'contains', 'depends on'"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Preview */}
          <div className="mt-4 p-3 bg-gray-700 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Preview:</div>
            <div className="text-sm text-white">
              <span className="font-medium">{sourceNode.label || sourceNode.id}</span>
              <span className="mx-2 text-gray-400">
                {customLabel ? `—${customLabel}→` : '→'}
              </span>
              <span className="font-medium">{targetNode.label || targetNode.id}</span>
            </div>
            <div className="text-xs text-blue-400 mt-1">
              Type: {connectionTypes.find(t => t.value === selectedType)?.label}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-600 flex space-x-3">
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition-colors"
          >
            Create Connection
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTypeModal; 