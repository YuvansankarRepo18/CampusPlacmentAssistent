export interface ModuleScoreDetail {
  moduleName: 'resume' | 'coding' | 'aptitude' | 'interview';
  label: string;
  score: number; // 0 - 100
  weight: number; // e.g. 0.35
  weightedScore: number;
  attemptsCount: number;
  solvedCount?: number;
  accuracy?: number;
  technicalAvg?: number;
  commAvg?: number;
  status: 'EXCELLENT' | 'GOOD' | 'NEEDS_PRACTICE' | 'NOT_STARTED';
  lastUpdated: number;
}

export interface CategorySkillBreakdown {
  quantitative: number;
  logical: number;
  verbal: number;
  dsaCoding: number;
  webDev: number;
  communication: number;
}

export interface CompanyReadinessItem {
  company: string;
  readinessScore: number; // 0 - 100
  status: 'READY' | 'COMPETITIVE' | 'NEEDS_PREPARATION';
  primaryFocus: string;
}

export interface DynamicRecommendation {
  id: string;
  category: 'Aptitude' | 'Coding' | 'Resume' | 'Interview';
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  action: string;
  reasoning: string;
  targetModuleRoute: string;
}

export interface PlacementReadinessReport {
  userId: string;
  userName?: string;
  
  // Key Aggregated Metrics
  overallReadinessScore: number; // 0 - 100
  placementProbability: number; // 0 - 100
  confidenceLevel: 'Very High' | 'High' | 'Moderate' | 'Needs Work';
  
  // Module Scores Breakdown
  moduleScores: {
    resume: ModuleScoreDetail;
    coding: ModuleScoreDetail;
    aptitude: ModuleScoreDetail;
    interview: ModuleScoreDetail;
  };

  // Category Skill Radar
  categoryBreakdown: CategorySkillBreakdown;

  // Company Readiness Index
  companyReadiness: CompanyReadinessItem[];

  // Dynamic AI Recommendations
  dynamicRecommendations: DynamicRecommendation[];

  // Performance History Trend
  performanceHistory?: Array<{
    timestamp: number;
    readinessScore: number;
    resumeScore: number;
    codingScore: number;
    aptitudeScore: number;
    interviewScore: number;
  }>;

  // Strengths & Gaps
  topStrengths: string[];
  criticalGaps: string[];

  // Snapshot Date
  calculatedAt: number;
}
