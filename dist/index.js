"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderText = exports.renderMarkdown = exports.renderJson = void 0;
exports.lintWorkflows = lintWorkflows;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const yaml_1 = require("yaml");
const rules_1 = require("./rules");
const workflow_files_1 = require("./workflow-files");
var reporters_1 = require("./reporters");
Object.defineProperty(exports, "renderJson", { enumerable: true, get: function () { return reporters_1.renderJson; } });
Object.defineProperty(exports, "renderMarkdown", { enumerable: true, get: function () { return reporters_1.renderMarkdown; } });
Object.defineProperty(exports, "renderText", { enumerable: true, get: function () { return reporters_1.renderText; } });
function lintWorkflows(options) {
    const rootDir = (0, node_path_1.resolve)(options.rootDir);
    const workflowFiles = (0, workflow_files_1.findWorkflowFiles)(rootDir, options.workflowsPath);
    const findings = [];
    for (const filePath of workflowFiles) {
        const content = (0, node_fs_1.readFileSync)(filePath, 'utf8');
        try {
            const parsed = (0, yaml_1.parse)(content);
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
            findings.push(...(0, rules_1.lintWorkflowDocument)(filePath, content, parsed));
        }
        catch (error) {
            findings.push({
                ruleId: 'workflow-parse-error',
                severity: 'error',
                message: error instanceof Error ? error.message : String(error),
                filePath,
                line: 1
            });
        }
    }
    return {
        rootDir,
        workflowFiles,
        findings,
        summary: {
            fileCount: workflowFiles.length,
            warningCount: findings.filter((finding) => finding.severity === 'warning').length,
            errorCount: findings.filter((finding) => finding.severity === 'error').length
        }
    };
}
