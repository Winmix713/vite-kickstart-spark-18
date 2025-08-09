# Liga Soccer (CRA) → Vite migration guide

This guide explains exactly how we’ll migrate your CRA template into this Vite + React + Tailwind + TS project while keeping things isolated and safe.

Status: waiting for your CRA upload at `_imports/liga-soccer-cra/`.

## 0) Why `_imports/liga-soccer-cra/`?
- It’s a staging area: not used by build/runtime, so it won’t break anything.
- We review and selectively migrate code into the actual Vite app (`src/`, `index.html`, etc.).

## 1) Inputs we need from your CRA
Upload to `_imports/liga-soccer-cra/`:
- `package.json` (dependency list)
- `public/` and `src/`
- Optional configs (for reference): `craco.config.js`, `jsconfig.json`, `.env.example`
- Please exclude `node_modules`, `build`, `coverage`, `.git` and any real secrets.

## 2) Core migration strategy
- Keep Vite’s `index.html` as the source of truth.
- Incrementally bring CRA code into `src/` and assets into `public/`.
- Replace CRA-only constructs with Vite equivalents (below).

## 3) Dependencies and tooling
From your CRA `package.json`, we’ll install what’s needed in this project. Key groups:
- UI/libs seen in your template: MUI (`@mui/material`, `@emotion/*`), styled-components, Redux Toolkit, Recharts, Day.js/Moment, Lottie, Swiper, DnD Kit, React Grid Layout, Big Calendar, Toastify, etc.
- Styles: `sass` (for `.scss` & CSS Modules: `*.module.scss`).
- SVG as React components: `vite-plugin-svgr`.

Note: We’ll likely switch from `@vitejs/plugin-react-swc` to `@vitejs/plugin-react` (Babel) to enable:
- `@emotion/babel-plugin`
- `babel-plugin-styled-components`
This preserves dev DX (display names, better SSR support if needed) and broad compatibility.

We won’t change build tooling until your CRA is uploaded and reviewed.

## 4) Vite config adjustments (planned)
- Replace `@vitejs/plugin-react-swc` with `@vitejs/plugin-react` and configure Babel:
  - Emotion: `@emotion/babel-plugin`
  - Styled-components: `babel-plugin-styled-components` (optional but recommended)
- Add `vite-plugin-svgr` if CRA used `import { ReactComponent as Icon } from 'icon.svg'`.
- Keep alias `@ → src` (already present). Mirror any CRA path aliases if used.
- If CRA had `proxy` in `package.json`, replicate via `server.proxy` in `vite.config.ts`.

## 5) Environment variables
- `process.env.REACT_APP_*` → `import.meta.env.VITE_*`
- `process.env.NODE_ENV` → `import.meta.env.MODE`
- Public URL handling: use Vite’s static assets in `public/` and direct `/asset.ext` paths.
- Secrets should live outside the repo (provide `.env.example` only).

## 6) Styles and assets
- `.module.scss` works out-of-the-box with Vite once `sass` is installed.
- Keep CRA patterns like `import styles from './styles.module.scss'`.
- Asset paths inside SCSS may need tweaks if they relied on CRA’s special resolvers.
- Tailwind and SCSS modules can co-exist safely.

Example (Lineups component):
```jsx
import styles from './styles.module.scss'
export default function Lineups() {
  return <div className={styles.wrapper}>…</div>
}
```

If SVGs were imported as React components in CRA, we’ll use SVGR:
```jsx
// CRA style
// import { ReactComponent as Logo } from './logo.svg'
// Vite + SVGR
import Logo from './logo.svg?react'
```

## 7) JSX files and TypeScript
- `.jsx` files are fine in Vite. No mass rename to `.tsx` is required.
- If TypeScript type-checking later complains, we can enable `allowJs` or migrate file-by-file.

## 8) Routing and entry composition
- We’ll preserve the current app shell (QueryClient, tooltips, toasters) and add CRA routes/components.
- If CRA had a different `App.jsx` structure, we’ll integrate routes into `src/App.tsx` with `react-router-dom` v6.

## 9) Build scripts and cleanup
- Keep Vite scripts: `dev`, `build`, `preview`.
- Remove CRA-specific scripts/configs once migration is complete (`react-scripts`, `craco`, etc.).

## 10) Step-by-step once upload is done
1. Review CRA code in `_imports/liga-soccer-cra/`.
2. Install missing deps (MUI/Emotion, styled-components, Redux Toolkit, Recharts, Sass, etc.).
3. Switch Vite to `@vitejs/plugin-react` and wire Babel plugins.
4. Add SVGR if needed.
5. Migrate env vars and replace usages.
6. Move components/pages gradually from `_imports/.../src` into `src/` (starting with lowest-risk parts).
7. Integrate routes into `src/App.tsx`.
8. Test locally, fix console errors, adjust config/paths.
9. Remove unused CRA leftovers.

## 11) What I need from you
- Upload your CRA under `_imports/liga-soccer-cra/` and ping me (branch name helps).
- If the template uses a backend/API, share base URLs or a mocked alternative.

Once files are in place, I’ll proceed with the migration and keep each change small and verifiable.
