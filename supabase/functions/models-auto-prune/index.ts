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

    const { threshold = 45, min_sample_size = 20 } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: accRows, error } = await supabase
      .from("pattern_accuracy")
      .select("template_id, total_predictions, accuracy_rate, id")
      .gte("total_predictions", Number(min_sample_size))
      .lt("accuracy_rate", Number(threshold));

    if (error) {
      throw error;
    }

    type AccRow = { template_id: string | null; total_predictions: number | null; accuracy_rate: number | null; id: string };
    const toDeactivate: AccRow[] = (accRows as AccRow[]) ?? [];
    const templateIds = toDeactivate.map((r) => r.template_id).filter((v): v is string => Boolean(v));

    let updated = 0;
    let details: { id: string; name: string; is_active: boolean }[] = [];
    if (templateIds.length > 0) {
      const { data: updatedTemplates, error: updateError } = await supabase
        .from("pattern_templates")
        .update({ is_active: false })
        .in("id", templateIds)
        .select("id, name, is_active");

      if (updateError) {
        console.error("models-auto-prune update error", updateError);
      } else {
        updated = updatedTemplates?.length ?? 0;
        details = (updatedTemplates as { id: string; name: string; is_active: boolean }[]) ?? [];
      }
    }

    return new Response(
      JSON.stringify({
        threshold: Number(threshold),
        min_sample_size: Number(min_sample_size),
        candidates: toDeactivate.length,
        deactivated: updated,
        templates: details,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("models-auto-prune error", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
