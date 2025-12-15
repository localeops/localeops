# Security Policy

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in LocaleOps, please report it responsibly.

**Do not open public issues for security vulnerabilities.**

### How to Report

1. **GitHub Security Advisories (Preferred)**  
   [Report a vulnerability](https://github.com/localeops/localeops/security/advisories/new)

2. **Email**  
   Contact the maintainers directly via GitHub

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

| Action | Timeframe |
| ------ | --------- |
| Acknowledgment | Within 48 hours |
| Initial assessment | Within 7 days |
| Fix for critical issues | Within 14 days |

## Disclosure Policy

We follow coordinated disclosure:

- Please allow up to 90 days before public disclosure
- We will credit reporters in release notes (unless you prefer anonymity)
- We aim to release fixes before or simultaneously with public disclosure

## Security Measures

LocaleOps implements the following security practices:

- **Signed releases** with npm provenance attestation
- **Dependency scanning** via Dependabot
- **SAST** via CodeQL analysis
- **Pinned dependencies** in CI workflows

## Scope

This security policy applies to:

- The `@localeops/localeops` npm package
- The LocaleOps GitHub repository

### Out of Scope

- Third-party integrations or services
- Issues in dependencies (report these to the respective projects)
- Social engineering attacks