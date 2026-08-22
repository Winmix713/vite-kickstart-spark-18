# API referencia – Edge functions

> Vissza: [Dokumentáció index](./README.md)

Minden endpoint a Lovable Cloud edge function futtatókörnyezetben fut, és a következő bázis URL alatt érhető el:

```text
https://<project-ref>.supabase.co/functions/v1/<function-name>
```

Frontendről a javasolt hívási mód:

```ts
const { data, error } = await supabase.functions.invoke("jobs-list", {
  body: { /* POST payload */ },
})
```

## Közös viselkedés

- **CORS**: minden function kezeli az `OPTIONS` preflightot, `Access-Control-Allow-Origin: *` fejlécekkel.
- **Content-Type**: a válasz mindig `application/json`.
- **Hibaformátum**: `{ "error": "üzenet" }`, néhol `details` mezővel kiegészítve.
- **Státuszkódok**: `400` hiányzó/érvénytelen paraméter, `401` hiányzó jogosultság (scheduler), `404` nem létező erőforrás, `405` nem támogatott metódus, `409` konfliktus (már futó job), `500` váratlan hiba.
- **Adatbázis-hozzáférés**: a functionök service role kulccsal futnak, tehát megkerülik az RLS-t – az engedélyezés logikáját a function maga végzi.

---

## Előrejelzés és mérkőzéselemzés

### `analyze-match`

Elemez egy mérkőzést, mintázatokat detektál, és elment egy előrejelzést.

- **Metódus**: `POST`
- **Kérés**: `{ "matchId": "uuid" }`
- **Válasz `200`**:

```json
{
  "prediction": { "id": "...", "match_id": "...", "predicted_outcome": "home_win",
                  "confidence_score": 71, "css_score": 71, "btts_prediction": true,
                  "prediction_factors": { "patterns": [], "form_scores": {}, "h2h_matches_considered": 3 } },
  "patterns": [{ "template_name": "h2h_dominance", "confidence_boost": 10, "data": {} }],
  "form_scores": { "home": 80, "away": 40 }
}
```

- **Hibák**: `400` hiányzó `matchId`; `404` nem található mérkőzés; `500` mentési hiba.
- **Mellékhatás**: sor beszúrása a `predictions` és a `detected_patterns` táblákba.

### `get-predictions`

Előrejelzések listázása.

- **Metódus**: `GET`
- **Query paraméterek**: `status` (`scheduled` vagy `finished`), `limit` (alap: `20`)
- **Válasz `200`**: előrejelzések tömbje, a kapcsolódó mérkőzés- és csapatadatokkal.

### `predictions-track`

Előrejelzés kimenetének nyomon követése / rögzítése.

- **Metódus**: `POST` (más metódusra `405`)
- **Kérés**: előrejelzés-azonosító és a követendő állapot mezői.
- **Válasz `200`**: a frissített előrejelzés. `400` érvénytelen payload esetén.

### `predictions-update-results`

Végeredmény visszavezetése: kiértékeli az előrejelzést és frissíti a mintázatok pontosságát.

- **Metódus**: `POST`
- **Kérés**: mérkőzésazonosító, `home_score`, `away_score`, opcionálisan félidei eredmények.
- **Validáció**: a félidei gólszám nem lehet nagyobb a végeredménynél → `400`.
- **Válasz `200`**: frissített előrejelzés + mintázat-pontosság állapot. `404`, ha nincs előrejelzés a mérkőzéshez.
- **Mellékhatás**: `matches`, `predictions`, `pattern_accuracy` frissítése.

### `submit-feedback`

Felhasználói eredmény-visszajelzés fogadása.

- **Metódus**: `POST`
- **Kérés**: `{ matchId, homeScore, awayScore, halfTimeHomeScore?, halfTimeAwayScore? }`
- **Hiba**: `400` hiányzó kötelező mező.

---

## Mintázatok (patterns)

### `patterns-detect`

Mintázatok detektálása egy csapatra.

- **Metódus**: `GET` vagy `POST`
- **GET query**: `team_name`, `team_id`, `pattern_types` (vesszővel elválasztva)
- **POST body**: ugyanezek a mezők JSON-ban
- **Válasz `200`**: detektált / frissített mintázatok listája.
- **Hibák**: `400` ha sem `team_name`, sem `team_id` nincs megadva; `404` ismeretlen csapatnév.
- **Mellékhatás**: `team_patterns` írása.

### `patterns-team`

Egy csapat tárolt mintázatainak lekérése (nem futtat detektálást).

- **Metódus**: `GET` vagy `POST`
- **Paraméterek**: `team_name` vagy `team_id`
- **Válasz `200`**: `team_patterns` sorok. `404` ismeretlen csapat.

### `patterns-verify`

Tárolt mintázatok újraellenőrzése friss adatokon, és állapotuk frissítése.

- **Metódus**: `GET` vagy `POST`
- **Paraméterek**: `team_name` / `team_id`, opcionálisan `pattern_types`
- **Válasz `200`**: ellenőrzött mintázatok, érvényességi státusszal.

### `meta-patterns-discover`

Mintázatok kombinációiból magasabb szintű meta-mintázatokat keres a `detected_patterns` és `pattern_templates` adatokból.

- **Metódus**: `POST` (egyébként `405`)
- **Kérés**: opcionális küszöbparaméterek.
- **Mellékhatás**: beszúrás a `meta_patterns` táblába.

### `meta-patterns-apply`

Egy meta-mintázat alkalmazása egy előrejelzésre.

- **Metódus**: `POST`
- **Kérés**: meta-pattern azonosító + előrejelzés azonosító.
- **Hibák**: `400` hiányzó mező; `404` ismeretlen meta-pattern vagy előrejelzés.
- **Mellékhatás**: `predictions` frissítése.

---

## Modellek

### `models-performance`

Modellverzió teljesítménye adott időszakra.

- **Metódus**: `GET` (egyébként `405`)
- **Query**: `version` (alap: `v1`), `start` (alap: 30 nappal ezelőtt, ISO), `end` (alap: most)
- **Válasz `200`**: aggregált metrikák (találati arány, mintaelemszám, időbeli bontás).
- **Mellékhatás**: upsert a `model_performance` táblába.

### `models-compare`

Két vagy több modellverzió összehasonlítása.

- **Metódus**: `POST` (egyébként `405`)
- **Kérés**: az összehasonlítandó verziók és az időablak.
- **Hibák**: `400` hiányzó vagy érvénytelen verziólista.
- **Mellékhatás**: `model_comparison` írása.

### `models-auto-prune`

Gyengén teljesítő mintázat-sablonok automatikus kivezetése.

- **Metódus**: `POST`
- **Kérés**: `{ "threshold": 45, "min_sample_size": 20 }` (alapértékek)
- **Logika**: a `pattern_accuracy` alapján a `min_sample_size` feletti mintaelemszámú, `threshold` alatti pontosságú sablonokat deaktiválja.
- **Válasz `200`**: a kivezetett sablonok listája.

---

## Bajnokságok közti elemzés

### `cross-league-analyze`

Bajnokságjellemzők számítása és tárolása.

- **Metódus**: `POST` (egyébként `405`)
- **Kérés**: az elemzendő bajnokság(ok) azonosítói.
- **Hibák**: `400` hiányzó paraméter.
- **Mellékhatás**: `league_characteristics` írása.

### `cross-league-correlations`

Két bajnokság közti korreláció lekérése vagy újraszámítása.

- **Metódus**: `GET` vagy `POST` (egyébként `405`)
- **GET query**: `league_a`, `league_b`, `type` (alap: `scoring_trend`)
- **POST**: ugyanezek body-ban; a POST újraszámol és ment.
- **Válasz `200`**: korrelációs érték(ek) a bajnokságok metaadataival.
- **Mellékhatás**: `cross_league_correlations` írása POST esetén.

---

## Ütemezett feladatok (jobs)

### `jobs-list`

Az összes ütemezett job összefoglalója.

- **Metódus**: `GET`
- **Válasz `200`**: `{ "jobs": JobSummary[] }` – jobonként a cron ütemezés, engedélyezettség, következő futás, átlagos futásidő, futásstatisztika és az utolsó napló. A típus: `src/types/jobs.ts`.

### `jobs-logs`

Futási naplók.

- **Metódus**: `GET` vagy `POST`
- **GET query**: `job_id`, `limit`
- **POST body**: ugyanezek
- **Válasz `200`**: `{ "logs": JobLog[] }`. `400`, ha hiányzik a job azonosító.

### `jobs-toggle`

Job engedélyezése / letiltása.

- **Metódus**: `POST` (egyébként `405`)
- **Kérés**: `{ "jobId": "uuid", "enabled": true }`
- **Válasz `200`**: `{ "job": JobSummary }`. `400` hiányzó mező, `404` ismeretlen job.

### `jobs-trigger`

Job manuális indítása.

- **Metódus**: `POST` (egyébként `405`)
- **Kérés**: `{ "jobId": "uuid", "force": false }`
- **Válasz `200`**: `{ "result": JobExecutionResult }`
- **Hibák**: `400` hiányzó `jobId`; `404` ismeretlen job; `409` a job már fut (`force: true` felülbírálja).

### `jobs-scheduler`

Az esedékes jobok futtatója – ütemezett hívásra készült, nem UI-ból.

- **Metódus**: `POST` (egyébként `405`)
- **Auth**: érvényes szolgáltatásszintű hívó szükséges, különben `401`.
- **Logika**: végigmegy a `scheduled_jobs` táblán, és lefuttatja azokat, amelyeknek a `next_run_at` értéke esedékes.

A job típusonkénti tényleges logikát a `supabase/functions/_shared/jobs.ts` tartalmazza: `prediction`, `maintenance`, `aggregation`, `data_import`.

---

## Monitoring

### `monitoring-health`

- **Metódus**: `GET`
- **Válasz `200`**: a `system_health` tábla komponensenkénti állapota.

### `monitoring-metrics`

- **Metódus**: `GET` vagy `POST`
- **Paraméterek**: `component`, `metricType` (vagy `metric_type`), `start`, `end`
- **Válasz `200`**: performance metrika idősorok a `performance_metrics` táblából.

### `monitoring-alerts`

- **Metódus**: `GET` vagy `POST`
- **Paraméterek**: `severity`
- **Válasz `200`**: a rendszerállapotból és metrikákból származtatott riasztások.

### `monitoring-computation-graph`

- **Metódus**: `GET`
- **Válasz `200`**:

```json
{
  "nodes": [{ "id": "n1", "data": { "label": "...", "status": "ok", "nodeType": "...",
              "executionTimeMs": 120, "lastRun": "..." }, "position": { "x": 0, "y": 0 } }],
  "edges": [{ "id": "n1-n2", "source": "n1", "target": "n2" }]
}
```

A `dependencies` tömbből épülnek az élek; a válasz közvetlenül a gráf-nézet formátuma.

---

## Phase 9 (kísérleti modulok)

Ezek a functionök **útvonalszegmens alapján** ágaznak el, ezért a hívásnál a function nevéhez alútvonalat kell fűzni.

### `phase9-temporal-decay`

| Alútvonal | Metódus | Leírás |
|---|---|---|
| `/freshness` | `POST` | Információfrissesség számítása és tárolása (`information_freshness`) |
| `/check-stale` | `POST` | Elavult információk kigyűjtése |

Ismeretlen alútvonal: `404`.

### `phase9-market-integration`

| Alútvonal | Metódus | Leírás |
|---|---|---|
| `/odds/:matchId` | `GET` | Piaci oddsok egy mérkőzésre (`market_odds`) |
| `/value-bets` | `GET` | Value bet lista; query: `maxResults` (alap `50`), `minExpectedValue` (alap `0.05`) |

Mellékhatás: `value_bets` írása.

### `phase9-collaborative-intelligence`

| Alútvonal | Metódus | Leírás |
|---|---|---|
| `/user` | `POST` | Felhasználói előrejelzés rögzítése (`user_predictions`) |
| `/crowd/:matchId` | `GET` | Tömegbölcsesség aggregátum (`crowd_wisdom`) |

### `phase9-self-improving-system`

| Alútvonal | Metódus | Leírás |
|---|---|---|
| `/generate-features` | `POST` | Új feature-jelöltek generálása (`feature_experiments`) |
| `/test-feature` | `POST` | Egy feature kísérleti kiértékelése |
| `/continuous-learning` | `POST` | Folyamatos tanulási ciklus futtatása |

---

## Endpoint összefoglaló

| Function | Metódus | Fő tábla |
|---|---|---|
| `analyze-match` | POST | predictions, detected_patterns |
| `get-predictions` | GET | predictions |
| `predictions-track` | POST | predictions |
| `predictions-update-results` | POST | matches, predictions, pattern_accuracy |
| `submit-feedback` | POST | matches |
| `patterns-detect` | GET/POST | team_patterns |
| `patterns-team` | GET/POST | team_patterns |
| `patterns-verify` | GET/POST | team_patterns |
| `meta-patterns-discover` | POST | meta_patterns |
| `meta-patterns-apply` | POST | predictions |
| `models-performance` | GET | model_performance |
| `models-compare` | POST | model_comparison |
| `models-auto-prune` | POST | pattern_templates, pattern_accuracy |
| `cross-league-analyze` | POST | league_characteristics |
| `cross-league-correlations` | GET/POST | cross_league_correlations |
| `jobs-list` | GET | scheduled_jobs, job_execution_logs |
| `jobs-logs` | GET/POST | job_execution_logs |
| `jobs-toggle` | POST | scheduled_jobs |
| `jobs-trigger` | POST | scheduled_jobs, job_execution_logs |
| `jobs-scheduler` | POST | scheduled_jobs |
| `monitoring-health` | GET | system_health |
| `monitoring-metrics` | GET/POST | performance_metrics |
| `monitoring-alerts` | GET/POST | system_health, performance_metrics |
| `monitoring-computation-graph` | GET | computation_graph |
| `phase9-temporal-decay` | POST | information_freshness |
| `phase9-market-integration` | GET | market_odds, value_bets |
| `phase9-collaborative-intelligence` | GET/POST | user_predictions, crowd_wisdom |
| `phase9-self-improving-system` | POST | feature_experiments |
