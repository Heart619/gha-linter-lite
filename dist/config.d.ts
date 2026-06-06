import type { Finding, LinterConfig } from './types';
export declare function readConfig(rootDir: string, configPath?: string): LinterConfig;
export declare function applyDisabledRules(findings: Finding[], disabledRules: string[]): Finding[];
