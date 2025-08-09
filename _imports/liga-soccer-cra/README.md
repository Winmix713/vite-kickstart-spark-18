# Liga Soccer CRA import dropzone

This folder is a safe, isolated place to upload the COMPLETE contents of your CRA template so we can migrate it to Vite without affecting the current app.

- Not compiled, not imported, won’t interfere with the app.
- Lives outside `src/`, so Tailwind/Vite won’t scan or bundle it.

## What to upload here
Upload the original files/folders from your CRA repo root:

Recommended to include
- `package.json` (important for dependency mapping)
- `public/`
- `src/`
- Any CRA configs you had (for reference): `craco.config.js`, `jsconfig.json`, `.env.example`, etc.

Please EXCLUDE (do not upload)
- `node_modules/`
- `build/` or `dist/`
- `coverage/`
- `.git/`, `.github/`, `.DS_Store`
- Real secrets in `.env*` (scrub or provide `.env.example` only)

Tip: If you drag-and-drop via GitHub UI, upload in chunks if the folder is large.

## Folder structure after upload (example)
```
_imports/
  liga-soccer-cra/
    package.json
    public/
    src/
    craco.config.js (optional)
    README.md (original, optional)
```

## How to upload
- Via GitHub: open the repo on GitHub → navigate to `_imports/liga-soccer-cra/` → Add file → Upload files → Commit to a new branch (e.g., `import-liga-soccer`).
- Or push from local git: clone repo → copy CRA files into `_imports/liga-soccer-cra/` → commit & push (prefer a feature branch).

## After you upload
1) Reply here that the upload is complete (and which branch).
2) I will:
   - Inspect the CRA code & dependencies.
   - Prepare Vite config/plugin changes.
   - Map env vars (REACT_APP_* → VITE_*), assets, routes, and styles.
   - Migrate incrementally and test.

For the full step-by-step plan, see the root file: `MIGRATION_GUIDE_LIGA_SOCCER.md`.
