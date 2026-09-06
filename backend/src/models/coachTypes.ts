export type CoachingMode = 
  | 'General' 
  | 'Resume' 
  | 'Coding' 
  | 'Aptitude' 
  | 'Interview' 
  | 'Career' 
  | 'Strategy';

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  category: 'Aptitude' | 'Coding' | 'Resume' | 'Interview' | 'Strategy';
  topic?: string;
  targetCompany?: string;
  completed: boolean;
  dueDate?: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface UserActionPlan {
  id: string;
  userId: string;
  goalTitle: string;
  items: ActionItem[];
  targetRole: string;
  targetCompanies: string[];
  weeklySchedule?: Array<{ day: string; focus: string; tasks: string[] }>;
  createdAt: number;
  updatedAt: number;
}

export interface ProactiveInsight {
  id: string;
  userId: string;
  type: 'aptitude_weakness' | 'ats_low' | 'coding_weakness' | 'interview_comm' | 'placement_ready' | 'weekly_nudge';
  title: string;
  summary: string;
  actionPrompt: string;
  topic?: string;
  generatedAt: number;
  dismissed: boolean;
}

export interface CoachMessage {
  id: string;
  sessionId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  mode: CoachingMode;
  proactive?: boolean;
  metadata?: {
    aiGenerated?: boolean;
    modelUsed?: string;
    actionPlanItems?: ActionItem[];
    recommendedProblems?: Array<{ id: string; title: string; topic: string; difficulty: string }>;
    suggestedTopics?: string[];
    roadmapTimeline?: Array<{ week: string; focus: string; objectives: string[] }>;
    companySuitability?: Array<{ company: string; fitScore: number; reason: string }>;
  };
  timestamp: number;
}

export interface CoachSession {
  id: string;
  userId: string;
  title: string;
  mode: CoachingMode;
  lastMessage?: string;
  messageCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface PlanGenerationOptions {
  targetRole?: string;
  targetCompanies?: string[];
  availableHoursPerWeek?: number;
  durationDays?: number;
}

export interface StudentPlacementContext {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    skills?: string[];
    targetRole?: string;
    targetCompanies?: string[];
    projects?: string[];
    certifications?: string[];
  };
  readiness: {
    overallScore: number;
    placementProbability: number;
    confidenceLevel: string;
    companyReadiness: Array<{
      company: string;
      readinessScore: number;
      status: string;
      primaryFocus: string;
    }>;
  };
  resume: {
    hasResume: boolean;
    latestScore: number;
    missingKeywords: string[];
    formattingIssues: string[];
    categoryScores?: {
      skillsScore?: number;
      experienceScore?: number;
      structureScore?: number;
      impactScore?: number;
    };
    improvements?: string[];
  };
  aptitude: {
    totalTests: number;
    overallAccuracy: number;
    weakestCategory: string;
    strongestCategory: string;
    categoryPerformance: {
      Quantitative?: { accuracy: number; total: number; correct: number };
      Logical?: { accuracy: number; total: number; correct: number };
      Verbal?: { accuracy: number; total: number; correct: number };
      DataInterpretation?: { accuracy: number; total: number; correct: number };
    };
  };
  coding: {
    totalAttempts: number;
    solvedTotal: number;
    codingAccuracy: number;
    avgScore: number;
    leaderboardRank?: number;
    weakestTopics: string[];
    topicBreakdown: Record<string, { attempted: number; passed: number; score: number }>;
  };
  interview: {
    totalSessions: number;
    avgOverallScore: number;
    avgTechnicalScore: number;
    avgCommunicationScore: number;
    avgConfidenceScore: number;
    recentStrengths: string[];
    recentWeaknesses: string[];
  };
  actionPlan: UserActionPlan | null;
  proactiveInsights: ProactiveInsight[];
}
