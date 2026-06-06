# GHA Linter Lite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a lightweight GitHub Actions workflow linter with CLI, Action metadata, tests, and docs.

**Architecture:** Workflow discovery feeds YAML documents into focused rule functions. Reports are rendered as text, JSON, or Markdown. The CLI and GitHub Action share the same library API.

**Tech Stack:** TypeScript, Node.js, yaml, Vitest, ESLint, GitHub Actions.

---

### Task 1: Workflow Rules

**Files:**
- Create: `src/workflow-files.ts`
- Create: `src/rules.ts`
- Create: `src/index.ts`
- Test: `tests/linter.test.ts`

- [x] Write failing tests for missing permissions, missing job timeout, and action refs.
- [x] Implement file discovery and YAML rule execution.
- [x] Run `npm test`.

### Task 2: CLI And Reports

**Files:**
- Create: `src/cli.ts`
- Create: `src/reporters.ts`

- [x] Add text, JSON, and Markdown renderers.
- [x] Add CLI flags for path, workflow path, output format, output file, and fail threshold.
- [x] Run `npm run build`.

### Task 3: Maintainer Surface

**Files:**
- Create: `README.md`
- Create: `action.yml`
- Create: `.github/workflows/ci.yml`
- Create: `.github/ISSUE_TEMPLATE/*`
- Create: `.github/pull_request_template.md`

- [x] Document rules, usage, and non-goals.
- [x] Add CI and GitHub Action metadata.
- [x] Run `npm run check`.
