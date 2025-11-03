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

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: jobs, error: jobsError } = await supabase
      .from("scheduled_jobs")
      .select("*")
      .order("job_name", { ascending: true });

    if (jobsError) {
      throw jobsError;
    }

    const jobSummaries = await Promise.all((jobs ?? []).map(async (job) => {
      const { data: recentLogs, error: logsError } = await supabase
        .from("job_execution_logs")
        .select("id, started_at, completed_at, status, duration_ms, records_processed, error_message")
        .eq("job_id", job.id)
        .order("started_at", { ascending: false })
        .limit(5);

      if (logsError) {
        console.error("Failed to load logs for job", job.id, logsError);
      }

      const lastLog = recentLogs && recentLogs.length > 0 ? recentLogs[0] : null;
      const averageDuration = recentLogs && recentLogs.length > 0
        ? Math.round((recentLogs
            .map((log) => log.duration_ms ?? 0)
            .reduce((acc, value) => acc + value, 0)) / recentLogs.length)
        : null;

      const { count: totalRuns, error: totalRunsError } = await supabase
        .from("job_execution_logs")
        .select("id", { count: "exact", head: true })
        .eq("job_id", job.id);

      if (totalRunsError) {
        console.error("Failed to load totalRuns for job", job.id, totalRunsError);
      }

      const { count: successRuns, error: successRunsError } = await supabase
        .from("job_execution_logs")
        .select("id", { count: "exact", head: true })
        .eq("job_id", job.id)
        .eq("status", "success");

      if (successRunsError) {
        console.error("Failed to load successRuns for job", job.id, successRunsError);
      }

      const isDue = Boolean(
        job.enabled && (!job.next_run_at || new Date(job.next_run_at).getTime() <= Date.now()),
      );

      return {
        ...job,
        config: job.config ?? {},
        is_due: isDue,
        last_log: lastLog,
        recent_logs: recentLogs ?? [],
        average_duration_ms: averageDuration,
        stats: {
          total_runs: totalRuns ?? 0,
          success_runs: successRuns ?? 0,
        },
      };
    }));

    return new Response(
      JSON.stringify({ jobs: jobSummaries }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("jobs-list error", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
