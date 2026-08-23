# Tesztelési útmutató

> Vissza: [Dokumentáció index](./README.md)

## Tartalom

- [Jelenlegi állapot](#jelenlegi-állapot)
- [Futtatás](#futtatás)
- [Fájl- és névkonvenciók](#fájl--és-névkonvenciók)
- [Mit teszteljünk és milyen szinten](#mit-teszteljünk-és-milyen-szinten)
- [Unit tesztek](#unit-tesztek)
- [Komponenstesztek](#komponenstesztek)
- [Edge function tesztelés](#edge-function-tesztelés)
- [Supabase mockolás](#supabase-mockolás)
- [Coverage célok](#coverage-célok)
- [Hibakeresés teszteléskor](#hibakeresés-teszteléskor)

---

## Jelenlegi állapot

- Teszt futtató: **Vitest 4** (`devDependencies`).
- Meglévő teszt: `src/test/phase9.test.ts` – a Phase 9 service-ek (`CollaborativeIntelligenceService`, `MarketIntegrationService`, `TemporalDecayService`, `SelfImprovingSystemService`) mockolt Supabase klienssel.
- A `package.json`-ben jelenleg **nincs** `test` script; a futtatás `bunx vitest run` paranccsal történik. Ha bekerül, a javasolt formája:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```

## Futtatás

```bash
bunx vitest run                    # teljes futtatás egyszer
bunx vitest                        # watch mód fejlesztés közben
bunx vitest run src/test/phase9.test.ts   # egyetlen fájl
bunx vitest run -t "value bet"     # névre szűrve
```

A Vitest a Vite konfigurációt használja, így a `@/` alias a tesztekben is működik.

## Fájl- és névkonvenciók

| Teszt típusa | Hely | Névminta |
|---|---|---|
| Unit (lib, utils, számítás) | a tesztelt fájl mellett | `teamStatistics.test.ts` |
| Service / integrációs | `src/test/` | `phase9.test.ts` |
| Komponens | a komponens mellett | `MatchCard.test.tsx` |

`describe` = a tesztelt egység neve, `it` = elvárt viselkedés jelen időben, magyarul vagy angolul, de fájlon belül következetesen: `it('returns 0 for empty match list')`.

## Mit teszteljünk és milyen szinten

**Mindig unit teszttel** (tiszta függvény, gyors, determinisztikus):

- form score számítás, konfidencia-összegzés és a 95%-os felső korlát
- mintázat-detektorok küszöbei (határértékek: pont a küszöbön, alatta, felette)
- `src/lib/teamStatistics.ts` aggregációk
- validációs szabályok (pl. félidei gólszám ≤ végeredmény)
- tervezett: `rngValidation.ts` Chi-négyzet és Runs teszt ismert bemeneteken

**Integrációs szinten** (mockolt adatréteggel):

- `src/lib/phase9-api.ts` és `src/integrations/models/service.ts` hívási láncai
- `usePageData` hook: loading → success → error átmenetek

**Ne teszteljük**: shadcn-ui primitíveket, harmadik fél könyvtárak belső viselkedését, puszta layout markupot.

## Unit tesztek

Minta egy számítási függvényre:

```ts
import { describe, it, expect } from 'vitest'
import { calculateFormScore } from '@/lib/teamStatistics'

describe('calculateFormScore', () => {
  it('gives 100 for all wins', () => {
    expect(calculateFormScore(['W', 'W', 'W'])).toBe(100)
  })

  it('gives 0 for all losses', () => {
    expect(calculateFormScore(['L', 'L', 'L'])).toBe(0)
  })

  it('returns 0 for an empty list instead of NaN', () => {
    expect(calculateFormScore([])).toBe(0)
  })
})
```

A harmadik eset a fontos: az üres bemenet a leggyakoribb éles hibaforrás (nulla osztás → `NaN` → üres UI).

## Komponenstesztek

Ha komponenstesztet írsz, telepítsd a szükséges csomagokat:

```bash
bun add -d @testing-library/react @testing-library/jest-dom jsdom
```

és állítsd be a `vite.config.ts`-ben:

```ts
test: {
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
  globals: true,
}
```

A TanStack Query-t használó komponenseket saját `QueryClientProvider`-be kell csomagolni, `retry: false` beállítással, különben a hibaágak tesztje lassú lesz.

## Edge function tesztelés

Az edge functionök Deno futtatókörnyezetben futnak, ezért nem a Vitest futtatja őket. Két gyakorlati megközelítés:

1. **Tiszta logika kiemelése**: a számítási részt a `_shared/` alá kell tenni, és onnan importálva Vitesttel is tesztelhető (a `_shared/patterns.ts` detektorai így fedhetők le).
2. **Szerződéses (contract) teszt**: a deployolt function hívása és a válasz alakjának ellenőrzése – státuszkód, kötelező mezők, hibaformátum (`{ error: string }`).

Minden functionnél legalább ezt a hármat érdemes lefedni: helyes kérés → `200`; hiányzó kötelező mező → `400`; rossz HTTP metódus → `405`.

## Supabase mockolás

A `src/test/phase9.test.ts` mintája követendő – a láncolható query builder minden szintjét mockolni kell:

```ts
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: 'test-id' }, error: null })),
        })),
      })),
    })),
  })),
}))
```

Ha egy lánc eleme hiányzik a mockból, a hiba `X is not a function` alakban jelentkezik – ilyenkor a hiányzó metódust kell pótolni, nem a tesztelt kódot módosítani.

Használj `beforeEach(() => vi.clearAllMocks())`-et, különben a hívásszámlálók átszivárognak a tesztek között.

## Coverage célok

| Terület | Cél |
|---|---|
| `src/lib/` számítási függvények | 80%+ |
| `supabase/functions/_shared/` | 70%+ |
| Service rétegek (`phase9-api`, `models/service`) | 60%+ |
| Oldalak és UI komponensek | nincs számszerű cél, a kritikus flow-k legyenek lefedve |

A coverage nem cél önmagában: egy jól megválasztott határérték-teszt többet ér tíz triviálisnál.

## Hibakeresés teszteléskor

- **Flaky teszt időzítés miatt**: `vi.useFakeTimers()` és explicit előretekerés `Date.now()` helyett.
- **Dátumfüggő eredmény**: fixáld az időt (`vi.setSystemTime(new Date('2026-01-01'))`), különben a "utolsó 30 nap" logika hónapváltáskor elhasal.
- **Alias nem oldódik fel**: ellenőrizd, hogy a Vitest a projekt `vite.config.ts`-ét használja.
