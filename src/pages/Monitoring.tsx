import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import SystemHealthCard from "@/components/monitoring/SystemHealthCard";
import PerformanceMetricsChart, { MetricsPoint } from "@/components/monitoring/PerformanceMetricsChart";
import ComputationMapDashboard from "@/components/monitoring/ComputationMapDashboard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AlertsResponse, ComputationGraphResponse, HealthSummaryResponse, MetricsResponse, PerformanceMetricRow } from "@/types/monitoring";
import { RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const useHealth = () =>
  useQuery<HealthSummaryResponse>({
    queryKey: ["monitoring", "health"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<HealthSummaryResponse>("monitoring-health");
      if (error) throw new Error(error.message);
      return data as HealthSummaryResponse;
    },
    refetchInterval: 30000,
  });

const useGraph = () =>
  useQuery<ComputationGraphResponse>({
    queryKey: ["monitoring", "graph"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<ComputationGraphResponse>("monitoring-computation-graph");
      if (error) throw new Error(error.message);
      return data as ComputationGraphResponse;
    },
    refetchInterval: 60000,
  });

const useAlerts = () =>
  useQuery<AlertsResponse>({
    queryKey: ["monitoring", "alerts"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<AlertsResponse>("monitoring-alerts");
      if (error) throw new Error(error.message);
      return data as AlertsResponse;
    },
    refetchInterval: 15000,
  });

const useMetrics = (component?: string | null) =>
  useQuery<MetricsResponse>({
    queryKey: ["monitoring", "metrics", component ?? "all"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<MetricsResponse>("monitoring-metrics", {
        body: component ? { component } : {},
      });
      if (error) throw new Error(error.message);
      return data as MetricsResponse;
    },
    enabled: true,
    refetchInterval: 30000,
  });

export default function Monitoring() {
  const healthQuery = useHealth();
  const graphQuery = useGraph();
  const alertsQuery = useAlerts();

  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const metricsQuery = useMetrics(selectedComponent);

  // Update selected component based on first health component
  useEffect(() => {
    if (!selectedComponent && healthQuery.data?.components?.length) {
      setSelectedComponent(healthQuery.data.components[0].component_name);
    }
  }, [healthQuery.data?.components, selectedComponent]);

  const metricsData: MetricsPoint[] = useMemo(() => {
    const rows: PerformanceMetricRow[] = metricsQuery.data?.metrics ?? [];
    const byTime = new Map<string, MetricsPoint>();
    for (const r of rows) {
      const key = r.timestamp;
      if (!byTime.has(key)) byTime.set(key, { time: key });
      const point = byTime.get(key)!;
      if (r.metric_name === "latency_p50") point.p50 = r.value;
      if (r.metric_name === "latency_p95") point.p95 = r.value;
      if (r.metric_name === "latency_p99") point.p99 = r.value;
    }
    return Array.from(byTime.values()).sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }, [metricsQuery.data]);

  const isLoading = healthQuery.isLoading || graphQuery.isLoading;

  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      <TopBar />
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gradient-emerald">Monitoring</h1>
              <p className="text-muted-foreground">System health, performance metrics and computation graph.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void healthQuery.refetch();
                void graphQuery.refetch();
                void alertsQuery.refetch();
                void metricsQuery.refetch();
              }}
              disabled={isLoading}
              className="inline-flex items-center gap-2"
            >
              <RefreshCcw className={cn("w-4 h-4", isLoading ? "animate-spin" : "")} />
              Frissítés
            </Button>
          </div>

          {(healthQuery.error || graphQuery.error || alertsQuery.error || metricsQuery.error) && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                {(healthQuery.error as Error)?.message || (graphQuery.error as Error)?.message || (alertsQuery.error as Error)?.message || (metricsQuery.error as Error)?.message}
              </AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Health section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(healthQuery.data?.components ?? []).map((h) => (
                  <SystemHealthCard key={h.id} health={h} />
                ))}
              </div>

              {/* Metrics section */}
              <Card className="border-border/60 bg-muted/20">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="text-lg font-semibold">Performance metrics</CardTitle>
                  <div className="flex items-center gap-2 w-full sm:w-64">
                    <Select value={selectedComponent ?? undefined} onValueChange={(v) => setSelectedComponent(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Válassz komponenst" />
                      </SelectTrigger>
                      <SelectContent>
                        {(healthQuery.data?.components ?? []).map((h) => (
                          <SelectItem key={h.id} value={h.component_name}>{h.component_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm" onClick={() => void metricsQuery.refetch()}>
                      <RefreshCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <PerformanceMetricsChart data={metricsData} />
                </CardContent>
              </Card>

              {/* Graph */}
              <ComputationMapDashboard graph={graphQuery.data ?? null} />

              {/* Alerts */}
              <Card className="border-border/60 bg-muted/20">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Alerts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(alertsQuery.data?.alerts ?? []).length === 0 ? (
                    <div className="text-muted-foreground">Nincs aktív riasztás.</div>
                  ) : (
                    <ul className="space-y-2">
                      {(alertsQuery.data?.alerts ?? []).map((a) => (
                        <li key={a.id} className={cn("rounded-md border p-3 text-sm", a.severity === "critical" ? "border-red-500/40 bg-red-500/10" : a.severity === "warning" ? "border-yellow-500/40 bg-yellow-500/10" : "border-border/60 bg-muted/20") }>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{a.message}{a.component ? ` – ${a.component}` : ""}</span>
                            <span className="text-muted-foreground">{new Date(a.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">Severity: {a.severity}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
