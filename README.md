# Elon Kernel

## Overview

Elon Kernel is an Astro + Preact personal-site project with:
- multi-page content (`/`, `/blog`, `/about`, `/experience`)
- blog/article rendering from Markdown
- interactive UI islands (timeline, tag filtering, TOC/progress, publish modal)
- reusable shared modules (dock, terminal, dynamic island shell)

It is deployed primarily on Cloudflare Pages.

## Live Demo

- Live Demo: https://blob-1yd.pages.dev
- Walkthrough Demo Video: TBD
- Preview Image: TBD

## Tech Stack

- Framework: Astro 5
- Interactive islands: Preact
- Styling: Tailwind CSS v4 + DaisyUI
- Testing: Vitest + Testing Library (`jsdom`)
- Runtime target: Cloudflare Pages + Pages Functions

## Architecture

### Runtime model

- **Routing and page composition**: `src/pages/`
- **Global layout shell**: `src/layouts/BaseLayout.astro`
- **Interactive islands**: `*.tsx` components mounted inside Astro pages/components
- **Shared client bootstraps**: `src/scripts/` (theme, global shortcuts, service worker)
- **Cloudflare function parity**:
  - Astro API route: `src/pages/api/ai/chat.ts`
  - Pages Function route: `functions/api/ai/chat.ts`

### Data/content flow

- Markdown blog posts: `src/blog/`
- Static content/domain data: `src/data/`
- Route-level output:
  - RSS: `src/pages/rss.xml.js`
  - Search index: `src/pages/search.json.ts`
  - Tag pages: `src/pages/tags/`

## Project Structure

```text
elon-kernel/
|-- src/
|   |-- components/
|   |   |-- about-page/
|   |   |-- blog-page/
|   |   |-- experience-page/
|   |   |-- index-page/
|   |   |-- mobile/
|   |   `-- shared/
|   |-- data/
|   |-- layouts/
|   |-- pages/
|   |-- scripts/
|   |-- styles/
|   `-- blog/  
|-- functions/
|-- public/
|-- test/
|-- tools/
|-- astro.config.mjs
|-- package.json
|-- vitest.config.ts
`-- wrangler.toml
```

## Component Guide

### 1) Home (`src/components/index-page/`)
- `hero/`: homepage hero section
- `timeline/`: timeline rendering and reveal interactions (`TimelineRevealIsland.tsx`)

### 2) Blog (`src/components/blog-page/`)
- `content/`: article/moment/note views and content switch
- `post/`: post shell, header, TOC, reading progress
- `sidebar/`: profile/tags/heatmap/navigation modules
- `modals/`: publish modal and interactive islands

### 3) About (`src/components/about-page/`)
- Resume workbench modules (editor topbar, panels, code-like rendering)
- `ResumeLanguageIsland.tsx`: language toggle behavior
- tokenizer helpers for code-line presentation

### 4) Experience (`src/components/experience-page/`)
- hero section and section TOC
- project/publication/research list composition modules

### 5) Shared (`src/components/shared/`)
- **Dock system** (`dock/`) with layered split:
  - `data/`: constants/state persistence helpers
  - `logic/`: controller/actions/visibility/activity logic
  - `ui/`: dock shell and item components
- terminal modal modules
- dynamic-island shell/core messaging/storage
- common icons/footer/social blocks

### 6) Mobile (`src/components/mobile/`)
- mobile-specific shell and component variants (dock/FAB integrations)

## Development Workflow

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
# Clone the repository
git clone --depth 1 https://github.com/elonwoo-02/elon-kernel.git my-new-blog && cd my-new-blog

# Install dependencies
npm install
```

### Start local dev server

```bash
# Run the development server
npm run dev
```

### Build and preview

```bash
npm run build
npm run preview
```

### Test and checks

```bash
npm test
npm run test:watch
npm run check:test-layout
npm run check:colors
npm run check
```

Recommended local loop:

1. `npm run dev`
2. develop feature/module
3. `npm test`
4. `npm run check`
5. `npm run build`

## Deployment

### Cloudflare Pages (primary)

Use Cloudflare Pages with:

- Build command: `npm ci && npm run build`
- Output directory: `dist`
- Node version: 18+ (LTS recommended)

`wrangler.toml` includes:

- `pages_build_output_dir = "dist"`
- `compatibility_date = "2024-10-01"`
- `compatibility_flags = ["nodejs_compat"]`

### Required environment variables

Configure for both **Preview** and **Production**:

- `OPENAI_API_KEY` (required, secret)
- `OPENAI_MODEL` (optional, default fallback exists in code)
- `OPENAI_BASE_URL` (optional, defaults to OpenAI API URL)

If `OPENAI_API_KEY` is missing, `/api/ai/chat` returns `500`.

### Local Cloudflare parity verification

```bash
npm run build
npx wrangler pages dev dist
```

Use this mode when you need behavior close to Cloudflare Pages Functions runtime.

## API Notes

Endpoint: `/api/ai/chat`

- Supports `POST` and `GET`
- Supports streaming mode (SSE) on supported path
- Request message sanitization is enforced (role/content validation, max length/count)
- GET fallback supports query/header-based question and history transport

Implementation references:

- `src/pages/api/ai/chat.ts`
- `functions/api/ai/chat.ts`

## Troubleshooting

- **`OPENAI_API_KEY is missing on server`**:
  set env vars in Cloudflare Pages Preview + Production.
- **Local behavior differs from Cloudflare**:
  verify with `wrangler pages dev dist` after `npm run build`.
- **UI behavior breaks after route transitions**:
  inspect global bootstrap scripts and `astro:page-load` rebind logic.
- **Deployment has no output**:
  confirm Pages output directory is `dist`.

## Contribution

- Keep PR scope focused (one feature/fix per PR when possible).
- Suggested commit style:
  - `feat(scope): ...`
  - `fix(scope): ...`
  - `chore: ...`
- Include in PR description:
  - behavior summary
  - commands run (`npm test`, `npm run check`)
  - screenshots/GIFs for UI changes

## License

License status: TBD (add explicit license file if you plan public distribution).
