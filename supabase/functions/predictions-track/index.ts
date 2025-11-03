import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const {
      matchId,
      predictedOutcome,
      confidenceScore,
      cssScore,
      predictionFactors,
      bttsPrediction,
      overUnderPrediction,
      predictedHomeScore,
      predictedAwayScore,
    } = body ?? {};

    if (!matchId || !predictedOutcome || typeof confidenceScore !== "number") {
      return new Response(
        JSON.stringify({ error: "matchId, predictedOutcome and confidenceScore are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const insert = {
      match_id: matchId as string,
      predicted_outcome: predictedOutcome as string,
      confidence_score: confidenceScore as number,
      css_score: (typeof cssScore === "number" ? cssScore : confidenceScore) as number,
      prediction_factors: predictionFactors ?? {},
      btts_prediction: typeof bttsPrediction === "boolean" ? bttsPrediction : null,
      over_under_prediction: overUnderPrediction ?? null,
      predicted_home_score: typeof predictedHomeScore === "number" ? predictedHomeScore : null,
      predicted_away_score: typeof predictedAwayScore === "number" ? predictedAwayScore : null,
    };

    const { data, error } = await supabase
      .from("predictions")
      .insert(insert)
      .select()
      .single();

    if (error) {
      console.error("predictions-track insert error", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ prediction: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("predictions-track unexpected error", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
