import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Calendar } from "lucide-react";
import type { LeagueKey } from "@/data/teamOptions";

const leagueMatches = {
  angol: [
    { home: "Liverpool", away: "Manchester Kék", date: "2025-11-15", time: "15:00" },
    { home: "London Ágyúk", away: "Chelsea", date: "2025-11-15", time: "17:30" },
    { home: "Tottenham", away: "Aston Oroszlán", date: "2025-11-16", time: "14:00" },
    { home: "Vörös Ördögök", away: "Newcastle", date: "2025-11-16", time: "16:30" },
    { home: "Brighton", away: "West Ham", date: "2025-11-17", time: "15:00" },
    { home: "Everton", away: "Fulham", date: "2025-11-17", time: "17:30" },
  ],
  spanyol: [
    { home: "Barcelona", away: "Madrid Fehér", date: "2025-11-15", time: "20:00" },
    { home: "Madrid Piros", away: "Sevilla Piros", date: "2025-11-15", time: "18:00" },
    { home: "Valencia", away: "Villarreal", date: "2025-11-16", time: "19:00" },
    { home: "San Sebastian", away: "Bilbao", date: "2025-11-16", time: "21:00" },
    { home: "Sevilla Zöld", away: "Girona", date: "2025-11-17", time: "18:00" },
    { home: "Mallorca", away: "Vigo", date: "2025-11-17", time: "20:00" },
  ]
};

const Matches = () => {
  const [league, setLeague] = useState<LeagueKey>("angol");
  const matches = leagueMatches[league];

  return (
    <div className="min-h-screen">
      <Sidebar />
      <TopBar />
      <main className="ml-0 md:ml-[84px] py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full ring-1 ring-primary/20 bg-primary/10 px-2.5 py-1 mb-2">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] text-primary font-semibold">Mérkőzések</span>
            </div>
            <h1 className="text-2xl sm:text-3xl tracking-tight text-foreground font-semibold">Közelgő mérkőzések</h1>
            <p className="text-muted-foreground mt-1">Válassz bajnokságot és nézd meg a következő mérkőzéseket.</p>
            
            {/* League Selector */}
            <div className="mt-4 inline-flex items-center rounded-lg bg-muted p-1 ring-1 ring-border">
              <button
                onClick={() => setLeague("angol")}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
                  league === "angol"
                    ? "bg-card text-foreground ring-1 ring-border shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Angol Bajnokság
              </button>
              <button
                onClick={() => setLeague("spanyol")}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
                  league === "spanyol"
                    ? "bg-card text-foreground ring-1 ring-border shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Spanyol Bajnokság
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {matches.map((match, index) => (
              <div
                key={index}
                className="rounded-2xl bg-card ring-1 ring-border p-5 hover:ring-primary/30 hover:bg-card/80 transition"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-right">
                    <h3 className="text-sm font-semibold text-foreground">{match.home}</h3>
                  </div>
                  <div className="px-3 py-1 rounded-md bg-muted ring-1 ring-border">
                    <span className="text-xs font-bold text-muted-foreground">VS</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">{match.away}</h3>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{match.date} • {match.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Matches;
