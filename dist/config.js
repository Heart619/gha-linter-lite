"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readConfig = readConfig;
exports.applyDisabledRules = applyDisabledRules;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
function readConfig(rootDir, configPath) {
    const resolvedPath = (0, node_path_1.resolve)(rootDir, configPath ?? 'gha-linter-lite.config.json');
    if (!(0, node_fs_1.existsSync)(resolvedPath)) {
        return { disabledRules: [] };
    }
    const parsed = JSON.parse((0, node_fs_1.readFileSync)(resolvedPath, 'utf8'));
    return {
        disabledRules: Array.isArray(parsed.disabledRules)
            ? parsed.disabledRules.filter((ruleId) => typeof ruleId === 'string')
            : []
    };
}
function applyDisabledRules(findings, disabledRules) {
    if (disabledRules.length === 0) {
        return findings;
    }
    const disabled = new Set(disabledRules);
    return findings.filter((finding) => !disabled.has(finding.ruleId));
}
