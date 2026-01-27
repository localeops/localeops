<div align="center">
  <h1>LocaleOps</h1>
  <p>Git-native translation workflow automation for i18n projects</p>

  <p>
    <a href="https://localeops.com"><strong>Documentation</strong></a> ·
    <a href="https://github.com/localeops/localeops/discussions"><strong>Discussions</strong></a>
  </p>

  <p>
    <a href="https://www.npmjs.com/package/@localeops/localeops">
      <img src="https://img.shields.io/npm/v/@localeops/localeops.svg" alt="npm version">
    </a>
    <a href="https://github.com/localeops/localeops/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="License">
    </a>
  </p>
</div>


> **Looking for Early Adopters!** We're searching for teams who want to streamline their translation workflow. If you're interested, we're happy to help you set it up. [Start a discussion](https://github.com/localeops/localeops/discussions) or reach out!

## Setup Guide

### For New Projects

1. **Start from a Template:**
  - Use one of the ready-to-use starter templates:
    - [React + Vite + i18next](examples/react-vite-i18next)
    - [React + Vite + FormatJS](examples/react-vite-formatjs)
  - Or create a new project and follow the steps below.

2. **Install LocaleOps:**
  ```bash
  npm install -g @localeops/localeops
  ```

3. **Add a `localeops.yml` config file** to your project root. See the [localeops.yml reference](localeops.yml) for configuration options.

4. **Initialize your locale files** (e.g., `./locales/en/translation.json`, `./locales/es/translation.json`).

5. **Run the core commands:**
  - `localeops sync` — Create initial snapshots for all target locales
  - `localeops extract` — Find new/changed strings
  - `localeops apply <translations-json>` — Apply translations and update your repo

6. **Automate with CI/CD (optional):**
  - See example workflows for [GitHub Actions](examples/actions/github/localeops.ai.yml), [Bitbucket Pipelines](examples/actions/bitbucket/bitbucket-pipelines.yml), or [GitLab CI](examples/actions/gitlab/.gitlab-ci.yml).

---

### For Existing Projects

1. **Install LocaleOps:**
  ```bash
  npm install -g @localeops/localeops
  ```

2. **Add a `localeops.yml` config file** to your project root. Use your current i18n framework and locale file structure. See the [localeops.yml reference](localeops.yml) for configuration options.

3. **Configure your source and target locales** in `localeops.yml`.

4. **Run an initial sync:**
  ```bash
  localeops sync
  ```
  > **Note:** The `sync` command always treats all existing target locale translations as up-to-date. Here, "stale" translations are entries where the source string has changed meaning or wording, but the translation was never updated. Before your first sync, review recent source-string changes (for example, by checking your Git diff or PR history) and either update or remove the corresponding translations you know are no longer correct. If you're unsure, it's safer to clear obviously outdated translations so LocaleOps can detect and track fresh changes from that point onward

5. **Integrate into your workflow:**
  - Use `localeops extract` to find new/changed strings after source edits.
  - Send extracted JSON to your translation provider (AI, agency, or human).
  - Use `localeops apply <translations-json>` to update translations and create PRs.

6. **Automate with CI/CD (optional):**
  - See [examples](#examples) for ready-to-use pipeline files for GitHub, Bitbucket, and GitLab.

---

LocaleOps prevents wasted translation work by tracking what changed in your source language and detecting when existing translations become stale - all while keeping your strings in Git instead of a vendor's database.

**The problem:** When developers change source strings (e.g., "Submit Form" → "Submit Your Application"), existing translations become wrong, but most tools don't detect this. Teams waste money re-translating or ship incorrect translations.

**The solution:** LocaleOps snapshots your source language after each translation, then diffs against it to detect exactly what changed. No vendor lock-in, no external database - everything stays in Git.

**[Read the full documentation →](https://localeops.com)**

## Key Features

- **Git-Native**: Translations stay in your repository under version control
- **Framework Support**: Works with i18next, FormatJS, and custom parsers
- **Provider Agnostic**: Use any translation service (AI, human, or agency)
- **Change Detection**: Automatically detects new and modified strings
- **Pull Request Automation**: Creates PRs for translation updates
- **CI/CD Ready**: Runs entirely in GitHub Actions or any CI pipeline

## Examples

- [React + Vite + i18next](examples/react-vite-i18next)
- [React + Vite + FormatJS](examples/react-vite-formatjs)

## Community

- [Documentation](https://localeops.com)
- [Discussions](https://github.com/localeops/localeops/discussions)

## License

Apache 2.0