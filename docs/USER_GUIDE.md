# Felhasználói kézikönyv

> Vissza: [Dokumentáció index](./README.md)

## Tartalom

1. [Mire való a WinMix TipsterHub](#mire-való-a-winmix-tipsterhub)
2. [Navigáció és oldalak](#navigáció-és-oldalak)
3. [Tipikus munkafolyamatok](#tipikus-munkafolyamatok)
4. [Fogalomtár](#fogalomtár)
5. [Gyakori kérdések](#gyakori-kérdések)

---

## Mire való a WinMix TipsterHub

A WinMix TipsterHub futball mérkőzések elemzésére és előrejelzésére szolgáló platform. A rendszer:

- korábbi mérkőzésadatokból **mintázatokat (pattern)** detektál,
- ezekből **konfidencia-pontszámmal** ellátott előrejelzést készít,
- visszaméri, hogy egy-egy mintázat hosszú távon mennyire volt pontos,
- és mindezt dashboardokon, riportokon keresztül teszi átláthatóvá.

A hangsúly nem az egyedi tippen van, hanem azon, hogy **mérhető és visszatesztelhető** legyen, melyik szabály működik.

---

## Navigáció és oldalak

Az alkalmazás útvonalai (a bal oldali Sidebar / felső TopBar segítségével érhetők el):

| Útvonal | Oldal | Mit csinál |
|---|---|---|
| `/` | **Index** | Nyitóoldal: bemutatás, gyors belépési pontok, kiemelt előrejelzések |
| `/dashboard` | **Dashboard** | Összefoglaló KPI kártyák, legutóbbi előrejelzések, pattern teljesítmény grafikon |
| `/predictions` | **Predictions** | Az összes előrejelzés listája, státusz és limit szerint szűrve |
| `/predictions/new` | **New Prediction** | Új elemzés indítása kiválasztott mérkőzésre |
| `/matches` | **Matches** | Mérkőzéslista (időpont, csapatok, státusz, eredmény) |
| `/match/:id` | **Match Detail** | Egy mérkőzés részletei: forma, H2H, detektált mintázatok, előrejelzés |
| `/teams` | **Teams** | Csapatlista |
| `/teams/:teamName` | **Team Detail** | Csapat statisztikák és a csapathoz kötött mintázatok |
| `/leagues` | **Leagues** | Bajnokságok és jellemzőik (pl. átlagos gólszám) |
| `/analytics` | **Analytics** | Mélyebb elemzések, teljesítmény idősorok |
| `/crossleague` | **Cross-League** | Bajnokságok közti korrelációk és összehasonlító radar chart |
| `/models` | **Models** | Modellverziók, összehasonlítás, teljesítménymutatók |
| `/monitoring` | **Monitoring** | Rendszerállapot, performance metrikák, computation graph, riasztások |
| `/jobs` | **Scheduled Jobs** | Ütemezett feladatok állapota, manuális indítás, futási naplók |
| `/phase9` | **Phase 9** | Kísérleti modulok: temporal decay, market integration, collaborative intelligence, self-improving system |
| `/soccer` | **Soccer Hub** | Külső sportadat integráció felülete |

---

## Tipikus munkafolyamatok

### 1. Előrejelzés készítése egy mérkőzésre

1. Nyisd meg a **Matches** oldalt, és keresd meg a mérkőzést (`scheduled` státusz).
2. Kattints a mérkőzésre → **Match Detail**.
3. Indítsd el az elemzést. A rendszer lekéri mindkét csapat utolsó 5 mérkőzését, az egymás elleni (H2H) találkozókat, majd mintázatokat keres.
4. Az eredmény: egy előrejelzett kimenet (`home_win` / `draw` / `away_win`), egy konfidencia-érték és a felhasznált mintázatok listája.

### 2. Eredmény visszavezetése és tanulás

1. A mérkőzés lejátszása után rögzítsd a végeredményt (és opcionálisan a félidei állást).
2. A rendszer megjelöli az előrejelzést helyesnek vagy helytelennek, és frissíti az érintett mintázatok pontossági statisztikáját.
3. A **Dashboard** és a **Models** oldalon látszik, hogyan mozdult el a modell teljesítménye.

### 3. Mintázat teljesítményének ellenőrzése

1. Nyisd meg a **Dashboard** → *Pattern Performance* grafikont, vagy a **Models** oldalt.
2. Nézd meg a mintázat mintaelemszámát (`total_predictions`) és a pontosságát (`accuracy_rate`).
3. Kis mintaelemszám mellett a pontosság félrevezető – legalább 20–30 lezárt eset kell értelmes következtetéshez.

### 4. Ütemezett feladatok kezelése

1. **Scheduled Jobs** oldal: minden job mellett látszik a cron ütemezés, a következő futás, az utolsó futás státusza és időtartama.
2. Ki-be kapcsolhatod a jobot, vagy manuálisan is elindíthatod.
3. A naplók (logs) dialógusban látod a futásonkénti feldolgozott rekordszámot és a hibaüzenetet, ha volt.

### 5. Rendszerállapot ellenőrzése

A **Monitoring** oldal komponensenként mutatja az állapotot, a válaszidő és hibaarány metrikákat, valamint a számítási gráfot (melyik lépés mitől függ, mennyi ideig fut).

---

## Fogalomtár

| Fogalom | Jelentés |
|---|---|
| **Pattern (mintázat)** | Egy visszatérő, adatban megfigyelhető szabályosság, pl. „a hazai csapat az utolsó 3 hazai meccsét megnyerte”. |
| **Confidence score (konfidencia)** | 0–100 közötti érték: mennyire megalapozott az előrejelzés. Alapérték 50, a detektált mintázatok növelik, felső korlát 95. |
| **CSS score** | A jelenlegi implementációban a konfidenciával megegyező összesített pontszám, amely az előrejelzés erősségét fejezi ki. |
| **BTTS** | *Both Teams To Score* – mindkét csapat szerez gólt. A rendszer a bajnokság átlagos gólszáma alapján ad rá becslést. |
| **H2H** | *Head-to-head* – a két csapat egymás elleni korábbi mérkőzései. |
| **Form score** | 0–100 közötti formamutató az utolsó mérkőzésekből: győzelem +20, döntetlen +10, vereség 0 pont. |
| **Confidence boost** | Az az érték, amennyivel egy adott mintázat megemeli a konfidenciát. |
| **Accuracy rate** | Egy mintázat helyes előrejelzéseinek aránya a lezárt esetek között, százalékban. |
| **Job** | Ütemezett háttérfeladat (előrejelzés-generálás, aggregáció, karbantartás, adatimport). |
| **Value bet** | Olyan eset, ahol a modell által becsült valószínűség kedvezőbb, mint amit a piaci odds sugall. |

---

## Gyakori kérdések

**Miért 50% a konfidencia egy meccsnél?**
Mert nem talált egyetlen mintázatot sem – nincs elég historikus adat, vagy a csapatok formája kiegyenlített.

**Miért nem készül előrejelzés egy mérkőzésre?**
Az automatikus generálás csak `scheduled` státuszú, a beállított időablakon (alapból 24 óra) belüli mérkőzésekre fut, és nem készít másodikat olyan meccsre, amelyhez már tartozik előrejelzés.

**Mennyire megbízhatók a százalékok?**
Csak annyira, amennyire az alattuk lévő minta. Alacsony mintaelemszám mellett tekintsd jelzésnek, ne ténynek.
