"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findWorkflowFiles = findWorkflowFiles;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
function findWorkflowFiles(rootDir, workflowsPath) {
    const target = (0, node_path_1.resolve)(rootDir, workflowsPath ?? '.github/workflows');
    if (!(0, node_fs_1.existsSync)(target)) {
        return [];
    }
    const stat = (0, node_fs_1.statSync)(target);
    if (stat.isFile()) {
        return isWorkflowFile(target) ? [target] : [];
    }
    if (!stat.isDirectory()) {
        return [];
    }
    return (0, node_fs_1.readdirSync)(target)
        .filter(isWorkflowFile)
        .map((name) => (0, node_path_1.join)(target, name))
        .sort();
}
function isWorkflowFile(value) {
    return value.endsWith('.yml') || value.endsWith('.yaml');
}
