# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UIGen is an AI-powered React component generator with live preview. Users describe components in natural language, and the application generates React code using Claude AI (or falls back to static mock responses without an API key). Components are stored in a virtual file system and rendered in real-time in an iframe preview.

## Development Commands

```bash
# Initial setup (install deps, generate Prisma client, run migrations)
npm run setup

# Development server with Turbopack
npm run dev

# Run tests with Vitest
npm test

# Build for production
npm run build

# Lint code
npm run lint

# Reset database
npm run db:reset
```

## Architecture

### Virtual File System (VFS)

The core of UIGen is a custom virtual file system (`src/lib/file-system.ts`) that stores generated files in-memory rather than on disk. The `VirtualFileSystem` class:

- Manages file/directory nodes in a Map with full CRUD operations
- Serializes/deserializes to JSON for database persistence
- Provides text-editor-like commands (view, create, str_replace, insert) used by AI tools

The VFS is passed to the AI as tool implementations and synchronized with the database for registered users.

### AI Integration Flow

1. **Chat Route** (`src/app/api/chat/route.ts`): Next.js API route handler that:
   - Receives messages and current file system state from the client
   - Deserializes the VFS from JSON
   - Streams responses using Vercel AI SDK's `streamText`
   - Provides two AI tools: `str_replace_editor` and `file_manager`
   - Saves conversation history and file state to database after completion

2. **AI Tools** (`src/lib/tools/`):
   - `str_replace_editor`: View files, create files, replace strings in files, insert text
   - `file_manager`: Rename and delete files/directories
   - Both tools operate directly on the VirtualFileSystem instance

3. **System Prompt** (`src/lib/prompts/generation.tsx`): Instructs Claude to:
   - Create React components using Tailwind CSS
   - Always have `/App.jsx` as the root entry point
   - Use `@/` import alias for local files
   - Keep responses brief

4. **Provider** (`src/lib/provider.ts`):
   - Returns real Claude model if `ANTHROPIC_API_KEY` is set
   - Falls back to `MockLanguageModel` that generates static components (Counter, Form, or Card)

### Preview System

The preview uses an in-browser JSX transformation pipeline (`src/lib/transform/jsx-transformer.ts`):

1. **Transform**: Each `.jsx`/`.tsx` file is transformed using Babel standalone to compile JSX/TypeScript
2. **Import Map**: Create ES Module import map with:
   - Blob URLs for transformed local files
   - CDN URLs for React (`https://esm.sh/react@19`)
   - `@/` alias support mapping to root directory
   - Third-party packages resolved via `esm.sh`
3. **HTML Generation**: Generate complete HTML document with:
   - Tailwind CSS CDN
   - Import map in `<script type="importmap">`
   - Error boundary for runtime errors
   - Syntax error display for compilation errors
4. **Rendering**: Inject HTML into sandboxed iframe (`src/components/preview/PreviewFrame.tsx`)

The preview automatically finds the entry point (`/App.jsx`, `/App.tsx`, `/index.jsx`, etc.) and updates on file system changes.

### Authentication & Persistence

- **Auth System** (`src/lib/auth.ts`): JWT-based authentication using `jose` library
  - Session tokens stored in HTTP-only cookies
  - 7-day expiration
  - Session payload contains userId and email

- **Database** (Prisma + SQLite):
  - Users can sign up/sign in or continue anonymously
  - Projects are saved with messages (conversation history) and data (serialized VFS) as JSON strings
  - Anonymous users' work is tracked in-memory but not persisted (`src/lib/anon-work-tracker.ts`)

### State Management

The application uses React Context for client-side state:

- `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`): Manages the VFS instance, provides file operations, triggers preview refreshes
- `ChatContext` (`src/lib/contexts/chat-context.tsx`): Manages chat messages, handles AI streaming, synchronizes with file system

### Testing

Tests use Vitest with jsdom environment. Run individual test files:

```bash
npm test -- src/lib/__tests__/file-system.test.ts
```

Test coverage exists for:
- Virtual file system operations
- JSX transformer and import map generation
- React components (chat, editor, UI)
- Context providers

## Key Design Patterns

1. **Entry Point**: Every project must have a root `/App.jsx` or `/App.tsx` file that exports a React component as default export

2. **Import Aliases**: All local imports should use the `@/` alias (e.g., `import Counter from '@/components/Counter'`)

3. **No HTML Files**: The system doesn't use HTML entry files - `App.jsx` is the entry point

4. **No Disk I/O for Generated Code**: All user-generated files exist only in the VFS (in-memory or database JSON)

5. **Tool-based AI Interaction**: AI doesn't write code directly in responses - it uses tool calls to manipulate the VFS

## Database Schema

The Prisma client is generated to `src/generated/prisma` (non-standard location). If you modify `prisma/schema.prisma`:

```bash
npx prisma generate
npx prisma migrate dev
```

## Environment Variables

- `ANTHROPIC_API_KEY` (optional): Claude API key. If not set, uses mock provider with static responses
- `JWT_SECRET` (optional): Defaults to "development-secret-key" if not set
