import React, { useState, useEffect } from 'react';
import { generateCode, CodeGenerationOptions, CodeLanguage } from '../utils/codeGenerator';
import { canvasStore } from '../store/canvasStore';

interface CodeGenerationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const CodeGenerationPanel: React.FC<CodeGenerationPanelProps> = ({ isOpen, onClose }) => {
  const [options, setOptions] = useState<CodeGenerationOptions>({
    language: 'javascript',
    includeComments: true,
    includeTypes: true,
    exportFormat: 'function',
    functionName: 'myWorkflow',
  });
  
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate code when options change
  useEffect(() => {
    if (isOpen) {
      generateCodeWithOptions();
    }
  }, [options, isOpen]);

  const generateCodeWithOptions = async () => {
    setIsGenerating(true);
    try {
      const state = canvasStore.getState();
      const code = generateCode(state.nodes, state.edges, state.groups, options);
      setGeneratedCode(code);
    } catch (error) {
      console.error('Code generation failed:', error);
      setGeneratedCode('// Error generating code\n// Please check your workflow structure');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    const fileExtension = getFileExtension(options.language);
    const filename = `${options.functionName}.${fileExtension}`;
    
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const getFileExtension = (language: CodeLanguage): string => {
    switch (language) {
      case 'javascript': return 'js';
      case 'typescript': return 'ts';
      case 'python': return 'py';
      case 'mermaid': return 'mmd';
      case 'plantuml': return 'puml';
      default: return 'txt';
    }
  };

  const getLanguageIcon = (language: CodeLanguage): string => {
    switch (language) {
      case 'javascript': return '🟨';
      case 'typescript': return '🔵';
      case 'python': return '🐍';
      case 'mermaid': return '📊';
      case 'plantuml': return '📋';
      default: return '📄';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-6xl h-[90vh] mx-4 border border-gray-600 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <h2 className="text-xl font-bold text-white">Code Generation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Options Panel */}
          <div className="w-80 border-r border-gray-600 p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Generation Options</h3>
            
            {/* Language Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Language
              </label>
              <div className="space-y-2">
                {(['javascript', 'typescript', 'python', 'mermaid', 'plantuml'] as CodeLanguage[]).map(lang => (
                  <label key={lang} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="language"
                      value={lang}
                      checked={options.language === lang}
                      onChange={(e) => setOptions(prev => ({ ...prev, language: e.target.value as CodeLanguage }))}
                      className="text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-lg">{getLanguageIcon(lang)}</span>
                    <span className="text-gray-300 capitalize">{lang}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Code-specific options */}
            {!['mermaid', 'plantuml'].includes(options.language) && (
              <>
                {/* Export Format */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Export Format
                  </label>
                  <select
                    value={options.exportFormat}
                    onChange={(e) => setOptions(prev => ({ ...prev, exportFormat: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="function">Function</option>
                    <option value="class">Class</option>
                    <option value="module">Module</option>
                  </select>
                </div>

                {/* Function Name */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {options.exportFormat === 'class' ? 'Class Name' : 'Function Name'}
                  </label>
                  <input
                    type="text"
                    value={options.functionName}
                    onChange={(e) => setOptions(prev => ({ ...prev, functionName: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="myWorkflow"
                  />
                </div>

                {/* Include Comments */}
                <div className="mb-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.includeComments}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeComments: e.target.checked }))}
                      className="text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-gray-300">Include Comments</span>
                  </label>
                </div>

                {/* Include Types (TypeScript only) */}
                {options.language === 'typescript' && (
                  <div className="mb-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={options.includeTypes}
                        onChange={(e) => setOptions(prev => ({ ...prev, includeTypes: e.target.checked }))}
                        className="text-purple-500 focus:ring-purple-500"
                      />
                      <span className="text-gray-300">Include Type Definitions</span>
                    </label>
                  </div>
                )}
              </>
            )}

            {/* Actions */}
            <div className="space-y-3 mt-8">
              <button
                onClick={generateCodeWithOptions}
                disabled={isGenerating}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                {isGenerating ? '🔄 Generating...' : '⚡ Generate Code'}
              </button>
              
              <button
                onClick={handleCopy}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                📋 Copy to Clipboard
              </button>
              
              <button
                onClick={handleDownload}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
              >
                💾 Download File
              </button>
            </div>

            {/* Info */}
            <div className="mt-6 p-3 bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-white mb-2">💡 Generation Tips</h4>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Ensure your workflow has a Start node</li>
                <li>• Connect nodes with edges for proper flow</li>
                <li>• Use sticky notes for variable assignments</li>
                <li>• Decision nodes create if/else branches</li>
              </ul>
            </div>
          </div>

          {/* Code Preview */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-600 bg-gray-750">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getLanguageIcon(options.language)}</span>
                  <span className="text-white font-medium">
                    {options.functionName}.{getFileExtension(options.language)}
                  </span>
                </div>
                <div className="text-gray-400 text-sm">
                  {generatedCode.split('\n').length} lines
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <pre className="h-full p-4 bg-gray-900 text-gray-100 text-sm font-mono overflow-auto">
                <code>{generatedCode}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-600 bg-gray-750">
          <div className="flex items-center justify-between">
            <div className="text-gray-400 text-sm">
              🚀 Export your visual workflow as executable code
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeGenerationPanel; 