import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, TrendingUp, CheckCircle2 } from 'lucide-react';

interface Pattern {
  template_name: string;
  confidence_boost: number;
  data: Record<string, any>;
}

interface PredictionDisplayProps {
  prediction: {
    predicted_outcome: string;
    confidence_score: number;
    btts_prediction?: boolean;
  };
  patterns?: Pattern[];
  formScores?: { home: number; away: number } | null;
}

const PATTERN_LABELS: Record<string, string> = {
  home_winning_streak: 'Hazai győzelmi széria',
  away_winning_streak: 'Vendég győzelmi széria',
  h2h_dominance: 'H2H dominancia',
  recent_form_advantage: 'Forma előny',
  high_scoring_league: 'Gólgazdag liga'
};

const PATTERN_ICONS: Record<string, any> = {
  home_winning_streak: Trophy,
  away_winning_streak: Trophy,
  h2h_dominance: Target,
  recent_form_advantage: TrendingUp,
  high_scoring_league: CheckCircle2
};

export default function PredictionDisplay({ prediction, patterns = [], formScores }: PredictionDisplayProps) {
  const outcomeLabel = prediction.predicted_outcome === 'home_win' 
    ? 'Hazai győzelem' 
    : prediction.predicted_outcome === 'away_win' 
      ? 'Vendég győzelem' 
      : 'Döntetlen';

  const confidenceColor = prediction.confidence_score >= 70 
    ? 'text-green-600' 
    : prediction.confidence_score >= 55 
      ? 'text-yellow-600' 
      : 'text-red-600';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Predikció Eredmény
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Előrejelzett kimenetel:</span>
              <Badge variant="default" className="text-lg px-4 py-1">
                {outcomeLabel}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Megbízhatósági pontszám</span>
                <span className={`text-2xl font-bold ${confidenceColor}`}>
                  {prediction.confidence_score.toFixed(1)}%
                </span>
              </div>
              <Progress value={prediction.confidence_score} className="h-3" />
            </div>

            {prediction.btts_prediction !== undefined && (
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm">Mindkét csapat szerez gólt (BTTS):</span>
                <Badge variant={prediction.btts_prediction ? 'default' : 'secondary'}>
                  {prediction.btts_prediction ? 'Igen' : 'Nem'}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {patterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Detektált Pattern-ek
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patterns.map((pattern, index) => {
                const Icon = PATTERN_ICONS[pattern.template_name] || CheckCircle2;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">
                          {PATTERN_LABELS[pattern.template_name] || pattern.template_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {JSON.stringify(pattern.data)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      +{pattern.confidence_boost.toFixed(1)}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {formScores && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Forma Pontszámok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Hazai csapat</p>
                <p className="text-3xl font-bold">{formScores.home}</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Vendég csapat</p>
                <p className="text-3xl font-bold">{formScores.away}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
