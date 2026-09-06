export type AptCategory =
  | 'Quantitative'
  | 'Logical'
  | 'Verbal'
  | 'DataInterpretation';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Topic =
  // Quantitative
  | 'Profit & Loss'
  | 'Time & Work'
  | 'Speed, Distance & Time'
  | 'Simple & Compound Interest'
  | 'Permutations & Combinations'
  | 'Ratios & Percentages'
  | 'Averages & Mixtures'
  // Logical
  | 'Number Series'
  | 'Blood Relations'
  | 'Coding & Decoding'
  | 'Seating Arrangement'
  | 'Syllogisms & Logic'
  // Verbal
  | 'Synonyms & Antonyms'
  | 'Grammar & Error Spotting'
  | 'Sentence Completion'
  | 'Idioms & Analogies'
  | 'Reading Comprehension'
  // Data Interpretation
  | 'Table Interpretation'
  | 'Pie Chart Analysis'
  | 'Bar Graph & Trends'
  | 'Data Sufficiency';

export interface AptQuestion {
  id: string;
  category: AptCategory;
  topic: Topic | string;
  difficulty: Difficulty;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  formula?: string;
  isDynamic?: boolean;
  contentHash?: string;
}

export interface UserQuestionHistory {
  userId: string;
  attemptedQuestionIds: string[];
  attemptedHashes: string[];
  lastAttemptedAt: number;
}

export interface QuestionResultDetail {
  id: string;
  question: string;
  options: string[];
  category: AptCategory;
  topic: string;
  difficulty: Difficulty;
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export interface TestAttempt {
  id: string;
  userId: string;
  categoryConfig: AptCategory[] | 'all';
  difficultyConfig: Difficulty | 'adaptive';
  questions: AptQuestion[];
  answers: Record<string, number>; // questionId -> selectedIndex
  score: number;
  total: number;
  accuracy: number;
  durationSec: number;
  timeSpentSec: number;
  categoryStats: Record<string, { correct: number; total: number; accuracy: number }>;
  topicStats: Record<string, { correct: number; total: number; accuracy: number }>;
  createdAt: number;
}

export interface CategoryPerformance {
  category: AptCategory;
  testsAttempted: number;
  totalQuestions: number;
  correctQuestions: number;
  accuracy: number;
}

export interface TopicInsight {
  topic: string;
  category: AptCategory;
  accuracy: number;
  totalAttempted: number;
  status: 'Strong' | 'Moderate' | 'Weak';
}

export interface AIRoadmapItem {
  id: string;
  title: string;
  description: string;
  category: AptCategory;
  priority: 'High' | 'Medium' | 'Low';
  actionableSteps: string[];
  estimatedHours: number;
}

export interface PerformanceAnalytics {
  testsAttempted: number;
  totalQuestionsAttempted: number;
  averageScore: number;
  bestScore: number;
  overallAccuracy: number;
  categoryPerformance: Record<AptCategory, { attempted: number; correct: number; accuracy: number }>;
  strengths: TopicInsight[];
  weaknesses: TopicInsight[];
  roadmap: AIRoadmapItem[];
  recentAttempts: {
    id: string;
    date: string;
    score: number;
    total: number;
    accuracy: number;
    category: string;
  }[];
}
