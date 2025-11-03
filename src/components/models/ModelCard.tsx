import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ModelRegistry } from "@/types/models";
import { cn } from "@/lib/utils";

interface Props {
  model: ModelRegistry;
  onPromote?: (model: ModelRegistry) => void;
}

function typeBadgeVariant(type: ModelRegistry["model_type"]): string {
  switch (type) {
    case "champion":
      return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
    case "challenger":
      return "bg-amber-500/15 text-amber-400 border border-amber-500/30";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function formatPct(value?: number | null): string {
  if (value === null || value === undefined) return "-";
  return `${Math.round(value * 100)}%`;
}

export default function ModelCard({ model, onPromote }: Props) {
  const canPromote = model.model_type === "challenger";

  return (
    <Card className="bg-card/60 border-border/80 backdrop-blur">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-foreground">
              {model.model_name} <span className="text-muted-foreground">v{model.model_version}</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {model.algorithm || "Algoritmus: ismeretlen"}
            </p>
          </div>
          <Badge className={cn("uppercase text-[11px] font-semibold tracking-wide", typeBadgeVariant(model.model_type))}>
            {model.model_type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Pontosság</p>
            <p className="text-foreground font-medium">{formatPct(model.accuracy)}</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Predikciók</p>
            <p className="text-foreground font-medium">{model.total_predictions ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Forgalom</p>
            <p className="text-foreground font-medium">{model.traffic_allocation ?? 0}%</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Regisztráció</p>
            <p className="text-foreground font-medium">{model.registered_at ? new Date(model.registered_at).toLocaleDateString() : "-"}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-end">
        {canPromote && (
          <Button size="sm" onClick={() => onPromote?.(model)}>Challenger promóció</Button>
        )}
      </CardFooter>
    </Card>
  );
}
