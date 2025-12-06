# LocaleOps

LocaleOps is a Git-native utility for managing translations in your codebase. It sits between your locale files and your translation provider - human translators, agencies, or AI.

It's not a translation platform. It doesn't lock your strings in a proprietary database or force translators into a web UI. It's a utility that makes your existing workflow - git, PRs, CI - work for translations.

## Why it exists

Most translation tools fall into two camps:

### Framework utilities
Extract strings and check for missing keys. Useful, but limited. You're left handling change tracking, translator sync, updates, and automation yourself.

### Translation management systems
Handle everything but your strings live in their platform. You import/export through their dashboard. Your workflow bends to their model. Great until you need to switch providers or do something unsupported.

### LocaleOps is the middle layer

Your locale files stay in git. You choose your translation provider. LocaleOps handles the tedious parts - diffing, staleness detection, branching, committing, opening PRs - so translations flow through your repo like any other code change.

## How it works

- `localeops extract` — Detect what changed, output for translation
- `localeops apply` — Write to locale files, commit to your repo

You control how strings reach your translation provider - send to an agency, pipe to AI, upload to a spreadsheet.

## What you get

- Detection of new, changed, and removed strings
- Git-native workflow with branches, commits, and pull requests
- Provider-agnostic - works with any translation service or process
- Extensible - add support for new frameworks or storage
- No proprietary formats, no vendor lock-in