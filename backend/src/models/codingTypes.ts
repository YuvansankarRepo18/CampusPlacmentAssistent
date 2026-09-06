export type CodingDifficulty = 'easy' | 'medium' | 'hard';

export type DSATopic =
  | 'Arrays'
  | 'Strings'
  | 'Linked Lists'
  | 'Stacks & Queues'
  | 'Trees'
  | 'Graphs'
  | 'Binary Search'
  | 'Sliding Window'
  | 'Dynamic Programming'
  | 'Greedy'
  | 'Recursion'
  | 'Sorting & Searching'
  | 'Two Pointers'
  | 'Matrix'
  | 'Bit Manipulation';

export type SupportedLanguage = 'cpp' | 'java' | 'python';

export interface CodingTestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
  isHidden?: boolean;
}

export interface CodingQuestion {
  id: string;
  title: string;
  slug: string;
  difficulty: CodingDifficulty;
  topic: DSATopic;
  description: string;
  constraints: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  starterCode: Record<SupportedLanguage, string>;
  visibleTestCases: CodingTestCase[];
  hiddenTestCases: CodingTestCase[];
  expectedTimeComplexity: string;
  expectedSpaceComplexity: string;
}

export interface CodingAssessmentSession {
  assessmentId: string;
  userId: string;
  questions: CodingQuestion[];
  durationMinutes: number;
  startTime: number;
  expiresAt: number;
}

export interface TestCaseResult {
  testCaseIndex: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  runtimeMs: number;
  isHidden: boolean;
  error?: string;
}

export interface QuestionEvaluationResult {
  questionId: string;
  passedCount: number;
  totalTestCases: number;
  correctnessScore: number; // 0 to 100
  testResults: TestCaseResult[];
  actualTimeComplexity: string;
  actualSpaceComplexity: string;
  complexityScore: number;
  codeQuality: {
    score: number; // 0 to 100
    readability: number;
    namingConventions: number;
    modularity: number;
    formatting: number;
  };
  suggestions: string[];
  executionTimeMs: number;
  memoryUsageMb: number;
  isEmptyCode?: boolean;
  isStarterCode?: boolean;
  mistakeAnalysis?: string;
  complexityComparison?: string;
  overallFeedback?: string;
}

export interface SolutionDraft {
  questionId: string;
  language: SupportedLanguage;
  code: string;
  isSubmitted?: boolean;
  evaluation?: QuestionEvaluationResult;
}

export interface CodingTestAttempt {
  attemptId: string;
  userId: string;
  userName: string;
  userEmail: string;
  startTime: number;
  completedAt: number;
  durationSeconds: number;
  totalScore: number; // 0 - 400
  maxScore: number; // 400
  solvedQuestionsCount: number; // 0 - 4
  accuracy: number; // 0 - 100%
  status: 'Completed' | 'In Progress' | 'Incomplete' | 'Failed';
  topicBreakdown: Record<string, { total: number; score: number; passed: boolean }>;
  questionSolutions: Record<string, SolutionDraft>;
  questionsSummary?: Array<{ id: string; title: string; topic: DSATopic; difficulty: CodingDifficulty }>;
}

export interface CodingLeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userEmail: string;
  profileImage?: string;
  totalScore: number;
  solvedCount: number;
  accuracy: number;
  durationSeconds: number;
  attemptedAt: number;
}

