# Analitikai funkciók

> Vissza: [Dokumentáció index](./README.md)

Ez a dokumentum azt írja le, hogyan születik egy előrejelzés: milyen mintázatokat detektál a rendszer, hogyan számol form- és konfidencia-értéket, és mit jelentenek a felületen megjelenő számok.

## Tartalom

- [A számítási lánc](#a-számítási-lánc)
- [Form score](#form-score)
- [Mintázatdetektorok](#mintázatdetektorok)
- [Konfidencia és CSS score](#konfidencia-és-css-score)
- [BTTS előrejelzés](#btts-előrejelzés)
- [Mintázat-pontosság és visszacsatolás](#mintázat-pontosság-és-visszacsatolás)
- [Meta-mintázatok](#meta-mintázatok)
- [Modellteljesítmény](#modellteljesítmény)
- [Bajnokságok közti elemzés](#bajnokságok-közti-elemzés)
- [Phase 9 modulok](#phase-9-modulok)
- [Tervezett: Streak Analysis és Transition Matrix](#tervezett-streak-analysis-és-transition-matrix)

---

## A számítási lánc

```text
matches (befejezett mérkőzések)
   │
   ├─► form score (hazai / vendég, utolsó N meccs)
   ├─► mintázatdetektorok  ──►  detected_patterns
   ├─► H2H előzmények
   │
   ▼
konfidencia = 50 + Σ confidence_boost      (max 95)
   │
   ▼
predictions  (predicted_outcome, confidence_score, css_score, btts_prediction)
   │
   ▼ végeredmény beérkezik (predictions-update-results)
pattern_accuracy  ──►  models-auto-prune  ──►  pattern_templates deaktiválás
```

A lánc belépési pontja az [`analyze-match`](./API_REFERENCE.md#analyze-match) edge function, a közös detektorlogika a `supabase/functions/_shared/patterns.ts` fájlban él.

## Form score

- Bemenet: a csapat legutóbbi mérkőzései (`getRecentMatches`, alap: 10 meccs).
- Pontozás mérkőzésenként: győzelem 3, döntetlen 1, vereség 0.
- Normalizálás: `elért pontok / maximálisan elérhető pontok * 100`, tehát 0–100 közti skála.
- A hazai és vendég form score bekerül a `predictions.prediction_factors.form_scores` mezőbe, így egy előrejelzés utólag is visszafejthető.

Értelmezési segédlet: 70 felett erős forma, 40 alatt gyenge forma; a kettő különbsége (form gap) az egyik legerősebb önálló jelzés.

## Mintázatdetektorok

A `_shared/patterns.ts` négy detektort exportál. Mindegyik egy `template_name`, egy `confidence_boost` és egy szabad `data` objektum hármast ad vissza.

| Detektor | Mit keres | Tipikus boost |
|---|---|---|
| `detectStreak` | Sorozatok: több egymást követő győzelem / veretlenség / vereség | 3–8 |
| `detectHomeDominance` | Kiemelkedő hazai teljesítmény; a `min_home_win_rate` küszöb feletti hazai győzelmi arányt skálázza (`rateScore`) | 6–10 |
| `detectHighScoring` | Magas gólátlagú mérkőzések – a BTTS és Over piacok fő bemenete | 3–7 |
| `detectFormSurge` | Formajavulás: a `calcFormIndex` a régebbi és a friss ablak form-indexét hasonlítja össze | 3–8 |

A `runDetections` fogja össze a futtatást; az `analyze-match` ezen felül a H2H (`h2h_dominance`) mintázatot is számolja a két csapat korábbi találkozóiból, `confidence_boost: 10` értékkel.

A detektálás önállóan is elérhető: [`patterns-detect`](./API_REFERENCE.md#patterns-detect) (futtatás), [`patterns-team`](./API_REFERENCE.md#patterns-team) (tárolt mintázatok), [`patterns-verify`](./API_REFERENCE.md#patterns-verify) (újraellenőrzés friss adatokon).

## Konfidencia és CSS score

```ts
let confidence = 50.0;                       // bázis
for (const p of patterns) confidence += p.confidence_boost;
confidence = Math.min(confidence, 95.0);     // felső korlát
```

- **Bázis 50%** – mintázat nélkül a rendszer nem foglal állást.
- **Felső korlát 95%** – szándékos: sportesemény kimenetele soha nem determinisztikus.
- A `css_score` (Combined Signal Strength) jelenleg **azonos** a `confidence_score` értékkel; a mező azért külön létezik, hogy később eltérő súlyozású, mintázatminőséget is figyelembe vevő pontszám kerülhessen bele a konfidencia megbontása nélkül.

Sávos értelmezés a felületen: 50–60 gyenge jelzés, 60–75 mérsékelt, 75–85 erős, 85+ nagyon erős (de továbbra sem garancia).

## BTTS előrejelzés

A `btts_prediction` boolean a két csapat gólszerzési és kapott gól mutatóiból, valamint a `high_scoring` mintázat jelenlétéből áll elő. Ha mindkét csapat rendszeresen szerez gólt és a magas gólátlag mintázat aktív, a mező `true`.

## Mintázat-pontosság és visszacsatolás

1. A végeredmény a [`predictions-update-results`](./API_REFERENCE.md#predictions-update-results) (vagy felhasználói úton a `submit-feedback`) endpointon érkezik.
2. A rendszer kiértékeli az előrejelzést (talált / nem talált), és frissíti a `pattern_accuracy` táblát minden olyan mintázatra, amely hozzájárult a döntéshez.
3. A `models-auto-prune` a `pattern_accuracy` alapján deaktiválja azokat a `pattern_templates` sorokat, amelyeknél a mintaelemszám ≥ `min_sample_size` (alap 20) és a pontosság < `threshold` (alap 45%).

Ez a hurok teszi a rendszert önkorrigálóvá: a gyakran tévedő mintázat idővel kikerül a döntésből.

Validáció: a félidei gólszám nem lehet nagyobb a végeredménynél – az endpoint `400`-zal utasítja el.

## Meta-mintázatok

A `meta-patterns-discover` mintázat-kombinációkat keres a `detected_patterns` előzményekben (mely mintázatok együttes előfordulása jár a szokásosnál jobb találati aránnyal), és a `meta_patterns` táblába ír. A `meta-patterns-apply` egy konkrét előrejelzésre alkalmazza a megtalált meta-mintázatot, felülírva/kiegészítve a konfidenciát.

## Modellteljesítmény

- `models-performance`: egy modellverzió (`version`, alap `v1`) találati aránya és mintaelemszáma adott időablakra; az eredményt a `model_performance` táblába upsertálja.
- `models-compare`: több verzió összevetése azonos időablakon, eredmény a `model_comparison` táblában.
- Felület: `src/pages/Models.tsx`, `src/components/models/ModelCard.tsx`, `src/components/ModelPerformanceChart.tsx`.

Metrikák, amelyeket érdemes együtt olvasni: találati arány, mintaelemszám (kis minta = zaj), és a konfidencia-sávonkénti bontás (jól kalibrált modellnél a 80%-os sáv kb. 80%-ban talál).

## Bajnokságok közti elemzés

- `cross-league-analyze` bajnokságjellemzőket számol (`league_characteristics`): gólátlag, hazai előny, döntetlen-arány.
- `cross-league-correlations` két bajnokság közti korrelációt számol, alapértelmezetten `scoring_trend` típusra (`cross_league_correlations`).
- Felület: `src/pages/CrossLeague.tsx`, `CorrelationHeatmap.tsx`, `LeagueComparisonRadarChart.tsx`.

Használat: ha egy mintázat az egyik bajnokságban megbízható és a két bajnokság korrelációja magas, a mintázat átvitele a másikra ésszerű kiindulás – de mindig külön mérendő.

## Phase 9 modulok

| Modul | Elemzési tartalom |
|---|---|
| Temporal decay | Az információ frissessége időben csökkenő súlyt kap (`information_freshness`); az elavult bemenet kiszűrhető |
| Market integration | Piaci oddsok (`market_odds`) és a modell valószínűségének különbségéből value bet számítás (`value_bets`, alap küszöb `minExpectedValue: 0.05`) |
| Collaborative intelligence | Felhasználói tippek (`user_predictions`) aggregálása tömegbölcsesség mutatóvá (`crowd_wisdom`) |
| Self-improving system | Feature-jelöltek generálása és kísérleti kiértékelése (`feature_experiments`), folyamatos tanulási ciklus |

Részletes endpoint-leírás: [API_REFERENCE](./API_REFERENCE.md#phase-9-kísérleti-modulok).

## Tervezett: Streak Analysis és Transition Matrix

Ezek **még nem implementált** funkciók, itt a tervezett viselkedés szerepel, hogy a fejlesztés egységes fogalmakkal induljon.

### Streak Analysis (tervezett)

- Kiterjesztés a `_shared/patterns.ts` fájlban: clean sheet sorozat, BTTS sorozat, gól nélküli sorozat.
- Új edge function: `team-streaks` – csapatonként az aktív sorozatok és azok történeti hossz-eloszlása.
- Frontend: `StreakAnalysis.tsx` – aktív sorozat, leghosszabb sorozat, a sorozat folytatódásának historikus aránya.

### Transition Matrix (tervezett)

- Markov-alapú állapotátmenetek: az állapot a mérkőzés kimenete (W/D/L), a mátrix az egymást követő mérkőzések közti átmenetek gyakorisága.
- Laplace-simítás a ritka átmenetek kezelésére (minden cellához +1, hogy a nulla valószínűség ne torzítson).
- Frontend: `TransitionMatrixHeatmap.tsx` – SVG hőtérkép, sor = előző állapot, oszlop = következő állapot.

### RNG validáció (tervezett)

- `src/lib/rngValidation.ts`: Chi-négyzet teszt (eloszlás-egyezés) és Runs teszt (sorozat-függetlenség) a bemeneti adatsorok véletlenszerűségének ellenőrzésére.
- Cél: kiszűrni azokat az adatforrásokat, amelyek statisztikailag nem viselkednek valós mérkőzésadatként.
