# CLAUDE.md — AI Assistant Guide for pdf-metadata-viewer

## Project Overview

**pdf-metadata-viewer** is a local web application for viewing, editing, and organizing PDF document metadata. It serves a directory of PDFs via an Express backend and a vanilla JS frontend. Key capabilities include metadata editing, AI-assisted suggestions (OpenAI Vision API), PDF splitting, a file list with sort/filter, and activity logging.

---

## Architecture

```
Browser (vanilla JS)
  ├── public/app.js          — Main client logic (2,320 lines)
  ├── public/table-manager.js — Table sort/filter utilities
  ├── public/styles.css      — Styling
  └── public/index.html      — Single-page HTML shell

Express Server
  └── server.js              — All API endpoints (1,112 lines)
  └── lib/taxonomy-loader.js — Parses taxonomy markdown, caches result

File System
  ├── pdfs/                  — PDF storage (configurable via PDFS_DIR env var)
  ├── activity-log.json      — Append-only activity log (auto-managed)
  └── docs/tag_entity_database.md — Taxonomy registry (source of truth for tags)
```

This is a **single-server, no-build-step** application. There is no bundler, transpiler, or test framework. The server uses ES Modules (`"type": "module"` in package.json).

---

## Key Files

| File | Purpose |
|---|---|
| `server.js` | Express server with all REST API routes |
| `public/app.js` | Client-side view management, metadata editing, AI suggestions UI |
| `public/table-manager.js` | Reusable table utilities (sort, filter, tag-based filter) |
| `lib/taxonomy-loader.js` | Parses `docs/tag_entity_database.md` and exports taxonomy data |
| `docs/tag_entity_database.md` | Authoritative taxonomy: document types, categories, statuses, people, vendors |
| `docs/ai-prompt-template.md` | Template injected into OpenAI Vision API calls (supports `{{variable}}` substitution) |
| `docs/PRD.md` | Product Requirements Document — read this to understand product intent |
| `docs/FEATURE_STATUS.md` | Current implementation status per feature area |

---

## Development Setup

### Requirements
- Node.js (ES Modules support required)
- An OpenAI API key (for AI suggestions only)
- A directory of PDF files

### Install & Run
```bash
npm install
cp .env.example .env   # or manually create .env
# Set OPENAI_API_KEY and optionally PDFS_DIR in .env
npm run dev            # Development: nodemon with auto-restart
npm start              # Production
```

### Environment Variables
```
OPENAI_API_KEY=sk-...          # Required for AI suggestions
PDFS_DIR=/path/to/your/pdfs   # Optional; defaults to pdfs/ in project root
```

`PDFS_DIR` accepts relative or absolute paths. Google Drive mounts are detected and handled with special error messaging.

### Server Config
- Port: **3000** (hardcoded)
- JSON body limit: 10MB
- File read timeout: 60 seconds

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/files-list` | Paginated file list with metadata and update counts |
| GET | `/api/pdfs` | Simple array of PDF filenames |
| GET | `/api/metadata/:filename` | Read embedded PDF metadata |
| PUT | `/api/metadata/:filename` | Write metadata to PDF file |
| POST | `/api/rename/:filename` | Rename a PDF file |
| DELETE | `/api/files/:filename` | Delete a PDF file |
| POST | `/api/split` | Split a multi-page PDF at specified page boundaries |
| POST | `/api/ai-suggestions/:filename` | Call OpenAI Vision API for metadata suggestions |
| GET | `/api/activity-log` | Retrieve activity history |
| GET | `/pdfs/:filename` | Serve PDF file to browser |

All API responses use JSON. Errors return `{ error: "...", details: "..." }`. Filenames in URLs must be URL-encoded.

---

## Code Conventions

### JavaScript Style
- **ES Modules** throughout (`import`/`export`, no CommonJS `require`)
- **`async/await`** exclusively — no `.then()` chains
- **`const`** by default; `let` only when reassignment is needed
- No TypeScript, no JSX, no bundler

### Naming
- Functions: `camelCase`, verb+noun (`loadFileList`, `requestAISuggestions`, `handleFilenameClick`)
- View functions: `showX`, `toggleX`
- Constants: `UPPER_CASE` (`PDFS_DIR`, `LOG_FILE`, `PORT`)
- Classes: `PascalCase` (`TableManager`)
- Async fetch helpers: `loadX`, `fetchX`

### Error Handling
- All async operations wrapped in `try/catch`
- Log errors with file path and context for debuggability
- Google Drive-specific errors have dedicated detection and user messaging
- Graceful fallbacks (e.g., if AI prompt template is missing, use a default prompt)

### DOM / Frontend Patterns
- No framework — vanilla JS with `document.querySelector`, `innerHTML`, event listeners
- Event delegation for dynamically-generated content
- Clone elements to remove stale event listeners before re-attaching
- Always escape user-facing strings with `escapeHtml()` to prevent XSS
- Use template literals for HTML generation

### API Response Patterns
- Always return JSON
- Success: relevant data object or array
- Error: `{ error: string, details?: string }` with appropriate HTTP status code

### Keyword Handling
- Keywords stored as **comma-delimited strings** (no spaces after commas) in PDF metadata
- Parse with `parseCommaDelimitedString()`, format with comma joining
- The keyword field is exposed as a tag-chip UI on the frontend

### Taxonomy
- All tags must come from `docs/tag_entity_database.md`
- Load via `lib/taxonomy-loader.js` (cached after first read)
- Taxonomy sections: document types, categories, actions, statuses, special flags, locations, people, vendors
- Tag slugs use `kebab-case`

### Activity Logging
- Every metadata update, rename, and split is logged to `activity-log.json`
- Log capped at 1000 entries (oldest dropped)
- Log entries include: timestamp, action type, filename, field-level diffs

---

## AI Suggestions Feature

The AI suggestions flow:
1. Client calls `POST /api/ai-suggestions/:filename`
2. Server renders PDF pages to images using `puppeteer` and `canvas`
3. Images are sent to OpenAI Vision API (`gpt-4o-mini`) with the prompt from `docs/ai-prompt-template.md`
4. Template variables like `{{filename}}`, `{{currentKeywords}}`, `{{taxonomyTags}}` are substituted at runtime
5. Server returns structured JSON: `{ filename, title, subject, keywords }`
6. Client displays suggestions alongside current metadata; user applies them individually

**AI configuration:**
- Model: `gpt-4o-mini`
- Temperature: `0.3`
- Max tokens: `500`

---

## PDF Splitting

The splitter feature (`POST /api/split`):
- Accepts a list of page split points
- Creates multiple output PDFs preserving the original's metadata
- Auto-numbers output files (e.g., `document-1.pdf`, `document-2.pdf`)
- Adds `from-split` taxonomy tag to all split outputs
- Uses `pdf-lib` for PDF manipulation

---

## File List View

- Loaded via `GET /api/files-list` with pagination (`limit`, `offset`)
- Supports `metadata=false` flag for fast initial load (filenames only)
- Sorted and filtered client-side by `table-manager.js`
- Shows: filename, title, subject, keywords (as tags), update count
- Kebab menu per row: view details, rename, delete

---

## Known Issues & Constraints

From `docs/PRD.md`:
- **Keywords read-back bug**: `pdf-lib` does not correctly read back keywords after writing — this is a known library bug. The activity log and server-side state may be more reliable than re-reading from the PDF.
- **PDFs only**: Image files (JPG, PNG, etc.) are not supported; only `.pdf` files are processed.
- **No OCR**: Text extraction is limited to embedded PDF text; scanned documents without embedded text won't yield extractable content.

---

## What Is Not Yet Implemented

Per `docs/FEATURE_STATUS.md`:
- Taxonomy validation (tags exist in taxonomy registry but are not enforced client-side)
- Duplicate detection
- XMP metadata syncing
- Batch operations
- OCR integration
- Cloud/remote storage
- Processing pipeline tracking

Do not add these unless explicitly asked. Do not add framework dependencies, build steps, or TypeScript without discussion.

---

## Testing

Test scripts live in `testing/`. They are standalone Node.js scripts — no test runner (Jest, Mocha, etc.) is used.

```bash
node testing/test-ai-direct.js          # Test OpenAI API directly
node testing/test-ai-via-server.js      # Test via running server
node testing/verify-keywords.js         # Verify keyword persistence
node testing/test-ai-suggestions-batch.js # Batch AI suggestion tests
```

There are no automated test suites that run on commit. Run tests manually when changing AI suggestion logic, keyword handling, or PDF read/write operations.

---

## nodemon Watch Config

`nodemon.json` watches: `server.js`, `lib/**/*.js`, `public/**/*`, `docs/ai-prompt-template.md`

Changes to the AI prompt template (`docs/ai-prompt-template.md`) will auto-restart the server.

---

## Git Branch

Active development branch: `claude/add-claude-documentation-6J7jL`

---

## Do's and Don'ts for AI Assistants

**Do:**
- Read `docs/PRD.md` before making product decisions
- Use `escapeHtml()` on all user-controlled strings rendered into HTML
- Preserve async/await style — do not introduce promise chains
- Keep changes minimal and scoped — don't refactor unrelated code
- Use existing taxonomy from `docs/tag_entity_database.md` for any tag-related work
- Follow the existing REST API conventions (JSON in/out, URL-encoded filenames)

**Don't:**
- Add a frontend framework (React, Vue, etc.) without explicit discussion
- Add a build step or bundler
- Add TypeScript
- Use `require()` — this project is ES Modules only
- Introduce a test framework without discussion
- Add error handling for impossible cases
- Add docstrings or comments to code you didn't change
- Commit `activity-log.json`, `.env`, or files in `pdfs/`
