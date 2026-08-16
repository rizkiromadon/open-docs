# Contributing to open-docs

Thanks for taking the time to contribute. This document covers the
project's local setup, conventions, and pull request process.

## Local setup

```bash
git clone https://github.com/OWNER/open-docs.git
cd open-docs
npm install
npm run dev
```

The app reads `public/specs/openapi.yaml` on every request in
development. Swap in your own OpenAPI 3.0.x or 3.1.x document to test
against it.

## Conventions

- **No inline comments.** Use TSDoc (`/** ... */`) on exported
  functions, components, and types instead of `//` comments.
- **Normalized types only.** Components under `src/components/` should
  consume the types in `src/types/openapi.ts`, never the raw spec
  shape. Any new spec fields should be normalized in
  `src/lib/openapi/parse-document.ts` first.
- **Server vs. client components.** Keep components server-rendered by
  default; add `"use client"` only when a component needs state,
  effects, or browser APIs (see `src/components/layout/Sidebar.tsx`
  for an example).
- **Design tokens.** Colors, spacing, and radii live in the `@theme`
  block in `src/app/globals.css`. Prefer the existing `canvas` /
  `surface` / `border` / `ink` / `method` scales over new one-off
  colors.

## Before opening a pull request

```bash
npm run lint
npx tsc --noEmit
npm run build
```

All three must pass. `npm run build` also parses the active spec at
build time, so a broken `public/specs/openapi.yaml` will fail the
build — that's expected and mirrors what CI checks.

## Commit and PR style

- Keep commits scoped to one logical change.
- Fill out the pull request template, including the checklist.
- Link related issues where relevant.

## Reporting bugs and requesting features

Use the issue templates under **New issue** — they collect the
context (OpenAPI version, repro steps, spec snippet) needed to
triage efficiently.
