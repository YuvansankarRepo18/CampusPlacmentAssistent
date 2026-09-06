export type InterviewRole =
  | 'Software Engineer'
  | 'Full Stack Developer'
  | 'Frontend Developer'
  | 'Backend Developer'
  | 'Data Analyst'
  | 'Data Scientist'
  | 'AI Engineer'
  | 'DevOps Engineer'
  | 'QA Engineer'
  | 'Product Manager';

export type TargetCompany =
  | 'Google'
  | 'Amazon'
  | 'Microsoft'
  | 'Deloitte'
  | 'TCS'
  | 'Infosys'
  | 'Accenture'
  | 'Cognizant'
  | 'Capgemini'
  | 'Zoho'
  | 'General Product Company'
  | 'General Service Company';

export type ExperienceLevel = 'Fresher' | '1-3 years' | '3-5 years' | 'Experienced';

export type InterviewType =
  | 'Technical'
  | 'HR'
  | 'Behavioral'
  | 'Managerial'
  | 'Coding'
  | 'System Design'
  | 'Mixed Interview';

export interface InterviewConfig {
  role: InterviewRole;
  company: TargetCompany;
  experienceLevel: ExperienceLevel;
  type: InterviewType;
  useResumeContext: boolean;
  questionCount: number;
}

export interface InterviewQuestion {
  id: string;
  questionText: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  expectedKeyPoints: string[];
  contextTag?: string; // e.g. "Resume Project: Placement Platform" or "Google DSA"
  idealAnswerSnippet?: string;
  isFollowUp?: boolean;
}

export interface AnswerEvaluation {
  questionId: string;
  questionText: string;
  candidateAnswer: string;
  score: number; // 0 - 100
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  problemSolvingScore: number;
  behavioralScore: number;
  strengths: string[];
  missingPoints: string[];
  idealAnswerSnippet: string;
  starFormatFeedback?: string;
  followUpQuestion?: InterviewQuestion;
}

export interface InterviewReport {
  id: string;
  userId: string;
  userName?: string;
  config: InterviewConfig;
  startTime: number;
  completedAt: number;
  durationSeconds: number;
  
  // Scores out of 100
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  problemSolvingScore: number;
  behavioralScore: number;
  
  // Readiness Percentages
  roleReadinessScore: number;
  companyReadinessScore: number;
  placementReadinessScore: number;

  questionEvaluations: AnswerEvaluation[];
  topStrengths: string[];
  keyWeaknesses: string[];
  frequentlyMissedTopics: string[];
  recommendedResources: string[];
  roadmap: Array<{ priority: string; title: string; action: string }>;
}
