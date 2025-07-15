import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorModalProps {
  isOpen: boolean;
  title: string;
  initialCode: string;
  language: string;
  onSave: (code: string) => void;
  onClose: () => void;
}

const CodeEditorModal: React.FC<CodeEditorModalProps> = ({
  isOpen,
  title,
  initialCode,
  language,
  onSave,
  onClose,
}) => {
  const [code, setCode] = useState(initialCode);
  const [isModified, setIsModified] = useState(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    setCode(initialCode);
    setIsModified(false);
  }, [initialCode]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Set editor theme and options
    editor.updateOptions({
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
      wordWrap: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
    });

    // Add keyboard shortcuts
    editor.addCommand(editor.KeyMod.CtrlCmd | editor.KeyCode.KeyS, () => {
      handleSave();
    });
  };

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    setIsModified(newCode !== initialCode);
  };

  const handleSave = () => {
    onSave(code);
    setIsModified(false);
  };

  const handleClose = () => {
    if (isModified) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmClose) return;
    }
    onClose();
  };

  const getLanguageIcon = (lang: string) => {
    switch (lang) {
      case 'javascript': return '🟨';
      case 'typescript': return '🔷';
      case 'python': return '🐍';
      case 'json': return '📋';
      case 'html': return '🌐';
      case 'css': return '🎨';
      case 'sql': return '🗄️';
      default: return '📝';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-xl w-full h-full max-w-6xl max-h-[90vh] mx-4 my-8 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getLanguageIcon(language)}</span>
            <div>
              <h2 className="text-lg font-bold text-white">{title}</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span className="capitalize">{language}</span>
                {isModified && (
                  <span className="bg-yellow-500 text-black px-2 py-1 rounded text-xs">
                    Modified
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={!isModified}
              className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              💾 Save
            </button>
            <button
              onClick={handleClose}
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded transition-colors"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleCodeChange}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
              wordWrap: 'on',
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-600 bg-gray-900">
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>Lines: {code.split('\n').length}</span>
            <span>Characters: {code.length}</span>
            <span>Language: {language}</span>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Ctrl+S to Save</span>
            <span>Ctrl+Z/Y for Undo/Redo</span>
            <span>Ctrl+F to Find</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditorModal; 