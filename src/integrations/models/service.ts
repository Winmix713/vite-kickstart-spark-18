import { supabase } from "@/integrations/supabase/client";
import type { ModelExperiment, ModelRegistry, ModelSelectionResponse } from "@/types/models";

// Utility: error class
class ModelServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ModelServiceError";
  }
}

function parseJSON<T = unknown>(value: unknown): T | null {
  if (!value) return null;
  if (typeof value === "object") return value as T;
  if (typeof value === "string") {
    try { return JSON.parse(value) as T; } catch { return null; }
  }
  return null;
}

export async function listModels(): Promise<ModelRegistry[]> {
  const { data, error } = await supabase
    .from("model_registry")
    .select("*")
    .order("registered_at", { ascending: false });

  if (error) throw new ModelServiceError(error.message);

  return (data ?? []).map((m) => ({
    ...m,
    model_type: (m.model_type as ModelRegistry["model_type"]) ?? "challenger",
    hyperparameters: parseJSON<Record<string, unknown>>(m.hyperparameters) ?? null,
  })) as unknown as ModelRegistry[];
}

export async function registerModel(input: Omit<ModelRegistry, "id" | "registered_at" | "total_predictions" | "accuracy"> & { traffic_allocation?: number }): Promise<ModelRegistry> {
  // If registering champion, retire current champion
  if (input.model_type === "champion") {
    const { data: champions } = await supabase.from("model_registry").select("id").eq("model_type", "champion");
    if (champions && champions.length > 0) {
      await supabase.from("model_registry").update({ model_type: "retired", traffic_allocation: 0 }).in(
        "id",
        champions.map((c) => c.id),
      );
    }
  }

  const { data, error } = await supabase
    .from("model_registry")
    .insert({
      model_name: input.model_name,
      model_version: input.model_version,
      model_type: input.model_type,
      algorithm: input.algorithm ?? null,
      hyperparameters: input.hyperparameters ?? null,
      traffic_allocation: input.traffic_allocation ?? (input.model_type === "champion" ? 90 : 10),
      total_predictions: 0,
      accuracy: 0,
      registered_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error || !data) throw new ModelServiceError(error?.message ?? "Sikertelen regisztráció");

  return data as unknown as ModelRegistry;
}

export async function epsilonGreedySelect(epsilon = 0.1): Promise<ModelSelectionResponse> {
  const { data: champion } = await supabase
    .from("model_registry")
    .select("id")
    .eq("model_type", "champion")
    .maybeSingle();

  const { data: challengers } = await supabase
    .from("model_registry")
    .select("id")
    .eq("model_type", "challenger");

  const explore = challengers && challengers.length > 0 && Math.random() < epsilon;

  if (explore) {
    const picked = challengers![Math.floor(Math.random() * challengers!.length)];
    return { selectedModelId: picked.id, strategy: "explore", explorationRate: epsilon };
  }

  if (champion?.id) {
    return { selectedModelId: champion.id, strategy: "exploit", explorationRate: epsilon };
  }

  // Fallback: pick any model
  const { data: anyModel } = await supabase.from("model_registry").select("id").limit(1).maybeSingle();
  if (!anyModel?.id) throw new ModelServiceError("Nincs elérhető modell");
  return { selectedModelId: anyModel.id, strategy: "exploit", explorationRate: epsilon };
}

export async function promoteChallenger(challengerId: string): Promise<void> {
  // Retire previous champion
  await supabase.from("model_registry").update({ model_type: "retired", traffic_allocation: 0 }).eq("model_type", "champion");

  // Promote challenger
  const { error } = await supabase
    .from("model_registry")
    .update({ model_type: "champion", traffic_allocation: 90 })
    .eq("id", challengerId);

  if (error) throw new ModelServiceError(error.message);
}

export async function createExperiment(args: {
  experiment_name: string;
  champion_model_id: string;
  challenger_model_id: string;
  target_sample_size?: number;
  significance_threshold?: number; // default 0.05
}): Promise<ModelExperiment> {
  const { data, error } = await supabase
    .from("model_experiments")
    .insert({
      experiment_name: args.experiment_name,
      champion_model_id: args.champion_model_id,
      challenger_model_id: args.challenger_model_id,
      target_sample_size: args.target_sample_size ?? 100,
      current_sample_size: 0,
      significance_threshold: args.significance_threshold ?? 0.05,
      started_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error || !data) throw new ModelServiceError(error?.message ?? "Kísérlet létrehozása sikertelen");
  return data as unknown as ModelExperiment;
}

// Error function approximation for chi-square p-value (1 df)
// Normal CDF approximation (Abramowitz and Stegun 26.2.17)
function normalCdf(x: number): number {
  const a1 = 0.319381530;
  const a2 = -0.356563782;
  const a3 = 1.781477937;
  const a4 = -1.821255978;
  const a5 = 1.330274429;
  const p = 0.2316419;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1 / (1 + p * absX);
  const phi = Math.exp(-0.5 * absX * absX) / Math.sqrt(2 * Math.PI);
  const y = 1 - phi * (a1 * t + a2 * t ** 2 + a3 * t ** 3 + a4 * t ** 4 + a5 * t ** 5);
  return sign === 1 ? y : 1 - y;
}

function chiSquarePValue1df(x: number): number {
  if (x <= 0) return 1;
  const z = Math.sqrt(x); // since X ~ Z^2 with Z ~ N(0,1)
  const pUpper = 1 - normalCdf(z);
  return Math.min(1, Math.max(0, 2 * pUpper));
}

export async function evaluateExperiment(experimentId: string): Promise<ModelExperiment> {
  const { data: exp, error: expErr } = await supabase
    .from("model_experiments")
    .select("*")
    .eq("id", experimentId)
    .single();
  if (expErr || !exp) throw new ModelServiceError(expErr?.message ?? "Kísérlet nem található");

  // Collect outcomes for both models
  const [champPreds, challPreds] = await Promise.all([
    supabase
      .from("predictions")
      .select("id, was_correct")
      .eq("model_id", exp.champion_model_id)
      .not("was_correct", "is", null),
    supabase
      .from("predictions")
      .select("id, was_correct")
      .eq("model_id", exp.challenger_model_id)
      .not("was_correct", "is", null),
  ]);

  const championData = champPreds.data ?? [];
  const challengerData = challPreds.data ?? [];

  const n1 = championData.length;
  const n2 = challengerData.length;
  const x1 = championData.filter((r) => r.was_correct === true).length; // successes
  const x2 = challengerData.filter((r) => r.was_correct === true).length;

  const p1 = n1 > 0 ? x1 / n1 : 0;
  const p2 = n2 > 0 ? x2 / n2 : 0;

  const total = n1 + n2;

  // Build 2x2 contingency table
  const a = x1; // champion success
  const b = n1 - x1; // champion failure
  const c = x2; // challenger success
  const d = n2 - x2; // challenger failure

  const row1 = a + b;
  const row2 = c + d;
  const col1 = a + c;
  const col2 = b + d;
  const N = row1 + row2 || 1;

  // Expected values under H0
  const Ea = (row1 * col1) / N;
  const Eb = (row1 * col2) / N;
  const Ec = (row2 * col1) / N;
  const Ed = (row2 * col2) / N;

  // Chi-square statistic
  const chi2 =
    (Ea > 0 ? (a - Ea) * (a - Ea) / Ea : 0) +
    (Eb > 0 ? (b - Eb) * (b - Eb) / Eb : 0) +
    (Ec > 0 ? (c - Ec) * (c - Ec) / Ec : 0) +
    (Ed > 0 ? (d - Ed) * (d - Ed) / Ed : 0);

  const pValue = chiSquarePValue1df(chi2);
  const accuracyDiff = p2 - p1;

  const decision = pValue < (exp.significance_threshold ?? 0.05)
    ? (accuracyDiff > 0 ? "promote" : "keep")
    : "continue";

  let winner: string | null = null;
  if (decision === "promote") winner = exp.challenger_model_id;
  if (decision === "keep") winner = exp.champion_model_id;

  const { data: updated, error: updErr } = await supabase
    .from("model_experiments")
    .update({
      current_sample_size: total,
      p_value: pValue,
      accuracy_diff: accuracyDiff,
      winner_model_id: winner,
      decision,
      completed_at: decision === "continue" ? null : new Date().toISOString(),
    })
    .eq("id", experimentId)
    .select("*")
    .single();

  if (updErr || !updated) throw new ModelServiceError(updErr?.message ?? "Értékelés frissítése sikertelen");

  if (decision === "promote" && winner) {
    await promoteChallenger(winner);
  }

  return updated as unknown as ModelExperiment;
}

export async function shadowRun(matchId: string, modelId: string): Promise<{ createdPredictionId?: string }> {
  // Try to duplicate existing visible prediction for the match and mark as shadow
  const { data: existing } = await supabase
    .from("predictions")
    .select("*")
    .eq("match_id", matchId)
    .maybeSingle();

  // Fetch model info
  const { data: model } = await supabase
    .from("model_registry")
    .select("id, model_name, model_version")
    .eq("id", modelId)
    .single();

  if (!model) {
    throw new ModelServiceError("Modell nem található árnyék futtatáshoz");
  }

  if (!existing) {
    // Insert placeholder shadow prediction if none exists
    const { data: inserted, error } = await supabase
      .from("predictions")
      .insert({
        match_id: matchId,
        predicted_outcome: "unknown",
        confidence_score: 0,
        is_shadow_mode: true,
        model_id: model.id,
        model_name: model.model_name,
        model_version: model.model_version,
      })
      .select("id")
      .single();

    if (error) throw new ModelServiceError(error.message);
    return { createdPredictionId: inserted?.id };
  }

  const { data: dup, error: dupErr } = await supabase
    .from("predictions")
    .insert({
      match_id: matchId,
      predicted_outcome: existing.predicted_outcome,
      confidence_score: existing.confidence_score,
      btts_prediction: existing.btts_prediction,
      over_under_prediction: existing.over_under_prediction,
      predicted_home_score: existing.predicted_home_score,
      predicted_away_score: existing.predicted_away_score,
      is_shadow_mode: true,
      model_id: model.id,
      model_name: model.model_name,
      model_version: model.model_version,
    })
    .select("id")
    .single();

  if (dupErr) throw new ModelServiceError(dupErr.message);
  return { createdPredictionId: dup?.id };
}
