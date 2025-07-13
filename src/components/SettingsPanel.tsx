import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { 
    config, 
    setTheme, 
    toggleAnimations, 
    toggleGridSnap, 
    toggleMinimap, 
    getSystemTheme 
  } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-600">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Theme Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Theme</h3>
          <div className="space-y-2">
            {[
              { value: 'auto', label: `Auto (${getSystemTheme()})`, icon: '🌓' },
              { value: 'dark', label: 'Dark', icon: '🌙' },
              { value: 'light', label: 'Light', icon: '☀️' },
            ].map(({ value, label, icon }) => (
              <label key={value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value={value}
                  checked={config.theme === value}
                  onChange={(e) => setTheme(e.target.value as any)}
                  className="text-purple-500 focus:ring-purple-500"
                />
                <span className="text-lg">{icon}</span>
                <span className="text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Visual Options */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Visual Options</h3>
          <div className="space-y-3">
            
            {/* Animations */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg">✨</span>
                <div>
                  <div className="text-gray-300 font-medium">Animations</div>
                  <div className="text-gray-500 text-sm">Smooth transitions and effects</div>
                </div>
              </div>
              <button
                onClick={toggleAnimations}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.animations ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.animations ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Grid Snap */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg">📐</span>
                <div>
                  <div className="text-gray-300 font-medium">Grid Snap</div>
                  <div className="text-gray-500 text-sm">Snap nodes to grid</div>
                </div>
              </div>
              <button
                onClick={toggleGridSnap}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.gridSnap ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.gridSnap ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Minimap */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg">🗺️</span>
                <div>
                  <div className="text-gray-300 font-medium">Minimap</div>
                  <div className="text-gray-500 text-sm">Show canvas overview</div>
                </div>
              </div>
              <button
                onClick={toggleMinimap}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  config.minimap ? 'bg-purple-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.minimap ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Theme Preview */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Preview</h3>
          <div className="p-4 rounded-lg border" style={{ 
            backgroundColor: config.colors.canvas,
            borderColor: config.colors.border 
          }}>
            <div className="flex space-x-2 mb-3">
              <div 
                className="w-16 h-12 rounded border-2 flex items-center justify-center text-xs"
                style={{ 
                  backgroundColor: config.colors.nodeBackground,
                  borderColor: config.colors.nodeBorder,
                  color: config.colors.text
                }}
              >
                Node
              </div>
              <div className="flex-1 h-px mt-6" style={{ 
                backgroundColor: config.colors.connection 
              }} />
              <div 
                className="w-16 h-12 rounded border-2 flex items-center justify-center text-xs"
                style={{ 
                  backgroundColor: config.colors.nodeBackground,
                  borderColor: config.colors.nodeBorder,
                  color: config.colors.text
                }}
              >
                Node
              </div>
            </div>
            <div 
              className="text-sm"
              style={{ color: config.colors.textSecondary }}
            >
              Canvas with connected nodes
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel; 