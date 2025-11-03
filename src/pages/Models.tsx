import { useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import ModelCard from "@/components/models/ModelCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listModels, registerModel, promoteChallenger, createExperiment, evaluateExperiment, epsilonGreedySelect } from "@/integrations/models/service";
import type { ModelExperiment, ModelRegistry } from "@/types/models";
import { toast } from "sonner";
import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

function useExperiments() {
  return useQuery<ModelExperiment[]>({
    queryKey: ["model-experiments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("model_experiments")
        .select("*")
        .order("started_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as ModelExperiment[];
    },
  });
}

export default function ModelsPage() {
  const queryClient = useQueryClient();
  const modelsQuery = useQuery<ModelRegistry[]>({ queryKey: ["model-registry"], queryFn: listModels, refetchInterval: 20000 });
  const experimentsQuery = useExperiments();

  type ModelForm = {
    model_name: string;
    model_version: string;
    model_type: ModelRegistry["model_type"];
    algorithm: string;
    hyperparameters: string;
    champion_id?: string;
    challenger_id?: string;
    experiment_name?: string;
  };

  const [form, setForm] = useState<ModelForm>({
    model_name: "",
    model_version: "",
    model_type: "challenger",
    algorithm: "",
    hyperparameters: "{}",
  });

  const trafficData = useMemo(() => {
    const models = modelsQuery.data ?? [];
    const active = models.filter((m) => m.model_type !== "retired");
    return active.map((m) => ({ name: `${m.model_name} v${m.model_version}`, value: m.traffic_allocation ?? 0 }));
  }, [modelsQuery.data]);

  const registerMutation = useMutation({
    mutationFn: async () => {
      let parsed: Record<string, unknown> | null = null;
      try { parsed = JSON.parse(form.hyperparameters || "{}"); } catch { parsed = null; }
      return registerModel({
        model_name: form.model_name,
        model_version: form.model_version,
        model_type: form.model_type,
        algorithm: form.algorithm || null,
        hyperparameters: parsed,
        traffic_allocation: form.model_type === "champion" ? 90 : 10,
      });
    },
    onSuccess: async () => {
      toast.success("Modell regisztrálva");
      await queryClient.invalidateQueries({ queryKey: ["model-registry"] });
      setForm({ model_name: "", model_version: "", model_type: "challenger", algorithm: "", hyperparameters: "{}" });
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Regisztrációs hiba";
      toast.error(message);
    },
  });

  const promoteMutation = useMutation({
    mutationFn: async (model: ModelRegistry) => promoteChallenger(model.id),
    onSuccess: async () => {
      toast.success("Challenger promótálva");
      await queryClient.invalidateQueries({ queryKey: ["model-registry"] });
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Promóciós hiba";
      toast.error(message);
    },
  });

  const createExperimentMutation = useMutation({
    mutationFn: async (payload: { championId: string; challengerId: string; name: string }) =>
      createExperiment({
        experiment_name: payload.name,
        champion_model_id: payload.championId,
        challenger_model_id: payload.challengerId,
        target_sample_size: 100,
      }),
    onSuccess: async () => {
      toast.success("Kísérlet elindítva");
      await queryClient.invalidateQueries({ queryKey: ["model-experiments"] });
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Kísérlet létrehozása sikertelen";
      toast.error(message);
    },
  });

  const evaluateMutation = useMutation({
    mutationFn: async (experimentId: string) => evaluateExperiment(experimentId),
    onSuccess: async () => {
      toast.success("Kísérlet értékelve");
      await queryClient.invalidateQueries({ queryKey: ["model-experiments"] });
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Értékelési hiba";
      toast.error(message);
    },
  });

  const testSelection = async () => {
    const result = await epsilonGreedySelect(0.1);
    toast.success(`Kiválasztott modell: ${result.selectedModelId} (${result.strategy})`);
  };

  const models = modelsQuery.data ?? [];
  const champion = models.find((m) => m.model_type === "champion") || null;
  const challengers = models.filter((m) => m.model_type === "challenger");

  const COLORS = ["#10b981", "#f59e0b", "#6366f1", "#ef4444", "#14b8a6"]; // emerald, amber, indigo, red, teal

  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      <TopBar />
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gradient-emerald">Model Management</h1>
              <p className="text-muted-foreground">Champion/Challenger framework, A/B tesztelés és promóció</p>
            </div>
            <Button variant="outline" onClick={testSelection}>Model selection teszt</Button>
          </div>

          {modelsQuery.error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{(modelsQuery.error as Error).message}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card/60 border-border/80 backdrop-blur">
                <CardHeader>
                  <CardTitle>Aktív modellek</CardTitle>
                </CardHeader>
                <CardContent>
                  {models.length === 0 ? (
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-8 text-center text-muted-foreground">
                      Nincs regisztrált modell.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {champion && (
                        <ModelCard key={champion.id} model={champion} onPromote={(m) => promoteMutation.mutate(m)} />
                      )}
                      {challengers.map((m) => (
                        <ModelCard key={m.id} model={m} onPromote={(mod) => promoteMutation.mutate(mod)} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card/60 border-border/80 backdrop-blur">
                <CardHeader>
                  <CardTitle>Futó kísérletek</CardTitle>
                </CardHeader>
                <CardContent>
                  {experimentsQuery.data?.length ? (
                    <div className="space-y-3">
                      {experimentsQuery.data.map((e) => (
                        <div key={e.id} className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-4">
                          <div>
                            <div className="font-medium text-foreground">{e.experiment_name}</div>
                            <div className="text-xs text-muted-foreground">minta: {e.current_sample_size ?? 0} / cél: {e.target_sample_size ?? 0} • p-érték: {e.p_value?.toFixed(4) ?? "-"} • döntés: {e.decision ?? "-"}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => evaluateMutation.mutate(e.id)}>Értékelés</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-8 text-center text-muted-foreground">
                      Jelenleg nincs futó kísérlet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-card/60 border-border/80 backdrop-blur">
                <CardHeader>
                  <CardTitle>Forgalom megoszlás</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie dataKey="value" data={trafficData} outerRadius={90} label>
                          {trafficData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/60 border-border/80 backdrop-blur">
                <CardHeader>
                  <CardTitle>Új modell regisztrálása</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Név</Label>
                    <Input value={form.model_name} onChange={(e) => setForm((f) => ({ ...f, model_name: e.target.value }))} placeholder="Pl. HeuristicEngine" />
                  </div>
                  <div className="space-y-2">
                    <Label>Verzió</Label>
                    <Input value={form.model_version} onChange={(e) => setForm((f) => ({ ...f, model_version: e.target.value }))} placeholder="1.0.0" />
                  </div>
                  <div className="space-y-2">
                    <Label>Típus</Label>
                    <Select value={form.model_type} onValueChange={(v) => setForm((f) => ({ ...f, model_type: v as ModelRegistry["model_type"] }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Válassz típust" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="champion">Champion</SelectItem>
                        <SelectItem value="challenger">Challenger</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Algoritmus</Label>
                    <Input value={form.algorithm} onChange={(e) => setForm((f) => ({ ...f, algorithm: e.target.value }))} placeholder="Pl. GradientBoostedHeuristics" />
                  </div>
                  <div className="space-y-2">
                    <Label>Hyperparaméterek (JSON)</Label>
                    <Input value={form.hyperparameters} onChange={(e) => setForm((f) => ({ ...f, hyperparameters: e.target.value }))} placeholder='{"learning_rate": 0.1}' />
                  </div>
                  <Button className="w-full" onClick={() => registerMutation.mutate()} disabled={registerMutation.isPending || !form.model_name || !form.model_version}>Regisztrálás</Button>
                </CardContent>
              </Card>

              <Card className="bg-card/60 border-border/80 backdrop-blur">
                <CardHeader>
                  <CardTitle>Új kísérlet indítása</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Champion</Label>
                    <Select disabled={!champion} onValueChange={(val: string) => setForm((f) => ({ ...f, champion_id: val }))}>
                      <SelectTrigger>
                        <SelectValue placeholder={champion ? `${champion.model_name} v${champion.model_version}` : "Nincs champion"} />
                      </SelectTrigger>
                      <SelectContent>
                        {champion && (
                          <SelectItem value={champion.id}>{champion.model_name} v{champion.model_version}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Challenger</Label>
                    <Select onValueChange={(val: string) => setForm((f) => ({ ...f, challenger_id: val }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Válassz challengert" />
                      </SelectTrigger>
                      <SelectContent>
                        {challengers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.model_name} v{c.model_version}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Kísérlet neve</Label>
                    <Input onChange={(e) => setForm((f) => ({ ...f, experiment_name: e.target.value }))} placeholder="Pl. A/B 2025-11-02" />
                  </div>
                  <Button className="w-full" onClick={() => createExperimentMutation.mutate({
                    championId: champion?.id ?? "",
                    challengerId: form.challenger_id ?? "",
                    name: form.experiment_name || "Model A/B",
                  })} disabled={!champion || !form.challenger_id}>
                    Kísérlet indítása
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
