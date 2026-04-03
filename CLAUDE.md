# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
gulp serve           # Start local dev server (HTTPS, port 4321)
gulp bundle          # Bundle for production (same as npm run build)
gulp bundle --ship   # Bundle for release (minified)
gulp package-solution --ship  # Generate .sppkg for deployment
gulp clean           # Remove build artifacts
gulp test            # Run tests
```

The dev server opens the SPFx workbench at `https://maksimshachykau.sharepoint.com/sites/AI-SDLCRoleMatrix/_layouts/workbench.aspx`.

Node version must be `>=18.17.1 <19.0.0`.

## Architecture

**SPFx 1.20.0** web part — single component rendering an interactive AI-SDLC role matrix table.

### Entry points

- [src/webparts/matrixWebPart/MatrixWebPartWebPart.ts](src/webparts/matrixWebPart/MatrixWebPartWebPart.ts) — SPFx `BaseClientSideWebPart` subclass. Initializes PnPJS with SPFx context (`spfi().using(SPFx(this))`), then mounts the React component passing the `sp` instance as a prop.
- [src/webparts/matrixWebPart/components/MatrixWebPart.tsx](src/webparts/matrixWebPart/components/MatrixWebPart.tsx) — Main React functional component (~315 lines). Contains all data-fetching logic, state, and rendering.

### Data flow

1. On mount, the component calls `sp.web.getFolderByServerRelativePath(root).folders()` to discover **roles** from the SharePoint folder hierarchy (`/sites/AI-SDLCRoleMatrix/SitePages/ai-sdlc-matrix/{role}/`).
2. It queries the **Site Pages** list filtered by `FileRef` starting with the matrix root path, selecting `FileRef` and `Involvement` columns.
3. Results are indexed into a `cellMap: Record<string, string>` keyed as `{role}|{phase}` for the currently selected level.
4. The matrix renders a role × phase grid where each cell shows an `InvolvementDot` based on the map.

### Key constants (defined inline in MatrixWebPart.tsx)

- `PHASES` — 7 SDLC phases (Planning → Maintenance)
- `LEVELS` — 3 AI maturity levels: AI Enabled, AI-First, AI Native (each with a color and icon)
- `INVOLVEMENT` — 5 involvement types: lead, active, review, on-demand, none

### Sub-components (all in MatrixWebPart.tsx)

- `InvolvementDot` — renders a colored circle for an involvement type
- `Legend` — renders the involvement key

### Styling

Uses a mix of inline styles (majority, inside `MatrixWebPart.tsx`) and [MatrixWebPart.module.scss](src/webparts/matrixWebPart/components/MatrixWebPart.module.scss) for SCSS modules. The `.vscode/settings.json` excludes auto-generated `.scss.ts` files from the file explorer.

### Build system

Gulp is configured via the Microsoft SPFx build rig (`@microsoft/sp-build-web`). [gulpfile.js](gulpfile.js) is minimal — it only loads the rig and applies the deprecated `serve` handler for SPFx 1.20 compatibility. Do not add custom Gulp tasks without understanding the rig's task graph.

### Deployment

`gulp package-solution --ship` produces `sharepoint/solution/ai-sdlc-matrix.sppkg`. Upload to the SharePoint App Catalog. `skipFeatureDeployment: true` means tenant-wide deployment is supported.
