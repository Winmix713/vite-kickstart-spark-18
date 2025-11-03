import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { runDetections, type DetectionResult, type DetectionFunctionKey, type GenericClient } from "../_shared/patterns.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  team_name?: string;
  team_id?: string;
  league_id?: string;
  pattern_types?: DetectionFunctionKey[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let params: RequestBody = {};
    if (req.method === "GET") {
      const url = new URL(req.url);
      params.team_name = url.searchParams.get("team_name") ?? undefined;
      params.team_id = url.searchParams.get("team_id") ?? undefined;
      const types = url.searchParams.get("pattern_types");
      if (types) params.pattern_types = types.split(",").map((t) => t.trim()) as DetectionFunctionKey[];
    } else {
      params = await req.json();
    }

    let teamId = params.team_id ?? "";
    let teamName = params.team_name ?? "";

    if (!teamId && !teamName) {
      return new Response(
        JSON.stringify({ error: "team_name or team_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!teamId) {
      const q = supabase.from("teams").select("id, name").eq("name", teamName).maybeSingle();
      const { data: team, error: teamError } = await q;
      if (teamError || !team) {
        return new Response(
          JSON.stringify({ error: "Team not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      teamId = team.id;
      teamName = team.name;
    }

    const detections: DetectionResult[] = await runDetections(supabase as GenericClient, teamId, params.pattern_types);

    // Upsert into team_patterns
    const upserted: Record<string, unknown>[] = [];
    for (const det of detections) {
      // fetch existing active pattern for this type
      const { data: existing, error: existingError } = await supabase
        .from("team_patterns")
        .select("id, historical_accuracy, valid_from")
        .eq("team_id", teamId)
        .eq("pattern_type", det.pattern_type)
        .is("valid_until", null)
        .maybeSingle();

      const payload = {
        team_id: teamId,
        pattern_type: det.pattern_type,
        pattern_name: det.pattern_name,
        confidence: det.confidence,
        strength: det.strength,
        prediction_impact: det.prediction_impact,
        pattern_metadata: det.metadata,
        historical_accuracy: existing?.historical_accuracy ?? 70,
        valid_from: existing?.valid_from ?? new Date().toISOString(),
      };

      if (existing) {
        const { data: updated, error } = await supabase
          .from("team_patterns")
          .update(payload)
          .eq("id", existing.id)
          .select()
          .single();
        if (!error && updated) upserted.push(updated);
      } else {
        const { data: inserted, error } = await supabase
          .from("team_patterns")
          .insert(payload)
          .select()
          .single();
        if (!error && inserted) upserted.push(inserted);
      }
    }

    return new Response(
      JSON.stringify({ team_id: teamId, team_name: teamName, patterns: upserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("patterns-detect error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
