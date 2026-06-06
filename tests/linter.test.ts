import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { lintWorkflows } from '../src/index';

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), 'gha-linter-lite-'));
  mkdirSync(join(root, '.github', 'workflows'), { recursive: true });
  return root;
}

describe('lintWorkflows', () => {
  test('flags workflows without explicit permissions and jobs without timeout', () => {
    const root = fixture();
    try {
      writeFileSync(
        join(root, '.github', 'workflows', 'ci.yml'),
        [
          'name: CI',
          'on: pull_request',
          'jobs:',
          '  test:',
          '    runs-on: ubuntu-latest',
          '    steps:',
          '      - uses: actions/checkout@v4',
          '      - run: npm test'
        ].join('\n')
      );

      const report = lintWorkflows({ rootDir: root });

      expect(report.summary.warningCount).toBe(2);
      expect(report.findings.map((finding) => finding.ruleId)).toEqual([
        'missing-workflow-permissions',
        'missing-job-timeout'
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('flags actions that use floating refs', () => {
    const root = fixture();
    try {
      writeFileSync(
        join(root, '.github', 'workflows', 'release.yml'),
        [
          'name: Release',
          'on: push',
          'permissions:',
          '  contents: read',
          'jobs:',
          '  release:',
          '    runs-on: ubuntu-latest',
          '    timeout-minutes: 10',
          '    steps:',
          '      - uses: owner/action@main',
          '      - uses: another/action'
        ].join('\n')
      );

      const report = lintWorkflows({ rootDir: root });

      expect(report.summary.warningCount).toBe(2);
      expect(report.findings).toMatchObject([
        {
          ruleId: 'floating-action-ref',
          line: 10,
          value: 'owner/action@main'
        },
        {
          ruleId: 'missing-action-ref',
          line: 11,
          value: 'another/action'
        }
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('passes a workflow with explicit permissions, timeout, and stable action refs', () => {
    const root = fixture();
    try {
      writeFileSync(
        join(root, '.github', 'workflows', 'ci.yml'),
        [
          'name: CI',
          'on: pull_request',
          'permissions:',
          '  contents: read',
          'jobs:',
          '  test:',
          '    runs-on: ubuntu-latest',
          '    timeout-minutes: 15',
          '    steps:',
          '      - uses: actions/checkout@v4',
          '      - run: npm test'
        ].join('\n')
      );

      const report = lintWorkflows({ rootDir: root });

      expect(report.summary).toEqual({
        fileCount: 1,
        warningCount: 0,
        errorCount: 0
      });
      expect(report.findings).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('skips findings for rules disabled in config', () => {
    const root = fixture();
    try {
      writeFileSync(
        join(root, '.github', 'workflows', 'ci.yml'),
        [
          'name: CI',
          'on: pull_request',
          'jobs:',
          '  test:',
          '    runs-on: ubuntu-latest',
          '    steps:',
          '      - uses: actions/checkout@v4'
        ].join('\n')
      );
      writeFileSync(
        join(root, 'gha-linter-lite.config.json'),
        JSON.stringify({ disabledRules: ['missing-job-timeout'] }, null, 2)
      );

      const report = lintWorkflows({ rootDir: root });

      expect(report.summary.warningCount).toBe(1);
      expect(report.findings.map((finding) => finding.ruleId)).toEqual([
        'missing-workflow-permissions'
      ]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  test('does not require refs for local action paths', () => {
    const root = fixture();
    try {
      writeFileSync(
        join(root, '.github', 'workflows', 'dogfood.yml'),
        [
          'name: Dogfood',
          'on: pull_request',
          'permissions:',
          '  contents: read',
          'jobs:',
          '  dogfood:',
          '    runs-on: ubuntu-latest',
          '    timeout-minutes: 10',
          '    steps:',
          '      - uses: actions/checkout@v4',
          '      - uses: ./'
        ].join('\n')
      );

      const report = lintWorkflows({ rootDir: root });

      expect(report.findings).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
