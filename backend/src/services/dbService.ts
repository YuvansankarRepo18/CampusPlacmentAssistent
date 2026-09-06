import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { AptQuestion, UserQuestionHistory, TestAttempt } from '../models/types.js';
import { UserRecord } from './userService.js';
import { CodingTestAttempt, CodingLeaderboardEntry } from '../models/codingTypes.js';
import { ComprehensiveAtsReport } from '../models/resumeTypes.js';
import { InterviewReport } from '../models/interviewTypes.js';
import { PlacementReadinessReport } from '../models/readinessTypes.js';
import { CoachSession, CoachMessage, UserActionPlan, ProactiveInsight } from '../models/coachTypes.js';
import {
  UserModel,
  QuestionModel,
  UserHistoryModel,
  TestAttemptModel,
  CodingAttemptModel,
  ResumeReportModel,
  InterviewSessionModel,
  ReadinessSnapshotModel,
  CoachSessionModel,
  CoachMessageModel,
  ActionPlanModel,
  ProactiveInsightModel,
} from '../models/mongoSchemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'aptitude_db.json');

interface DbSchema {
  questions: AptQuestion[];
  userHistories: Record<string, UserQuestionHistory>;
  testAttempts: TestAttempt[];
  users: UserRecord[];
  codingAttempts: CodingTestAttempt[];
  resumeReports: ComprehensiveAtsReport[];
  interviewSessions: InterviewReport[];
  readinessSnapshots: PlacementReadinessReport[];
  coachSessions: CoachSession[];
  coachMessages: CoachMessage[];
  actionPlans: UserActionPlan[];
  proactiveInsights: ProactiveInsight[];
}

class DbService {
  private schema: DbSchema = {
    questions: [],
    userHistories: {},
    testAttempts: [],
    users: [],
    codingAttempts: [],
    resumeReports: [],
    interviewSessions: [],
    readinessSnapshots: [],
    coachSessions: [],
    coachMessages: [],
    actionPlans: [],
    proactiveInsights: [],
  };

  constructor() {
    this.init();
  }

  private async init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.schema = {
          questions: parsed.questions || [],
          userHistories: parsed.userHistories || {},
          testAttempts: parsed.testAttempts || [],
          users: parsed.users || [],
          codingAttempts: parsed.codingAttempts || [],
          resumeReports: parsed.resumeReports || [],
          interviewSessions: parsed.interviewSessions || [],
          readinessSnapshots: parsed.readinessSnapshots || [],
          coachSessions: parsed.coachSessions || [],
          coachMessages: parsed.coachMessages || [],
          actionPlans: parsed.actionPlans || [],
          proactiveInsights: parsed.proactiveInsights || [],
        };
      } else {
        this.saveLocal();
      }

      // Initial sync with MongoDB Atlas
      this.syncWithMongo();
    } catch (err) {
      console.error('Failed to initialize DB service:', err);
    }
  }

  private saveLocal() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.schema, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save to local DB file:', err);
    }
  }

  // Load from and push existing local cache to MongoDB Atlas
  public async syncWithMongo() {
    try {
      // 1. Sync Users
      if (this.schema.users.length > 0) {
        for (const user of this.schema.users) {
          await UserModel.findOneAndUpdate({ id: user.id }, user, { upsert: true, returnDocument: 'after' }).catch(() => {});
        }
      } else {
        const mongoUsers = await UserModel.find().lean();
        if (mongoUsers.length > 0) {
          this.schema.users = mongoUsers as any;
        }
      }

      // 2. Sync Questions
      if (this.schema.questions.length > 0) {
        for (const q of this.schema.questions) {
          await QuestionModel.findOneAndUpdate({ id: q.id }, q, { upsert: true, returnDocument: 'after' }).catch(() => {});
        }
      } else {
        const mongoQuestions = await QuestionModel.find().lean();
        if (mongoQuestions.length > 0) {
          this.schema.questions = mongoQuestions as any;
        }
      }

      // 3. Sync Test Attempts
      if (this.schema.testAttempts.length > 0) {
        for (const t of this.schema.testAttempts) {
          await TestAttemptModel.findOneAndUpdate({ id: t.id }, t, { upsert: true, returnDocument: 'after' }).catch(() => {});
        }
      }

      // 4. Sync Coding Attempts
      if (this.schema.codingAttempts.length > 0) {
        for (const c of this.schema.codingAttempts) {
          await CodingAttemptModel.findOneAndUpdate({ attemptId: c.attemptId }, c, { upsert: true, returnDocument: 'after' }).catch(() => {});
        }
      }

      // 5. Sync Resume Reports
      if (this.schema.resumeReports.length > 0) {
        for (const r of this.schema.resumeReports) {
          await ResumeReportModel.findOneAndUpdate({ id: r.id }, r, { upsert: true, returnDocument: 'after' }).catch(() => {});
        }
      }

      // 6. Sync Interview Sessions
      if (this.schema.interviewSessions.length > 0) {
        for (const i of this.schema.interviewSessions) {
          await InterviewSessionModel.findOneAndUpdate({ id: i.id }, i, { upsert: true, returnDocument: 'after' }).catch(() => {});
        }
      }

      // 7. Sync Coach Sessions
      if (this.schema.coachSessions.length > 0) {
        for (const cs of this.schema.coachSessions) {
          await CoachSessionModel.findOneAndUpdate({ id: cs.id }, cs, { upsert: true, returnDocument: 'after' }).catch(() => {});
        }
      }

      this.saveLocal();
    } catch (err) {
      console.warn('MongoDB Atlas sync deferred until connection ready:', err);
    }
  }

  // Questions API
  public getQuestions(): AptQuestion[] {
    return this.schema.questions;
  }

  public saveQuestions(newQuestions: AptQuestion[]) {
    const existingIds = new Set(this.schema.questions.map((q) => q.id));
    for (const q of newQuestions) {
      if (!existingIds.has(q.id)) {
        this.schema.questions.push(q);
        QuestionModel.findOneAndUpdate({ id: q.id }, q, { upsert: true }).catch((err) =>
          console.error('Mongo save question error:', err)
        );
      }
    }
    this.saveLocal();
  }

  // User Question History API
  public getUserHistory(userId: string): UserQuestionHistory {
    if (!this.schema.userHistories[userId]) {
      this.schema.userHistories[userId] = {
        userId,
        attemptedQuestionIds: [],
        attemptedHashes: [],
        lastAttemptedAt: Date.now(),
      };
    }
    return this.schema.userHistories[userId];
  }

  public recordUserAttemptedQuestions(userId: string, questionIds: string[], hashes: string[]) {
    const history = this.getUserHistory(userId);
    const idSet = new Set(history.attemptedQuestionIds);
    const hashSet = new Set(history.attemptedHashes);

    for (const id of questionIds) idSet.add(id);
    for (const h of hashes) if (h) hashSet.add(h);

    history.attemptedQuestionIds = Array.from(idSet);
    history.attemptedHashes = Array.from(hashSet);
    history.lastAttemptedAt = Date.now();
    this.saveLocal();

    UserHistoryModel.findOneAndUpdate({ userId }, history, { upsert: true }).catch((err) =>
      console.error('Mongo save history error:', err)
    );
  }

  // Test Attempts API
  public saveTestAttempt(attempt: TestAttempt) {
    this.schema.testAttempts.push(attempt);
    this.saveLocal();

    TestAttemptModel.findOneAndUpdate({ id: attempt.id }, attempt, { upsert: true }).catch((err) =>
      console.error('Mongo save test attempt error:', err)
    );
  }

  public getUserTestAttempts(userId: string): TestAttempt[] {
    if (!userId || userId === 'anon') return [];
    return this.schema.testAttempts
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  public getAllTestAttempts(): TestAttempt[] {
    return this.schema.testAttempts;
  }

  // Users API
  public getUsers(): UserRecord[] {
    return this.schema.users;
  }

  public findUserByEmail(email: string): UserRecord | undefined {
    return this.schema.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public findUserById(id: string): UserRecord | undefined {
    return this.schema.users.find((u) => u.id === id);
  }

  public saveUser(user: UserRecord) {
    const idx = this.schema.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      this.schema.users[idx] = user;
    } else {
      this.schema.users.push(user);
    }
    this.saveLocal();

    UserModel.findOneAndUpdate({ id: user.id }, user, { upsert: true }).catch((err) =>
      console.error('Mongo save user error:', err)
    );
  }

  // Coding Platform API
  public saveCodingAttempt(attempt: CodingTestAttempt) {
    const idx = this.schema.codingAttempts.findIndex((a) => a.attemptId === attempt.attemptId);
    if (idx >= 0) {
      this.schema.codingAttempts[idx] = attempt;
    } else {
      this.schema.codingAttempts.push(attempt);
    }
    this.saveLocal();

    CodingAttemptModel.findOneAndUpdate({ attemptId: attempt.attemptId }, attempt, { upsert: true }).catch((err) =>
      console.error('Mongo save coding attempt error:', err)
    );
  }

  public getUserCodingAttempts(userId: string): CodingTestAttempt[] {
    if (!userId || userId === 'anon') return [];
    return this.schema.codingAttempts
      .filter((a) => a.userId === userId)
      .sort((a, b) => b.completedAt - a.completedAt);
  }

  public getCodingLeaderboard(): CodingLeaderboardEntry[] {
    const userBest = new Map<string, CodingTestAttempt>();

    for (const attempt of this.schema.codingAttempts) {
      if (!attempt.totalScore || attempt.totalScore <= 0 || attempt.solvedQuestionsCount <= 0 || attempt.status === 'Incomplete') {
        continue;
      }

      const existing = userBest.get(attempt.userId);
      if (!existing) {
        userBest.set(attempt.userId, attempt);
      } else {
        if (
          attempt.totalScore > existing.totalScore ||
          (attempt.totalScore === existing.totalScore && (attempt.accuracy || 0) > (existing.accuracy || 0)) ||
          (attempt.totalScore === existing.totalScore && (attempt.accuracy || 0) === (existing.accuracy || 0) && attempt.durationSeconds < existing.durationSeconds)
        ) {
          userBest.set(attempt.userId, attempt);
        }
      }
    }

    const sorted = Array.from(userBest.values()).sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.solvedQuestionsCount !== a.solvedQuestionsCount) return b.solvedQuestionsCount - a.solvedQuestionsCount;
      if ((b.accuracy || 0) !== (a.accuracy || 0)) return (b.accuracy || 0) - (a.accuracy || 0);
      return a.durationSeconds - b.durationSeconds;
    });

    return sorted.map((item, idx) => {
      const user = this.findUserById(item.userId);
      return {
        rank: idx + 1,
        userId: item.userId,
        userName: item.userName || user?.name || 'Anonymous Coder',
        userEmail: item.userEmail || user?.email || '',
        profileImage: user?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(item.userName)}`,
        totalScore: item.totalScore,
        solvedCount: item.solvedQuestionsCount,
        accuracy: item.accuracy || Math.round((item.solvedQuestionsCount / 4) * 100),
        durationSeconds: item.durationSeconds,
        attemptedAt: item.completedAt,
      };
    });
  }

  // Resume Reports API
  public saveResumeReport(report: ComprehensiveAtsReport) {
    const idx = this.schema.resumeReports.findIndex((r) => r.id === report.id);
    if (idx >= 0) {
      this.schema.resumeReports[idx] = report;
    } else {
      this.schema.resumeReports.push(report);
    }
    this.saveLocal();

    ResumeReportModel.findOneAndUpdate({ id: report.id }, report, { upsert: true }).catch((err) =>
      console.error('Mongo save resume report error:', err)
    );
  }

  public getUserResumeReports(userId: string): ComprehensiveAtsReport[] {
    if (!userId || userId === 'anon') return [];
    return this.schema.resumeReports
      .filter((r) => r.userId === userId)
      .sort((a, b) => b.uploadedAt - a.uploadedAt);
  }

  public getResumeReportById(id: string): ComprehensiveAtsReport | undefined {
    return this.schema.resumeReports.find((r) => r.id === id);
  }

  // Interview Simulation Sessions API
  public saveInterviewSession(report: InterviewReport) {
    const idx = this.schema.interviewSessions.findIndex((s) => s.id === report.id);
    if (idx >= 0) {
      this.schema.interviewSessions[idx] = report;
    } else {
      this.schema.interviewSessions.push(report);
    }
    this.saveLocal();

    InterviewSessionModel.findOneAndUpdate({ id: report.id }, report, { upsert: true }).catch((err) =>
      console.error('Mongo save interview session error:', err)
    );
  }

  public getUserInterviewHistory(userId: string): InterviewReport[] {
    if (!userId || userId === 'anon') return [];
    return this.schema.interviewSessions
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.completedAt - a.completedAt);
  }

  public getInterviewReportById(id: string): InterviewReport | undefined {
    return this.schema.interviewSessions.find((r) => r.id === id);
  }

  // Placement Readiness Snapshots API
  public saveReadinessSnapshot(report: PlacementReadinessReport) {
    this.schema.readinessSnapshots.push(report);
    this.saveLocal();

    ReadinessSnapshotModel.create(report).catch((err) =>
      console.error('Mongo save readiness snapshot error:', err)
    );
  }

  public getUserReadinessHistory(userId: string): PlacementReadinessReport[] {
    if (!userId || userId === 'anon') return [];
    return this.schema.readinessSnapshots
      .filter((r) => r.userId === userId)
      .sort((a, b) => b.calculatedAt - a.calculatedAt);
  }

  // Coach Sessions & Memory API
  public getCoachSessions(userId: string): CoachSession[] {
    if (!userId || userId === 'anon') return [];
    return this.schema.coachSessions
      .filter((s) => s.userId === userId)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  public getCoachSessionById(sessionId: string): CoachSession | undefined {
    return this.schema.coachSessions.find((s) => s.id === sessionId);
  }

  public saveCoachSession(session: CoachSession) {
    const idx = this.schema.coachSessions.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      this.schema.coachSessions[idx] = session;
    } else {
      this.schema.coachSessions.push(session);
    }
    this.saveLocal();

    CoachSessionModel.findOneAndUpdate({ id: session.id }, session, { upsert: true }).catch((err) =>
      console.error('Mongo save coach session error:', err)
    );
  }

  public deleteCoachSession(userId: string, sessionId: string) {
    this.schema.coachSessions = this.schema.coachSessions.filter((s) => !(s.id === sessionId && s.userId === userId));
    this.schema.coachMessages = this.schema.coachMessages.filter((m) => m.sessionId !== sessionId);
    this.saveLocal();

    CoachSessionModel.deleteOne({ id: sessionId, userId }).catch(() => {});
    CoachMessageModel.deleteMany({ sessionId }).catch(() => {});
  }

  public getCoachMessages(sessionId: string): CoachMessage[] {
    return this.schema.coachMessages
      .filter((m) => m.sessionId === sessionId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  public saveCoachMessage(message: CoachMessage) {
    this.schema.coachMessages.push(message);
    const session = this.getCoachSessionById(message.sessionId);
    if (session) {
      session.lastMessage = message.content.slice(0, 120);
      session.messageCount = (session.messageCount || 0) + 1;
      session.updatedAt = Date.now();
      this.saveCoachSession(session);
    } else {
      this.saveLocal();
    }

    CoachMessageModel.findOneAndUpdate({ id: message.id }, message, { upsert: true }).catch((err) =>
      console.error('Mongo save coach message error:', err)
    );
  }

  // User Action Plan API
  public getUserActionPlan(userId: string): UserActionPlan | null {
    if (!userId || userId === 'anon') return null;
    return this.schema.actionPlans.find((p) => p.userId === userId) || null;
  }

  public saveUserActionPlan(plan: UserActionPlan) {
    const idx = this.schema.actionPlans.findIndex((p) => p.userId === plan.userId);
    if (idx >= 0) {
      this.schema.actionPlans[idx] = plan;
    } else {
      this.schema.actionPlans.push(plan);
    }
    this.saveLocal();

    ActionPlanModel.findOneAndUpdate({ id: plan.id }, plan, { upsert: true }).catch((err) =>
      console.error('Mongo save action plan error:', err)
    );
  }

  // Proactive Insights API
  public getProactiveInsights(userId: string): ProactiveInsight[] {
    if (!userId || userId === 'anon') return [];
    return this.schema.proactiveInsights
      .filter((i) => i.userId === userId && !i.dismissed)
      .sort((a, b) => b.generatedAt - a.generatedAt);
  }

  public saveProactiveInsight(insight: ProactiveInsight) {
    const existing = this.schema.proactiveInsights.find(
      (i) => i.userId === insight.userId && i.type === insight.type && i.topic === insight.topic && !i.dismissed
    );
    if (existing) {
      existing.generatedAt = Date.now();
      existing.summary = insight.summary;
    } else {
      this.schema.proactiveInsights.push(insight);
    }
    this.saveLocal();

    ProactiveInsightModel.findOneAndUpdate({ id: insight.id }, insight, { upsert: true }).catch((err) =>
      console.error('Mongo save proactive insight error:', err)
    );
  }

  public dismissProactiveInsight(userId: string, insightId: string) {
    const item = this.schema.proactiveInsights.find((i) => i.id === insightId && i.userId === userId);
    if (item) {
      item.dismissed = true;
      this.saveLocal();

      ProactiveInsightModel.updateOne({ id: insightId, userId }, { $set: { dismissed: true } }).catch(() => {});
    }
  }
}

export const dbService = new DbService();
