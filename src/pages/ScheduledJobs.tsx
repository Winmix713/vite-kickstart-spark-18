import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCcw } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import JobStatusCard from "@/components/jobs/JobStatusCard";
import { JobLogsDialog } from "@/components/jobs/JobLogsDialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type {
  JobSummary,
  JobLog,
  JobListResponse,
  JobLogsResponse,
  JobToggleResponse,
  JobTriggerResponse,
} from "@/types/jobs";

const fetchJobs = async (): Promise<JobSummary[]> => {
  const { data, error } = await supabase.functions.invoke<JobListResponse>("jobs-list");
  if (error) {
    throw new Error(error.message ?? "Nem sikerült betölteni az ütemezett feladatokat");
  }
  return data?.jobs ?? [];
};

export default function ScheduledJobs() {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<JobSummary | null>(null);
  const [logsOpen, setLogsOpen] = useState(false);
  const [toggleJobId, setToggleJobId] = useState<string | null>(null);
  const [runJobId, setRunJobId] = useState<string | null>(null);

  const jobsQuery = useQuery<JobSummary[]>({
    queryKey: ["scheduled-jobs"],
    queryFn: fetchJobs,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

  const fetchLogs = async (): Promise<JobLog[]> => {
    if (!selectedJob) return [];
    const { data, error } = await supabase
      .functions
      .invoke<JobLogsResponse>("jobs-logs", { body: { jobId: selectedJob.id, limit: 50 } });

    if (error) {
      throw new Error(error.message ?? "Nem sikerült lekérni a futtatási naplókat");
    }

    return data?.logs ?? [];
  };

  const logsQuery = useQuery<JobLog[]>({
    queryKey: ["job-logs", selectedJob?.id],
    queryFn: fetchLogs,
    enabled: logsOpen && Boolean(selectedJob),
    refetchOnWindowFocus: false,
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Nem sikerült betölteni a naplókat";
      toast.error(message);
    },
  });

  const toggleMutation = useMutation<JobSummary | undefined, Error, { jobId: string; enabled: boolean }>({
    mutationFn: async ({ jobId, enabled }) => {
      const { data, error } = await supabase
        .functions
        .invoke<JobToggleResponse>("jobs-toggle", { body: { jobId, enabled } });

      if (error) {
        throw new Error(error.message ?? "Nem sikerült frissíteni a job állapotát");
      }

      return data?.job;
    },
    onMutate: ({ jobId }) => {
      setToggleJobId(jobId);
    },
    onSuccess: async (_, { enabled }) => {
      await queryClient.invalidateQueries({ queryKey: ["scheduled-jobs"] });
      toast.success(enabled ? "A job engedélyezve lett" : "A job le lett tiltva");
    },
    onError: (error) => {
      toast.error(error.message || "Nem sikerült frissíteni a jobot");
    },
    onSettled: () => {
      setToggleJobId(null);
    },
  });

  const runMutation = useMutation<JobTriggerResponse["result"], Error, { jobId: string; force?: boolean }>({
    mutationFn: async ({ jobId, force }) => {
      const { data, error } = await supabase
        .functions
        .invoke<JobTriggerResponse>("jobs-trigger", { body: { jobId, force } });

      if (error) {
        throw new Error(error.message ?? "Nem sikerült futtatni a jobot");
      }

      if (!data?.result) {
        throw new Error("Nem érkezett válasz a job futtatásáról");
      }

      return data.result;
    },
    onMutate: ({ jobId }) => {
      setRunJobId(jobId);
    },
    onSuccess: async (result, { jobId }) => {
      await queryClient.invalidateQueries({ queryKey: ["scheduled-jobs"] });
      if (selectedJob?.id === jobId) {
        await queryClient.invalidateQueries({ queryKey: ["job-logs", jobId] });
      }
      toast.success(`Job futtatása befejeződött – ${result.recordsProcessed} rekord feldolgozva.`);
    },
    onError: (error) => {
      toast.error(error.message || "Nem sikerült futtatni a jobot");
    },
    onSettled: () => {
      setRunJobId(null);
    },
  });

  const jobs = jobsQuery.data ?? [];
  const isLoading = jobsQuery.isLoading;
  const isFetching = jobsQuery.isFetching;
  const error = jobsQuery.error ? (jobsQuery.error as Error) : null;

  const skeletonCards = useMemo(() => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((item) => (
        <Skeleton key={item} className="h-64 w-full" />
      ))}
    </div>
  ), []);

  const handleViewLogs = (job: JobSummary) => {
    setSelectedJob(job);
    setLogsOpen(true);
  };

  const handleCloseLogs = (open: boolean) => {
    setLogsOpen(open);
    if (!open) {
      setSelectedJob(null);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Sidebar />
      <TopBar />
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gradient-emerald">Ütemezett feladatok</h1>
              <p className="text-muted-foreground">
                Feladatok automatizált futtatása, manuális indítás és naplók megtekintése.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void jobsQuery.refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2"
            >
              <RefreshCcw className={cn("w-4 h-4", isFetching ? "animate-spin" : "")} />
              Frissítés
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            skeletonCards
          ) : jobs.length === 0 ? (
            <div className="rounded-lg border border-border/60 bg-muted/20 p-12 text-center text-muted-foreground">
              Még nincs konfigurált ütemezett feladat.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <JobStatusCard
                  key={job.id}
                  job={job}
                  onToggle={(enabled) => toggleMutation.mutate({ jobId: job.id, enabled })}
                  onRun={() => runMutation.mutate({ jobId: job.id, force: !job.enabled })}
                  onViewLogs={() => handleViewLogs(job)}
                  isToggling={toggleJobId === job.id && toggleMutation.isPending}
                  isRunning={runJobId === job.id && runMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <JobLogsDialog
        open={logsOpen}
        onOpenChange={handleCloseLogs}
        job={selectedJob}
        logs={logsQuery.data ?? []}
        isLoading={logsQuery.isLoading}
        onRefresh={() => void logsQuery.refetch()}
      />
    </div>
  );
}
