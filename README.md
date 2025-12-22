# LocaleOps

> **Looking for Early Adopters!** We're searching for teams who want to streamline their translation workflow. If you're interested, we're happy to help you set it up. [Start a discussion](https://github.com/localeops/localeops/discussions) or reach out!

LocaleOps is a Git-native utility for managing translations directly inside your codebase. It sits between your locale files and your translation provider - human translators, agencies, or AI.

LocaleOps is **not** a translation platform. It doesn't store your strings in a proprietary database or force you into a web UI. Instead, it makes your existing workflow - **Git, pull requests, CI, automation** - work naturally for translations.

## Why LocaleOps Exists

Most tools fit into one of two categories:

### 1. Framework utilities (e.g., i18next tools)
They can extract untranslated strings and check missing keys, but:
- They do not track changes to existing strings.
- They do not detect stale translations.
- They provide no diffs.
- Any change made by developers can invalidate translations already in progress.

This leaves teams manually tracking what changed - a painful and error-prone process.

### 2. Translation management systems
Comprehensive, but:
- They introduce vendor lock-in.
- Strings live outside your repo.
- You import/export through their UI.
- Switching providers becomes difficult.
- They are often overkill and expensive.
- They require onboarding non-technical managers.

### LocaleOps: the middle layer

LocaleOps keeps your locale files in Git and automates the tedious parts:
- Diffing string changes
- Detecting stale or outdated translations
- Generating translation extraction sets
- Opening pull requests with translation changes
- Writing translated strings back into your repo

You remain fully in control of the translation provider, workflow, and file formats.

## How LocaleOps Works

```
main branch update
      │
      ├──▶ localeops extract (snapshot + diff)
      │
      ├──▶ send to translator / AI
      │
      ├──▶ receive translated output
      │
      ├──▶ localeops apply (update locale files + snapshot)
      │
      └──▶ PR with updated translations
```

LocaleOps provides two core commands:

### `localeops extract`
Detects:
- New strings
- Changed strings

Outputs a structured JSON file (the translation delta) that you send to your translation provider.

### `localeops apply`
Takes completed translations and writes them into your locale files, creating commits or pull requests.

## Provider-Agnostic by Design

LocaleOps simply produces JSON. From there, you control the workflow:
- Send JSON to a translation agency  
- Translate via an LLM  
- Convert to CSV/Excel  
- Pipe into your own API  
- Store or transform it however you want  

Because LocaleOps is open source and format-agnostic, you can fully customize how translations move through your stack.

## Workflow Flexibility: Synchronous & Asynchronous

LocaleOps doesn’t enforce a specific workflow - developers decide how automation works.

### Synchronous workflow (single step)
You can:
1. Run `localeops extract`
2. Send the JSON to an AI translator
3. Receive translations
4. Run `localeops apply`

All inside a single GitHub Action job. Ideal for fully automated, continuous translation pipelines.

### Asynchronous workflow (multi-step)
You can also:
1. Run `localeops extract` in CI
2. Send JSON to your own API, external service, or human translators
3. Trigger a second workflow (or API callback) later
4. Run `localeops apply` when translations are ready

Perfect for human review cycles, batching, or custom internal processes.

### No extra servers required
LocaleOps can run entirely inside CI/CD pipelines and GitHub Actions, so if you don't want to manage infrastructure, you don't have to.