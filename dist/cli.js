#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = run;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const index_1 = require("./index");
const packageJson = JSON.parse((0, node_fs_1.readFileSync)((0, node_path_1.join)(__dirname, '..', 'package.json'), 'utf8'));
function run(argv, env = process.env) {
    try {
        const options = parseArgs(argv, env);
        const report = (0, index_1.lintWorkflows)({
            rootDir: options.rootDir,
            workflowsPath: options.workflowsPath,
            configPath: options.configPath
        });
        const rendered = render(report, options.format);
        if (options.output) {
            (0, node_fs_1.writeFileSync)(options.output, rendered);
        }
        else {
            process.stdout.write(rendered);
        }
        if (env.GITHUB_STEP_SUMMARY) {
            (0, node_fs_1.writeFileSync)(env.GITHUB_STEP_SUMMARY, (0, index_1.renderMarkdown)(report), { flag: 'a' });
        }
        return shouldFail(report.summary, options.failOn) ? 1 : 0;
    }
    catch (error) {
        process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
        return 2;
    }
}
function parseArgs(argv, env) {
    const options = {
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
function readRequiredValue(argv, index, flag) {
    const value = argv[index];
    if (!value) {
        throw new Error(`Missing value for ${flag}`);
    }
    return value;
}
function parseFormat(value) {
    if (value === 'text' || value === 'json' || value === 'markdown') {
        return value;
    }
    throw new Error(`Unsupported format "${value}". Expected text, json, or markdown.`);
}
function parseFailOn(value) {
    if (value === 'error' || value === 'warning' || value === 'none') {
        return value;
    }
    throw new Error(`Unsupported fail-on value "${value}". Expected error, warning, or none.`);
}
function render(report, format) {
    if (format === 'json') {
        return (0, index_1.renderJson)(report);
    }
    if (format === 'markdown') {
        return (0, index_1.renderMarkdown)(report);
    }
    return (0, index_1.renderText)(report);
}
function shouldFail(summary, failOn) {
    if (failOn === 'none') {
        return false;
    }
    if (failOn === 'error') {
        return summary.errorCount > 0;
    }
    return summary.errorCount > 0 || summary.warningCount > 0;
}
function helpText() {
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
