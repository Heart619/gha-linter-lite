# GHA Linter Lite

[![CI](https://github.com/Heart619/gha-linter-lite/actions/workflows/ci.yml/badge.svg)](https://github.com/Heart619/gha-linter-lite/actions/workflows/ci.yml)
[![Dogfood](https://github.com/Heart619/gha-linter-lite/actions/workflows/dogfood.yml/badge.svg)](https://github.com/Heart619/gha-linter-lite/actions/workflows/dogfood.yml)
[![Release](https://img.shields.io/github/v/release/Heart619/gha-linter-lite)](https://github.com/Heart619/gha-linter-lite/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Small static checks for GitHub Actions workflow maintenance risks. It is designed for maintainers who want a fast CI guard without adopting a large policy framework.

This tool complements, not replaces, full workflow validators.

## Install

```sh
npm install --save-dev gha-linter-lite
```

## CLI

```sh
npx gha-linter-lite .
npx gha-linter-lite . --format json
npx gha-linter-lite . --config gha-linter-lite.config.json
npx gha-linter-lite . --format markdown --fail-on none
```

For local development:

```sh
npm run check
node dist/cli.js . --format markdown
```

## GitHub Action

```yaml
name: Workflow lint

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  gha-linter-lite:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: Heart619/gha-linter-lite@v0.1.1
        with:
          path: .
          format: markdown
          fail-on: warning
```

## Rules

- `missing-workflow-permissions`: workflow should declare top-level `permissions`.
- `missing-job-timeout`: every job should set `timeout-minutes`.
- `missing-action-ref`: every action reference should include an explicit `@ref`.
- `floating-action-ref`: `@main`, `@master`, and `@latest` are treated as floating refs.

## Config

Create `gha-linter-lite.config.json` to disable selected rules:

```json
{
  "disabledRules": [
    "missing-job-timeout"
  ]
}
```

## Output Formats

- `text`: terminal output.
- `json`: structured report for automation.
- `markdown`: job summaries or pull request comments.

## Exit Behavior

`--fail-on warning` is the default. Use `--fail-on error` or `--fail-on none` when introducing the tool to an existing repository.

## Development

```sh
npm install
npm test
npm run lint
npm run build
```

Planned work is tracked in [docs/roadmap.md](docs/roadmap.md).
