# Telepítés és üzemeltetés

> Vissza: [Dokumentáció index](./README.md)

## Tartalom

- [Környezetek](#környezetek)
- [Build](#build)
- [Publikálás](#publikálás)
- [Környezeti változók](#környezeti-változók)
- [Secretek kezelése](#secretek-kezelése)
- [Edge functionök deployja](#edge-functionök-deployja)
- [Adatbázis-migrációk kivezetése](#adatbázis-migrációk-kivezetése)
- [Ütemezett feladatok](#ütemezett-feladatok)
- [Publikálás utáni ellenőrzőlista](#publikálás-utáni-ellenőrzőlista)
- [Visszaállítás](#visszaállítás)
- [Üzemeltetési monitorozás](#üzemeltetési-monitorozás)

---

## Környezetek

| Környezet | Leírás |
|---|---|
| Fejlesztői | `bun run dev` – Vite dev szerver, HMR-rel |
| Preview | A Lovable preview URL; minden változás azonnal látszik, a Cloud backend ugyanaz |
| Produkció | Publikálás után elérhető URL (és opcionálisan egyedi domain) |

Fontos: a preview és a produkció **ugyanazt a Cloud backendet** használja. Destruktív adatműveletet ezért soha ne próbálj ki preview-ban éles adatokon.

## Build

```bash
bun run dev        # fejlesztői szerver
bun run build      # produkciós build (dist/)
bun run build:dev  # development módú build, forrástérképpel
bun run preview    # a buildelt csomag helyi kiszolgálása
bun run lint       # ESLint
```

A build akkor jó, ha **0 hibával** fut le. Nullától eltérő kilépési kód vagy `Error` sor a kimenetben blokkoló – publikálás előtt javítandó.

## Publikálás

A publikálás a Lovable felületéről történik (Publish gomb). Ez a `dist/` tartalmát teszi közzé; az edge functionök és az adatbázis ettől független módon, a Cloud oldalon élnek.

Publikálás előtt:

1. `bun run build` hibátlanul lefut.
2. `bun run lint` nem ad új hibát.
3. `bunx vitest run` zöld.
4. Az `index.html` `<title>` és `<meta name="description">` a projektre jellemző szöveg.

## Környezeti változók

A frontend csak `VITE_` előtagú változókat lát. Ezek a build során **beépülnek a kliens bundle-be**, tehát nyilvánosak:

| Változó | Tartalom | Titkos? |
|---|---|---|
| `VITE_SUPABASE_URL` | A Cloud projekt URL-je | nem |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Publikus (anon) kulcs | nem |

Ezek megjelenhetnek a kódban – a védelmet az RLS adja, nem a kulcs titkossága.

**Soha ne tegyél privát kulcsot `VITE_` változóba** (service role kulcs, harmadik fél API kulcsa, fizetési titkok). Ezek kizárólag edge function oldali secretek lehetnek.

## Secretek kezelése

A szerveroldali titkokat a Cloud secret tárolójában kell elhelyezni, és edge functionből `Deno.env.get("NEV")` hívással kiolvasni:

```ts
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
if (!supabaseUrl || !supabaseKey) throw new Error("Missing Supabase credentials");
```

Automatikusan elérhető secretek edge functionben: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`.

Szabályok:

- Secret értéke soha nem kerül a repository-ba, logba, hibaüzenetbe vagy válasz payloadba.
- A hiányzó secretet a function indulásakor ellenőrizni kell, beszédes hibával.
- Kulcsrotációkor először az új értéket kell beállítani, majd a functionöket újradeployolni.

## Edge functionök deployja

- A `supabase/functions/<name>/index.ts` fájlok mentése után a deploy automatikus – nincs külön parancs.
- A `supabase/config.toml` tartalmazza a functionönkénti beállításokat; ha egy function nyilvánosan, bejelentkezés nélkül hívható kell legyen, ott kell `verify_jwt = false` értékre állítani.
- Új function létrehozásakor kötelező elemek: `OPTIONS` preflight kezelés, `corsHeaders`, `try/catch`, JSON hibaformátum (`{ error }`), és a nem támogatott metódusra `405`.
- A functionök service role kulccsal futnak, tehát megkerülik az RLS-t – az engedélyezést a function végzi (ld. [DATA_MANAGEMENT](./DATA_MANAGEMENT.md#hozzáférés-kezelés-rls-és-rbac)).

## Adatbázis-migrációk kivezetése

1. A migráció egy logikai változást tartalmazzon.
2. Táblát létrehozó migrációban **kötelező** a `GRANT` blokk, RLS engedélyezés és policy – ebben a sorrendben.
3. Törlő / átnevező migráció előtt győződj meg róla, hogy egyetlen edge function és frontend hívás sem hivatkozik a régi névre (`rg -n "régi_tábla" src supabase`).
4. Migráció után frissítsd a [DATA_MANAGEMENT.md](./DATA_MANAGEMENT.md) tábla-táblázatát.

## Ütemezett feladatok

- A jobok definíciója a `scheduled_jobs` táblában él (cron kifejezés, engedélyezettség, `next_run_at`).
- A futtató a `jobs-scheduler` function, amely az esedékes jobokat indítja; **külső ütemezőnek kell periodikusan hívnia**, service szintű jogosultsággal (enélkül `401`).
- Job típusok és logikájuk: `supabase/functions/_shared/jobs.ts` – `prediction`, `maintenance`, `aggregation`, `data_import`.
- Manuális indítás és ki/bekapcsolás a `/scheduled-jobs` felületről (`jobs-trigger`, `jobs-toggle`); a már futó job újraindítása csak `force: true` mellett lehetséges, egyébként `409`.

Üzemeltetési javaslat: a scheduler hívási gyakorisága legyen sűrűbb, mint a legrövidebb job intervalluma, különben a `next_run_at` csúszni fog.

## Publikálás utáni ellenőrzőlista

- [ ] A publikált URL betölt, nincs fehér képernyő és konzolhiba.
- [ ] Bejelentkezés és kijelentkezés működik.
- [ ] Dashboard adatot mutat (nem üres állapotot hiba miatt).
- [ ] Egy előrejelzés generálása (`analyze-match`) végigfut.
- [ ] `/monitoring` – rendszerállapot minden komponensre `ok`.
- [ ] `/scheduled-jobs` – a jobok `next_run_at` értéke a jövőben van, az utolsó futások sikeresek.
- [ ] Hálózati fülön nincs `401` / `500` válasz a normál használat során.
- [ ] Mobilnézet (390px szélesség) használható.

## Visszaállítás

- **Frontend**: a Lovable verziótörténetéből visszaállítható egy korábbi állapot, majd újrapublikálás.
- **Edge function**: a korábbi kódváltozat visszaállítása után a deploy automatikus.
- **Adatbázis**: a séma visszaállítása mindig **új, visszafelé mutató migrációval** történik, nem korábbi migráció szerkesztésével.
- Hibás job miatti adatromlás esetén először tiltsd le a jobot (`jobs-toggle`), csak azután javíts adatot.

## Üzemeltetési monitorozás

| Jel | Hol |
|---|---|
| Komponensállapot | `monitoring-health` → `/monitoring` |
| Teljesítmény idősorok | `monitoring-metrics` |
| Riasztások | `monitoring-alerts` (severity szerint szűrve) |
| Számítási gráf és futásidők | `monitoring-computation-graph` |
| Job hibák és stack trace | `jobs-logs` → `JobLogsDialog` |

Rendszeres teendő: hetente nézd át a `models-performance` találati arányát és a `models-auto-prune` által kivezetett sablonokat – a hirtelen romló pontosság rendszerint adatminőségi problémára utal, nem modellhibára.
