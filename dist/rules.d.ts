import type { Finding } from './types';
type WorkflowMap = Record<string, unknown>;
export declare function lintWorkflowDocument(filePath: string, content: string, workflow: WorkflowMap): Finding[];
export {};
