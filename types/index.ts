// types/index.ts
export interface Country {
  id: number;
  name: string;
  code: string;
  flag: string;
  leagues: League[];
}

export interface League {
  id: number;
  name: string;
  countryId: number;
  countryName: string;
  tier: number;
  logo?: string;
  season: number;
  totalTeams: number;
  teams?: Team[];
}

export interface Team {
  id: number;
  name: string;
  leagueId: number;
  countryId: number;
  logo?: string;
  position?: number;
  points?: number;
  form?: string[];
}

export interface Fixture {
  id: number;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeId: number;
  awayId: number;
  leagueId: number;
  leagueName: string;
  date: string;
  kickoff: string;
  status: string;
  homeOdds?: number;
  drawOdds?: number;
  awayOdds?: number;
  result?: {
    homeGoals: number;
    awayGoals: number;
    winner: "HOME" | "AWAY" | "DRAW";
  };
}

export interface Standing {
  position: number;
  teamId: number;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form: string[];
}

export interface OracleLeg {
  legId: string;
  matchId: string;
  country: string;
  league: string;
  leagueId: number;
  leagueTier: number;
  kickoff: string;
  homeTeam: string;
  awayTeam: string;
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
  selection: string;
  selectionOdds: number;
  modelProb: number;
  edge: number;
  status: "APPROVED" | "REJECTED" | "CAUTION";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  statusReason?: string;
}

export interface ForensicReport {
  m4: M4Report;
  m5: M5Report;
  m6: M6Report;
  m7: M7Report;
  m8: M8Report;
  m9: M9Report;
  m10: M10Report;
  m26: M26Report;
  m27: M27Report;
  riskFlags: string[];
  finalStatus: string;
  finalConfidence: string;
  weightedScore: number;
}

export interface M4Report {
  passed: boolean;
  checksPassed: number;
  checksTotal: number;
  weightedScore: number;
  checkDetails: M4Check[];
}

export interface M4Check {
  id: string;
  name: string;
  passed: boolean;
  value: number;
  threshold: number;
  message: string;
}

export interface M5Report {
  failureScore: number;
  passed: boolean;
  details: Record<string, number>;
}

export interface M6Report {
  homeScore: number;
  awayScore: number;
  homeKeyPlayersMissing: string[];
  awayKeyPlayersMissing: string[];
  homeFatigue: string;
  awayFatigue: string;
}

export interface M7Report {
  consensus: string;
  agreement: number;
  providers: string[];
  narratives: Record<string, string>;
}

export interface M8Report {
  dualRiskLevel: string;
  underdogThreat: string;
  patternClashScore: number;
  resilienceGap: number;
  patternsReliable: boolean;
}

export interface M9Report {
  underdogEdge: number;
  threatLevel: string;
  patternScore: number;
  goldmineQualified: boolean;
}

export interface M10Report {
  matrixUseful: boolean;
  bilateralPrediction: string;
  bilateralConfidence: string;
  trapValueSignal: string;
}

export interface M26Report {
  matchImportance: number;
  contextLabel: string;
  isRivalry: boolean;
  isSixPointer: boolean;
  isDeadRubber: boolean;
  homeMotivation: string;
  awayMotivation: string;
}

export interface M27Report {
  h2hScore: number;
  h2hLabel: string;
  gamesPlayed: number;
  favWins: number;
  draws: number;
  undWins: number;
  drawRate: number;
  psychologicalBlock: boolean;
  drawBoostFactor: number;
}

export interface BankrollStatus {
  current: number;
  peak: number;
  drawdownPct: number;
  stakeMultiplier: number;
  healthLabel: string;
  pauseRecommended: boolean;
}

export interface PerformanceMetrics {
  calibrationGrade: string;
  brierScore: number;
  ece: number;
  overallAccuracy: number;
  highConfAccuracy: number;
  mediumConfAccuracy: number;
  lowConfAccuracy: number;
  overallRoi: number;
  byLeague: Record<string, { total: number; correct: number; accuracy: number; roi: number }>;
}

export interface DisjointParlay {
  parlayId: number;
  tier: string;
  legs: ParlayLeg[];
  totalOdds: number;
  combinedProb: number;
  riskScore: number;
  riskLevel: string;
}

export interface ParlayLeg {
  legId: string;
  match: string;
  selection: string;
  odds: number;
  confidence: string;
  league: string;
}

export interface SingleStakePlan {
  match: string;
  selection: string;
  odds: number;
  stake: number;
  potentialReturn: number;
  confidence: string;
}

export interface ConfigSettings {
  homeWinThreshold: number;
  opponentWinCap: number;
  minEdge: number;
  confidenceThreshold: number;
  riskTolerance: number;
  kellyFraction: number;
}
