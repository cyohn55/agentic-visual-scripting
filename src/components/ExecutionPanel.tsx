import React, { useState, useEffect } from 'react';
import { executionEngine, ExecutionContext, ExecutionStep } from '../store/executionEngine';
import { canvasStore } from '../store/canvasStore';

interface ExecutionPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExecutionPanel: React.FC<ExecutionPanelProps> = ({ isOpen, onClose }) => {
  const [context, setContext] = useState<ExecutionContext>(executionEngine.getContext());
  const [history, setHistory] = useState<ExecutionStep[]>([]);
  const [selectedTab, setSelectedTab] = useState<'variables' | 'console' | 'history'>('variables');

  useEffect(() => {
    const unsubscribe = executionEngine.subscribe((newContext) => {
      setContext(newContext);
      setHistory(executionEngine.getExecutionHistory());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleExecute = async () => {
    const state = canvasStore.getState();
    await executionEngine.executeWorkflow(state.nodes, state.edges);
  };

  const handleStop = () => {
    executionEngine.stop();
  };

  const handlePause = () => {
    if (context.isPaused) {
      executionEngine.resume();
    } else {
      executionEngine.pause();
    }
  };

  const handleReset = () => {
    executionEngine.reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-20 right-4 w-80 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-40">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-600">
        <h2 className="text-lg font-bold text-white">Execution Engine</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-xl"
        >
          ×
        </button>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-gray-600">
        <div className="flex space-x-2">
          <button
            onClick={handleExecute}
            disabled={context.isRunning}
            className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm"
          >
            {context.isRunning ? '▶️ Running...' : '▶️ Execute'}
          </button>
          
          {context.isRunning && (
            <button
              onClick={handlePause}
              className="bg-yellow-600 hover:bg-yellow-500 text-white px-3 py-2 rounded text-sm"
            >
              {context.isPaused ? '▶️' : '⏸️'}
            </button>
          )}
          
          <button
            onClick={handleStop}
            disabled={!context.isRunning}
            className="bg-red-600 hover:bg-red-500 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm"
          >
            ⏹️
          </button>
          
          <button
            onClick={handleReset}
            className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded text-sm"
          >
            🔄
          </button>
        </div>

        {/* Status */}
        <div className="mt-2 text-sm text-gray-300">
          Status: <span className={`font-semibold ${
            context.isRunning ? 'text-green-400' : 
            context.errors.length > 0 ? 'text-red-400' : 'text-gray-400'
          }`}>
            {context.isRunning ? (context.isPaused ? 'Paused' : 'Running') : 
             context.errors.length > 0 ? 'Error' : 'Ready'}
          </span>
        </div>

        {context.currentNodeId && (
          <div className="mt-1 text-sm text-blue-400">
            Current: {context.currentNodeId}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-600">
        {['variables', 'console', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab as any)}
            className={`flex-1 px-3 py-2 text-sm capitalize ${
              selectedTab === tab
                ? 'bg-gray-700 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 max-h-80 overflow-y-auto">
        {selectedTab === 'variables' && (
          <div className="space-y-2">
            <h3 className="text-white font-semibold text-sm">Variables</h3>
            {Object.keys(context.variables).length === 0 ? (
              <p className="text-gray-400 text-sm">No variables defined</p>
            ) : (
              Object.entries(context.variables).map(([name, variable]) => (
                <div key={name} className="bg-gray-700 rounded p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 font-mono text-sm">{name}</span>
                    <span className="text-gray-400 text-xs">{variable.type}</span>
                  </div>
                  <div className="text-white text-sm mt-1">
                    {typeof variable.value === 'object' 
                      ? JSON.stringify(variable.value, null, 2)
                      : String(variable.value)
                    }
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {selectedTab === 'console' && (
          <div className="space-y-2">
            <h3 className="text-white font-semibold text-sm">Console</h3>
            <div className="bg-black rounded p-2 font-mono text-xs max-h-60 overflow-y-auto">
              {context.errors.length === 0 && history.length === 0 && (
                <p className="text-gray-400">No output</p>
              )}
              
              {history.map((step, index) => (
                <div key={index} className="mb-2">
                  <div className="text-gray-400">
                    [{new Date(step.timestamp).toLocaleTimeString()}] {step.action}
                  </div>
                  {step.output && (
                    <div className="text-green-400 ml-4">
                      {JSON.stringify(step.output, null, 2)}
                    </div>
                  )}
                </div>
              ))}
              
              {context.errors.map((error, index) => (
                <div key={index} className="text-red-400 mb-1">
                  ERROR: {error}
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'history' && (
          <div className="space-y-2">
            <h3 className="text-white font-semibold text-sm">Execution History</h3>
            {history.length === 0 ? (
              <p className="text-gray-400 text-sm">No execution history</p>
            ) : (
              <div className="space-y-1">
                {history.map((step, index) => (
                  <div 
                    key={index} 
                    className={`text-sm p-2 rounded ${
                      step.nodeId === context.currentNodeId 
                        ? 'bg-blue-700 text-white' 
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    <div className="font-mono text-xs">
                      {index + 1}. {step.nodeId}
                    </div>
                    <div className="text-xs text-gray-400">
                      {step.action} • {new Date(step.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutionPanel; 