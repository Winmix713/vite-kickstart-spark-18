import { Home, Users, Calendar as CalendarIcon, Trophy, Settings, Sparkles, Clock, Brain, LayoutDashboard, ListChecks, LineChart, FlaskConical, Network, Activity } from "lucide-react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed z-40 top-0 left-0 h-screen w-[84px] flex-col justify-between py-6 border-r border-border bg-background/50 backdrop-blur">
        <div className="flex flex-col items-center gap-4">
          <NavLink to="/" className="group">
            <div className="h-9 w-9 rounded-xl bg-card ring-1 ring-border grid place-items-center text-primary text-[10px] font-semibold tracking-tight hover:ring-primary/30 transition-all">
              WT
            </div>
          </NavLink>
          <div className="mt-4 flex flex-col items-center gap-3">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `h-11 w-11 grid place-items-center rounded-xl transition-all ${
                  isActive 
                    ? "bg-primary/15 ring-1 ring-primary/30 hover:ring-primary/40" 
                    : "bg-card ring-1 ring-border hover:bg-muted hover:ring-primary/30"
                }`
              }
            >
              {({ isActive }) => (
                <Home className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              )}
            </NavLink>
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `h-11 w-11 grid place-items-center rounded-xl transition-all ${
                  isActive 
                    ? "bg-primary/15 ring-1 ring-primary/30 hover:ring-primary/40" 
                    : "bg-card ring-1 ring-border hover:bg-muted hover:ring-primary/30"
                }`
              }
            >
              {({ isActive }) => (
                <LayoutDashboard className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              )}
            </NavLink>
            <NavLink 
              to="/analytics" 
              className={({ isActive }) => 
                `h-11 w-11 grid place-items-center rounded-xl transition-all ${
                  isActive 
                    ? "bg-primary/15 ring-1 ring-primary/30 hover:ring-primary/40" 
                    : "bg-card ring-1 ring-border hover:bg-muted hover:ring-primary/30"
                }`
              }
            >
              {({ isActive }) => (
                <LineChart className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              )}
            </NavLink>
            <NavLink 
              to="/predictions/new" 
              className={({ isActive }) => 
                `h-11 w-11 grid place-items-center rounded-xl transition-all ${
                  isActive 
                    ? "bg-primary/15 ring-1 ring-primary/30 hover:ring-primary/40" 
                    : "bg-card ring-1 ring-border hover:bg-muted hover:ring-primary/30"
                }`
              }
            >
              {({ isActive }) => (
                <Sparkles className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              )}
            </NavLink>
            <NavLink 
              to="/predictions" 
              className={({ isActive }) => 
                `h-11 w-11 grid place-items-center rounded-xl transition-all ${
                  isActive 
                    ? "bg-primary/15 ring-1 ring-primary/30 hover:ring-primary/40" 
                    : "bg-card ring-1 ring-border hover:bg-muted hover:ring-primary/30"
                }`
              }
            >
              {({ isActive }) => (
                <ListChecks className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              )}
            </NavLink>
            <NavLink 
              to="/teams"
              className={({ isActive }) => 
                `h-11 w-11 grid place-items-center rounded-xl transition-all ${
                  isActive 
                    ? "bg-primary/15 ring-1 ring-primary/30 hover:ring-primary/40" 
                    : "bg-card ring-1 ring-border hover:bg-muted hover:ring-primary/30"
                }`
              }
            >
              {({ isActive }) => (
                <Users className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              )}
            </NavLink>
            <NavLink 
              to="/matches" 
              className={({ isActive }) => 
                `h-11 w-11 grid place-items-center rounded-xl transition-all ${
                  isActive 
                    ? "bg-primary/15 ring-1 ring-primary/30 hover:ring-primary/40" 
                    : "bg-card ring-1 ring-border hover:bg-muted hover:ring-primary/30"
                }`
              }
            >
              {({ isActive }) => (
                <CalendarIcon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              )}
            </NavLink>
            <NavLink 
              to="/jobs" 
              className={({ isActive }) => 
                `h-11 w-11 grid place-items-center rounded-xl transition-all ${
                  isActive 
                    ? "bg-primary/15 ring-1 ring-primary/30 hover:ring-primary/40" 
                    : "bg-card ring-1 ring-border hover:bg-muted hover:ring-primary/30"
                }`
              }
            >
              {({ isActive }) => (
                <Clock className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              )}
            </NavLink>
            <NavLink 
              to="/models" 
              className={({ isActive }) => 
                `h-11 w-11 grid place-items-center rounded-xl transition-all ${
                  isActive 
                    ? "bg-primary/15 ring-1 ring-primary/30 hover:ring-primary/40" 
                    : "bg-card ring-1 ring-border hover:bg-muted hover:ring-primary/30"
                }`
              }
            >
              {({ isActive }) => (
                <FlaskConical className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              )}
            </NavLink>
            <NavLink 
              to="/crossleague" 
              className={({ isActive }) => 
                `h-11 w-11 grid place-items-center rounded-xl transition-all ${
                  isActive 
                    ? "bg-primary/15 ring-1 ring-primary/30 hover:ring-primary/40" 
                    : "bg-card ring-1 ring-border hover:bg-muted hover:ring-primary/30"
                }`
              }
            >
              {({ isActive }) => (
                <Network className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              )}
            </NavLink>
            <NavLink 
              to="/monitoring" 
              className={({ isActive }) => 
                `h-11 w-11 grid place-items-center rounded-xl transition-all ${
                  isActive 
                    ? "bg-primary/15 ring-1 ring-primary/30 hover:ring-primary/40" 
                    : "bg-card ring-1 ring-border hover:bg-muted hover:ring-primary/30"
                }`
              }
            >
              {({ isActive }) => (
                <Activity className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              )}
            </NavLink>
            <NavLink 
              to="/leagues" 
              className={({ isActive }) => 
                `h-11 w-11 grid place-items-center rounded-xl transition-all ${
                  isActive 
                    ? "bg-primary/15 ring-1 ring-primary/30 hover:ring-primary/40" 
                    : "bg-card ring-1 ring-border hover:bg-muted hover:ring-primary/30"
                }`
              }
            >
              {({ isActive }) => (
                <Trophy className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              )}
            </NavLink>
            <NavLink 
              to="/phase9" 
              className={({ isActive }) => 
                `h-11 w-11 grid place-items-center rounded-xl transition-all ${
                  isActive 
                    ? "bg-primary/15 ring-1 ring-primary/30 hover:ring-primary/40" 
                    : "bg-card ring-1 ring-border hover:bg-muted hover:ring-primary/30"
                }`
              }
            >
              {({ isActive }) => (
                <Brain className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              )}
            </NavLink>
          </div>
        </div>
        <div className="px-4">
          <button className="w-12 h-12 rounded-xl bg-card ring-1 ring-border hover:bg-muted hover:ring-primary/30 grid place-items-center transition-all">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
