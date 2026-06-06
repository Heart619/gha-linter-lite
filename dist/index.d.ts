import type { LintOptions, Report } from './types';
export type { FailOn, Finding, LintOptions, OutputFormat, Report, Severity, Summary } from './types';
export { renderJson, renderMarkdown, renderText } from './reporters';
export declare function lintWorkflows(options: LintOptions): Report;
