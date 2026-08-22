# Dokumentációs csomag létrehozása (docs/)

Egy műveletben elkészül a teljes `docs/` mappa 8 dokumentummal, a repository tényleges állapota alapján (React 18 + TypeScript + Vite, Tailwind + shadcn-ui, TanStack Query, Lovable Cloud backend 29 edge functionnel).

## Mit hozok létre

| Fájl | Tartalom |
|---|---|
| `docs/README.md` | Index: melyik dokumentum mire való, olvasási sorrend |
| `docs/USER_GUIDE.md` | Felhasználói kézikönyv: oldalak (Dashboard, Matches, Predictions, Teams, Leagues, Analytics, Cross-League, Models, Monitoring, Scheduled Jobs, Phase9), tipikus munkafolyamatok, fogalomtár (CSS score, BTTS, konfidencia) |
| `docs/DEVELOPER_GUIDE.md` | Környezet indítása, mappastruktúra, alias-ok, design system és tokenek, MainLayout / PageLoader / PageErrorBoundary / usePageData minták, kódstílus, gyakori hibák |
| `docs/API_REFERENCE.md` | A `supabase/functions/` alatti 29 edge function táblázatos referenciája: cél, HTTP metódus, kérés/válasz payload, auth és CORS viselkedés, hibakódok |
| `docs/ANALYTICS_FEATURES.md` | Analytics komponensek és számítási logika: pattern detektálás, konfidencia-számítás, form score, H2H, cross-league korrelációk, model performance; tervezett Streak Analysis és Transition Matrix leírása külön "Tervezett" szekcióban |
| `docs/TESTING_GUIDE.md` | Vitest futtatás, tesztfájl-konvenciók, mit érdemes unit vs. integrációs szinten tesztelni, edge function tesztelés, coverage célok |
| `docs/DATA_MANAGEMENT.md` | Adatmodell áttekintés (matches, teams, leagues, predictions, patterns, jobs), adatbeviteli utak, RLS és RBAC (user_roles + has_role), adatminőségi szabályok, retenció |
| `docs/DEPLOYMENT.md` | Build és publish folyamat, környezeti változók és secretek kezelése, edge function deploy, scheduled jobs, publikálás utáni ellenőrzőlista |
| `docs/CHANGELOG.md` | Keep a Changelog formátum, a projekt eddigi mérföldköveinek visszamenőleges összefoglalásával (Unreleased szekcióval) |

## Elvek

- Nyelv: magyar szöveg, angol technikai kifejezésekkel (a meglévő dokumentumokkal egyezően).
- Csak azt írom le tényként, ami a kódban ténylegesen létezik; a még nem implementált részek külön "Tervezett" jelöléssel szerepelnek — így a dokumentáció nem szalad el a kód elől.
- Kereszthivatkozások a dokumentumok között, minden fájl elején rövid tartalomjegyzék.
- A meglévő gyökérszintű .md fájlokat (README, PHASE9, MIGRATION_GUIDE stb.) nem törlöm, a `docs/README.md` hivatkozik rájuk.

## Technikai megjegyzés

Az API_REFERENCE a `supabase/functions/*/index.ts` fájlok tényleges beolvasásából készül (payload-mezők, státuszkódok), nem feltételezésekből. A dokumentáció nem érinti az alkalmazás kódját — kizárólag új markdown fájlok jönnek létre a `docs/` mappában.
