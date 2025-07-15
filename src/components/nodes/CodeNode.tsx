import React, { useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow, NodeResizer } from 'reactflow';
import CodeEditorModal from '../CodeEditorModal';

interface CodeNodeData {
  label: string;
  code: string;
  language: string;
  isRunnable?: boolean;
  lastRun?: number;
  output?: string;
  width?: number;
  height?: number;
}

// Memoized CodeNode for better performance
const CodeNode: React.FC<NodeProps<CodeNodeData>> = React.memo(({
  data,
  id,
  selected,
  ...props
}) => {
  const [showEditor, setShowEditor] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const { setNodes } = useReactFlow();

  // Let React Flow control the dimensions completely

  // Optimized update function using global reference
  const updateNodeData = (updates: Partial<CodeNodeData>) => {
    // Use the global update function for optimal performance
    if ((window as any).__updateNodeData) {
      (window as any).__updateNodeData(id, updates);
    } else {
      // Fallback to direct React Flow update
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, ...updates } } : node
        )
      );
    }
  };

  const supportedLanguages = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨', runnable: true },
    { value: 'typescript', label: 'TypeScript', icon: '🔷', runnable: true },
    { value: 'python', label: 'Python', icon: '🐍', runnable: true },
    { value: 'json', label: 'JSON', icon: '📋', runnable: false },
    { value: 'css', label: 'CSS', icon: '🎨', runnable: false },
    { value: 'html', label: 'HTML', icon: '🌐', runnable: false },
    { value: 'markdown', label: 'Markdown', icon: '📝', runnable: false },
    { value: 'yaml', label: 'YAML', icon: '📄', runnable: false },
    { value: 'sql', label: 'SQL', icon: '🗄️', runnable: false },
  ];

  const currentLanguage = supportedLanguages.find(lang => lang.value === data.language) ||
    supportedLanguages[0];

  const executeCode = async () => {
    if (!currentLanguage.runnable) return;
    
    setIsExecuting(true);
    
    try {
      let output = '';
      
      switch (data.language) {
        case 'javascript':
        case 'typescript':
          try {
            // eslint-disable-next-line no-eval
            const result = eval(data.code);
            output = result !== undefined ? String(result) : 'undefined';
          } catch (jsError) {
            output = `Error: ${jsError instanceof Error ? jsError.message : String(jsError)}`;
          }
          break;
          
        case 'python':
          // Simulate Python execution with basic pattern matching
          if (data.code.includes('print(')) {
            const printMatches = data.code.match(/print\(['"`]([^'"`]*)['"`]\)/g);
            if (printMatches) {
              output = printMatches.map(match => {
                const content = match.match(/print\(['"`]([^'"`]*)['"`]\)/);
                return content ? content[1] : '';
              }).join('\n');
            } else {
              output = 'Python code executed (simulated)';
            }
          } else if (data.code.includes('=') && !data.code.includes('==')) {
            output = 'Variables assigned (simulated)';
          } else {
            output = 'Python code executed (simulated)\nNote: Full Python execution requires backend service';
          }
          break;
          
        default:
          output = `${data.language.toUpperCase()} code executed (simulated)\nNote: Full execution requires backend service`;
          break;
      }
      
      updateNodeData({
        output,
        lastRun: Date.now()
      });
      
    } catch (error) {
      updateNodeData({
        output: `Error: ${error instanceof Error ? error.message : String(error)}`,
        lastRun: Date.now()
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const openEditor = () => setShowEditor(true);
  const closeEditor = () => setShowEditor(false);

  const handleCodeChange = (newCode: string) => {
    updateNodeData({ code: newCode });
  };

  const handleLabelChange = (newLabel: string) => {
    updateNodeData({ label: newLabel });
  };

  const handleLanguageChange = (newLanguage: string) => {
    updateNodeData({ language: newLanguage });
  };

  // Render the resizable code node
  return (
    <div 
      className="bg-gray-800 border-2 border-blue-500 rounded-lg shadow-lg text-white relative flex flex-col w-full h-full"
      style={{ minWidth: 200, minHeight: 150 }}
    >
      {/* React Flow's built-in NodeResizer - much more performant */}
      <NodeResizer 
        color="#3b82f6"
        isVisible={selected}
        minWidth={200}
        minHeight={150}
        handleStyle={{
          backgroundColor: '#3b82f6',
          border: '2px solid #1d4ed8',
          borderRadius: '3px',
          width: '8px',
          height: '8px',
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-600 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{currentLanguage.icon}</span>
          <input
            type="text"
            value={data.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className="bg-transparent border-none outline-none text-white font-medium"
            placeholder="Code Block"
          />
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={data.language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
          >
            {supportedLanguages.map(lang => (
              <option key={lang.value} value={lang.value}>
                {lang.icon} {lang.label}
              </option>
            ))}
          </select>
          {currentLanguage.runnable && (
            <button
              onClick={executeCode}
              disabled={isExecuting}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                isExecuting
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isExecuting ? '⏳' : '▶️'}
            </button>
          )}
          <button
            onClick={openEditor}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            title="You can also double-click the code area to edit"
          >
            📝
          </button>
        </div>
      </div>

      {/* Code preview - flexible height */}
              <div 
          className="p-3 overflow-hidden flex-1 cursor-pointer hover:bg-gray-800 transition-colors rounded"
          onDoubleClick={openEditor}
          title="Double-click to edit code"
        >
          <pre className="text-sm font-mono whitespace-pre-wrap break-words text-gray-300 h-full overflow-auto">
            {data.code || 'Double-click to add code...'}
          </pre>
        </div>

      {/* Output section */}
      {data.output && (
        <div className="border-t border-gray-600 p-3 bg-gray-900 flex-shrink-0 max-h-24 overflow-auto">
          <div className="text-xs text-gray-400 mb-1">Output:</div>
          <pre className="text-sm font-mono whitespace-pre-wrap break-words text-green-400">
            {data.output}
          </pre>
        </div>
      )}

      {/* Connection handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />

      {/* Code Editor Modal */}
      {showEditor && (
        <CodeEditorModal
          isOpen={showEditor}
          title={data.label}
          initialCode={data.code || `// ${currentLanguage.label} code\n\n`}
          language={data.language}
          onSave={(newCode) => {
            handleCodeChange(newCode);
            closeEditor();
          }}
          onClose={closeEditor}
        />
      )}
    </div>
  );
});

CodeNode.displayName = 'CodeNode';

export default CodeNode; 