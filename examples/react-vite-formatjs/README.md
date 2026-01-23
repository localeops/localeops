# LocaleOps FormatJS Example

Ready-to-use React + Vite + FormatJS starter with AI-powered translations.

## Quick Start

Copy this example to start your project:

```bash
# Download just this example folder
npx degit localeops/localeops/examples/react-vite-formatjs my-project
cd my-project

# Install and run
npm install
npm run dev
```

## Setup Instructions

Before using LocaleOps with CI/CD automation:

1. **Uncomment VCS source configuration** in [localeops.yml](localeops.yml):
   - Find the ready-to-use VCS-specific source section (commented out)
   - Uncomment the section for your VCS provider (GitHub, Bitbucket, GitLab, etc.)

2. **Follow setup instructions** in your VCS-specific workflow file:
   - **GitHub Actions**: See [.github/workflows/localeops.ai.yml](.github/workflows/localeops.ai.yml)
   - **Bitbucket Pipelines**: See [bitbucket-pipelines.yml](bitbucket-pipelines.yml)
   - **GitLab Pipelines**: See [.gitlab-ci.yml](.gitlab-ci.yml)

> **Note:** This example includes CI pipeline files for multiple VCS providers. If you're using a specific VCS, you can delete the unused CI pipeline files for other providers.

## What's Included

- React 19 + TypeScript + Vite
- FormatJS (react-intl) configured with English and Spanish
- Language switcher component
- [AI translation workflow](.github/workflows/localeops.ai.yml) via Claude
- [LocaleOps config](localeops.yml) ready to use

## Customization

To add more languages, edit [localeops.yml](localeops.yml):
```yaml
targetLocales:
  - es
  - fr
  - de
```
