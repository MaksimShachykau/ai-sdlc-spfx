# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                      # Install dependencies
gulp serve                       # Start local dev server (HTTPS, port 4321)
gulp bundle                      # Bundle for development
gulp bundle --ship               # Bundle for production (minified)
gulp package-solution --ship     # Generate .sppkg for deployment
gulp clean                       # Remove build artifacts
gulp test                        # Run tests
```

Node version must be `>=18.17.1 <19.0.0`.

The dev server opens the SPFx workbench at the URL defined in `SP_WORKBENCH_URL` inside `.env`. Copy `.env.template` to `.env` and fill in your SharePoint site values before running `gulp serve`.

## Environment

Site-specific values live in `.env` (gitignored). `.env.template` is the committed reference.

| Variable | Purpose |
| --- | --- |
| `SP_SITE_URL` | Full URL of the SharePoint site (no trailing slash) |
| `SP_FOLDER_ROOT` | Server-relative path to the SitePages matrix folder |
| `SP_WORKBENCH_URL` | Workbench URL opened by `gulp serve` |

## Architecture

**SPFx 1.20.0** solution with two web parts.

### Web parts

#### matrixWebPart

Renders an interactive AI-SDLC role × phase involvement matrix.

- [src/webparts/matrixWebPart/MatrixWebPartWebPart.ts](src/webparts/matrixWebPart/MatrixWebPartWebPart.ts) — `BaseClientSideWebPart` subclass. Initializes PnPJS with SPFx context (`spfi().using(SPFx(this))`), mounts the React component passing the `sp` instance as a prop.
- [src/webparts/matrixWebPart/components/MatrixWebPart.tsx](src/webparts/matrixWebPart/components/MatrixWebPart.tsx) — Main React functional component. Contains all data-fetching logic, state, and rendering.

**Data flow:**
1. On mount, calls `sp.web.getFolderByServerRelativePath(root).folders()` to discover **roles** from the SharePoint folder hierarchy (`SP_FOLDER_ROOT/{role}/`).
2. Queries the **Site Pages** list filtered by `FileRef` starting with the matrix root path, selecting `FileRef` and `Involvement` columns.
3. Indexes results into `cellMap: Record<string, string>` keyed as `{role}|{phase}` for the active level.
4. Renders a role × phase grid where each cell shows an `InvolvementDot`.

**Key constants (defined inline in MatrixWebPart.tsx):**
- `PHASES` — 8 rows: Base AI Maturity + 7 SDLC phases (Planning → Maintenance)
- `LEVELS` — 3 AI maturity levels: AI Enabled, AI-First, AI Native (each with a color)
- `INVOLVEMENT` — 5 types: lead, active, review, on-demand, none

**Sub-components (all in MatrixWebPart.tsx):**
- `InvolvementDot` — colored circle for an involvement type
- `Legend` — renders the involvement key

#### mdCardWebPart

Fetches a Markdown file from SharePoint and renders it as a styled card.

- [src/webparts/mdCardWebPart/MdCardWebPartWebPart.ts](src/webparts/mdCardWebPart/MdCardWebPartWebPart.ts) — Web part host; exposes a `fileUrl` property pane field.
- [src/webparts/mdCardWebPart/components/MdCardWebPart.tsx](src/webparts/mdCardWebPart/components/MdCardWebPart.tsx) — Fetches file content via PnPJS or `fetch` (for SharePoint sharing links), converts Markdown to HTML, renders result.

Accepts either a full URL or a server-relative path. Sharing links (pathname starting with `/:`) are fetched via `?download=1` rather than PnPJS.

### Shared utilities

- [src/webparts/shared/mdToHtml.ts](src/webparts/shared/mdToHtml.ts) — Markdown-to-HTML converter used by `mdCardWebPart`.

### Styling

Uses inline styles (majority) and [MatrixWebPart.module.scss](src/webparts/matrixWebPart/components/MatrixWebPart.module.scss) for SCSS modules. `.vscode/settings.json` excludes auto-generated `.scss.ts` files from the file explorer.

### Build system

Gulp is configured via the Microsoft SPFx build rig (`@microsoft/sp-build-web`). [gulpfile.js](gulpfile.js) is minimal — it only loads the rig and applies the deprecated `serve` handler for SPFx 1.20 compatibility. Do not add custom Gulp tasks without understanding the rig's task graph.

### Deployment

`gulp package-solution --ship` produces `sharepoint/solution/ai-sdlc-matrix.sppkg`. Upload to the SharePoint App Catalog. `skipFeatureDeployment: true` means tenant-wide deployment is supported.
