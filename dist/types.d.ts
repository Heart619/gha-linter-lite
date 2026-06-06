export type Severity = 'error' | 'warning';
export type OutputFormat = 'text' | 'json' | 'markdown';
export type FailOn = 'error' | 'warning' | 'none';
export interface LintOptions {
    rootDir: string;
    workflowsPath?: string;
    configPath?: string;
}
export interface Finding {
    ruleId: string;
    severity: Severity;
    message: string;
    filePath: string;
    line: number;
    jobId?: string;
    value?: string;
}
export interface Summary {
    fileCount: number;
    warningCount: number;
    errorCount: number;
}
export interface Report {
    rootDir: string;
    workflowFiles: string[];
    summary: Summary;
    findings: Finding[];
}
export interface LinterConfig {
    disabledRules: string[];
}
