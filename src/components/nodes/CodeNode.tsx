import React, { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import CodeEditorModal from '../CodeEditorModal';

interface CodeNodeData {
  label: string;
  code: string;
  language: string;
  isRunnable?: boolean;
  lastRun?: number;
  output?: string;
}

const CodeNode: React.FC<NodeProps<CodeNodeData>> = ({
  data,
  id,
  selected,
}) => {
  const [showEditor, setShowEditor] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const supportedLanguages = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨', runnable: true },
    { value: 'typescript', label: 'TypeScript', icon: '🔷', runnable: true },
    { value: 'python', label: 'Python', icon: '🐍', runnable: true },
    { value: 'json', label: 'JSON', icon: '📋', runnable: false },
    { value: 'html', label: 'HTML', icon: '🌐', runnable: false },
    { value: 'css', label: 'CSS', icon: '🎨', runnable: false },
    { value: 'sql', label: 'SQL', icon: '🗄️', runnable: true },
  ];

  const currentLanguage = supportedLanguages.find(l => l.value === data.language) || 
                          supportedLanguages[0];

  const handleCodeSave = (newCode: string) => {
    // Update node data (this would normally be handled by the parent)
    const event = new CustomEvent('updateNodeData', {
      detail: { nodeId: id, data: { ...data, code: newCode } }
    });
    window.dispatchEvent(event);
    setShowEditor(false);
  };

  const handleExecuteCode = async () => {
    if (!currentLanguage.runnable) return;
    
    setIsExecuting(true);
    
    try {
      // Basic code execution simulation
      let output = '';
      
      if (data.language === 'javascript') {
        // Simple JavaScript evaluation (unsafe in production)
        try {
          const result = eval(data.code);
          output = String(result);
        } catch (error) {
          output = `Error: ${error instanceof Error ? error.message : String(error)}`;
        }
      } else if (data.language === 'python') {
        // Python execution would require a backend service
        output = 'Python execution requires backend service';
      } else if (data.language === 'sql') {
        // SQL execution would require database connection
        output = 'SQL execution requires database connection';
      }
      
      // Update node with execution result
      const event = new CustomEvent('updateNodeData', {
        detail: { 
          nodeId: id, 
          data: { 
            ...data, 
            lastRun: Date.now(),
            output 
          }
        }
      });
      window.dispatchEvent(event);
      
    } finally {
      setIsExecuting(false);
    }
  };

  const getPreviewCode = (code: string, maxLines: number = 3): string => {
    const lines = code.split('\n');
    if (lines.length <= maxLines) return code;
    return lines.slice(0, maxLines).join('\n') + '\n...';
  };

  return (
    <>
      <div className={`bg-gray-900 border-2 rounded-lg min-w-[300px] ${
        selected ? 'border-blue-500' : 'border-gray-600'
      } shadow-lg`}>
        {/* Header */}
        <div className="bg-gray-800 px-4 py-2 rounded-t-lg border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{currentLanguage.icon}</span>
              <div>
                <h3 className="text-white font-medium text-sm">{data.label}</h3>
                <p className="text-gray-400 text-xs">{currentLanguage.label}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {currentLanguage.runnable && (
                <button
                  onClick={handleExecuteCode}
                  disabled={isExecuting}
                  className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors"
                  title="Execute Code"
                >
                  {isExecuting ? '⏳' : '▶️'}
                </button>
              )}
              
              <button
                onClick={() => setShowEditor(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs transition-colors"
                title="Open Editor"
              >
                📝
              </button>
            </div>
          </div>
        </div>

        {/* Code Preview */}
        <div className="p-4">
          {data.code ? (
            <pre className="text-gray-300 text-xs font-mono bg-black rounded p-3 overflow-hidden">
              {getPreviewCode(data.code)}
            </pre>
          ) : (
            <div className="text-gray-500 text-xs italic text-center py-4">
              Click "📝" to add code
            </div>
          )}
          
          {/* Last Execution Info */}
          {data.lastRun && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="text-xs text-gray-400 mb-1">
                Last run: {new Date(data.lastRun).toLocaleTimeString()}
              </div>
              {data.output && (
                <pre className="text-green-400 text-xs font-mono bg-gray-800 rounded p-2 overflow-hidden">
                  {data.output}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Connection Handles */}
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 bg-blue-500"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 bg-blue-500"
        />
      </div>

      {/* Monaco Editor Modal */}
      <CodeEditorModal
        isOpen={showEditor}
        title={data.label}
        initialCode={data.code || `// ${currentLanguage.label} code\n\n`}
        language={data.language}
        onSave={handleCodeSave}
        onClose={() => setShowEditor(false)}
      />
    </>
  );
};

export default CodeNode; 