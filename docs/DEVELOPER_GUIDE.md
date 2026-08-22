# Fejlesztői kézikönyv

> Vissza: [Dokumentáció index](./README.md)

## Tartalom

1. [Stack és követelmények](#stack-és-követelmények)
2. [Indítás](#indítás)
3. [Mappastruktúra](#mappastruktúra)
4. [Alias-ok](#alias-ok)
5. [Design system](#design-system)
6. [Oldal-architektúra minták](#oldal-architektúra-minták)
7. [Adatréteg](#adatréteg)
8. [Edge function fejlesztés](#edge-function-fejlesztés)
9. [Kódstílus](#kódstílus)
10. [Gyakori hibák és megoldásuk](#gyakori-hibák-és-megoldásuk)

---

## Stack és követelmények

| Réteg | Technológia |
|---|---|
| UI | React 18, TypeScript 5 |
| Build | Vite 5 |
| Stílus | Tailwind CSS 3 + shadcn-ui (Radix primitívek) |
| Állapot / adat | TanStack Query (`@tanstack/react-query`) |
| Routing | react-router-dom |
| Grafikonok | Recharts |
| Ikonok | lucide-react |
| Backend | Lovable Cloud: PostgreSQL + Deno edge functions + Row Level Security |
| Teszt | Vitest |

---

## Indítás

```bash
npm install
npm run dev      # fejlesztői szerver
npm run build    # produkciós build
npm run lint     # ESLint
npx vitest run   # tesztek
```

A Supabase kliens a `src/integrations/supabase/client.ts` fájlban van konfigurálva. Ezt a fájlt **ne szerkeszd kézzel** – generált.

---

## Mappastruktúra

```text
src/
  components/
    ui/            shadcn-ui primitívek (button, card, dialog, ...)
    layout/        MainLayout, PageLoader, PageErrorBoundary
    dashboard/     dashboard-specifikus widgetek
    monitoring/    SystemHealthCard, PerformanceMetricsChart, ComputationMapDashboard
    patterns/      PatternBadge, TeamPatternsSection
    crossleague/   CorrelationHeatmap, LeagueComparisonRadarChart
    models/        ModelCard
    jobs/          JobStatusCard, JobLogsDialog
    phase9/        kísérleti modulok UI-ja
    editor/        vizuális komponens-szerkesztő
  pages/           route-onkénti oldalkomponensek
  hooks/           useAuth, usePageData, useSportradarAPI, use-toast, use-mobile
  lib/             tiszta üzleti logika és segédfüggvények
  services/        külső API kliensek
  integrations/    supabase kliens és generált típusok
  types/           megosztott TypeScript típusok
  data/            statikus / mock adatok
supabase/
  functions/
    _shared/       edge functionök közti közös kód (jobs.ts, patterns.ts)
    <function>/    egy-egy endpoint index.ts-szel
  config.toml
docs/              ez a dokumentáció
```

---

## Alias-ok

A `vite.config.ts` és a `tsconfig.json` `@/` aliast definiál a `src/` mappára:

```ts
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
```

Relatív `../../..` importok helyett mindig az aliast használd.

---

## Design system

**Szabály: a komponensekben nem használunk konkrét szín-utilityket** (`text-white`, `bg-black`, `bg-[#1a1a2e]`). Minden szín, gradient és árnyék szemantikus tokenként él az `src/index.css`-ben, és a `tailwind.config.ts`-ben van bekötve.

Helyes:

```tsx
<div className="bg-card text-card-foreground border-border rounded-lg p-4">
```

Helytelen:

```tsx
<div className="bg-white text-black border-gray-200 rounded-lg p-4">
```

Új szín bevezetésekor:

1. HSL változó az `index.css` `:root` és `.dark` blokkjába,
2. bekötés a `tailwind.config.ts` `theme.extend.colors`-ba,
3. használat szemantikus névvel a komponensben.

shadcn-ui komponensek variánsait a `cva` konfigurációban bővítsd, ne ad-hoc className-ekkel a hívás helyén.

---

## Oldal-architektúra minták

### MainLayout

Minden oldal a közös elrendezésbe csomagolódik – nincs többé oldalanként duplikált Sidebar/TopBar:

```tsx
import { MainLayout } from "@/components/layout/MainLayout"

export default function Teams() {
  return (
    <MainLayout>
      {/* oldal tartalma */}
    </MainLayout>
  )
}
```

### PageLoader és PageErrorBoundary

- `PageLoader` – skeleton állapot betöltés közben, hogy ne ugráljon a layout.
- `PageErrorBoundary` – oldal szintű hibahatár, hogy egy komponens hibája ne fehérítse ki az egész alkalmazást.

### usePageData

Központosított lekérdezés-wrapper TanStack Query fölött (`src/hooks/usePageData.ts`). Ezt használd `useEffect` + `useState` kézi fetch helyett: egységes loading, error és cache viselkedést ad.

---

## Adatréteg

Minden szerveradat TanStack Queryn keresztül jön. Alapminta:

```ts
const { data, isLoading, error } = useQuery({
  queryKey: ["jobs"],
  queryFn: async (): Promise<JobSummary[]> => {
    const { data, error } = await supabase.functions.invoke("jobs-list")
    if (error) throw error
    return data.jobs
  },
})
```

Konvenciók:

- `queryKey` mindig tömb, és tartalmazza az összes paramétert, amitől az eredmény függ.
- Mutáció után `queryClient.invalidateQueries({ queryKey: [...] })`.
- A `queryFn` visszatérési típusát explicit annotáld (`): Promise<T> =>`) – így elkerülöd a generikus paraméterekkel korábban felmerült típusütközéseket.
- Táblák közvetlen olvasása is mehet `supabase.from(...)`-tal, ha az RLS ezt engedi; írás és összetett logika edge functionbe való.

---

## Edge function fejlesztés

Sablon (a projekt minden functionje ezt követi):

```ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    )
    // ...
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("my-function error", error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  }
})
```

Szabályok:

- A CORS preflight kezelése **kötelező**, különben a böngészőből nem hívható.
- A service role kulcs csak edge functionben él, soha nem kerül a frontendbe.
- Több function által használt logika a `supabase/functions/_shared/` alá kerül (`jobs.ts`, `patterns.ts`).
- Naplózz `console.error`-ral hiba esetén – ez látszik a function logokban.

---

## Kódstílus

- TypeScript mindenhol; `any` helyett `unknown` + szűkítés.
- Komponensek: függvénykomponens, named export a `pages/` alatt default exporttal (a routing így hivatkozik rájuk).
- Egy komponens egy felelősség; ha egy fájl 250 sor fölé nő, bontsd.
- Megosztott típusok a `src/types/` alá, ne duplikáld őket komponensenként.
- Tiszta, tesztelhető számítási logika a `src/lib/` alá, ne a JSX-be.

---

## Gyakori hibák és megoldásuk

| Tünet | Ok | Megoldás |
|---|---|---|
| `Failed to resolve import` build közben | hiányzó alias vagy rossz elérési út | ellenőrizd a `vite.config.ts` alias listáját és a fájl tényleges nevét |
| `Failed to parse source ... invalid JS syntax` | JSX `.js` kiterjesztésű fájlban | nevezd át `.jsx` / `.tsx`-re |
| Üres oldal, konzolban semmi | provider hiba az `App.tsx`-ben vagy hibahatár nélküli runtime error | csomagold `PageErrorBoundary`-be, és nézd a böngésző konzolt |
| Edge function hívás CORS hibával bukik | hiányzó OPTIONS ág | add hozzá a preflight kezelést |
| `useQuery` típushiba | felesleges generikus paraméterek | hagyd el a generikusokat, annotáld a `queryFn` visszatérési típusát |
| Sötét témában olvashatatlan szöveg | hardcode-olt szín-utility | cseréld szemantikus tokenre |
