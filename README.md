# AI-SDLC Role Matrix

An interactive SharePoint Framework web part that renders an AI-SDLC role matrix — a role × phase grid showing how different team roles are involved across SDLC phases at each AI maturity level (AI Enabled, AI-First, AI Native).

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/SPFx-1.20.0-green.svg)
![Node.js](https://img.shields.io/badge/Node.js-18.x-brightgreen.svg)

## Web Parts

| Web Part | Description |
| --- | --- |
| `matrixWebPart` | Interactive role × phase involvement matrix with level tabs and modal page previews |
| `mdCardWebPart` | Renders a Markdown file from SharePoint as a styled card |

## Prerequisites

- Node.js `>=18.17.1 <19.0.0`
- SharePoint site with the matrix SitePages folder hierarchy in place
- App Catalog access for deployment

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd ai-sdlc-spfx
npm install
```

### 2. Configure environment

```bash
cp .env.template .env
```

Edit `.env` and fill in your SharePoint site values:

```env
SP_SITE_URL=https://<tenant>.sharepoint.com/sites/<site-name>
SP_FOLDER_ROOT=/sites/<site-name>/SitePages/<matrix-folder-name>
SP_WORKBENCH_URL=https://<tenant>.sharepoint.com/sites/<site-name>/_layouts/workbench.aspx
```

| Variable | Purpose |
| --- | --- |
| `SP_SITE_URL` | Full URL of the SharePoint site hosting the matrix |
| `SP_FOLDER_ROOT` | Server-relative path to the SitePages matrix folder |
| `SP_WORKBENCH_URL` | Workbench URL opened by `gulp serve` |

### 3. Run locally

```bash
gulp serve
```

Opens the SPFx workbench at the URL defined in `SP_WORKBENCH_URL`.

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

## Architecture

### Data flow (matrixWebPart)

1. On mount, fetches **role folders** from the SharePoint folder hierarchy under `SP_FOLDER_ROOT/{role}/`.
2. Queries the **Site Pages** list filtered by `FileRef` starting with the matrix root path, selecting `FileRef` and `Involvement` columns.
3. Indexes results into a `cellMap` keyed as `{role}|{phase}` for the active level.
4. Renders a role × phase grid where each cell shows an involvement dot.

### Matrix dimensions

- **Phases** — Base AI Maturity, Planning, Requirements, Design/Architecture, Development, Testing, Deployment/Release, Maintenance
- **Levels** — AI Enabled, AI-First, AI Native
- **Involvement types** — Lead, Active, Review, On-demand, None

## Deployment

```bash
gulp bundle --ship
gulp package-solution --ship
```

Upload `sharepoint/solution/ai-sdlc-matrix.sppkg` to the SharePoint App Catalog. `skipFeatureDeployment: true` enables tenant-wide deployment.

## Solution

| Solution | Author |
| --- | --- |
| ai-sdlc-matrix | Maksim Shachykau |

## Version history

| Version | Date | Comments |
| --- | --- | --- |
| 1.0 | April 2026 | Initial release |

## References

- [SharePoint Framework documentation](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/)
- [PnPJS documentation](https://pnp.github.io/pnpjs/)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp)
