import React, { useState } from 'react';
import { NodeType } from '../types';

interface NodeCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNode: (type: NodeType, customData?: any) => void;
}

interface CustomNodeTemplate {
  id: string;
  name: string;
  type: NodeType;
  defaultData: any;
  icon: string;
  description: string;
  category: string;
}

const NodeCreator: React.FC<NodeCreatorProps> = ({ isOpen, onClose, onCreateNode }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('basic');
  const [searchTerm, setSearchTerm] = useState('');

  const nodeTemplates: CustomNodeTemplate[] = [
    // Basic nodes
    {
      id: 'sticky-note-basic',
      name: 'Sticky Note',
      type: 'sticky-note',
      defaultData: { label: 'New Note', content: '', color: '#fef3c7' },
      icon: '📝',
      description: 'Simple note for ideas and comments',
      category: 'basic',
    },
    {
      id: 'text-file-basic',
      name: 'Text File',
      type: 'text-file',
      defaultData: { label: 'document.txt', content: '', fileType: 'text' },
      icon: '📄',
      description: 'File representation with content',
      category: 'basic',
    },
    {
      id: 'shape-basic',
      name: 'Shape',
      type: 'shape',
      defaultData: { label: 'Shape', color: '#8b5cf6', shape: 'rectangle' },
      icon: '🔷',
      description: 'Geometric shape for diagrams',
      category: 'basic',
    },

    // Control Flow
    {
      id: 'start-node',
      name: 'Start Node',
      type: 'control-flow',
      defaultData: { label: 'Start', type: 'start' },
      icon: '▶️',
      description: 'Beginning of a workflow',
      category: 'flow',
    },
    {
      id: 'end-node',
      name: 'End Node',
      type: 'control-flow',
      defaultData: { label: 'End', type: 'end' },
      icon: '⏹️',
      description: 'End of a workflow',
      category: 'flow',
    },
    {
      id: 'decision-node',
      name: 'Decision Node',
      type: 'control-flow',
      defaultData: { label: 'Decision', type: 'decision', condition: 'x > 0' },
      icon: '❓',
      description: 'Conditional branching point',
      category: 'flow',
    },
    {
      id: 'process-node',
      name: 'Process Node',
      type: 'control-flow',
      defaultData: { label: 'Process', type: 'process' },
      icon: '⚙️',
      description: 'Processing step in workflow',
      category: 'flow',
    },

    // Data nodes
    {
      id: 'variable-note',
      name: 'Variable',
      type: 'sticky-note',
      defaultData: { 
        label: 'Variable', 
        content: 'x = 10\ny = "hello"', 
        color: '#ddd6fe' 
      },
      icon: '📊',
      description: 'Variable definition and assignment',
      category: 'data',
    },
    {
      id: 'json-file',
      name: 'JSON Data',
      type: 'text-file',
      defaultData: { 
        label: 'data.json', 
        content: '{\n  "key": "value",\n  "array": [1, 2, 3]\n}',
        fileType: 'json'
      },
      icon: '📋',
      description: 'JSON data structure',
      category: 'data',
    },
    {
      id: 'database-shape',
      name: 'Database',
      type: 'shape',
      defaultData: { label: 'Database', color: '#10b981', shape: 'rectangle' },
      icon: '🗄️',
      description: 'Database or storage representation',
      category: 'data',
    },

    // UI Elements
    {
      id: 'ui-button',
      name: 'Button',
      type: 'shape',
      defaultData: { label: 'Button', color: '#3b82f6', shape: 'rectangle' },
      icon: '🔘',
      description: 'UI button component',
      category: 'ui',
    },
    {
      id: 'ui-input',
      name: 'Input Field',
      type: 'shape',
      defaultData: { label: 'Input', color: '#6b7280', shape: 'rectangle' },
      icon: '📝',
      description: 'Input field component',
      category: 'ui',
    },
    {
      id: 'ui-modal',
      name: 'Modal Dialog',
      type: 'shape',
      defaultData: { label: 'Modal', color: '#f59e0b', shape: 'rectangle' },
      icon: '🪟',
      description: 'Modal dialog component',
      category: 'ui',
    },
  ];

  const categories = [
    { id: 'basic', name: 'Basic', icon: '📦' },
    { id: 'flow', name: 'Control Flow', icon: '🔄' },
    { id: 'data', name: 'Data', icon: '📊' },
    { id: 'ui', name: 'UI Elements', icon: '🎨' },
  ];

  const filteredTemplates = nodeTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateNode = (template: CustomNodeTemplate) => {
    onCreateNode(template.type, template.defaultData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl h-[80vh] mx-4 border border-gray-600 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <h2 className="text-xl font-bold text-white">Create Node</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-600">
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Categories */}
          <div className="w-48 border-r border-gray-600 p-4">
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="mr-2">🌟</span>
                All
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Node Templates */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  onClick={() => handleCreateNode(template)}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-purple-500 hover:bg-gray-650 cursor-pointer transition-all group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{template.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium group-hover:text-purple-300 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                        {template.description}
                      </p>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-600 text-gray-300">
                          {categories.find(c => c.id === template.category)?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">No nodes found</div>
                <div className="text-gray-500 text-sm">
                  Try adjusting your search or category filter
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-600 bg-gray-750">
          <div className="flex items-center justify-between">
            <div className="text-gray-400 text-sm">
              💡 Tip: Double-click on canvas to quickly access this menu
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeCreator; 