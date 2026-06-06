import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Finding, LinterConfig } from './types';

export function readConfig(rootDir: string, configPath?: string): LinterConfig {
  const resolvedPath = resolve(rootDir, configPath ?? 'gha-linter-lite.config.json');
  if (!existsSync(resolvedPath)) {
    return { disabledRules: [] };
  }

  const parsed = JSON.parse(readFileSync(resolvedPath, 'utf8')) as Partial<LinterConfig>;
  return {
    disabledRules: Array.isArray(parsed.disabledRules)
      ? parsed.disabledRules.filter((ruleId) => typeof ruleId === 'string')
      : []
  };
}

export function applyDisabledRules(findings: Finding[], disabledRules: string[]): Finding[] {
  if (disabledRules.length === 0) {
    return findings;
  }

  const disabled = new Set(disabledRules);
  return findings.filter((finding) => !disabled.has(finding.ruleId));
}
