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

## Allow GitHub Actions to create and approve pull requests

- Go to Settings → Actions → General in your repository.
- Under "Workflow permissions", enable "Allow GitHub Actions to approve pull requests"

Done! LocaleOps can now automatically create pull requests with translation updates.

## Enable AI Translations

Add your Anthropic API key as a GitHub secret:
- Go to Settings → Secrets and variables → Actions
- Add `ANTHROPIC_API_KEY`

Done! Now when you update [src/i18n/locales/en.json](src/i18n/locales/en.json), GitHub Actions will automatically translate to other languages.

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
