import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { applyDisabledRules, readConfig } from './config';
import { lintWorkflowDocument } from './rules';
import type { Finding, LintOptions, Report } from './types';
import { findWorkflowFiles } from './workflow-files';

export type { FailOn, Finding, LintOptions, OutputFormat, Report, Severity, Summary } from './types';
export { renderJson, renderMarkdown, renderText } from './reporters';

export function lintWorkflows(options: LintOptions): Report {
  const rootDir = resolve(options.rootDir);
  const workflowFiles = findWorkflowFiles(rootDir, options.workflowsPath);
  const findings: Finding[] = [];

  for (const filePath of workflowFiles) {
    const content = readFileSync(filePath, 'utf8');
    try {
      const parsed = parse(content) as unknown;
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        findings.push({
          ruleId: 'invalid-workflow-document',
          severity: 'error',
          message: 'Workflow document must be a YAML map.',
          filePath,
          line: 1
        });
        continue;
      }

      findings.push(...lintWorkflowDocument(filePath, content, parsed as Record<string, unknown>));
    } catch (error) {
      findings.push({
        ruleId: 'workflow-parse-error',
        severity: 'error',
        message: error instanceof Error ? error.message : String(error),
        filePath,
        line: 1
      });
    }
  }

  const config = readConfig(rootDir, options.configPath);
  const filteredFindings = applyDisabledRules(findings, config.disabledRules);

  return {
    rootDir,
    workflowFiles,
    findings: filteredFindings,
    summary: {
      fileCount: workflowFiles.length,
      warningCount: filteredFindings.filter((finding) => finding.severity === 'warning').length,
      errorCount: filteredFindings.filter((finding) => finding.severity === 'error').length
    }
  };
}
