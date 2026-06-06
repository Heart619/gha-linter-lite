import type { Report } from './types';

export function renderText(report: Report): string {
  const lines = [
    'GHA Linter Lite',
    `Workflow files: ${report.summary.fileCount}`,
    `Warnings: ${report.summary.warningCount}`,
    `Errors: ${report.summary.errorCount}`
  ];

  if (report.findings.length > 0) {
    lines.push('', 'Findings:');
    for (const finding of report.findings) {
      lines.push(
        `- [${finding.severity}] ${finding.ruleId} ${finding.filePath}:${finding.line} ${finding.message}`
      );
    }
  }

  return `${lines.join('\n')}\n`;
}

export function renderJson(report: Report): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

export function renderMarkdown(report: Report): string {
  const lines = [
    '# GHA Linter Lite',
    '',
    `- Workflow files: ${report.summary.fileCount}`,
    `- Warnings: ${report.summary.warningCount}`,
    `- Errors: ${report.summary.errorCount}`,
    ''
  ];

  if (report.findings.length === 0) {
    lines.push('No findings.');
    return `${lines.join('\n')}\n`;
  }

  lines.push('| Severity | Rule | Location | Message |', '| --- | --- | --- | --- |');
  for (const finding of report.findings) {
    lines.push(
      `| ${finding.severity} | ${finding.ruleId} | ${finding.filePath}:${finding.line} | ${escapeCell(
        finding.message
      )} |`
    );
  }

  return `${lines.join('\n')}\n`;
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, '\\|');
}
