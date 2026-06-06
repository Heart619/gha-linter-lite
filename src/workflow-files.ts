import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

export function findWorkflowFiles(rootDir: string, workflowsPath?: string): string[] {
  const target = resolve(rootDir, workflowsPath ?? '.github/workflows');
  if (!existsSync(target)) {
    return [];
  }

  const stat = statSync(target);
  if (stat.isFile()) {
    return isWorkflowFile(target) ? [target] : [];
  }

  if (!stat.isDirectory()) {
    return [];
  }

  return readdirSync(target)
    .filter(isWorkflowFile)
    .map((name) => join(target, name))
    .sort();
}

function isWorkflowFile(value: string): boolean {
  return value.endsWith('.yml') || value.endsWith('.yaml');
}
