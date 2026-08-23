# Changelog

> Vissza: [Dokumentáció index](./README.md)

A formátum a [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) elveit követi, a verziószámozás a [Semantic Versioning](https://semver.org/lang/hu/) szerint történik.

Kategóriák: `Hozzáadva`, `Módosítva`, `Elavult`, `Eltávolítva`, `Javítva`, `Biztonság`.

A `package.json` verziója jelenleg `0.0.0` – az első címkézett kiadásig minden változás az `Unreleased` szekcióba kerül.

---

## [Unreleased]

### Hozzáadva

- Teljes `docs/` dokumentációs csomag: index, felhasználói kézikönyv, fejlesztői útmutató, API referencia, analitikai funkciók, adatkezelés, tesztelési útmutató, telepítési leírás és ez a changelog.

### Tervezett (még nem implementált)

- **Streak Analysis**: clean sheet / BTTS / gól nélküli sorozatok detektálása, `team-streaks` edge function, `StreakAnalysis.tsx` felület.
- **Transition Matrix**: Markov-alapú W/D/L állapotátmenetek Laplace-simítással, `TransitionMatrixHeatmap.tsx` hőtérkép.
- **RNG validáció**: Chi-négyzet és Runs teszt (`src/lib/rngValidation.ts`).
- **Backtesting**: historikus adatokon futtatott előrejelzés-kiértékelés.
- **Admin rendszer**: `user_roles` alapú RBAC, `useUserRole` hook, `RoleGate` és `ProtectedRoute`, admin dashboard, felhasználó- és szerepkörkezelés.
- Generált Supabase típusok visszaállítása (`src/integrations/supabase/types.ts` jelenleg üres).

---

## Korábbi mérföldkövek

Az alábbi szakaszok a projekt eddigi fejlesztési szakaszait foglalják össze visszamenőleg, a repository tartalma alapján. Dátum helyett fejlesztési fázisok szerepelnek, mert a munka nem címkézett kiadásokban zajlott.

### Pages refactor – Foundation (Hét 1)

#### Hozzáadva

- `MainLayout` közös oldalkeret (sidebar + topbar), így megszűnt a layout-duplikáció az oldalakban.
- `PageLoader` egységes skeleton betöltő állapot.
- `PageErrorBoundary` oldalszintű hibahatár.
- `usePageData` hook a TanStack Query alapú adatlekérés egységesítésére.

#### Módosítva

- `Teams` és `Leagues` oldalak átállítva az új layout rendszerre.

#### Javítva

- A build hibaszáma 80+-ról 0-ra csökkent: nem használt importok és paraméterek eltávolítása, `react-flow-renderer` típushiba javítása.

### Rendszer-audit és stabilizáció

#### Javítva

- Hibás Supabase metódusláncolás a `src/lib/phase9-api.ts` fájlban.
- Duplikált típus-exportok a `src/types/phase9.ts` fájlban.
- `Header` komponens hibás default/named importjai több oldalon.
- `UserPredictionForm` névütközés feloldása.
- React Query típushibák a `Monitoring.tsx` és `ScheduledJobs.tsx` oldalakon.
- Implicit `any` és lehetséges `undefined` hibák az analitikai komponensekben.

#### Hozzáadva

- Hiányzó függőségek: `dompurify`, `tinycolor2`, `lodash.debounce` és a hozzájuk tartozó típusdefiníciók.

### Editor modul

#### Hozzáadva

- Vizuális szerkesztő: `EditorCanvas`, `EditorToolbar`, `LayerPanel`, `PropertiesPanel`, `ShortcutsHelp`.
- `EditorContext` a szerkesztő állapotának kezelésére.
- Központosított property konfiguráció (`propertyGroupsConfig.ts`), amely feloldotta a `PropertiesPanel` és `PropertyGroup` közti körkörös függőséget.
- `useKeyboardShortcuts` hook.

### Phase 9 – kísérleti modulok

#### Hozzáadva

- Temporal decay: információfrissesség számítása (`information_freshness`).
- Market integration: piaci oddsok és value bet számítás (`market_odds`, `value_bets`).
- Collaborative intelligence: felhasználói tippek és tömegbölcsesség (`user_predictions`, `crowd_wisdom`).
- Self-improving system: feature generálás és kísérleti kiértékelés (`feature_experiments`).
- `src/lib/phase9-api.ts` service réteg és `src/test/phase9.test.ts` Vitest tesztek.

### Monitoring és ütemezés

#### Hozzáadva

- `monitoring-health`, `monitoring-metrics`, `monitoring-alerts`, `monitoring-computation-graph` edge functionök.
- Rendszerállapot, teljesítménygrafikon és számítási gráf felületek.
- Ütemezett feladatok: `jobs-list`, `jobs-logs`, `jobs-toggle`, `jobs-trigger`, `jobs-scheduler`, valamint a `_shared/jobs.ts` job típusok (`prediction`, `maintenance`, `aggregation`, `data_import`).

### Modellek és bajnokságok közti elemzés

#### Hozzáadva

- `models-performance`, `models-compare`, `models-auto-prune` edge functionök és a Models felület.
- Gyengén teljesítő mintázat-sablonok automatikus kivezetése (alap küszöb 45%, minimum mintaelemszám 20).
- `cross-league-analyze` és `cross-league-correlations`, korrelációs hőtérképpel és radar diagrammal.

### Mintázatrendszer

#### Hozzáadva

- `_shared/patterns.ts` detektorok: `detectStreak`, `detectHomeDominance`, `detectHighScoring`, `detectFormSurge`.
- `patterns-detect`, `patterns-team`, `patterns-verify` endpointok.
- Meta-mintázatok: `meta-patterns-discover`, `meta-patterns-apply`.
- Eredmény-visszacsatolás a `pattern_accuracy` táblába.

### Alaprendszer

#### Hozzáadva

- Előrejelzési mag: `analyze-match`, `get-predictions`, `predictions-track`, `predictions-update-results`, `submit-feedback`.
- Konfidencia-számítás 50%-os bázissal és 95%-os felső korláttal, form score és H2H figyelembevételével.
- Lovable Cloud backend: PostgreSQL, RLS, Deno edge functionök.
- React 18 + TypeScript + Vite frontend, Tailwind CSS és shadcn-ui design rendszerrel, TanStack Query adatréteggel.

### Liga Soccer template migráció

#### Módosítva

- A Liga Soccer CRA template átemelése Vite környezetbe: alias-ok, `@mui/base` függőségek kiváltása helyi `TabsBase` és `Popup` implementációval, JSX-et tartalmazó `.js` fájlok átnevezése `.jsx`-re.

---

## Karbantartási szabály

Minden felhasználó által észlelhető változás ugyanabban a változtatásban kerüljön be az `Unreleased` szekcióba. Kiadáskor az `Unreleased` tartalma új verziószám alá kerül, dátummal.
