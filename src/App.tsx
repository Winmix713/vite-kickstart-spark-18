import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Index from "./pages/Index"
import NewPredictions from "./pages/NewPredictions"
import Teams from "./pages/Teams"
import TeamDetail from "./pages/TeamDetail"
import Matches from "./pages/Matches"
import Leagues from "./pages/Leagues"
import Dashboard from "./pages/Dashboard"
import MatchDetail from "./pages/MatchDetail"
import PredictionsView from "./pages/PredictionsView"
import ScheduledJobs from "./pages/ScheduledJobs"
import Phase9 from "./pages/Phase9"
import NotFound from "./pages/NotFound"
import CrossLeague from "./pages/CrossLeague"
import Analytics from "./pages/Analytics"
import Models from "./pages/Models"
import Monitoring from "./pages/Monitoring"
import SoccerHub from "./pages/SoccerHub"

const queryClient = new QueryClient()

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/predictions" element={<PredictionsView />} />
          <Route path="/predictions/new" element={<NewPredictions />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/models" element={<Models />} />
          <Route path="/crossleague" element={<CrossLeague />} />
          <Route path="/match/:id" element={<MatchDetail />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:teamName" element={<TeamDetail />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/leagues" element={<Leagues />} />
          <Route path="/jobs" element={<ScheduledJobs />} />
          <Route path="/phase9" element={<Phase9 />} />
          <Route path="/soccer" element={<SoccerHub />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
)

export default App
