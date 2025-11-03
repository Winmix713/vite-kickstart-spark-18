// Phase 9: Collaborative Intelligence Components

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CollaborativeIntelligenceService } from '@/lib/phase9-api';
import type { UserPredictionForm, UserPredictionFormProps } from '@/types/phase9';

// Form validation schema
const predictionSchema = z.object({
  predicted_outcome: z.enum(['home_win', 'draw', 'away_win']),
  confidence_score: z.number().min(0).max(100),
  predicted_home_score: z.number().min(0).max(10).optional(),
  predicted_away_score: z.number().min(0).max(10).optional(),
  btts_prediction: z.boolean().optional(),
  over_under_prediction: z.enum(['over_2.5', 'under_2.5']).optional(),
  reasoning: z.string().max(500).optional()
});

export const UserPredictionForm: React.FC<UserPredictionFormProps> = ({
  matchId,
  onSubmit,
  isLoading = false,
  disabled = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<UserPredictionForm>({
    resolver: zodResolver(predictionSchema),
    defaultValues: {
      predicted_outcome: 'home_win',
      confidence_score: 75,
      btts_prediction: false,
      over_under_prediction: 'over_2.5'
    }
  });

  const confidenceScore = watch('confidence_score');
  const predictedOutcome = watch('predicted_outcome');

  const handleFormSubmit = async (data: UserPredictionForm) => {
    setIsSubmitting(true);
    
    try {
      const result = await CollaborativeIntelligenceService.submitUserPrediction(
        { ...data, match_id: matchId },
        'anonymous' // In production, get from auth
      );

      if (result.success) {
        toast({
          title: 'Prediction submitted successfully!',
          description: 'Your prediction has been added to the crowd wisdom.',
        });
        onSubmit?.(data);
      } else {
        toast({
          title: 'Failed to submit prediction',
          description: result.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 80) return 'Very High';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Submit Your Prediction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Main Prediction */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="predicted_outcome">Match Outcome</Label>
              <Select
                value={predictedOutcome}
                onValueChange={(value) => setValue('predicted_outcome', value as any)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home_win">Home Win</SelectItem>
                  <SelectItem value="draw">Draw</SelectItem>
                  <SelectItem value="away_win">Away Win</SelectItem>
                </SelectContent>
              </Select>
              {errors.predicted_outcome && (
                <p className="text-sm text-red-600 mt-1">{errors.predicted_outcome.message}</p>
              )}
            </div>

            {/* Confidence Score */}
            <div>
              <Label htmlFor="confidence_score">
                Confidence Score: <span className={`font-semibold ${getConfidenceColor(confidenceScore)}`}>
                  {confidenceScore}% ({getConfidenceLabel(confidenceScore)})
                </span>
              </Label>
              <Slider
                id="confidence_score"
                min={0}
                max={100}
                step={5}
                value={[confidenceScore]}
                onValueChange={(value) => setValue('confidence_score', value[0])}
                disabled={disabled}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
              {errors.confidence_score && (
                <p className="text-sm text-red-600 mt-1">{errors.confidence_score.message}</p>
              )}
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Button>

            {showAdvanced && (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                {/* Score Predictions */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="predicted_home_score">Home Score</Label>
                    <Input
                      id="predicted_home_score"
                      type="number"
                      min={0}
                      max={10}
                      placeholder="0-10"
                      {...register('predicted_home_score', { valueAsNumber: true })}
                      disabled={disabled}
                    />
                  </div>
                  <div>
                    <Label htmlFor="predicted_away_score">Away Score</Label>
                    <Input
                      id="predicted_away_score"
                      type="number"
                      min={0}
                      max={10}
                      placeholder="0-10"
                      {...register('predicted_away_score', { valueAsNumber: true })}
                      disabled={disabled}
                    />
                  </div>
                </div>

                {/* BTTS Prediction */}
                <div>
                  <Label>Both Teams to Score</Label>
                  <Select
                    value={watch('btts_prediction') ? 'yes' : 'no'}
                    onValueChange={(value) => setValue('btts_prediction', value === 'yes')}
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Over/Under Prediction */}
                <div>
                  <Label>Goals Over/Under 2.5</Label>
                  <Select
                    value={watch('over_under_prediction')}
                    onValueChange={(value) => setValue('over_under_prediction', value as any)}
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="over_2.5">Over 2.5</SelectItem>
                      <SelectItem value="under_2.5">Under 2.5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reasoning */}
                <div>
                  <Label htmlFor="reasoning">Reasoning (Optional)</Label>
                  <Textarea
                    id="reasoning"
                    placeholder="Explain your prediction logic..."
                    className="min-h-[80px]"
                    {...register('reasoning')}
                    disabled={disabled}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {watch('reasoning')?.length || 0}/500 characters
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={!isValid || isSubmitting || disabled || isLoading}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Submit Prediction
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Crowd Wisdom Display Component
import type { CrowdWisdomDisplayProps } from '@/types/phase9';

interface CrowdWisdomData {
  crowdWisdom?: any;
  divergence?: any;
  isLoading: boolean;
  error?: string;
}

export const CrowdWisdomDisplay: React.FC<CrowdWisdomDisplayProps> = ({
  matchId,
  showDivergence = true,
  refreshInterval = 30000 // 30 seconds
}) => {
  const [data, setData] = useState<CrowdWisdomData>({ isLoading: true });

  const fetchCrowdWisdom = useCallback(async () => {
    setData(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const [crowdResult, divergenceResult] = await Promise.all([
        CollaborativeIntelligenceService.getCrowdWisdom(matchId),
        showDivergence ? CollaborativeIntelligenceService.analyzeDivergence(matchId) : null
      ]);

      setData({
        crowdWisdom: crowdResult.crowdWisdom,
        divergence: divergenceResult?.analysis,
        isLoading: false,
        error: crowdResult.error || divergenceResult?.error
      });
    } catch (error) {
      setData({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch crowd wisdom'
      });
    }
  }, [matchId, showDivergence]);

  useEffect(() => {
    fetchCrowdWisdom();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchCrowdWisdom, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [matchId, showDivergence, refreshInterval, fetchCrowdWisdom]);

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'home_win': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draw': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'away_win': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDivergenceColor = (divergence: number) => {
    if (divergence > 30) return 'text-red-600';
    if (divergence > 15) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (data.isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Crowd Wisdom
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Crowd Wisdom
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{data.error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data.crowdWisdom || data.crowdWisdom.total_predictions === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Crowd Wisdom
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No predictions yet for this match.</p>
            <p className="text-sm">Be the first to share your prediction!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Crowd Wisdom ({data.crowdWisdom.total_predictions} predictions)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Consensus Prediction */}
        {data.crowdWisdom.consensus_prediction && (
          <div className="space-y-2">
            <h4 className="font-semibold">Consensus Prediction</h4>
            <div className="flex items-center gap-2">
              <Badge className={getOutcomeColor(data.crowdWisdom.consensus_prediction)}>
                {data.crowdWisdom.consensus_prediction.replace('_', ' ').toUpperCase()}
              </Badge>
              <span className="text-sm text-gray-600">
                {data.crowdWisdom.consensus_confidence.toFixed(1)}% confidence
              </span>
            </div>
          </div>
        )}

        {/* Prediction Distribution */}
        <div className="space-y-2">
          <h4 className="font-semibold">Prediction Distribution</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Home Win</span>
              <span className="font-semibold">{data.crowdWisdom.home_win_predictions}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${(data.crowdWisdom.home_win_predictions / data.crowdWisdom.total_predictions) * 100}%`
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span>Draw</span>
              <span className="font-semibold">{data.crowdWisdom.draw_predictions}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gray-600 h-2 rounded-full"
                style={{
                  width: `${(data.crowdWisdom.draw_predictions / data.crowdWisdom.total_predictions) * 100}%`
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span>Away Win</span>
              <span className="font-semibold">{data.crowdWisdom.away_win_predictions}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full"
                style={{
                  width: `${(data.crowdWisdom.away_win_predictions / data.crowdWisdom.total_predictions) * 100}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Average Confidence */}
        <div className="space-y-2">
          <h4 className="font-semibold">Average Confidence</h4>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${data.crowdWisdom.average_confidence}%` }}
              />
            </div>
            <span className="text-sm font-semibold">
              {data.crowdWisdom.average_confidence.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Divergence Analysis */}
        {showDivergence && data.divergence && (
          <div className="space-y-2">
            <h4 className="font-semibold">Model vs Crowd Analysis</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Model Prediction:</span>
                <div className="font-semibold">
                  {data.divergence.modelPrediction.replace('_', ' ').toUpperCase()}
                </div>
                <div className="text-gray-600">
                  {data.divergence.modelConfidence.toFixed(1)}% confidence
                </div>
              </div>
              <div>
                <span className="text-gray-600">Crowd Consensus:</span>
                <div className="font-semibold">
                  {data.divergence.crowdConsensus.replace('_', ' ').toUpperCase()}
                </div>
                <div className="text-gray-600">
                  {data.divergence.crowdConfidence.toFixed(1)}% confidence
                </div>
              </div>
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Divergence:</span>
                <span className={`text-sm font-bold ${getDivergenceColor(data.divergence.divergence)}`}>
                  {data.divergence.divergence.toFixed(1)}%
                </span>
              </div>
              <Badge
                variant={data.divergence.interpretation === 'high' ? 'destructive' : 
                       data.divergence.interpretation === 'medium' ? 'default' : 'secondary'}
                className="mt-1"
              >
                {data.divergence.interpretation.toUpperCase()} Divergence
              </Badge>
              <p className="text-xs text-gray-600 mt-2">
                {data.divergence.recommendation}
              </p>
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="text-xs text-gray-500 text-right">
          Last updated: {new Date(data.crowdWisdom.last_calculated_at).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
};