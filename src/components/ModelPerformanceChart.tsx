import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export interface PerformancePoint {
  date: string; // ISO date
  overall: number; // percentage (0-100)
  home_win: number; // percentage
  draw: number; // percentage
  away_win: number; // percentage
}

interface ModelPerformanceChartProps {
  data: PerformancePoint[];
}

export default function ModelPerformanceChart({ data }: ModelPerformanceChartProps) {
  return (
    <Card className="glass-card border-border animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Model Performance</CardTitle>
        <p className="text-muted-foreground text-sm">Pontosság idősorban, kimenetek szerint</p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            Még nincs elég adat a teljesítmény megjelenítéséhez
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 17%)" />
              <XAxis dataKey="date" tick={{ fill: "hsl(215, 20%, 65%)" }} />
              <YAxis domain={[0, 100]} tick={{ fill: "hsl(215, 20%, 65%)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(11, 11%, 8%)",
                  border: "1px solid hsl(215, 20%, 17%)",
                  borderRadius: "0.5rem",
                  color: "hsl(210, 40%, 98%)",
                }}
                labelStyle={{ color: "hsl(210, 40%, 98%)" }}
                formatter={(value: number) => `${value.toFixed(1)}%`}
              />
              <Legend wrapperStyle={{ color: "hsl(215, 20%, 65%)" }} />
              <Line type="monotone" dataKey="overall" stroke="#10b981" dot={false} strokeWidth={2} name="Összes" />
              <Line type="monotone" dataKey="home_win" stroke="#60a5fa" dot={false} strokeWidth={2} name="Hazai" />
              <Line type="monotone" dataKey="draw" stroke="#f59e0b" dot={false} strokeWidth={2} name="Döntetlen" />
              <Line type="monotone" dataKey="away_win" stroke="#ef4444" dot={false} strokeWidth={2} name="Vendég" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
