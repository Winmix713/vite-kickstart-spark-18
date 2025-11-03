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
    if (!teamId && params.team_name) {
      const { data: team, error } = await supabase
        .from("teams")
        .select("id")
        .eq("name", params.team_name)
        .maybeSingle();
      if (error || !team) {
        return new Response(
          JSON.stringify({ error: "Team not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      teamId = team.id;
    }

    if (!teamId) {
      return new Response(
        JSON.stringify({ error: "team_name or team_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Run fresh detections
    const detections: DetectionResult[] = await runDetections(supabase as GenericClient, teamId, params.pattern_types);
    const detectedTypes = new Set(detections.map((d) => d.pattern_type));

    // Fetch current active patterns
    const { data: active, error: activeError } = await supabase
      .from("team_patterns")
      .select("id, pattern_type, historical_accuracy, valid_from")
      .eq("team_id", teamId)
      .is("valid_until", null);

    if (activeError) throw activeError;

    const updates: Record<string, unknown>[] = [];
    const expirations: string[] = [];

    // Expire those not detected anymore
    for (const p of active ?? []) {
      if (!detectedTypes.has(p.pattern_type)) {
        const { error } = await supabase
          .from("team_patterns")
          .update({ valid_until: new Date().toISOString() })
          .eq("id", p.id);
        if (!error) expirations.push(p.id);
      }
    }

    // Upsert current detections
    for (const det of detections) {
      const existing = (active ?? []).find((p) => p.pattern_type === det.pattern_type);
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
        if (!error && updated) updates.push(updated);
      } else {
        const { data: inserted, error } = await supabase
          .from("team_patterns")
          .insert(payload)
          .select()
          .single();
        if (!error && inserted) updates.push(inserted);
      }
    }

    return new Response(
      JSON.stringify({ updated: updates, expired: expirations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("patterns-verify error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
