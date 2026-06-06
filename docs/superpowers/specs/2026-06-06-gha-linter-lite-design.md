# GHA Linter Lite Design

## Assumptions

- The first release should be static-only and should not run workflow steps.
- The tool should catch common maintenance risks with low setup cost.
- Findings should be reportable in terminal, JSON, Markdown, and GitHub job summaries.

## Approach

The linter discovers workflow YAML files, parses them, and applies small independent rules. Each rule returns findings with a rule id, severity, location, and message. A CLI and JavaScript Action share the same library entrypoint.

## Initial Rules

- Top-level workflow permissions should be explicit.
- Jobs should set `timeout-minutes`.
- Actions should include a ref and avoid obvious floating refs.

## Verification

Vitest covers rule behavior with fixture workflow files. CI runs tests, lint, TypeScript build, and a CLI smoke test.
