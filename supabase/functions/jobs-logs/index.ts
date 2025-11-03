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
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials");
    }

    let jobId: string | null = null;
    let limit = 50;

    if (req.method === "GET") {
      const { searchParams } = new URL(req.url);
      jobId = searchParams.get("job_id");
      const limitParam = searchParams.get("limit");
      if (limitParam) {
        const parsedLimit = Number(limitParam);
        if (!Number.isNaN(parsedLimit)) {
          limit = Math.min(100, Math.max(1, parsedLimit));
        }
      }
    } else {
      const body = await req.json();
      jobId = body?.jobId ?? body?.job_id ?? null;
      if (body?.limit !== undefined) {
        const parsedLimit = Number(body.limit);
        if (!Number.isNaN(parsedLimit)) {
          limit = Math.min(100, Math.max(1, parsedLimit));
        }
      }
    }

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: "jobId is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: logs, error } = await supabase
      .from("job_execution_logs")
      .select("id, started_at, completed_at, status, duration_ms, records_processed, error_message, error_stack")
      .eq("job_id", jobId)
      .order("started_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ logs: logs ?? [] }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("jobs-logs error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
