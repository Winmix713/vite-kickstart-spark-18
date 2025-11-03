// Phase 9: Advanced Features Integration Page

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  DollarSign, 
  Clock, 
  Brain, 
  Settings,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity
} from 'lucide-react';

// Import Phase 9 components
import { UserPredictionForm } from './collaborative-intelligence';
import { CrowdWisdomDisplay } from './collaborative-intelligence';
import { MarketOddsDisplay } from './market-integration';
import { ValueBetHighlights } from './market-integration';
import { TemporalDecayDashboard } from './temporal-decay';
import { FreshnessIndicator } from './temporal-decay';
import { ExperimentDashboard } from './self-improving-system';
import { FeatureGenerationWizard } from './self-improving-system';

// Import services for status checks
import { 
  CollaborativeIntelligenceService,
  MarketIntegrationService,
  TemporalDecayService,
  SelfImprovingSystemService
} from '@/lib/phase9-api';

interface Phase9DashboardProps {
  matchId?: string; // Optional match ID for match-specific features
}

export const Phase9Dashboard: React.FC<Phase9DashboardProps> = ({ matchId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showFeatureWizard, setShowFeatureWizard] = useState(false);

  // Mock match ID for demonstration - in real app, this would come from props or route
  const demoMatchId = matchId || 'demo-match-123';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Phase 9: Advanced Features</h1>
          <p className="text-gray-600 mt-2">
            Collaborative Intelligence, Market Integration, Temporal Decay & Self-Improvement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowFeatureWizard(!showFeatureWizard)}
            variant="outline"
          >
            <Settings className="mr-2 h-4 w-4" />
            Feature Wizard
          </Button>
        </div>
      </div>

      {/* Feature Generation Wizard */}
      {showFeatureWizard && (
        <FeatureGenerationWizard 
          onGenerationComplete={() => setShowFeatureWizard(false)}
        />
      )}

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="collaborative">Crowd Wisdom</TabsTrigger>
          <TabsTrigger value="market">Market Integration</TabsTrigger>
          <TabsTrigger value="temporal">Temporal Decay</TabsTrigger>
          <TabsTrigger value="self-improving">Self-Improving</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SystemStatusCard
              title="Collaborative Intelligence"
              icon={<Users className="h-5 w-5" />}
              status="active"
              description="User predictions & crowd wisdom"
              color="blue"
            />
            <SystemStatusCard
              title="Market Integration"
              icon={<DollarSign className="h-5 w-5" />}
              status="active"
              description="Odds API & value bets"
              color="green"
            />
            <SystemStatusCard
              title="Temporal Decay"
              icon={<Clock className="h-5 w-5" />}
              status="active"
              description="Data freshness tracking"
              color="orange"
            />
            <SystemStatusCard
              title="Self-Improving"
              icon={<Brain className="h-5 w-5" />}
              status="active"
              description="Feature engineering & learning"
              color="purple"
            />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickActionCard
                  title="Submit Prediction"
                  description="Add your prediction to crowd wisdom"
                  icon={<Users className="h-8 w-8" />}
                  onClick={() => setActiveTab('collaborative')}
                />
                <QuickActionCard
                  title="Check Value Bets"
                  description="Find profitable betting opportunities"
                  icon={<DollarSign className="h-8 w-8" />}
                  onClick={() => setActiveTab('market')}
                />
                <QuickActionCard
                  title="Monitor Freshness"
                  description="Check data staleness and decay"
                  icon={<Clock className="h-8 w-8" />}
                  onClick={() => setActiveTab('temporal')}
                />
                <QuickActionCard
                  title="Run Learning"
                  description="Execute continuous learning pipeline"
                  icon={<Brain className="h-8 w-8" />}
                  onClick={() => setActiveTab('self-improving')}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                System Health Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <HealthMetric
                  title="Crowd Participation"
                  value="87%"
                  status="good"
                  description="Active user predictions"
                />
                <HealthMetric
                  title="Market Data Freshness"
                  value="94%"
                  status="excellent"
                  description="Odds data recency"
                />
                <HealthMetric
                  title="Feature Experiments"
                  value="12"
                  status="excellent"
                  description="Running experiments"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collaborative Intelligence Tab */}
        <TabsContent value="collaborative" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Prediction Form */}
            <UserPredictionForm
              matchId={demoMatchId}
              onSubmit={(data) => {
                console.log('Prediction submitted:', data);
              }}
            />
            
            {/* Crowd Wisdom Display */}
            <CrowdWisdomDisplay
              matchId={demoMatchId}
              showDivergence={true}
              refreshInterval={30000}
            />
          </div>

          {/* Additional Crowd Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Crowd Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Advanced crowd analytics coming soon...</p>
                <p className="text-sm">Prediction accuracy trends, user performance tracking, and more.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Integration Tab */}
        <TabsContent value="market" className="space-y-6">
          <MarketOddsDisplay
            matchId={demoMatchId}
            showValueBets={true}
            autoRefresh={true}
          />

          <ValueBetHighlights
            maxResults={10}
            minExpectedValue={0.05}
            showKellyCalculator={true}
          />
        </TabsContent>

        {/* Temporal Decay Tab */}
        <TabsContent value="temporal" className="space-y-6">
          <TemporalDecayDashboard
            autoRefresh={true}
            refreshInterval={60000}
          />

          {/* Example Freshness Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Example Freshness Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Match Data</span>
                  <FreshnessIndicator
                    tableName="matches"
                    recordId={demoMatchId}
                    dataType="match"
                    showDetails={true}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">Market Odds</span>
                  <FreshnessIndicator
                    tableName="market_odds"
                    recordId={demoMatchId}
                    dataType="odds"
                    showDetails={true}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Self-Improving Tab */}
        <TabsContent value="self-improving" className="space-y-6">
          <ExperimentDashboard
            showActiveOnly={false}
            autoRefresh={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// System Status Card Component
interface SystemStatusCardProps {
  title: string;
  icon: React.ReactNode;
  status: 'active' | 'inactive' | 'error';
  description: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

const SystemStatusCard: React.FC<SystemStatusCardProps> = ({
  title,
  icon,
  status,
  description,
  color
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-gray-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'border-blue-200 bg-blue-50',
      green: 'border-green-200 bg-green-50',
      orange: 'border-orange-200 bg-orange-50',
      purple: 'border-purple-200 bg-purple-50'
    };
    return colors[color] || colors.blue;
  };

  return (
    <Card className={getColorClasses(color)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${getColorClasses(color)}`}>
            {icon}
          </div>
          {getStatusIcon(status)}
        </div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-2">{description}</p>
        <div className={`text-sm font-medium ${getStatusColor(status)}`}>
          {status.toUpperCase()}
        </div>
      </CardContent>
    </Card>
  );
};

// Quick Action Card Component
interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon,
  onClick
}) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300"
      onClick={onClick}
    >
      <CardContent className="p-4 text-center">
        <div className="text-blue-600 mb-3 flex justify-center">
          {icon}
        </div>
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
};

// Health Metric Component
interface HealthMetricProps {
  title: string;
  value: string;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  description: string;
}

const HealthMetric: React.FC<HealthMetricProps> = ({
  title,
  value,
  status,
  description
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="text-center">
      <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
      <div className={`text-3xl font-bold mb-2 ${getStatusColor(status)}`}>
        {value}
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};