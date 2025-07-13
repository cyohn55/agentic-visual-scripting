import { Node, Edge } from 'reactflow';

export interface Variable {
  name: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object';
}

export interface ExecutionContext {
  variables: Record<string, Variable>;
  currentNodeId: string | null;
  isRunning: boolean;
  isPaused: boolean;
  executionPath: string[];
  errors: string[];
}

export interface ExecutionStep {
  nodeId: string;
  action: string;
  input?: any;
  output?: any;
  timestamp: number;
}

class ExecutionEngine {
  private context: ExecutionContext = {
    variables: {},
    currentNodeId: null,
    isRunning: false,
    isPaused: false,
    executionPath: [],
    errors: [],
  };

  private listeners: Set<(context: ExecutionContext) => void> = new Set();
  private executionHistory: ExecutionStep[] = [];

  // Subscribe to execution context changes
  subscribe(listener: (context: ExecutionContext) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.context));
  }

  getContext(): ExecutionContext {
    return { ...this.context };
  }

  // Variable management
  setVariable(name: string, value: any, type?: 'string' | 'number' | 'boolean' | 'object') {
    const inferredType = type || this.inferType(value);
    this.context.variables[name] = {
      name,
      value,
      type: inferredType,
    };
    this.notifyListeners();
  }

  getVariable(name: string): Variable | undefined {
    return this.context.variables[name];
  }

  private inferType(value: any): 'string' | 'number' | 'boolean' | 'object' {
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'object';
  }

  // Execution control
  async executeWorkflow(nodes: Node[], edges: Edge[]) {
    this.context.isRunning = true;
    this.context.isPaused = false;
    this.context.executionPath = [];
    this.context.errors = [];
    this.executionHistory = [];
    this.notifyListeners();

    try {
      // Find start node
      const startNode = nodes.find(node => 
        node.type === 'control-flow' && node.data.type === 'start'
      );

      if (!startNode) {
        this.addError('No start node found. Add a start node to begin execution.');
        return;
      }

      await this.executeFromNode(startNode.id, nodes, edges);
    } catch (error) {
      this.addError(`Execution error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      this.context.isRunning = false;
      this.context.currentNodeId = null;
      this.notifyListeners();
    }
  }

  private async executeFromNode(nodeId: string, nodes: Node[], edges: Edge[]): Promise<string | null> {
    if (this.context.isPaused) {
      await this.waitForResume();
    }

    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      this.addError(`Node ${nodeId} not found`);
      return null;
    }

    this.context.currentNodeId = nodeId;
    this.context.executionPath.push(nodeId);
    this.notifyListeners();

    // Add delay for visualization
    await this.delay(500);

    const step: ExecutionStep = {
      nodeId,
      action: 'execute',
      timestamp: Date.now(),
    };

    try {
      // Execute node based on type
      const nextNodeId = await this.executeNode(node, nodes, edges, step);
      
      this.executionHistory.push(step);

      // Continue to next node if not end
      if (nextNodeId && node.data.type !== 'end') {
        return await this.executeFromNode(nextNodeId, nodes, edges);
      }

      return null;
    } catch (error) {
      step.output = { error: error instanceof Error ? error.message : String(error) };
      this.executionHistory.push(step);
      this.addError(`Error executing node ${nodeId}: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }

  private async executeNode(node: Node, nodes: Node[], edges: Edge[], step: ExecutionStep): Promise<string | null> {
    switch (node.type) {
      case 'control-flow':
        return this.executeControlFlowNode(node, nodes, edges, step);
      case 'sticky-note':
        return this.executeStickyNoteNode(node, nodes, edges, step);
      case 'text-file':
        return this.executeTextFileNode(node, nodes, edges, step);
      case 'shape':
        return this.executeShapeNode(node, nodes, edges, step);
      default:
        this.addError(`Unknown node type: ${node.type}`);
        return null;
    }
  }

  private async executeControlFlowNode(node: Node, nodes: Node[], edges: Edge[], step: ExecutionStep): Promise<string | null> {
    const { type, condition } = node.data;

    switch (type) {
      case 'start':
        step.action = 'start';
        step.output = { message: 'Workflow started' };
        break;

      case 'end':
        step.action = 'end';
        step.output = { message: 'Workflow completed' };
        return null;

      case 'decision':
        step.action = 'decision';
        step.input = { condition };
        
        // Evaluate condition (basic implementation)
        const result = this.evaluateCondition(condition || 'true');
        step.output = { result, condition };

        // Find next node based on result
        const outgoingEdges = edges.filter(edge => edge.source === node.id);
        
        if (result) {
          // Find 'yes' edge
          const yesEdge = outgoingEdges.find(edge => edge.sourceHandle === 'yes') ||
                         outgoingEdges[0]; // Fallback to first edge
          return yesEdge?.target || null;
        } else {
          // Find 'no' edge
          const noEdge = outgoingEdges.find(edge => edge.sourceHandle === 'no') ||
                        outgoingEdges[1]; // Fallback to second edge
          return noEdge?.target || null;
        }

      case 'process':
      default:
        step.action = 'process';
        step.output = { message: `Processed: ${node.data.label}` };
        break;
    }

    // Find next node for linear flow
    const nextEdge = edges.find(edge => edge.source === node.id);
    return nextEdge?.target || null;
  }

  private async executeStickyNoteNode(node: Node, nodes: Node[], edges: Edge[], step: ExecutionStep): Promise<string | null> {
    step.action = 'note';
    step.output = { 
      message: `Note: ${node.data.label}`,
      content: node.data.content 
    };

    // Log the content as a variable if it contains assignment-like syntax
    const content = node.data.content || '';
    const assignmentMatch = content.match(/(\w+)\s*=\s*(.+)/);
    if (assignmentMatch) {
      const [, varName, varValue] = assignmentMatch;
      this.setVariable(varName.trim(), this.parseValue(varValue.trim()));
      step.output.variable = { name: varName.trim(), value: this.parseValue(varValue.trim()) };
    }

    const nextEdge = edges.find(edge => edge.source === node.id);
    return nextEdge?.target || null;
  }

  private async executeTextFileNode(node: Node, nodes: Node[], edges: Edge[], step: ExecutionStep): Promise<string | null> {
    step.action = 'file';
    step.output = { 
      filename: node.data.label,
      content: node.data.content 
    };

    const nextEdge = edges.find(edge => edge.source === node.id);
    return nextEdge?.target || null;
  }

  private async executeShapeNode(node: Node, nodes: Node[], edges: Edge[], step: ExecutionStep): Promise<string | null> {
    step.action = 'shape';
    step.output = { 
      message: `Shape: ${node.data.label}`,
      shape: node.data.shape,
      color: node.data.color 
    };

    const nextEdge = edges.find(edge => edge.source === node.id);
    return nextEdge?.target || null;
  }

  private evaluateCondition(condition: string): boolean {
    try {
      // Replace variables with their values
      let evaluable = condition;
      
      Object.entries(this.context.variables).forEach(([varName, variable]) => {
        const value = variable.type === 'string' ? `"${variable.value}"` : variable.value;
        evaluable = evaluable.replace(new RegExp(`\\b${varName}\\b`, 'g'), value.toString());
      });

      // Simple safe evaluation for basic expressions
      // Only allow basic comparison operators and numbers/strings
      const sanitizedExpression = evaluable.replace(/[^0-9+\-*/<>=!&|()"\s]/g, '');
      
      // For demo purposes, use a very basic evaluation
      // In production, use a proper expression parser library
      if (sanitizedExpression.includes('>')) {
        const [left, right] = sanitizedExpression.split('>').map(s => s.trim());
        return parseFloat(left) > parseFloat(right);
      } else if (sanitizedExpression.includes('<')) {
        const [left, right] = sanitizedExpression.split('<').map(s => s.trim());
        return parseFloat(left) < parseFloat(right);
      } else if (sanitizedExpression.includes('==')) {
        const [left, right] = sanitizedExpression.split('==').map(s => s.trim());
        return left === right;
      } else if (sanitizedExpression.includes('!=')) {
        const [left, right] = sanitizedExpression.split('!=').map(s => s.trim());
        return left !== right;
      }
      
      // Default to true for unrecognized conditions
      return true;
    } catch (error) {
      this.addError(`Error evaluating condition "${condition}": ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  private parseValue(value: string): any {
    // Try to parse as number
    if (!isNaN(Number(value))) {
      return Number(value);
    }
    
    // Try to parse as boolean
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
    
    // Try to parse as JSON
    try {
      return JSON.parse(value);
    } catch {
      // Return as string
      return value.replace(/^["']|["']$/g, ''); // Remove quotes
    }
  }

  private addError(message: string) {
    this.context.errors.push(message);
    this.notifyListeners();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async waitForResume(): Promise<void> {
    return new Promise(resolve => {
      const checkResume = () => {
        if (!this.context.isPaused) {
          resolve();
        } else {
          setTimeout(checkResume, 100);
        }
      };
      checkResume();
    });
  }

  // Execution controls
  pause() {
    this.context.isPaused = true;
    this.notifyListeners();
  }

  resume() {
    this.context.isPaused = false;
    this.notifyListeners();
  }

  stop() {
    this.context.isRunning = false;
    this.context.isPaused = false;
    this.context.currentNodeId = null;
    this.notifyListeners();
  }

  reset() {
    this.context = {
      variables: {},
      currentNodeId: null,
      isRunning: false,
      isPaused: false,
      executionPath: [],
      errors: [],
    };
    this.executionHistory = [];
    this.notifyListeners();
  }

  getExecutionHistory(): ExecutionStep[] {
    return [...this.executionHistory];
  }
}

export const executionEngine = new ExecutionEngine(); 