# Adatkezelés

> Vissza: [Dokumentáció index](./README.md)

## Tartalom

- [Fontos megjegyzés a séma forrásáról](#fontos-megjegyzés-a-séma-forrásáról)
- [Adatmodell áttekintés](#adatmodell-áttekintés)
- [Táblák szerepe](#táblák-szerepe)
- [Adatbeviteli utak](#adatbeviteli-utak)
- [Hozzáférés-kezelés: RLS és RBAC](#hozzáférés-kezelés-rls-és-rbac)
- [Grant szabály](#grant-szabály)
- [Adatminőségi szabályok](#adatminőségi-szabályok)
- [Retenció és karbantartás](#retenció-és-karbantartás)
- [Migrációk](#migrációk)

---

## Fontos megjegyzés a séma forrásáról

A `src/integrations/supabase/types.ts` jelenleg **üres** – nincs benne generált tábla-típus (`Tables: { [_ in never]: never }`). Ez a dokumentum ezért **nem generált sémából**, hanem az edge functionök kódjában ténylegesen hivatkozott táblanevekből épül fel (`supabase/functions/**/index.ts`). A leírt oszlopok azok, amelyeket a kód olvas vagy ír; a tábláknak lehetnek további, kódból nem érintett oszlopai.

Következmény a fejlesztésre: a frontend Supabase hívások jelenleg nem kapnak típusellenőrzést. Séma-változás után érdemes a típusokat újragenerálni, hogy a `types.ts` valós sémát írjon le.

## Adatmodell áttekintés

```text
leagues ──< teams ──< matches >── predictions ──< detected_patterns
                          │            │                  │
                          │            │                  └─► pattern_templates
                          │            └─► pattern_accuracy ─┘
                          │
                          ├─► team_patterns
                          ├─► market_odds ──► value_bets
                          └─► user_predictions ──► crowd_wisdom

pattern_templates ──► meta_patterns
model_performance / model_comparison        (modellértékelés)
league_characteristics / cross_league_correlations   (bajnokságok közti)
scheduled_jobs ──< job_execution_logs        (ütemezés)
system_health / performance_metrics / computation_graph   (monitoring)
information_freshness / feature_experiments  (Phase 9)
```

## Táblák szerepe

### Alaptörzs

| Tábla | Szerep | Kód szerint használt mezők |
|---|---|---|
| `leagues` | Bajnokságok törzsadata | név, ország, szezon |
| `teams` | Csapatok, bajnoksághoz kötve | `id`, `name`, `league_id` |
| `matches` | Mérkőzések, ütemezett és befejezett egyaránt | `id`, `home_team_id`, `away_team_id`, `match_date`, `status`, `home_score`, `away_score`, félidei gólok |

A `matches.status` a `scheduled` / `finished` megkülönböztetést hordozza – erre szűr a `get-predictions` is.

### Előrejelzés

| Tábla | Szerep | Kulcsmezők |
|---|---|---|
| `predictions` | Egy mérkőzésre adott előrejelzés | `match_id`, `predicted_outcome`, `confidence_score`, `css_score`, `btts_prediction`, `prediction_factors` (JSON: patterns, form_scores, h2h_matches_considered) |
| `detected_patterns` | Az adott előrejelzéshez detektált mintázatok | `template_name`, `confidence_contribution`, `data` (JSON) |
| `pattern_templates` | Mintázat-sablonok katalógusa, aktív/inaktív jelzéssel | név, típus, aktív flag |
| `pattern_accuracy` | Sablononkénti találati statisztika | mintaelemszám, pontosság |
| `team_patterns` | Csapatszinten tárolt, detektált mintázatok | `team_id`, mintázattípus, érvényesség |
| `meta_patterns` | Mintázat-kombinációkból származó magasabb szintű minták | komponens sablonok, teljesítmény |

### Modell és bajnokság

| Tábla | Szerep |
|---|---|
| `model_performance` | Modellverziónkénti teljesítmény időablakra (upsert) |
| `model_comparison` | Verziók összehasonlításának eredménye |
| `league_characteristics` | Bajnokságjellemzők (gólátlag, hazai előny, döntetlen-arány) |
| `cross_league_correlations` | Két bajnokság közti korreláció, típussal (`scoring_trend` stb.) |

### Üzemeltetés

| Tábla | Szerep |
|---|---|
| `scheduled_jobs` | Job definíciók: cron ütemezés, engedélyezettség, `next_run_at` |
| `job_execution_logs` | Futási naplók: `started_at`, `completed_at`, `status`, `duration_ms`, `records_processed`, `error_message`, `error_stack` |
| `system_health` | Komponensenkénti állapot |
| `performance_metrics` | Metrika idősorok (`component`, `metric_type`, időbélyeg) |
| `computation_graph` | Számítási gráf csomópontjai és függőségei (`dependencies` → élek) |

### Phase 9

| Tábla | Szerep |
|---|---|
| `information_freshness` | Információ frissessége / időbeli súlyozás |
| `market_odds` | Piaci oddsok mérkőzésenként |
| `value_bets` | Számított value betek (`expected_value` küszöb felett) |
| `user_predictions` | Felhasználói tippek |
| `crowd_wisdom` | Tömegbölcsesség aggregátum mérkőzésenként |
| `feature_experiments` | Generált feature-jelöltek és kiértékelésük |

## Adatbeviteli utak

1. **Mérkőzésadat felvitel / import** – `src/pages/Upload.tsx`, illetve a `data_import` típusú ütemezett jobok (`_shared/jobs.ts`).
2. **Előrejelzés generálás** – `analyze-match` (`predictions`, `detected_patterns` írása).
3. **Eredmény visszavezetés** – `predictions-update-results` (adminisztratív) vagy `submit-feedback` (felhasználói); mindkettő frissíti a `matches` és a `predictions` sorokat, majd a `pattern_accuracy` értékeket.
4. **Aggregációk** – `aggregation` típusú jobok, `models-performance`, `cross-league-analyze`.
5. **Karbantartás** – `maintenance` jobok és `models-auto-prune`.

Alapelv: a származtatott adatot (pontosság, jellemzők, korrelációk) **soha ne írjuk kézzel** – mindig az azt előállító function/job írja, hogy újraszámolható maradjon.

## Hozzáférés-kezelés: RLS és RBAC

- Minden `public` séma alatti tábla RLS-szel védett.
- A szerepköröket **külön `user_roles` táblában** kell tárolni (`user_id`, `role` enum), soha nem a profil- vagy user táblában – a profilon tárolt szerepkör jogosultság-emelési támadást tesz lehetővé.
- A szerepkör-ellenőrzés `SECURITY DEFINER` függvénnyel történik, hogy ne keletkezzen rekurzív RLS-hivatkozás:

```sql
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;
```

Policy-ben így használandó:

```sql
create policy "Admins can manage scheduled jobs"
on public.scheduled_jobs
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'));
```

**Az edge functionök service role kulccsal futnak, tehát megkerülik az RLS-t.** Ezért minden olyan functionnél, amely írási vagy adminisztratív műveletet végez, magának a functionnek kell elvégeznie a jogosultság-ellenőrzést a hívó tokenje alapján. A `jobs-scheduler` ezért utasít el `401`-gyel érvényes szolgáltatásszintű hívó nélkül.

Frontend oldali szerepkör-ellenőrzés (pl. admin menüpont elrejtése) csak kényelmi funkció – nem biztonsági határ. Soha ne dönts jogosultságról `localStorage` vagy más kliensoldali tárolás alapján.

## Grant szabály

Új tábla létrehozásakor a `GRANT` **kötelező, ugyanabban a migrációban** – az RLS önmagában nem elég, PostgREST enélkül jogosultsági hibát ad. A sorrend kötött:

```sql
create table public.example (...);

grant select, insert, update, delete on public.example to authenticated;
grant all on public.example to service_role;
-- grant select on public.example to anon;  -- CSAK ha van anon olvasást engedő policy

alter table public.example enable row level security;

create policy "..." on public.example ...;
```

## Adatminőségi szabályok

| Szabály | Hol érvényesül |
|---|---|
| Félidei gólszám ≤ végeredmény | `predictions-update-results` → `400` |
| Egy mérkőzéshez egy aktív előrejelzés | `predictions` írási logika |
| Csapat csak létező bajnoksághoz köthető | `teams.league_id` FK |
| Mintázat csak létező sablonra hivatkozhat | `detected_patterns` → `pattern_templates` |
| Statisztika csak elegendő mintaelemszám felett értelmezhető | `models-auto-prune` `min_sample_size` (alap 20) |
| Üres bemenet nem eredményezhet `NaN`-t | számítási függvények (ld. [TESTING_GUIDE](./TESTING_GUIDE.md)) |

Gyakorlati ellenőrzés adatimport után: hiányzó `match_date`, azonos hazai és vendég csapat, negatív gólszám, jövőbeli dátumú `finished` mérkőzés.

## Retenció és karbantartás

Javasolt (a `maintenance` job típushoz köthető) irányelvek:

| Adat | Megőrzés |
|---|---|
| `job_execution_logs` | 90 nap, utána törölhető |
| `performance_metrics` | 30 nap részletes, azon túl napi aggregátum |
| `system_health` | csak az aktuális állapot + 30 nap előzmény |
| `matches`, `predictions`, `detected_patterns` | korlátlan – ez a modell tanulási alapja, nem törlendő |
| `market_odds`, `value_bets` | a mérkőzés lezárása után 180 nap |

## Migrációk

- Minden sémaváltozás migrációként megy ki, kézi módosítás nélkül.
- Egy migráció egy logikai változást tartalmazzon, visszafelé kompatibilis lépésekben (először oszlop hozzáadása nullable-ként, adatfeltöltés, majd megszorítás).
- Táblát létrehozó migráció grant nélkül **hibás** – deploy előtt olvasd újra a SQL-t.
- Séma után frissítsd ezt a dokumentumot és a [DEVELOPER_GUIDE](./DEVELOPER_GUIDE.md) adatréteg szakaszát ugyanabban a változásban.
