import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import StatisticsCards from "@/components/dashboard/StatisticsCards";
import RecentPredictions from "@/components/dashboard/RecentPredictions";
import PatternPerformanceChart from "@/components/dashboard/PatternPerformanceChart";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageData } from "@/hooks/usePageData";

interface Prediction {
  id: string;
  match: {
    home_team: string;
    away_team: string;
    match_date: string;
    league: string;
  };
  predicted_outcome: string;
  confidence_score: number;
  actual_outcome: string | null;
  was_correct: boolean | null;
}

interface PatternData {
  name: string;
  accuracy: number;
  total: number;
}

interface DashboardData {
  predictions: Prediction[];
  patternData: PatternData[];
  stats: {
    totalPredictions: number;
    accuracy: number;
    topPattern: string;
    winningStreak: number;
  };
}

const fetchDashboardData = async (): Promise<DashboardData> => {
  const { data: predictionsData, error: predictionsError } = await supabase
    .from("predictions")
    .select(`
      id,
      predicted_outcome,
      confidence_score,
      actual_outcome,
      was_correct,
      match:matches(
        match_date,
        home_team:teams!matches_home_team_id_fkey(name),
        away_team:teams!matches_away_team_id_fkey(name),
        league:leagues(name)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(10);

  if (predictionsError) throw predictionsError;

  const predictions: Prediction[] =
    (predictionsData as any[])?.map((p) => ({
      id: p.id,
      predicted_outcome: p.predicted_outcome,
      confidence_score: p.confidence_score,
      actual_outcome: p.actual_outcome,
      was_correct: p.was_correct,
      match: {
        home_team: p.match?.home_team?.name ?? "—",
        away_team: p.match?.away_team?.name ?? "—",
        match_date: p.match?.match_date,
        league: p.match?.league?.name ?? "—",
      },
    })) ?? [];

  const { data: allPredictions, error: allPredictionsError } = await supabase
    .from("predictions")
    .select("was_correct");

  if (allPredictionsError) throw allPredictionsError;

  const evaluated = (allPredictions ?? []).filter((p) => p.was_correct !== null);
  const correct = evaluated.filter((p) => p.was_correct).length;
  const accuracy = evaluated.length > 0 ? Math.round((correct / evaluated.length) * 100) : 0;

  let currentStreak = 0;
  let maxStreak = 0;
  for (const pred of [...evaluated].reverse()) {
    if (pred.was_correct) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  const { data: patternAccuracy, error: patternError } = await supabase
    .from("pattern_accuracy")
    .select(`
      total_predictions,
      correct_predictions,
      accuracy_rate,
      template:pattern_templates(name)
    `)
    .order("accuracy_rate", { ascending: false });

  if (patternError) throw patternError;

  const patternData: PatternData[] =
    (patternAccuracy as any[])?.map((p) => ({
      name: p.template?.name ?? "—",
      accuracy: p.accuracy_rate,
      total: p.total_predictions,
    })) ?? [];

  return {
    predictions,
    patternData,
    stats: {
      totalPredictions: allPredictions?.length ?? 0,
      accuracy,
      topPattern: patternData[0]?.name ?? "N/A",
      winningStreak: maxStreak,
    },
  };
};

export default function Dashboard() {
  const { data, isLoading, error } = usePageData<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-12 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96 mb-8" />
          <Skeleton className="h-96" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient-emerald mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Kövesd nyomon a predikciók pontosságát és teljesítményét
          </p>
        </div>

        {error ? (
          <p className="text-destructive">Nem sikerült betölteni az adatokat.</p>
        ) : (
          <>
            <StatisticsCards
              totalPredictions={data?.stats.totalPredictions ?? 0}
              accuracy={data?.stats.accuracy ?? 0}
              topPattern={data?.stats.topPattern ?? "N/A"}
              winningStreak={data?.stats.winningStreak ?? 0}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <RecentPredictions predictions={data?.predictions ?? []} />
              <PatternPerformanceChart data={data?.patternData ?? []} />
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
