import mongoose, { Schema } from 'mongoose';

// 1. User Schema
const UserSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    role: { type: String, required: true },
    passwordHash: { type: String },
    provider: { type: String, required: true },
    profileImage: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    resetToken: { type: String },
    resetTokenExpires: { type: Number },
    lastLoginAt: { type: Number, default: Date.now },
    createdAt: { type: Number, default: Date.now },
  },
  { timestamps: true }
);

// 2. Aptitude Question Schema
const QuestionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    category: { type: String, required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, required: true },
    question: { type: String, required: true },
    options: [{ type: String }],
    answerIndex: { type: Number, required: true },
    explanation: { type: String, required: true },
    formula: { type: String },
    isDynamic: { type: Boolean },
    contentHash: { type: String },
  },
  { timestamps: true }
);

// 3. User Question History Schema
const UserHistorySchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    attemptedQuestionIds: [{ type: String }],
    attemptedHashes: [{ type: String }],
    lastAttemptedAt: { type: Number, default: Date.now },
  },
  { timestamps: true }
);

// 4. Test Attempt Schema
const TestAttemptSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    categoryConfig: Schema.Types.Mixed,
    difficultyConfig: Schema.Types.Mixed,
    questions: [Schema.Types.Mixed],
    answers: { type: Map, of: Number },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    durationSec: { type: Number, required: true },
    timeSpentSec: { type: Number, required: true },
    categoryStats: Schema.Types.Mixed,
    topicStats: Schema.Types.Mixed,
    createdAt: { type: Number, default: Date.now },
  },
  { timestamps: true }
);

// 5. Coding Attempt Schema
const CodingAttemptSchema = new Schema(
  {
    attemptId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String },
    userEmail: { type: String },
    startTime: { type: Number },
    completedAt: { type: Number, default: Date.now },
    durationSeconds: { type: Number },
    totalScore: { type: Number },
    maxScore: { type: Number },
    solvedQuestionsCount: { type: Number },
    accuracy: { type: Number },
    status: { type: String },
    topicBreakdown: Schema.Types.Mixed,
    questionSolutions: Schema.Types.Mixed,
    questionsSummary: Schema.Types.Mixed,
  },
  { timestamps: true }
);

// 6. Resume Report Schema
const ResumeReportSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    fileName: { type: String },
    fileType: { type: String },
    uploadedAt: { type: Number, default: Date.now },
    overallAtsScore: { type: Number },
    recruiterReadinessScore: { type: Number },
    resumeCompletenessScore: { type: Number },
    employabilityScore: { type: Number },
    parsedContent: Schema.Types.Mixed,
    categoryScores: Schema.Types.Mixed,
    jobMatch: Schema.Types.Mixed,
    sectionAnalysis: Schema.Types.Mixed,
    bulletRewrites: Schema.Types.Mixed,
    formattingChecks: Schema.Types.Mixed,
    benchmarking: Schema.Types.Mixed,
    roadmap: Schema.Types.Mixed,
    optimizedResumeText: { type: String },
  },
  { timestamps: true }
);

// 7. Interview Session Schema
const InterviewSessionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String },
    config: Schema.Types.Mixed,
    startTime: { type: Number },
    completedAt: { type: Number, default: Date.now },
    durationSeconds: { type: Number },
    overallScore: { type: Number },
    technicalScore: { type: Number },
    communicationScore: { type: Number },
    confidenceScore: { type: Number },
    problemSolvingScore: { type: Number },
    behavioralScore: { type: Number },
    roleReadinessScore: { type: Number },
    companyReadinessScore: { type: Number },
    placementReadinessScore: { type: Number },
    questionEvaluations: Schema.Types.Mixed,
    topStrengths: [{ type: String }],
    keyWeaknesses: [{ type: String }],
    frequentlyMissedTopics: [{ type: String }],
    recommendedResources: [{ type: String }],
    roadmap: Schema.Types.Mixed,
  },
  { timestamps: true }
);

// 8. Readiness Snapshot Schema
const ReadinessSnapshotSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    userName: { type: String },
    overallReadinessScore: { type: Number },
    placementProbability: { type: Number },
    confidenceLevel: { type: String },
    moduleScores: Schema.Types.Mixed,
    categoryBreakdown: Schema.Types.Mixed,
    companyReadiness: Schema.Types.Mixed,
    dynamicRecommendations: Schema.Types.Mixed,
    performanceHistory: Schema.Types.Mixed,
    topStrengths: [{ type: String }],
    criticalGaps: [{ type: String }],
    calculatedAt: { type: Number, default: Date.now },
  },
  { timestamps: true }
);

// 9. Coach Session Schema
const CoachSessionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    mode: { type: String, required: true },
    lastMessage: { type: String },
    messageCount: { type: Number, default: 0 },
    createdAt: { type: Number, default: Date.now },
    updatedAt: { type: Number, default: Date.now },
  },
  { timestamps: true }
);

// 10. Coach Message Schema
const CoachMessageSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    sessionId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    role: { type: String, required: true },
    content: { type: String, required: true },
    mode: { type: String, required: true },
    proactive: { type: Boolean, default: false },
    metadata: Schema.Types.Mixed,
    timestamp: { type: Number, default: Date.now },
  },
  { timestamps: true }
);

// 11. Action Plan Schema
const ActionPlanSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, unique: true, index: true },
    goalTitle: { type: String, required: true },
    items: Schema.Types.Mixed,
    targetRole: { type: String },
    targetCompanies: [{ type: String }],
    weeklySchedule: Schema.Types.Mixed,
    createdAt: { type: Number, default: Date.now },
    updatedAt: { type: Number, default: Date.now },
  },
  { timestamps: true }
);

// 12. Proactive Insight Schema
const ProactiveInsightSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    actionPrompt: { type: String, required: true },
    topic: { type: String },
    generatedAt: { type: Number, default: Date.now },
    dismissed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const QuestionModel = mongoose.models.Question || mongoose.model('Question', QuestionSchema);
export const UserHistoryModel = mongoose.models.UserHistory || mongoose.model('UserHistory', UserHistorySchema);
export const TestAttemptModel = mongoose.models.TestAttempt || mongoose.model('TestAttempt', TestAttemptSchema);
export const CodingAttemptModel = mongoose.models.CodingAttempt || mongoose.model('CodingAttempt', CodingAttemptSchema);
export const ResumeReportModel = mongoose.models.ResumeReport || mongoose.model('ResumeReport', ResumeReportSchema);
export const InterviewSessionModel = mongoose.models.InterviewSession || mongoose.model('InterviewSession', InterviewSessionSchema);
export const ReadinessSnapshotModel = mongoose.models.ReadinessSnapshot || mongoose.model('ReadinessSnapshot', ReadinessSnapshotSchema);
export const CoachSessionModel = mongoose.models.CoachSession || mongoose.model('CoachSession', CoachSessionSchema);
export const CoachMessageModel = mongoose.models.CoachMessage || mongoose.model('CoachMessage', CoachMessageSchema);
export const ActionPlanModel = mongoose.models.ActionPlan || mongoose.model('ActionPlan', ActionPlanSchema);
export const ProactiveInsightModel = mongoose.models.ProactiveInsight || mongoose.model('ProactiveInsight', ProactiveInsightSchema);
