import { Node, Edge } from 'reactflow';
import { NodeGroup } from '../store/canvasStore';

export type CodeLanguage = 'javascript' | 'python' | 'typescript' | 'mermaid' | 'plantuml';

export interface CodeGenerationOptions {
  language: CodeLanguage;
  includeComments: boolean;
  includeTypes: boolean;
  exportFormat: 'function' | 'class' | 'module';
  functionName: string;
}

export class CodeGenerator {
  private nodes: Node[];
  private edges: Edge[];
  private groups: NodeGroup[];
  private options: CodeGenerationOptions;

  constructor(nodes: Node[], edges: Edge[], groups: NodeGroup[], options: CodeGenerationOptions) {
    this.nodes = nodes;
    this.edges = edges;
    this.groups = groups;
    this.options = options;
  }

  generate(): string {
    switch (this.options.language) {
      case 'javascript':
        return this.generateJavaScript();
      case 'python':
        return this.generatePython();
      case 'typescript':
        return this.generateTypeScript();
      case 'mermaid':
        return this.generateMermaid();
      case 'plantuml':
        return this.generatePlantUML();
      default:
        throw new Error(`Unsupported language: ${this.options.language}`);
    }
  }

  private generateJavaScript(): string {
    const header = this.options.includeComments 
      ? `// Generated workflow function\n// Created from visual canvas\n\n`
      : '';

    const functionStart = this.options.exportFormat === 'class'
      ? `class ${this.options.functionName} {\n  execute(variables = {}) {\n`
      : `function ${this.options.functionName}(variables = {}) {\n`;

    const body = this.generateWorkflowLogic('javascript');
    
    const functionEnd = this.options.exportFormat === 'class'
      ? '  }\n}'
      : '}';

    const footer = this.options.exportFormat === 'module'
      ? `\nexport { ${this.options.functionName} };`
      : '';

    return header + functionStart + body + functionEnd + footer;
  }

  private generatePython(): string {
    const header = this.options.includeComments 
      ? `# Generated workflow function\n# Created from visual canvas\n\n`
      : '';

    const functionStart = this.options.exportFormat === 'class'
      ? `class ${this.options.functionName}:\n    def execute(self, variables=None):\n        if variables is None:\n            variables = {}\n`
      : `def ${this.options.functionName}(variables=None):\n    if variables is None:\n        variables = {}\n`;

    const body = this.generateWorkflowLogic('python');
    
    return header + functionStart + body;
  }

  private generateTypeScript(): string {
    const header = this.options.includeComments 
      ? `// Generated workflow function\n// Created from visual canvas\n\n`
      : '';

    const typeDefinitions = this.options.includeTypes
      ? `interface Variables {\n  [key: string]: any;\n}\n\ninterface WorkflowResult {\n  success: boolean;\n  result?: any;\n  error?: string;\n}\n\n`
      : '';

    const functionStart = this.options.exportFormat === 'class'
      ? `class ${this.options.functionName} {\n  execute(variables: Variables = {}): WorkflowResult {\n`
      : this.options.includeTypes
        ? `function ${this.options.functionName}(variables: Variables = {}): WorkflowResult {\n`
        : `function ${this.options.functionName}(variables = {}) {\n`;

    const body = this.generateWorkflowLogic('typescript');
    
    const functionEnd = this.options.exportFormat === 'class'
      ? '  }\n}'
      : '}';

    const footer = this.options.exportFormat === 'module'
      ? `\nexport { ${this.options.functionName} };`
      : '';

    return header + typeDefinitions + functionStart + body + functionEnd + footer;
  }

  private generateMermaid(): string {
    let mermaid = 'graph TD\n';
    
    // Add nodes
    this.nodes.forEach(node => {
      const nodeId = this.sanitizeId(node.id);
      const label = node.data.label || 'Node';
      
      let shape = '';
      switch (node.type) {
        case 'control-flow':
          if (node.data.type === 'start') shape = `${nodeId}([${label}])`;
          else if (node.data.type === 'end') shape = `${nodeId}([${label}])`;
          else if (node.data.type === 'decision') shape = `${nodeId}{${label}}`;
          else shape = `${nodeId}[${label}]`;
          break;
        case 'sticky-note':
          shape = `${nodeId}[/"${label}"/]`;
          break;
        case 'text-file':
          shape = `${nodeId}[["${label}"]]`;
          break;
        case 'shape':
          shape = `${nodeId}[${label}]`;
          break;
        default:
          shape = `${nodeId}[${label}]`;
      }
      
      mermaid += `    ${shape}\n`;
    });

    // Add edges
    this.edges.forEach(edge => {
      const sourceId = this.sanitizeId(edge.source);
      const targetId = this.sanitizeId(edge.target);
      const sourceHandle = edge.sourceHandle;
      
      let arrow = '-->';
      let label = '';
      
      if (sourceHandle === 'yes') label = '|Yes|';
      else if (sourceHandle === 'no') label = '|No|';
      
      mermaid += `    ${sourceId} ${arrow}${label} ${targetId}\n`;
    });

    return mermaid;
  }

  private generatePlantUML(): string {
    let plantuml = '@startuml\n';
    plantuml += 'start\n';

    // Find start node
    const startNode = this.nodes.find(n => n.type === 'control-flow' && n.data.type === 'start');
    if (startNode) {
      plantuml += this.traverseWorkflow(startNode, new Set());
    }

    plantuml += 'stop\n@enduml';
    return plantuml;
  }

  private generateWorkflowLogic(language: 'javascript' | 'python' | 'typescript'): string {
    const indent = this.options.exportFormat === 'class' ? '    ' : '  ';
    let code = '';

    // Add variables initialization
    const variableNodes = this.nodes.filter(n => 
      n.type === 'sticky-note' && n.data.content && n.data.content.includes('=')
    );

    if (variableNodes.length > 0 && this.options.includeComments) {
      code += `${indent}// Initialize variables from canvas\n`;
    }

    variableNodes.forEach(node => {
      const content = node.data.content;
      const assignments = content.split('\n').filter((line: string) => line.includes('='));
      
      assignments.forEach((assignment: string) => {
        const [varName, varValue] = assignment.split('=').map((s: string) => s.trim());
        if (varName && varValue) {
          if (language === 'python') {
            code += `${indent}variables['${varName}'] = ${this.formatValue(varValue, language)}\n`;
          } else {
            code += `${indent}variables.${varName} = ${this.formatValue(varValue, language)};\n`;
          }
        }
      });
    });

    // Generate workflow execution logic
    const startNode = this.nodes.find(n => n.type === 'control-flow' && n.data.type === 'start');
    
    if (startNode) {
      if (this.options.includeComments) {
        code += `\n${indent}// Workflow execution\n`;
      }
      
      code += this.generateNodeExecution(startNode, language, indent, new Set());
    }

    // Add return statement
    const returnStatement = language === 'python' 
      ? `${indent}return {'success': True, 'variables': variables}\n`
      : language === 'typescript' && this.options.includeTypes
        ? `${indent}return { success: true, result: variables };\n`
        : `${indent}return { success: true, variables };\n`;

    code += '\n' + returnStatement;

    return code;
  }

  private generateNodeExecution(node: Node, language: string, indent: string, visited: Set<string>): string {
    if (visited.has(node.id)) return '';
    visited.add(node.id);

    let code = '';
    const terminator = language === 'python' ? '' : ';';

    if (this.options.includeComments) {
      code += `${indent}// ${node.data.label || 'Process'}\n`;
    }

    switch (node.type) {
      case 'control-flow':
        if (node.data.type === 'decision') {
          const condition = node.data.condition || 'true';
          const pythonCondition = language === 'python' 
            ? condition.replace(/&&/g, ' and ').replace(/\|\|/g, ' or ')
            : condition;

          code += `${indent}if (${pythonCondition})${language === 'python' ? ':' : ' {'}\n`;
          
          // Find yes/no paths
          const yesEdge = this.edges.find(e => e.source === node.id && e.sourceHandle === 'yes');
          const noEdge = this.edges.find(e => e.source === node.id && e.sourceHandle === 'no');
          
          if (yesEdge) {
            const nextNode = this.nodes.find(n => n.id === yesEdge.target);
            if (nextNode) {
              code += this.generateNodeExecution(nextNode, language, indent + '  ', visited);
            }
          }
          
          if (noEdge) {
            code += `${indent}${language === 'python' ? 'else:' : '} else {'}\n`;
            const nextNode = this.nodes.find(n => n.id === noEdge.target);
            if (nextNode) {
              code += this.generateNodeExecution(nextNode, language, indent + '  ', visited);
            }
            if (language !== 'python') {
              code += `${indent}}\n`;
            }
          } else if (language !== 'python') {
            code += `${indent}}\n`;
          }
        } else if (node.data.type === 'process') {
          code += `${indent}console.log("Processing: ${node.data.label}")${terminator}\n`;
          
          // Continue to next node
          const nextEdge = this.edges.find(e => e.source === node.id);
          if (nextEdge) {
            const nextNode = this.nodes.find(n => n.id === nextEdge.target);
            if (nextNode) {
              code += this.generateNodeExecution(nextNode, language, indent, visited);
            }
          }
        }
        break;

      case 'sticky-note':
        if (node.data.content) {
          const logStatement = language === 'python'
            ? `${indent}print("Note: ${node.data.content.replace(/"/g, '\\"')}")\n`
            : `${indent}console.log("Note: ${node.data.content.replace(/"/g, '\\"')}")${terminator}\n`;
          code += logStatement;
        }
        break;

      case 'text-file':
        const fileStatement = language === 'python'
          ? `${indent}print("File: ${node.data.label}")\n`
          : `${indent}console.log("File: ${node.data.label}")${terminator}\n`;
        code += fileStatement;
        break;
    }

    return code;
  }

  private traverseWorkflow(node: Node, visited: Set<string>): string {
    if (visited.has(node.id)) return '';
    visited.add(node.id);

    let plantuml = '';
    
    switch (node.type) {
      case 'control-flow':
        if (node.data.type === 'decision') {
          plantuml += `if (${node.data.condition || 'condition'}) then (yes)\n`;
          
          const yesEdge = this.edges.find(e => e.source === node.id && e.sourceHandle === 'yes');
          const noEdge = this.edges.find(e => e.source === node.id && e.sourceHandle === 'no');
          
          if (yesEdge) {
            const nextNode = this.nodes.find(n => n.id === yesEdge.target);
            if (nextNode) {
              plantuml += this.traverseWorkflow(nextNode, visited);
            }
          }
          
          if (noEdge) {
            plantuml += 'else (no)\n';
            const nextNode = this.nodes.find(n => n.id === noEdge.target);
            if (nextNode) {
              plantuml += this.traverseWorkflow(nextNode, visited);
            }
          }
          
          plantuml += 'endif\n';
        } else if (node.data.type === 'process') {
          plantuml += `:${node.data.label};\n`;
          
          const nextEdge = this.edges.find(e => e.source === node.id);
          if (nextEdge) {
            const nextNode = this.nodes.find(n => n.id === nextEdge.target);
            if (nextNode) {
              plantuml += this.traverseWorkflow(nextNode, visited);
            }
          }
        }
        break;
        
      case 'sticky-note':
        plantuml += `:Note: ${node.data.label};\n`;
        break;
        
      case 'text-file':
        plantuml += `:File: ${node.data.label};\n`;
        break;
    }

    return plantuml;
  }

  private formatValue(value: string, language: string): string {
    // Remove quotes if already quoted
    const cleaned = value.replace(/^["']|["']$/g, '');
    
    // Try to parse as number
    if (!isNaN(Number(cleaned))) {
      return cleaned;
    }
    
    // Try to parse as boolean
    if (cleaned.toLowerCase() === 'true' || cleaned.toLowerCase() === 'false') {
      return language === 'python' ? 
        (cleaned.toLowerCase() === 'true' ? 'True' : 'False') :
        cleaned.toLowerCase();
    }
    
    // Return as string
    return `"${cleaned}"`;
  }

  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9]/g, '_');
  }
}

export function generateCode(
  nodes: Node[], 
  edges: Edge[], 
  groups: NodeGroup[], 
  options: CodeGenerationOptions
): string {
  const generator = new CodeGenerator(nodes, edges, groups, options);
  return generator.generate();
} 