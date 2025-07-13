import React, { useState } from 'react';
import { canvasStore } from '../store/canvasStore';

interface ExportImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportImportDialog: React.FC<ExportImportDialogProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importData, setImportData] = useState('');
  const [exportData, setExportData] = useState('');
  const [fileName, setFileName] = useState('canvas-export');
  const [importError, setImportError] = useState('');

  const handleExport = () => {
    const data = canvasStore.exportCanvas();
    setExportData(data);
  };

  const handleDownload = () => {
    const data = canvasStore.exportCanvas();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName || 'canvas-export'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    setImportError('');
    try {
      const success = canvasStore.importCanvas(importData);
      if (success) {
        setImportData('');
        onClose();
      } else {
        setImportError('Failed to import canvas data. Please check the format.');
      }
    } catch (error) {
      setImportError('Invalid JSON format. Please check your data.');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportData(content);
      };
      reader.readAsText(file);
    }
  };

  const validateImportData = () => {
    try {
      const parsed = JSON.parse(importData);
      return parsed.nodes && Array.isArray(parsed.nodes);
    } catch {
      return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <h3 className="text-white font-semibold text-lg">Canvas Export/Import</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-600">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === 'export'
                ? 'text-white bg-gray-700 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📤 Export Canvas
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 px-6 py-3 text-sm font-medium ${
              activeTab === 'import'
                ? 'text-white bg-gray-700 border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📥 Import Canvas
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'export' ? (
            <div className="space-y-4">
              <div>
                <p className="text-gray-300 text-sm mb-4">
                  Export your current canvas state to save your work or share it with others.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    onClick={handleExport}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>📋</span>
                    <span>Generate Export Data</span>
                  </button>
                  
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      className="flex-1 bg-gray-700 text-white rounded px-3 py-2 text-sm border border-gray-600 focus:border-blue-500 focus:outline-none"
                      placeholder="File name"
                    />
                    <button
                      onClick={handleDownload}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                      title="Download as JSON file"
                    >
                      💾
                    </button>
                  </div>
                </div>

                {exportData && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Export Data (copy this):
                    </label>
                    <textarea
                      value={exportData}
                      readOnly
                      className="w-full h-40 bg-gray-700 text-white rounded px-3 py-2 text-xs border border-gray-600 font-mono"
                      onClick={(e) => e.currentTarget.select()}
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      Click in the text area to select all, then copy (Ctrl+C)
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-gray-700 rounded p-4">
                <h4 className="text-white font-medium mb-2">Canvas Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Nodes:</span>
                    <span className="text-white ml-2">{canvasStore.getState().nodes.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Edges:</span>
                    <span className="text-white ml-2">{canvasStore.getState().edges.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Groups:</span>
                    <span className="text-white ml-2">{canvasStore.getState().groups.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">View Mode:</span>
                    <span className="text-white ml-2">{canvasStore.getState().viewMode}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-gray-300 text-sm mb-4">
                  Import a previously exported canvas to restore your work. This will replace your current canvas.
                </p>

                <div className="flex space-x-2 mb-4">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors cursor-pointer flex items-center space-x-2"
                  >
                    <span>📁</span>
                    <span>Choose File</span>
                  </label>
                  
                  <button
                    onClick={handleImport}
                    disabled={!importData || !validateImportData()}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors flex items-center space-x-2"
                  >
                    <span>📥</span>
                    <span>Import Canvas</span>
                  </button>
                </div>

                {importError && (
                  <div className="bg-red-900 border border-red-600 rounded p-3 mb-4">
                    <p className="text-red-200 text-sm">{importError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Import Data (paste JSON here):
                  </label>
                  <textarea
                    value={importData}
                    onChange={(e) => {
                      setImportData(e.target.value);
                      setImportError('');
                    }}
                    className="w-full h-40 bg-gray-700 text-white rounded px-3 py-2 text-xs border border-gray-600 font-mono focus:border-blue-500 focus:outline-none"
                    placeholder="Paste exported canvas JSON data here..."
                  />
                  
                  {importData && (
                    <div className="mt-2 flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        validateImportData() ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className={`text-xs ${
                        validateImportData() ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {validateImportData() ? 'Valid canvas data' : 'Invalid data format'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-yellow-900 border border-yellow-600 rounded p-4">
                <h4 className="text-yellow-200 font-medium mb-2">⚠️ Warning</h4>
                <p className="text-yellow-100 text-sm">
                  Importing will replace your current canvas completely. Make sure to export your current work first if you want to keep it.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportImportDialog; 