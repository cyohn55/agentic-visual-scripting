import React from 'react';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl+K', description: 'Open Command Palette' },
    { key: 'Ctrl+Z', description: 'Undo' },
    { key: 'Ctrl+Y', description: 'Redo' },
    { key: 'Delete', description: 'Delete Selected Nodes' },
    { key: 'P', description: 'Open Properties Panel' },
    { key: 'G', description: 'Toggle Groups Panel' },
    { key: 'M', description: 'Multi-Select Actions' },
    { key: 'Escape', description: 'Close Dialogs/Deselect' },
    { key: 'Ctrl+A', description: 'Select All Nodes' },
    { key: 'F', description: 'Fit View to Nodes' },
    { key: '?', description: 'Show/Hide This Help' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-600">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="space-y-3">
          {shortcuts.map(({ key, description }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-gray-300">{description}</span>
              <kbd className="bg-gray-700 text-gray-200 px-2 py-1 rounded text-sm font-mono">
                {key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-600">
          <p className="text-gray-400 text-sm text-center">
            Press <kbd className="bg-gray-700 text-gray-200 px-1 rounded">?</kbd> anytime to toggle this help
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp; 