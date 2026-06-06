"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lintWorkflowDocument = lintWorkflowDocument;
const floatingRefs = new Set(['main', 'master', 'latest']);
function lintWorkflowDocument(filePath, content, workflow) {
    const findings = [];
    if (!Object.prototype.hasOwnProperty.call(workflow, 'permissions')) {
        findings.push({
            ruleId: 'missing-workflow-permissions',
            severity: 'warning',
            message: 'Workflow should declare top-level permissions explicitly.',
            filePath,
            line: 1
        });
    }
    const jobs = asRecord(workflow.jobs);
    if (!jobs) {
        findings.push({
            ruleId: 'missing-jobs',
            severity: 'error',
            message: 'Workflow does not define a jobs map.',
            filePath,
            line: findLine(content, 'jobs:') || 1
        });
        return findings;
    }
    for (const [jobId, rawJob] of Object.entries(jobs)) {
        const job = asRecord(rawJob);
        if (!job) {
            continue;
        }
        if (!Object.prototype.hasOwnProperty.call(job, 'timeout-minutes')) {
            findings.push({
                ruleId: 'missing-job-timeout',
                severity: 'warning',
                message: `Job "${jobId}" should set timeout-minutes.`,
                filePath,
                line: findLine(content, `${jobId}:`) || 1,
                jobId
            });
        }
        const steps = Array.isArray(job.steps) ? job.steps : [];
        for (const rawStep of steps) {
            const step = asRecord(rawStep);
            if (!step || typeof step.uses !== 'string') {
                continue;
            }
            const uses = step.uses;
            if (uses.startsWith('./') || uses.startsWith('../')) {
                continue;
            }
            if (!uses.includes('@')) {
                findings.push({
                    ruleId: 'missing-action-ref',
                    severity: 'warning',
                    message: `Action "${uses}" should include an explicit ref.`,
                    filePath,
                    line: findLine(content, `uses: ${uses}`) || 1,
                    jobId,
                    value: uses
                });
                continue;
            }
            const ref = uses.slice(uses.lastIndexOf('@') + 1);
            if (floatingRefs.has(ref)) {
                findings.push({
                    ruleId: 'floating-action-ref',
                    severity: 'warning',
                    message: `Action "${uses}" uses floating ref "${ref}".`,
                    filePath,
                    line: findLine(content, `uses: ${uses}`) || 1,
                    jobId,
                    value: uses
                });
            }
        }
    }
    return findings;
}
function asRecord(value) {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value
        : undefined;
}
function findLine(content, needle) {
    const index = content.split(/\r?\n/).findIndex((line) => line.includes(needle));
    return index >= 0 ? index + 1 : undefined;
}
