# WinMix TipsterHub – Dokumentáció

Ez a mappa a projekt teljes dokumentációját tartalmazza. Minden dokumentum a repository **tényleges** állapotából indul ki; ami még nem létezik a kódban, azt külön `Tervezett` jelölés jelzi.

## Olvasási sorrend

| Sorrend | Dokumentum | Kinek szól |
|---|---|---|
| 1 | [USER_GUIDE.md](./USER_GUIDE.md) | Felhasználók, elemzők – mit tud a rendszer és hogyan használd |
| 2 | [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) | Fejlesztők – környezet, architektúra, kódminták |
| 3 | [API_REFERENCE.md](./API_REFERENCE.md) | Fejlesztők – edge function endpointok referenciája |
| 4 | [ANALYTICS_FEATURES.md](./ANALYTICS_FEATURES.md) | Elemzők + fejlesztők – számítási logika, pattern rendszer |
| 5 | [DATA_MANAGEMENT.md](./DATA_MANAGEMENT.md) | Adatmodell, RLS/RBAC, adatminőség, retenció |
| 6 | [TESTING_GUIDE.md](./TESTING_GUIDE.md) | Tesztelési stratégia és konvenciók |
| 7 | [DEPLOYMENT.md](./DEPLOYMENT.md) | Build, publish, secretek, üzemeltetés |
| 8 | [CHANGELOG.md](./CHANGELOG.md) | Verziókövetés |

## Kapcsolódó gyökérszintű dokumentumok

Ezek megmaradnak, történeti / migrációs kontextust adnak:

- `README.md` – projekt rövid bemutatása
- `PHASE9_IMPLEMENTATION.md` – Phase 9 (temporal decay, market integration, collaborative intelligence, self-improving system) implementációs jegyzet
- `MIGRATION_GUIDE_LIGA_SOCCER.md` – a Liga Soccer CRA template Vite-ra migrálásának jegyzőkönyve
- `WEEK1_FOUNDATION_COMPLETE.md` – layout foundation (MainLayout, PageLoader, PageErrorBoundary, usePageData)
- `WinMix_TipsterHub_Phase_3-9_Components_EN.md` – komponens katalógus (EN)
- `docs-fejlesztesi-lepesek-hu.md` – fejlesztési lépések (HU)

## Technológiai stack – egy mondatban

React 18 + TypeScript + Vite frontend, Tailwind CSS + shadcn-ui design rendszer, TanStack Query adatréteg, Lovable Cloud (PostgreSQL + Deno edge functions + RLS) backend.

## Dokumentáció karbantartása

- Új edge function → frissítsd az [API_REFERENCE.md](./API_REFERENCE.md)-t ugyanabban a PR-ban.
- Új tábla vagy oszlop → [DATA_MANAGEMENT.md](./DATA_MANAGEMENT.md).
- Új analitikai számítás → [ANALYTICS_FEATURES.md](./ANALYTICS_FEATURES.md).
- Minden felhasználó által észlelhető változás → [CHANGELOG.md](./CHANGELOG.md) `Unreleased` szekció.
