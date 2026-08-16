# open-docs

[![CI](https://github.com/OWNER/open-docs/actions/workflows/ci.yml/badge.svg)](https://github.com/OWNER/open-docs/actions/workflows/ci.yml)
<!-- TODO: replace OWNER once repo is published -->
[![License: MIT](https://img.shields.io/badge/License-MIT-lightgrey.svg)](./LICENSE)

A frontend for rendering OpenAPI documentation, built with Next.js (App
Router). Supports OpenAPI 3.0.0 through the latest 3.1.x specifications.

## Design

Dark monochrome interface: rounded cards, subtle 1px borders, compact
type scale (13–14px base). HTTP methods are the only source of color,
each mapped to a single desaturated accent so the method badge stays
scannable without breaking the monochrome palette.

## Architecture

```
src/
  app/                    Next.js routes (App Router)
    page.tsx              Introduction / landing view
    operations/[slug]/    Per-operation detail route
  components/
    layout/                Shell, sidebar, topbar
    openapi/                Spec-aware rendering components
    ui/                     Generic, spec-agnostic primitives
  lib/
    openapi/
      parse-document.ts     Raw spec -> NormalizedDocument
      resolve-refs.ts        $ref resolution
      display.ts              Slugs, labels, formatting helpers
      code-samples.ts         curl / fetch / requests generators
      load-document.ts        Server-side spec loading
    utils/                   Generic, non-domain helpers
  types/
    openapi.ts               Normalized document type definitions
```

The parsing layer (`lib/openapi`) is fully decoupled from rendering:
`parse-document.ts` turns a raw JSON or YAML string into a
`NormalizedDocument`, resolving all local `$ref` pointers first. All
downstream components consume only the normalized types in
`types/openapi.ts`, never the raw spec shape, so alternate spec sources
(remote URL, multiple documents, uploads) can be added without
touching any component.

## Supported OpenAPI versions

- Minimum: `3.0.0`
- Target: latest `3.1.x`

Documents declaring an unsupported `openapi` version are rejected with
a descriptive error surfaced through the route's error boundary.

## Loading a specification

By default, open-docs reads `public/specs/openapi.yaml`. Replace that
file with your own OpenAPI 3.0.x or 3.1.x document (JSON or YAML) to
document a different API.

## Development

```bash
npm install
npm run dev
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for local setup, conventions,
and the pull request checklist. Please also review the
[Code of Conduct](./CODE_OF_CONDUCT.md).

## Security

See [SECURITY.md](./SECURITY.md) for how to report vulnerabilities.

## License

[MIT](./LICENSE)
