import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  team_name?: string;
  team_id?: string;
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
      const { data: team, error: teamError } = await supabase
        .from("teams")
        .select("id, name")
        .eq("name", teamName)
        .maybeSingle();

      if (teamError || !team) {
        return new Response(
          JSON.stringify({ error: "Team not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      teamId = team.id;
      teamName = team.name;
    }

    const nowIso = new Date().toISOString();

    const { data: patterns, error } = await supabase
      .from("team_patterns")
      .select("*")
      .eq("team_id", teamId)
      .order("valid_from", { ascending: false });

    if (error) {
      throw error;
    }

    const active = (patterns ?? []).filter((p) => p.valid_until === null || (p.valid_until as string) > nowIso);
    const expired = (patterns ?? []).filter((p) => p.valid_until !== null && (p.valid_until as string) <= nowIso);

    return new Response(
      JSON.stringify({ team_id: teamId, team_name: teamName, active_patterns: active, expired_patterns: expired }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("patterns-team error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
