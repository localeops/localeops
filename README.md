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

---

> **Looking for Early Adopters!** We're searching for teams who want to streamline their translation workflow. If you're interested, we're happy to help you set it up. [Start a discussion](https://github.com/localeops/localeops/discussions) or reach out!

LocaleOps prevents wasted translation work by tracking what changed in your source language and detecting when existing translations become stale - all while keeping your strings in Git instead of a vendor's database.

**The problem:** When developers change source strings (e.g., "Submit Form" → "Submit Your Application"), existing translations become wrong, but most tools don't detect this. Teams waste money re-translating or ship incorrect translations.

**The solution:** LocaleOps snapshots your source language after each translation, then diffs against it to detect exactly what changed. No vendor lock-in, no external database - everything stays in Git.

**[📚 Read the full documentation →](https://localeops.com)**

## Quick Start

```bash
npm install -g @localeops/localeops
```

Create a `localeops.yml` config file:

```yaml
framework:
  name: i18next
  locale: en
  directory: ./locales

database:
  adapter:
    name: file

source:
  name: github
  base: main
  repo: your-org/your-repo
  token: ${GITHUB_TOKEN}

locales:
  - es
  - fr
```

Then run:

```bash
# Extract untranslated strings
localeops extract

# Send to translation provider (AI, human, or agency)

# Apply translations and create PR
localeops apply <translations-json>
```

## Key Features

- **Git-Native**: Translations stay in your repository under version control
- **Framework Support**: Works with i18next, FormatJS, and custom parsers
- **Provider Agnostic**: Use any translation service (AI, human, or agency)
- **Change Detection**: Automatically detects new and modified strings
- **Pull Request Automation**: Creates PRs for translation updates
- **CI/CD Ready**: Runs entirely in GitHub Actions or any CI pipeline

## Examples

- [i18next Example](examples/i18next)
- [FormatJS Example](examples/formatjs)

## Community

- [Documentation](https://localeops.com)
- [Discussions](https://github.com/localeops/localeops/discussions)

## License

Apache 2.0