#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { lintWorkflows, renderJson, renderMarkdown, renderText } from './index';
import type { FailOn, OutputFormat } from './types';

interface CliOptions {
  rootDir: string;
  workflowsPath?: string;
  configPath?: string;
  format: OutputFormat;
  output?: string;
  failOn: FailOn;
}

const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8')) as {
  version: string;
};

export function run(argv: string[], env: NodeJS.ProcessEnv = process.env): number {
  try {
    const options = parseArgs(argv, env);
    const report = lintWorkflows({
      rootDir: options.rootDir,
      workflowsPath: options.workflowsPath,
      configPath: options.configPath
    });
    const rendered = render(report, options.format);

    if (options.output) {
      writeFileSync(options.output, rendered);
    } else {
      process.stdout.write(rendered);
    }

    if (env.GITHUB_STEP_SUMMARY) {
      writeFileSync(env.GITHUB_STEP_SUMMARY, renderMarkdown(report), { flag: 'a' });
    }

    return shouldFail(report.summary, options.failOn) ? 1 : 0;
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    return 2;
  }
}

function parseArgs(argv: string[], env: NodeJS.ProcessEnv): CliOptions {
  const options: CliOptions = {
    rootDir: env.INPUT_PATH || process.cwd(),
    workflowsPath: env.INPUT_WORKFLOWS || undefined,
    configPath: env.INPUT_CONFIG || undefined,
    format: parseFormat(env.INPUT_FORMAT || 'text'),
    failOn: parseFailOn(env.INPUT_FAIL_ON || 'warning')
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help' || arg === '-h') {
      process.stdout.write(helpText());
      process.exit(0);
    }
    if (arg === '--version' || arg === '-v') {
      process.stdout.write(`${packageJson.version}\n`);
      process.exit(0);
    }
    if (arg === '--workflows') {
      options.workflowsPath = readRequiredValue(argv, (index += 1), '--workflows');
      continue;
    }
    if (arg === '--config') {
      options.configPath = readRequiredValue(argv, (index += 1), '--config');
      continue;
    }
    if (arg === '--format') {
      options.format = parseFormat(readRequiredValue(argv, (index += 1), '--format'));
      continue;
    }
    if (arg === '--output') {
      options.output = readRequiredValue(argv, (index += 1), '--output');
      continue;
    }
    if (arg === '--fail-on') {
      options.failOn = parseFailOn(readRequiredValue(argv, (index += 1), '--fail-on'));
      continue;
    }
    if (arg?.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    }
    options.rootDir = arg ?? options.rootDir;
  }

  return options;
}

function readRequiredValue(argv: string[], index: number, flag: string): string {
  const value = argv[index];
  if (!value) {
    throw new Error(`Missing value for ${flag}`);
  }
  return value;
}

function parseFormat(value: string): OutputFormat {
  if (value === 'text' || value === 'json' || value === 'markdown') {
    return value;
  }
  throw new Error(`Unsupported format "${value}". Expected text, json, or markdown.`);
}

function parseFailOn(value: string): FailOn {
  if (value === 'error' || value === 'warning' || value === 'none') {
    return value;
  }
  throw new Error(`Unsupported fail-on value "${value}". Expected error, warning, or none.`);
}

function render(report: ReturnType<typeof lintWorkflows>, format: OutputFormat): string {
  if (format === 'json') {
    return renderJson(report);
  }
  if (format === 'markdown') {
    return renderMarkdown(report);
  }
  return renderText(report);
}

function shouldFail(summary: ReturnType<typeof lintWorkflows>['summary'], failOn: FailOn): boolean {
  if (failOn === 'none') {
    return false;
  }
  if (failOn === 'error') {
    return summary.errorCount > 0;
  }
  return summary.errorCount > 0 || summary.warningCount > 0;
}

function helpText(): string {
  return [
    'Usage: gha-linter-lite [path] [--workflows .github/workflows] [--config config.json] [--format text|json|markdown]',
    '',
    'Lightweight static checks for GitHub Actions workflow maintenance risks.',
    ''
  ].join('\n');
}

if (require.main === module) {
  process.exitCode = run(process.argv.slice(2));
}
