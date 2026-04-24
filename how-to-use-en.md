# AI-SDLC Matrix — How to Use

## 1. Install

> **Node.js requirement:** version `18.x` (specifically `>=18.17.1 <19.0.0`). Other versions will fail at build time. Use [nvm](https://github.com/nvm-sh/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows) to switch versions if needed.

```
npm install
```

This installs all dependencies from `package.json` into the local `node_modules` folder.

---

## 2. Configure the environment

Copy `.env.template` to `.env` and fill in your SharePoint site values:

| Variable | Example value |
|---|---|
| `SP_SITE_URL` | `https://contoso.sharepoint.com/sites/AI-SDLCRoleMatrix` |
| `SP_FOLDER_ROOT` | `/sites/AI-SDLCRoleMatrix/SitePages/ai-sdlc-matrix` |
| `SP_WORKBENCH_URL` | `https://contoso.sharepoint.com/sites/AI-SDLCRoleMatrix/_layouts/workbench.aspx` |

The `.env` file is gitignored and never committed.

---

## 3. Build

```
gulp bundle --ship
gulp package-solution --ship
```

Run both commands in sequence. The `--ship` flag produces a minified, production-ready build.

**Output:** `sharepoint/solution/ai-sdlc-matrix.sppkg`

This `.sppkg` file is the deployable SharePoint package. Everything needed to run both web parts is bundled inside it.

---

## 4. Upload to SharePoint

1. Open your SharePoint **App Catalog** site.
   - If you don't have one, ask your tenant admin or go to the SharePoint admin center → **More features → Apps → App Catalog**.
2. Go to **Apps for SharePoint** (left navigation) → click **Upload** or drag-and-drop `ai-sdlc-matrix.sppkg`.
3. When prompted — click **Deploy**.
   - Enable **"Make this solution available to all sites in the organization"** if you want tenant-wide deployment without per-site installation.

---

## 5. Add the app to a site

After uploading to the App Catalog:

1. Navigate to your SharePoint site.
2. Go to **Site contents** → **New → App**.
3. Find **ai-sdlc-matrix** and click **Add**.

Once added, two web parts become available in the page editor:

- **AI-SDLC Role Matrix**
- **MD Card**

---

## 6. Web parts

### AI-SDLC Role Matrix

An interactive matrix showing how each role is involved across AI-SDLC phases and maturity levels.

**How it works:**

The matrix has two axes:
- **Columns — Roles:** read dynamically from a folder hierarchy in your SharePoint Site Pages library (see [SharePoint content structure](#7-sharepoint-content-structure) below).
- **Rows — Phases:** fixed set of 8 phases:
  - Base AI Maturity
  - Planning
  - Requirements
  - Design / Architecture
  - Development
  - Testing
  - Deployment / Release
  - Maintenance

At the top, three **maturity level** buttons switch the view:

| Level | Description |
|---|---|
| AI Enabled | Teams using AI tools within existing processes |
| AI-First | AI is the primary working mode |
| AI Native | Fully AI-driven delivery model |

**Reading the matrix:**

Each cell shows a colored dot representing how involved that role is in that phase at the selected maturity level:

| Symbol | Meaning |
|---|---|
| Large purple dot | **Lead** — owns and drives the phase |
| Medium teal dot | **Active** — core contributor |
| Small amber dot | **Review** — reviews and approves outputs |
| Small grey dot | **On-demand** — consulted when needed |
| · (dot) | Not involved |

The **Base AI Maturity** row is special — it shows a document icon when a page exists, instead of an involvement dot. Clicking it opens the maturity overview page for that role.

**Clicking a cell** opens a modal with the corresponding SharePoint page, where the full role description for that phase and level is shown. A button in the modal opens the page in a new tab.

**Developer role** has an extra dropdown in the column header to switch between developer sub-specialisations (e.g. General, Frontend, Backend). The rest of the matrix updates accordingly.

---

### MD Card

Fetches a Markdown (`.md`) file stored in SharePoint and renders it as a formatted card on the page.

**How it works:**

1. Add the **MD Card** web part to any SharePoint page.
2. Open the property pane (click the pencil/edit icon on the web part).
3. Paste the URL or server-relative path to a `.md` file stored in SharePoint.
   - Accepts a full URL: `https://contoso.sharepoint.com/sites/MySite/Shared Documents/readme.md`
   - Accepts a server-relative path: `/sites/MySite/Shared Documents/readme.md`
   - Accepts SharePoint sharing links (the ones starting with `/:t:/s/...`)
4. The card renders Markdown — headings, bold, lists, code blocks, etc.

If the file is not found, the card shows a clear error with the configured path.

---

## 7. SharePoint content structure

The matrix reads its data entirely from SharePoint folder and page hierarchy. No database or external storage is used.

### Folder structure

All content lives under `SitePages/<matrix-root-folder>/`:

```
SitePages/
└── ai-sdlc-matrix/
    ├── <Role>/                        ← one folder per role (e.g. Developer, PM, Architect)
    │   ├── Base-AI-Maturity/
    │   │   ├── ai-enabled.aspx
    │   │   ├── ai-first.aspx
    │   │   └── ai-native.aspx
    │   ├── Planning/
    │   │   ├── ai-enabled.aspx
    │   │   ├── ai-first.aspx
    │   │   └── ai-native.aspx
    │   ├── Requirements/
    │   ├── Design-Architecture/
    │   ├── Development/
    │   ├── Testing/
    │   ├── Deployment-Release/
    │   └── Maintenance/
    │
    └── Developer/                     ← Developer has an extra sub-folder level
        ├── General/
        │   ├── Planning/
        │   │   ├── ai-enabled.aspx
        │   │   └── ...
        │   └── ...
        └── Frontend/
            └── ...
```

- **Role folders** — any folder name you create here becomes a column in the matrix. The matrix discovers them automatically.
- **Phase folders** — must match the exact names listed above (case-sensitive).
- **Level pages** — must be named `ai-enabled.aspx`, `ai-first.aspx`, or `ai-native.aspx`.

### The `Involvement` column

Each `.aspx` page in the hierarchy must have a custom column called `Involvement` in the **Site Pages** library. This value drives the dot shown in the matrix cell.

Valid values (case-insensitive):

| Value | Matrix display |
|---|---|
| `lead` | Large purple dot |
| `active` | Medium teal dot |
| `review` | Small amber dot |
| `on-demand` | Small grey dot |
| *(empty)* | No dot (not involved) |

To set the value: open the page → click **Page details** (or the ⓘ panel) → find the `Involvement` field → select the value.

> If the `Involvement` column does not exist in the Site Pages library, add it manually: **Site Pages library → Add column → Choice** — name it exactly `Involvement` and add the five values above.
