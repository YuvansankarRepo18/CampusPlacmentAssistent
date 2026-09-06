export interface ParsedContactInfo {
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  location?: string;
}

export interface ParsedSkills {
  languages: string[];
  frameworks: string[];
  databases: string[];
  cloudDevOps: string[];
  tools: string[];
  softSkills: string[];
  allFound: string[];
}

export interface ParsedWorkExperience {
  company?: string;
  role?: string;
  duration?: string;
  bullets: string[];
}

export interface ParsedProject {
  title: string;
  technologies: string[];
  description: string;
  bullets: string[];
  link?: string;
}

export interface ParsedEducation {
  degree?: string;
  institution?: string;
  graduationYear?: string;
  gpa?: string;
}

export interface ParsedResumeContent {
  contact: ParsedContactInfo;
  summary?: string;
  skills: ParsedSkills;
  experience: ParsedWorkExperience[];
  projects: ParsedProject[];
  education: ParsedEducation[];
  certifications: string[];
  achievements: string[];
  internships: string[];
  rawTextLength: number;
}

export interface CategoryScoreDetail {
  category: string;
  label: string;
  score: number; // 0 - 100
  weight: number; // percentage
  status: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' | 'CRITICAL';
  pointsGained: string[];
  pointsLost: string[];
  feedback: string;
}

export interface AtsCategoryScores {
  formatting: CategoryScoreDetail;
  keywordOptimization: CategoryScoreDetail;
  skillsMatch: CategoryScoreDetail;
  experienceQuality: CategoryScoreDetail;
  projectQuality: CategoryScoreDetail;
  educationDetails: CategoryScoreDetail;
  contactCompleteness: CategoryScoreDetail;
  atsCompatibility: CategoryScoreDetail;
  readability: CategoryScoreDetail;
  grammarLanguage: CategoryScoreDetail;
  industryRelevance: CategoryScoreDetail;
}

export interface JobMatchAnalysis {
  jobTitle?: string;
  jobMatchScore: number; // 0 - 100
  matchingSkills: string[];
  missingSkills: string[];
  missingKeywords: string[];
  missingTechnologies: string[];
  compatibilityExplanation: string;
}

export interface SectionGradeDetail {
  sectionName: string;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' | 'MISSING';
  score: number; // 0 - 100
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'WEAK' | 'MISSING';
  strengths: string[];
  improvements: string[];
  missingItems: string[];
}

export interface BulletRewrite {
  id: string;
  section: string;
  originalText: string;
  rewrittenText: string;
  impactBoost: string;
  metricsAdded: string[];
  category: 'ACTION_VERB' | 'QUANTIFIED_METRICS' | 'TECHNICAL_CLARITY' | 'CONCISENESS';
}

export interface FormattingCheckItem {
  checkName: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  detail: string;
  recommendation: string;
}

export interface BenchmarkComparison {
  targetRole: string; // e.g. Software Engineer
  candidatePercentile: number; // e.g. Top 15%
  industryAverageScore: number; // e.g. 68
  candidateScore: number;
  competencyGaps: string[];
  topCompetencies: string[];
}

export interface RoadmapItem {
  id: string;
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  action: string;
  expectedScoreBoost: number; // e.g. +8 pts
  reasoning: string;
  category: string;
}

export interface ComprehensiveAtsReport {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  uploadedAt: number;
  
  // Overall Scores
  overallAtsScore: number; // 0 - 100
  recruiterReadinessScore: number; // 0 - 100
  resumeCompletenessScore: number; // 0 - 100
  employabilityScore: number; // 0 - 100
  
  // Parsed Resume
  parsedContent: ParsedResumeContent;

  // 11 Category Breakdown
  categoryScores: AtsCategoryScores;

  // Optional Job Description Comparison
  jobMatch: JobMatchAnalysis | null;

  // Section Analysis
  sectionAnalysis: SectionGradeDetail[];

  // Content Quality & AI Bullet Rewrites
  bulletRewrites: BulletRewrite[];

  // ATS Formatting Analysis
  formattingChecks: FormattingCheckItem[];

  // Industry Benchmarking
  benchmarking: BenchmarkComparison;

  // Prioritized Roadmap
  roadmap: RoadmapItem[];

  // Optimized AI Rewrite Output
  optimizedResumeText: string;
}
