// Statistical calculation functions for team analysis

export interface MatchResult {
  date: string;
  opponent: string;
  homeGoals: number;
  awayGoals: number;
  isHome: boolean;
  result: 'W' | 'D' | 'L';
}

export interface TeamStatistics {
  bothTeamsScored: number;
  avgGoalsPerMatch: number;
  avgHomeGoals: number;
  avgAwayGoals: number;
  formIndex: number;
  expectedGoals: number;
  bothTeamsToScoreProb: number;
  winProbability: {
    home: number;
    draw: number;
    away: number;
  };
}

// Calculate percentage of matches where both teams scored
export const calculateBothTeamsScoredPercentage = (matches: MatchResult[]): number => {
  if (matches.length === 0) return 0;
  
  const bothScored = matches.filter(match => 
    match.homeGoals > 0 && match.awayGoals > 0
  ).length;
  
  return Math.round((bothScored / matches.length) * 100);
};

// Calculate average goals per match
export const calculateAverageGoals = (matches: MatchResult[]) => {
  if (matches.length === 0) return { total: 0, home: 0, away: 0 };
  
  let totalGoals = 0;
  let homeGoals = 0;
  let awayGoals = 0;
  let homeMatches = 0;
  let awayMatches = 0;
  
  matches.forEach(match => {
    totalGoals += match.homeGoals + match.awayGoals;
    if (match.isHome) {
      homeGoals += match.homeGoals;
      homeMatches++;
    } else {
      awayGoals += match.awayGoals;
      awayMatches++;
    }
  });
  
  return {
    total: Number((totalGoals / matches.length).toFixed(2)),
    home: homeMatches > 0 ? Number((homeGoals / homeMatches).toFixed(2)) : 0,
    away: awayMatches > 0 ? Number((awayGoals / awayMatches).toFixed(2)) : 0
  };
};

// Calculate form index based on last 5 matches
export const calculateFormIndex = (matches: MatchResult[]): number => {
  const recentMatches = matches.slice(0, 5);
  if (recentMatches.length === 0) return 0;
  
  const points = recentMatches.reduce((total, match) => {
    if (match.result === 'W') return total + 3;
    if (match.result === 'D') return total + 1;
    return total;
  }, 0);
  
  const maxPoints = recentMatches.length * 3;
  return Math.round((points / maxPoints) * 100);
};

// Calculate expected goals (xG)
export const calculateExpectedGoals = (matches: MatchResult[]): number => {
  if (matches.length === 0) return 0;
  
  const teamGoals = matches.map(match => 
    match.isHome ? match.homeGoals : match.awayGoals
  );
  
  const avgGoals = teamGoals.reduce((sum, goals) => sum + goals, 0) / teamGoals.length;
  return Number(avgGoals.toFixed(2));
};

// Calculate probability of both teams scoring
export const calculateBothTeamsToScoreProb = (matches: MatchResult[]): number => {
  return calculateBothTeamsScoredPercentage(matches);
};

// Calculate head-to-head statistics
export const calculateHeadToHeadStats = (matches: MatchResult[]) => {
  if (matches.length === 0) return { wins: 0, draws: 0, losses: 0 };
  
  const wins = matches.filter(m => m.result === 'W').length;
  const draws = matches.filter(m => m.result === 'D').length;
  const losses = matches.filter(m => m.result === 'L').length;
  
  return {
    wins: Math.round((wins / matches.length) * 100),
    draws: Math.round((draws / matches.length) * 100),
    losses: Math.round((losses / matches.length) * 100)
  };
};

// Predict winner based on form and stats
export const predictWinner = (matches: MatchResult[]): { prediction: string; confidence: number } => {
  const formIndex = calculateFormIndex(matches);
  const wins = matches.slice(0, 5).filter(m => m.result === 'W').length;
  
  let prediction = 'Döntetlen';
  let confidence = 50;
  
  if (formIndex >= 70) {
    prediction = 'Győzelem várható';
    confidence = formIndex;
  } else if (formIndex >= 50) {
    prediction = 'Kiegyensúlyozott';
    confidence = formIndex;
  } else if (formIndex < 40) {
    prediction = 'Nehéz mérkőzés';
    confidence = 100 - formIndex;
  }
  
  return { prediction, confidence };
};

// Calculate Poisson-based goal prediction
export const calculatePoissonGoals = (matches: MatchResult[]): { home: number; away: number } => {
  const avgGoals = calculateAverageGoals(matches);
  
  return {
    home: Math.round(avgGoals.home),
    away: Math.round(avgGoals.away)
  };
};

// Calculate win probability using Elo-inspired model
export const calculateWinProbability = (matches: MatchResult[]): { home: number; draw: number; away: number } => {
  if (matches.length === 0) return { home: 33, draw: 34, away: 33 };
  
  const stats = calculateHeadToHeadStats(matches);
  const formIndex = calculateFormIndex(matches);
  
  // Adjust probabilities based on form
  const adjustment = (formIndex - 50) / 2;
  
  let home = Math.max(20, Math.min(60, stats.wins + adjustment));
  let away = Math.max(15, Math.min(50, stats.losses - adjustment));
  let draw = 100 - home - away;
  
  // Normalize to ensure sum is 100
  const total = home + draw + away;
  home = Math.round((home / total) * 100);
  away = Math.round((away / total) * 100);
  draw = 100 - home - away;
  
  return { home, draw, away };
};

// Generate comprehensive team statistics
export const generateTeamStatistics = (matches: MatchResult[]): TeamStatistics => {
  return {
    bothTeamsScored: calculateBothTeamsScoredPercentage(matches),
    avgGoalsPerMatch: calculateAverageGoals(matches).total,
    avgHomeGoals: calculateAverageGoals(matches).home,
    avgAwayGoals: calculateAverageGoals(matches).away,
    formIndex: calculateFormIndex(matches),
    expectedGoals: calculateExpectedGoals(matches),
    bothTeamsToScoreProb: calculateBothTeamsToScoreProb(matches),
    winProbability: calculateWinProbability(matches)
  };
};
