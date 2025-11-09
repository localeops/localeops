# LocaleOps Project Documentation

> **IMPORTANT FOR AI AGENTS:** This document describes the architecture, design decisions, and patterns used in LocaleOps. You MUST update this document whenever you make changes to:
> - Architecture or design patterns
> - Key technical decisions
> - Project structure (new directories, major refactoring)
> - Configuration schema
> - API endpoints or contracts
> - Core concepts or workflows
>
> Keep this document synchronized with the codebase so future AI agents have accurate context.

## Overview

LocaleOps is a translation management system that tracks translation progress and detects when source text changes, making translations stale.

**Core Concept:** Store snapshots of source language text (not the translations themselves) to enable change detection and stale translation management.

## Architecture

### High-Level Flow

```
1. Developer writes English text in GitHub repo
2. LocaleOps tracks which keys have been translated
3. When English changes, LocaleOps detects it
4. Translators are notified via GET endpoint
5. Translators submit new translations via POST endpoint
6. LocaleOps creates/updates GitHub PRs with translations
```

### Key Components

**1. Sources (`src/sources/`)**
- Adapters for version control systems (currently: GitHub)
- Read source files, create branches, commit translations, manage PRs
- Abstract base class pattern for extensibility

**2. Transports (`src/server/modules/`)**
- HTTP server that exposes GET/POST endpoints
- GET: Returns deltas (what needs translation)
- POST: Accepts translations and creates PRs

**3. Databases (`src/databases/`)** ⭐ **New**
- Track translation progress by storing source language snapshots
- Two adapters: File (JSON) and SQLite
- Abstract base class pattern (same as sources/transports)

**4. Core State Management (`src/core/state/`)**
- Diff algorithm to detect changes between objects
- Returns deltas: "added", "changed", "removed"

## Database Adapter Architecture

### Purpose

The database stores **source language snapshots** for each target locale. This enables:
1. Tracking which keys have been translated
2. Detecting when source text changes (stale translations)
3. Returning only untranslated/changed keys via GET endpoint

### Key Design Principles

**1. Generic Type System**
- Not coupled to any specific translation tool format (i18next, react-intl, etc.)
- Supports both objects and arrays at top level
- Types: `DatabaseValue`, `DatabaseRecord`, `DatabaseArray`, `DatabaseContent`

**2. Abstract Base Class Pattern**
```typescript
export abstract class BaseDatabase {
  abstract initialize(): Promise<void>;
  abstract getAll(): Promise<DatabaseContent>;
  abstract get(key: string): Promise<DatabaseRecord | DatabaseArray>;
  abstract update(key: string, updates: DatabaseRecord | DatabaseArray): Promise<void>;
  abstract set(key: string, content: DatabaseRecord | DatabaseArray): Promise<void>;
  abstract delete(key: string): Promise<void>;
}
```

**3. Factory Pattern**
- Configuration-driven instantiation
- TypeBox schema validation (regex patterns for file extensions)
- Exhaustive type checking for discriminated unions

**4. Path Resolution**
- Shared utility in `src/shared/paths.ts`
- Resolves relative paths against `baseDir` (binary location in prod, cwd in dev)
- Handles special values like SQLite's `:memory:`

### What the Database Stores

**Structure:**
```json
{
  "locale_code": {
    "file.json": {
      "key1": "source_text",
      "key2": "source_text"
    }
  }
}
```

**Example:**
```json
{
  "fr": {
    "common.json": {
      "greeting": "Hello",
      "welcome": "Welcome to our app"
    }
  },
  "de": {
    "common.json": {
      "greeting": "Hello"
    }
  }
}
```

**Important:**
- Keys = target locale codes (fr, de, es)
- Values = **English source text** (not translations!)
- Why? To detect when English changes and translations become stale

### File Adapter

**Location:** `src/databases/file.database.ts`

**Features:**
- Human-readable JSON storage
- Always pretty-printed (2-space indent)
- Deep merge using lodash for updates
- Async file operations

**Configuration:**
```yaml
database:
  adapter:
    name: file
    path: ./localeops-db.json  # Must end with .json
```

**Limitations:**
- Race conditions with concurrent writes (read→modify→write pattern)
- Use for: Development, testing, debugging

### SQLite Adapter

**Location:** `src/databases/sqlite.database.ts`

**Features:**
- Built-in locking and transactions (Bun's `bun:sqlite`)
- UPSERT pattern for idempotent updates
- JSON stored as TEXT column
- Better for production workloads

**Schema:**
```sql
CREATE TABLE translation_progress (
  target_locale TEXT PRIMARY KEY,
  source_snapshot TEXT NOT NULL
);
```

**Configuration:**
```yaml
database:
  adapter:
    name: sqlite
    path: ./localeops.db  # Must end with .db or use :memory:
```

**Why this schema?**
- `target_locale` = locale code (e.g., "fr")
- `source_snapshot` = JSON string with source language snapshots
- Primary key on locale ensures one row per target language

## How Change Detection Works

### Scenario: Initial Translation

**GitHub:**
```json
// en/common.json
{"greeting": "Hello"}
```

**Database:** `{}`

**GET /api/translations?locale=fr:**
```typescript
diff({
  oldObj: {},  // Database snapshot
  newObj: {"greeting": "Hello"}  // Current GitHub English
})
// Returns: "greeting" is NEW (type: "added")
```

**POST translation:** `{"value": "Bonjour", "from": "Hello"}`

**Database updated:**
```json
{
  "fr": {
    "common.json": {
      "greeting": "Hello"  // ← Stores source text
    }
  }
}
```

### Scenario: English Text Changes

**Developer updates GitHub:**
```json
// en/common.json
{"greeting": "Hi there"}  // ← Changed!
```

**Database still has:**
```json
{
  "fr": {
    "common.json": {
      "greeting": "Hello"  // ← Old snapshot
    }
  }
}
```

**GET /api/translations?locale=fr:**
```typescript
diff({
  oldObj: {"greeting": "Hello"},      // Database
  newObj: {"greeting": "Hi there"}     // GitHub
})
// Returns: "greeting" is MODIFIED (type: "changed", oldValue: "Hello", newValue: "Hi there")
```

**POST re-translation:** `{"value": "Salut", "from": "Hi there"}`

**Database updated:**
```json
{
  "fr": {
    "common.json": {
      "greeting": "Hi there"  // ← Updated snapshot
    }
  }
}
```

## Translation Service Integration

**Location:** `src/server/modules/translation/translation.service.ts`

**Module-level initialization:**
```typescript
const source = await createSource(config.source);
const database = await createDatabase(config.database);
await database.initialize();
```

**GET endpoint logic:**
```typescript
async getUntranslatedDeltas(): Promise<Delta[]> {
  // 1. Get snapshot from database
  const sourceSnapshot = await this.database.get(this.locale);

  // 2. Get current English from GitHub
  const baseLocaleDirCompilation = await this.compileBaseLocaleDir();

  // 3. Diff to find changes
  const diff = State.diffObjects({
    oldObj: sourceSnapshot,  // What was translated
    newObj: baseLocaleDirCompilation  // Current English
  });

  return diff;
}
```

**POST endpoint logic:**
```typescript
async postTranslations(translations: PostTranslation[]) {
  // 1. Validate translations aren't stale
  for (const translation of translations) {
    const source = get(baseLocaleDirCompilation, translation.path);
    if (translation.from !== source) {
      throw new AppError({ type: ERROR_TYPES.STALE_TRANSLATION });
    }
  }

  // 2. Create GitHub PR with translations
  await this.updateRemoteFiles(translations);

  // 3. Update database with source snapshots
  await this.updateTranslationProgress(translations);
}
```

**Updating progress:**
```typescript
private async updateTranslationProgress(translations: PostTranslation[]) {
  // Store SOURCE text (the "from" field), not translation
  const sourceTextSnapshots = translations.map((tr) => ({
    ...tr,
    value: tr.from  // ← Source text, not translation!
  }));

  const existingSnapshot = await this.database.get(this.locale);
  const updatedSnapshot = state.update({
    state: existingSnapshot,
    translations: sourceTextSnapshots
  });

  await this.database.set(this.locale, updatedSnapshot);
}
```

## Configuration

**Location:** `localeops.yml`

**Database section:**
```yaml
database:
  adapter:
    # File adapter (development)
    name: file
    path: ./localeops-db.json

    # OR SQLite adapter (production)
    # name: sqlite
    # path: ./localeops.db
    # path: :memory:  # In-memory for testing
```

**Validation:**
- File adapter: Path must end with `.json` (regex: `\\.json$`)
- SQLite adapter: Path must end with `.db` or be `:memory:` (regex: `^(:memory:|.*\\.db)$`)

## API Endpoints

**GET /api/translations?locale={locale}**
- Returns array of deltas (what needs translation)
- Compares database snapshot vs current GitHub English
- Delta types: "added", "changed", "removed"

**Response:**
```json
[
  {
    "type": "added",
    "path": ["common.json", "greeting"],
    "key": "greeting",
    "value": "Hello"
  },
  {
    "type": "changed",
    "path": ["common.json", "welcome"],
    "key": "welcome",
    "oldValue": "Welcome",
    "newValue": "Welcome to our app"
  }
]
```

**POST /api/translations**
- Accepts translations for a locale
- Creates/updates GitHub PR
- Updates database with source snapshots

**Request:**
```json
{
  "locale": "fr",
  "translations": [
    {
      "path": ["common.json", "greeting"],
      "value": "Bonjour",
      "from": "Hello"
    }
  ]
}
```

## Project Structure

```
src/
├── config/              # Configuration schema and loading
│   ├── config.schema.ts # TypeBox validation schemas
│   └── config.ts        # Config loader, exports baseDir
├── core/
│   └── state/          # Diff algorithm for change detection
├── databases/          # ⭐ Database adapters
│   ├── base.database.ts    # Abstract base class
│   ├── file.database.ts    # JSON file adapter
│   ├── sqlite.database.ts  # SQLite adapter
│   ├── factory.ts          # Factory function
│   └── index.ts            # Exports
├── shared/             # ⭐ Shared utilities
│   ├── paths.ts        # Path resolution utility
│   └── index.ts        # Exports
├── sources/            # VCS adapters (GitHub)
│   ├── base.source.ts      # Abstract base class
│   ├── github.source.ts    # GitHub implementation
│   └── factory.ts          # Factory function
└── server/
    ├── modules/
    │   └── translation/
    │       ├── translation.service.ts     # Core logic
    │       ├── translation.controller.ts  # HTTP handlers
    │       └── translation.schema.ts      # Request/response schemas
    └── index.ts        # Server entry point
```

## Key Decisions and Rationale

### Why store source text instead of hashes?

**Considered:** Store SHA256 hashes of source text for security
**Decision:** Store plain text
**Rationale:**
- Deltas need to show actual text values to UI
- Source text is already public in GitHub repo
- Hashing would break API (UI would receive hashes instead of text)

### Why separate database files from binary?

**Decision:** Database files stored outside executable, paths required in config
**Rationale:**
- Easier to backup/migrate data
- Can share database between multiple instances
- Clear separation of code and data

### Why both file and SQLite adapters?

**Decision:** Provide both options
**Rationale:**
- File adapter: Easy debugging, human-readable, simple setup
- SQLite adapter: Production-safe, concurrent writes, better performance
- Different use cases, both valuable

### Why module-level database initialization?

**Decision:** Initialize database at module level in translation.service.ts
**Rationale:**
- Simpler than dependency injection through multiple layers
- Single connection shared across all service instances
- Matches pattern used for source adapter

### Why "translation_progress" not "translations"?

**Decision:** Name table/database "translation_progress"
**Rationale:**
- Clarifies it's tracking progress, not storing translations
- Translations live in GitHub, not database
- Reduces confusion about what's stored

### Why async database methods?

**Decision:** All database methods return Promises
**Rationale:**
- File I/O is inherently async
- Future database adapters (PostgreSQL, MySQL) are async
- Consistent API across all adapters

## Common Patterns

### Adding a new database adapter

1. Create `src/databases/{name}.database.ts`
2. Extend `BaseDatabase` abstract class
3. Implement all abstract methods
4. Add config type to `config.schema.ts`
5. Add case to factory in `factory.ts`
6. Export from `index.ts`

### Path resolution

Always use `resolveConfigPath()` from `src/shared/paths.ts`:
```typescript
import { resolveConfigPath } from "../shared";

const path = resolveConfigPath(config.database.adapter.path);
```

### Error handling

Service throws errors, controller catches and returns HTTP responses:
```typescript
// Controller
try {
  const result = await service.method();
  return new Response(JSON.stringify(result));
} catch (error) {
  if (error instanceof AppError) {
    return new Response(error.message, { status: 400 });
  }
  return new Response("Internal Server Error", { status: 500 });
}
```

## Development

**Build:**
```bash
bun run build
```

**Run in development:**
```bash
bun run dev
```

**Configuration:**
- Development: `localeops.yml` in project root
- Production: `localeops.yml` next to binary

**Environment variables:**
- `GITHUB_ACCESS_TOKEN` - Required for GitHub API
- Load from `.env` file in project root
