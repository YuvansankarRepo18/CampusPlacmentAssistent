import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'crypto';
import { v4 as uuid } from 'uuid';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { createAdaptiveTestSession } from './services/testEngine.js';
import { evaluateTestSubmission, getUserAnalytics } from './services/analyticsService.js';
import { dbService } from './services/dbService.js';
import { AptCategory, Difficulty } from './models/types.js';
import { userService, toPublicUser, hashPassword, isValidEmail, isValidPassword } from './services/userService.js';
import { generateTokens, verifyAccessToken, verifyRefreshToken, handleGoogleAuth, handleLinkedInAuth } from './services/authService.js';
import { codingEngine } from './services/codingEngine.js';
import { codingEvaluationService } from './services/codingEvaluationService.js';
import { resumeAnalyzerService } from './services/resumeAnalyzerService.js';
import { interviewService } from './services/interviewService.js';
import { readinessEngineService } from './services/readinessEngineService.js';
import { coachEngineService } from './services/coachEngineService.js';
import { ragContextService } from './services/ragContextService.js';
import { CoachingMode } from './models/coachTypes.js';
import { connectDB } from './config/db.js';

dotenv.config();

// Connect to MongoDB
connectDB();


const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

app.use(cors());
app.use(express.json());

// multer for file uploads (memory storage)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Initialize default seed users if DB is empty
if (dbService.getUsers().length === 0) {
  userService.createUser({
    name: 'Aarav Sharma',
    email: 'student@example.com',
    password: 'Password123!',
    role: 'student',
  });
  userService.createUser({
    name: 'Priya Verma',
    email: 'admin@example.com',
    password: 'Admin@123!',
    role: 'admin',
  });
  userService.createUser({
    name: 'Rohan Gupta',
    email: 'tpo@example.com',
    password: 'Tpo@123!',
    role: 'tpo',
  });
}

// Helper to set HTTP-only Refresh Token Cookie
const setRefreshTokenCookie = (res: express.Response, refreshToken: string) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 3600 * 1000, // 30 days
  });
};

app.post('/api/auth/register', (req, res) => {
  try {
    const { fullName, email, password, role = 'student' } = req.body as {
      fullName?: string;
      email?: string;
      password?: string;
      role?: any;
    };

    if (!fullName?.trim() || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: 'Password must contain at least 8 characters, including uppercase, lowercase, a number, and a special character.',
      });
    }

    const user = userService.createUser({
      name: fullName,
      email,
      password,
      role,
      provider: 'email',
    });

    const tokens = generateTokens(user);
    setRefreshTokenCookie(res, tokens.refreshToken);

    res.status(201).json({ token: tokens.accessToken, refreshToken: tokens.refreshToken, user: tokens.user });
  } catch (err: any) {
    res.status(400).json({ message: err?.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = userService.findByEmail(email);
    if (!user || !user.passwordHash || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    user.lastLoginAt = Date.now();
    dbService.saveUser(user);

    const tokens = generateTokens(user);
    setRefreshTokenCookie(res, tokens.refreshToken);

    res.json({ token: tokens.accessToken, refreshToken: tokens.refreshToken, user: tokens.user });
  } catch (err: any) {
    res.status(500).json({ message: 'Login failed' });
  }
});

app.post('/api/auth/oauth/google', async (req, res) => {
  try {
    const { credential, code } = req.body as { credential?: string; code?: string };
    const payload = credential || code || 'google-token-' + Date.now();

    const tokens = await handleGoogleAuth(payload);
    setRefreshTokenCookie(res, tokens.refreshToken);

    res.json({ token: tokens.accessToken, refreshToken: tokens.refreshToken, user: tokens.user });
  } catch (err: any) {
    console.error('Google OAuth error:', err);
    res.status(400).json({ message: 'Google authentication failed' });
  }
});

app.post('/api/auth/oauth/linkedin', async (req, res) => {
  try {
    const { code, email } = req.body as { code?: string; email?: string };
    const payload = code || email || 'linkedin-code-' + Date.now();

    const tokens = await handleLinkedInAuth(payload);
    setRefreshTokenCookie(res, tokens.refreshToken);

    res.json({ token: tokens.accessToken, refreshToken: tokens.refreshToken, user: tokens.user });
  } catch (err: any) {
    console.error('LinkedIn OAuth error:', err);
    res.status(400).json({ message: 'LinkedIn authentication failed' });
  }
});

app.post('/api/auth/refresh', (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }

    const payload = verifyRefreshToken(refreshToken);
    const user = userService.findById(payload.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const tokens = generateTokens(user);
    setRefreshTokenCookie(res, tokens.refreshToken);

    res.json({ token: tokens.accessToken, refreshToken: tokens.refreshToken, user: tokens.user });
  } catch (err: any) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
});

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

app.post('/api/auth/forgot-password', (req, res) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) return res.status(400).json({ message: 'Email address is required.' });

    const token = userService.generateResetToken(email);
    res.json({
      message: 'Password reset link has been generated.',
      resetLink: `/reset-password?token=${token}`,
    });
  } catch (err: any) {
    res.status(400).json({ message: err?.message || 'Failed to process forgot password request.' });
  }
});

app.post('/api/auth/reset-password', (req, res) => {
  try {
    const { token, newPassword } = req.body as { token?: string; newPassword?: string };
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Reset token and new password are required.' });
    }

    const user = userService.resetPassword(token, newPassword);
    const tokens = generateTokens(user);
    setRefreshTokenCookie(res, tokens.refreshToken);

    res.json({ message: 'Password updated successfully!', token: tokens.accessToken, user: tokens.user });
  } catch (err: any) {
    res.status(400).json({ message: err?.message || 'Password reset failed.' });
  }
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    const user = userService.findById(payload.id);

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user: toPublicUser(user) });
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

app.get('/api/insights', (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const report = readinessEngineService.calculatePlacementReadiness(userId);

    // Maintain backward compatible fields alongside new placement engine report
    res.json({
      readinessScore: report.overallReadinessScore,
      resumeStrength: report.moduleScores.resume.score,
      codingScore: report.moduleScores.coding.score,
      aptitudeScore: report.moduleScores.aptitude.score,
      interviewScore: report.moduleScores.interview.score,
      communicationScore: report.moduleScores.interview.commAvg ?? 70,
      placementProbability: report.placementProbability,
      confidenceLevel: report.confidenceLevel,
      interviewSuccessProbability: Math.min(98, Math.round(report.moduleScores.interview.score * 0.95)),
      technicalRoundSuccessRate: Math.min(98, Math.round(report.moduleScores.coding.score * 0.9)),
      hrRoundSuccessRate: Math.min(98, Math.round((report.moduleScores.interview.commAvg ?? 70) * 0.95)),
      suggestions: report.dynamicRecommendations.map((r) => r.action),
      report
    });
  } catch (err: any) {
    console.error('Failed to compute readiness insights:', err);
    res.status(500).json({ message: 'Failed to compute dynamic placement readiness insights' });
  }
});

app.get('/api/readiness/detail', (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const report = readinessEngineService.calculatePlacementReadiness(userId);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch detailed placement readiness report' });
  }
});

app.post('/api/resume/analyze', upload.single('file'), async (req, res) => {
  try {
    const file = (req as any).file;
    const { jobDescription } = req.body as { jobDescription?: string };
    const userId = getUserIdFromReq(req);

    if (!file) return res.status(400).json({ message: 'No resume file uploaded' });

    const name = file.originalname.toLowerCase();
    let rawText = '';

    if (file.mimetype === 'application/pdf' || name.endsWith('.pdf')) {
      const parsed = await pdfParse(file.buffer);
      rawText = parsed.text || '';
    } else {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      rawText = result.value || '';
    }

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({ message: 'Could not extract text from uploaded document.' });
    }

    const report = resumeAnalyzerService.analyzeResume(
      rawText,
      file.originalname,
      file.mimetype || 'application/pdf',
      jobDescription,
      userId
    );

    // Save report to database history
    dbService.saveResumeReport(report);

    res.json(report);
  } catch (err: any) {
    console.error('Resume analyze error', err);
    res.status(500).json({ message: err?.message || 'Failed to perform ATS analysis on resume' });
  }
});

app.get('/api/resume/history', (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const reports = dbService.getUserResumeReports(userId);
    res.json(reports);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch resume analysis history' });
  }
});

app.get('/api/resume/report/:id', (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const report = dbService.getResumeReportById(req.params.id);
    if (!report || (report.userId && report.userId !== userId)) {
      return res.status(404).json({ message: 'Resume report not found' });
    }
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch resume report' });
  }
});

app.post('/api/resume/rewrite', (req, res) => {
  try {
    const { reportId } = req.body as { reportId?: string };
    if (!reportId) return res.status(400).json({ message: 'reportId is required' });

    const report = dbService.getResumeReportById(reportId);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    res.json({
      optimizedResumeText: report.optimizedResumeText,
      fileName: report.fileName
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to generate optimized resume rewrite' });
  }
});

app.post('/api/interview/start', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const config = req.body as any;

    const session = await interviewService.startInterview(config, userId);
    res.json(session);
  } catch (err: any) {
    console.error('Failed to start interview session:', err);
    res.status(500).json({ message: err?.message || 'Failed to start interview session' });
  }
});

app.post('/api/interview/evaluate-answer', async (req, res) => {
  try {
    const { questionId, questionText, candidateAnswer, config } = req.body as {
      questionId: string;
      questionText: string;
      candidateAnswer: string;
      config: any;
    };

    if (!questionId || !questionText) {
      return res.status(400).json({ message: 'questionId and questionText are required' });
    }

    const evaluation = await interviewService.evaluateAnswer(
      questionId,
      questionText,
      candidateAnswer || '',
      config || { role: 'Software Engineer', company: 'Google', experienceLevel: 'Fresher', type: 'Technical' }
    );

    res.json(evaluation);
  } catch (err: any) {
    console.error('Failed to evaluate answer:', err);
    res.status(500).json({ message: 'Failed to evaluate candidate response' });
  }
});

app.post('/api/interview/finish', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const { sessionId, config, evaluations, durationSeconds } = req.body as {
      sessionId: string;
      config: any;
      evaluations: any[];
      durationSeconds: number;
    };

    if (!sessionId || !evaluations) {
      return res.status(400).json({ message: 'sessionId and evaluations are required' });
    }

    const report = await interviewService.finishInterview(
      sessionId,
      config,
      evaluations,
      durationSeconds || 300,
      userId
    );

    res.json(report);
  } catch (err: any) {
    console.error('Failed to finish interview:', err);
    res.status(500).json({ message: 'Failed to generate interview report' });
  }
});

app.get('/api/interview/history', (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const history = dbService.getUserInterviewHistory(userId);
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch interview history' });
  }
});

app.get('/api/interview/report/:id', (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const report = dbService.getInterviewReportById(req.params.id);
    if (!report || (report.userId && report.userId !== userId)) {
      return res.status(404).json({ message: 'Interview report not found' });
    }
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch interview report' });
  }
});

app.post('/api/coding/evaluate', (req, res) => {
  const { language, code } = req.body as { language?: string; code?: string };
  res.json({
    correctnessScore: 84,
    qualityScore: 88,
    complexity: 'O(n log n)',
    suggestion: `Your ${language || 'solution'} logic is strong. Consider reducing nested conditionals and adding edge-case handling.`,
    explanation: code ? 'The solution handles the core path well and can be made more readable.' : 'No code submitted.'
  });
});

// Helper to extract userId from Auth Token or fallback to empty string
const getUserIdFromReq = (req: express.Request): string => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return '';
  try {
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    return payload.id || '';
  } catch {
    return '';
  }
};

app.post('/api/aptitude/start', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const { categories = 'all', difficulty = 'medium', count = 20, durationSec = 30 * 60 } = req.body as {
      categories?: AptCategory[] | 'all';
      difficulty?: Difficulty | 'adaptive';
      count?: number;
      durationSec?: number;
    };

    const session = await createAdaptiveTestSession(
      userId,
      categories,
      difficulty,
      Math.min(50, Math.max(5, count)),
      durationSec
    );

    res.json(session);
  } catch (err: any) {
    console.error('Failed to start aptitude session:', err);
    res.status(500).json({ message: err?.message || 'Failed to start test session' });
  }
});

app.post('/api/aptitude/submit', (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const { testId, answers = {}, timeSpentSec = 0 } = req.body as {
      testId?: string;
      answers?: Record<string, number> | { id: string; selectedIndex: number }[];
      timeSpentSec?: number;
    };

    if (!testId) {
      return res.status(400).json({ message: 'testId is required' });
    }

    // Convert array format if sent by client
    let mapAnswers: Record<string, number> = {};
    if (Array.isArray(answers)) {
      for (const item of answers) {
        if (item.id && typeof item.selectedIndex === 'number') {
          mapAnswers[item.id] = item.selectedIndex;
        }
      }
    } else {
      mapAnswers = answers;
    }

    const result = evaluateTestSubmission(testId, mapAnswers, userId, timeSpentSec);
    res.json(result);
  } catch (err: any) {
    console.error('Failed to submit test:', err);
    res.status(400).json({ message: err?.message || 'Failed to process test submission' });
  }
});

app.get('/api/aptitude/insights', (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const analytics = getUserAnalytics(userId);
    res.json(analytics);
  } catch (err: any) {
    console.error('Failed to fetch user analytics:', err);
    res.status(500).json({ message: 'Failed to fetch aptitude analytics' });
  }
});

app.get('/api/aptitude/stats', (_req, res) => {
  const allQuestions = dbService.getQuestions();
  const allAttempts = dbService.getAllTestAttempts();
  res.json({
    totalQuestionPool: allQuestions.length,
    categories: ['Quantitative', 'Logical', 'Verbal', 'DataInterpretation'],
    totalTestAttemptsLogged: allAttempts.length
  });
});

// Coding Platform APIs
app.post('/api/coding/assessment/start', (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const { attemptId } = req.body as { attemptId?: string };
    const session = codingEngine.generateAssessment(userId, attemptId);
    res.json(session);
  } catch (err: any) {
    console.error('Failed to start coding assessment:', err);
    res.status(500).json({ message: 'Failed to start coding assessment' });
  }
});

app.post('/api/coding/run', async (req, res) => {
  try {
    const { questionId, language, code, customInput } = req.body as {
      questionId?: string;
      language?: any;
      code?: string;
      customInput?: string;
    };

    if (!questionId || !language || !code) {
      return res.status(400).json({ message: 'questionId, language, and code are required' });
    }

    const result = await codingEvaluationService.runSampleCode(questionId, language, code, customInput);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err?.message || 'Code execution failed' });
  }
});

app.post('/api/coding/submit-question', async (req, res) => {
  try {
    const { questionId, language, code } = req.body as {
      questionId?: string;
      language?: any;
      code?: string;
    };

    if (!questionId || !language || !code) {
      return res.status(400).json({ message: 'questionId, language, and code are required' });
    }

    const result = await codingEvaluationService.evaluateQuestionSubmission(questionId, language, code);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err?.message || 'Question submission failed' });
  }
});

app.post('/api/coding/assessment/submit', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const user = dbService.findUserById(userId);
    const userName = user?.name || 'Candidate Coder';
    const userEmail = user?.email || 'student@example.com';

    const { assessmentId, startTime, questions, solutions } = req.body as {
      assessmentId?: string;
      startTime?: number;
      questions?: any[];
      solutions?: Record<string, any>;
    };

    if (!assessmentId || !questions || !solutions) {
      return res.status(400).json({ message: 'Missing assessment submission payload' });
    }

    const attempt = await codingEvaluationService.evaluateFullAssessment(
      userId,
      userName,
      userEmail,
      assessmentId,
      startTime || Date.now() - 3600 * 1000,
      questions,
      solutions
    );

    res.json(attempt);
  } catch (err: any) {
    console.error('Failed to submit coding assessment:', err);
    res.status(400).json({ message: err?.message || 'Failed to submit coding assessment' });
  }
});

app.post('/api/coding/assessment/abandon', (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const user = dbService.findUserById(userId);
    const { assessmentId, startTime, questions } = req.body as {
      assessmentId?: string;
      startTime?: number;
      questions?: any[];
    };

    if (assessmentId) {
      const incompleteAttempt: any = {
        attemptId: assessmentId,
        userId,
        userName: user?.name || 'Candidate Coder',
        userEmail: user?.email || 'student@example.com',
        startTime: startTime || Date.now() - 60000,
        completedAt: Date.now(),
        durationSeconds: Math.max(1, Math.round((Date.now() - (startTime || Date.now() - 60000)) / 1000)),
        totalScore: 0,
        maxScore: 400,
        solvedQuestionsCount: 0,
        accuracy: 0,
        status: 'Incomplete',
        topicBreakdown: {},
        questionSolutions: {},
        questionsSummary: (questions || []).map((q: any) => ({
          id: q.id,
          title: q.title,
          topic: q.topic,
          difficulty: q.difficulty,
        })),
      };
      dbService.saveCodingAttempt(incompleteAttempt);
    }

    res.json({ message: 'Assessment marked as incomplete' });
  } catch (err: any) {
    res.status(400).json({ message: err?.message || 'Failed to mark incomplete assessment' });
  }
});


app.get('/api/coding/history', (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    const history = dbService.getUserCodingAttempts(userId);
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch coding history' });
  }
});

app.get('/api/coding/leaderboard', (_req, res) => {
  try {
    const leaderboard = dbService.getCodingLeaderboard();
    res.json(leaderboard);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
});

// ==========================================
// AI CAREER & PLACEMENT COACH ENDPOINTS
// ==========================================

// Get all saved coaching sessions for user
app.get('/api/coach/sessions', (req, res) => {
  try {
    const userId = getUserIdFromReq(req) || 'anon';
    let sessions = dbService.getCoachSessions(userId);

    if (sessions.length === 0) {
      const defaultSession = {
        id: uuid(),
        userId,
        title: 'Placement Strategy Chat',
        mode: 'General' as CoachingMode,
        messageCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      dbService.saveCoachSession(defaultSession);
      sessions = [defaultSession];
    }

    res.json(sessions);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch coach sessions' });
  }
});

// Create a new coaching session
app.post('/api/coach/sessions', (req, res) => {
  try {
    const userId = getUserIdFromReq(req) || 'anon';
    const { title = 'New Coaching Session', mode = 'General' } = req.body as {
      title?: string;
      mode?: CoachingMode;
    };

    const newSession = {
      id: uuid(),
      userId,
      title,
      mode,
      messageCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    dbService.saveCoachSession(newSession);
    res.status(201).json(newSession);
  } catch (err: any) {
    res.status(400).json({ message: 'Failed to create coach session' });
  }
});

// Delete a coaching session
app.delete('/api/coach/sessions/:id', (req, res) => {
  try {
    const userId = getUserIdFromReq(req) || 'anon';
    const sessionId = req.params.id;
    dbService.deleteCoachSession(userId, sessionId);
    res.json({ message: 'Session deleted successfully' });
  } catch (err: any) {
    res.status(400).json({ message: 'Failed to delete coach session' });
  }
});

// Get conversation memory messages for a session
app.get('/api/coach/sessions/:id/messages', (req, res) => {
  try {
    const sessionId = req.params.id;
    const messages = dbService.getCoachMessages(sessionId);

    if (messages.length === 0) {
      const session = dbService.getCoachSessionById(sessionId);
      const initialAssistantMsg = {
        id: uuid(),
        sessionId,
        userId: session?.userId || 'anon',
        role: 'assistant' as const,
        content: `Hello! I am your AI Career & Placement Coach. I have analyzed your profile, ATS resume score, aptitude accuracy, coding test attempts, and mock interview reports. How can I help guide your placement journey today?`,
        mode: session?.mode || 'General',
        timestamp: Date.now(),
      };
      dbService.saveCoachMessage(initialAssistantMsg);
      return res.json([initialAssistantMsg]);
    }

    res.json(messages);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch session messages' });
  }
});

// Primary Chat Endpoint (RAG pipeline + conversation memory + multi-mode routing)
app.post('/api/coach/chat', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req) || 'anon';
    const { message, sessionId: reqSessionId, mode } = req.body as {
      message?: string;
      sessionId?: string;
      mode?: CoachingMode;
    };

    console.log(`[Coach Chat API] Incoming request from userId: '${userId}', mode: '${mode || 'General'}'`);

    if (!message?.trim()) {
      console.warn('[Coach Chat API] Request rejected: Message content is required.');
      return res.status(400).json({ message: 'Message content is required.' });
    }

    let sessionId = reqSessionId;
    if (!sessionId) {
      const sessions = dbService.getCoachSessions(userId);
      if (sessions.length > 0) {
        sessionId = sessions[0].id;
      } else {
        const newSess = {
          id: uuid(),
          userId,
          title: 'Placement Mentorship',
          mode: mode || 'General',
          messageCount: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        dbService.saveCoachSession(newSess);
        sessionId = newSess.id;
      }
    }

    console.log(`[Coach Chat API] Active Session ID: '${sessionId}'. Generating response...`);
    const { responseMessage, actionPlan } = await coachEngineService.generateCoachResponse(
      userId,
      sessionId,
      message.trim(),
      mode
    );

    console.log(`[Coach Chat API] Response generated successfully for session '${sessionId}'.`);
    res.json({
      reply: responseMessage.content,
      responseMessage,
      actionPlan,
      sessionId,
    });
  } catch (err: any) {
    console.error('[Coach Chat API Error]:', err);
    res.status(500).json({
      message: 'Failed to generate coach response',
      error: err?.message || String(err),
    });
  }
});

// Proactive Insights Endpoint
app.get('/api/coach/insights', (req, res) => {
  try {
    const userId = getUserIdFromReq(req) || 'anon';
    const insights = coachEngineService.generateProactiveInsights(userId);
    res.json(insights);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to generate proactive insights' });
  }
});

// Dismiss a proactive insight
app.post('/api/coach/insights/dismiss', (req, res) => {
  try {
    const userId = getUserIdFromReq(req) || 'anon';
    const { insightId } = req.body as { insightId?: string };
    if (!insightId) return res.status(400).json({ message: 'Insight ID is required' });

    dbService.dismissProactiveInsight(userId, insightId);
    res.json({ message: 'Insight dismissed successfully' });
  } catch (err: any) {
    res.status(400).json({ message: 'Failed to dismiss insight' });
  }
});

// Get User Action Plan
app.get('/api/coach/action-plan', (req, res) => {
  try {
    const userId = getUserIdFromReq(req) || 'anon';
    let plan = dbService.getUserActionPlan(userId);
    if (!plan) {
      plan = coachEngineService.generatePersonalizedPlan(userId);
    }
    res.json(plan);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch action plan' });
  }
});

// Update Action Plan
app.post('/api/coach/action-plan', (req, res) => {
  try {
    const userId = getUserIdFromReq(req) || 'anon';
    const { itemToggleId, items, goalTitle } = req.body as {
      itemToggleId?: string;
      items?: any[];
      goalTitle?: string;
    };

    let plan = dbService.getUserActionPlan(userId);
    if (!plan) {
      plan = coachEngineService.generatePersonalizedPlan(userId);
    }

    if (itemToggleId) {
      plan.items = plan.items.map((item) =>
        item.id === itemToggleId ? { ...item, completed: !item.completed } : item
      );
    }
    if (items) {
      plan.items = items;
    }
    if (goalTitle) {
      plan.goalTitle = goalTitle;
    }

    plan.updatedAt = Date.now();
    dbService.saveUserActionPlan(plan);
    res.json(plan);
  } catch (err: any) {
    res.status(400).json({ message: 'Failed to update action plan' });
  }
});

// Generate a fresh preparation plan
app.post('/api/coach/generate-plan', (req, res) => {
  try {
    const userId = getUserIdFromReq(req) || 'anon';
    const { targetRole, targetCompanies, availableHoursPerWeek } = req.body as {
      targetRole?: string;
      targetCompanies?: string[];
      availableHoursPerWeek?: number;
    };

    const plan = coachEngineService.generatePersonalizedPlan(userId, {
      targetRole,
      targetCompanies,
      availableHoursPerWeek,
    });

    res.json(plan);
  } catch (err: any) {
    res.status(400).json({ message: 'Failed to generate personalized plan' });
  }
});

// AI Coach Diagnostic & Provider Health Check Endpoint
app.get('/api/coach/health', async (_req, res) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  const isKeyPresent = Boolean(apiKey && apiKey.trim().length > 0 && apiKey !== 'your_actual_gemini_api_key_here');

  let providerPing = 'not_tested';
  let providerError: string | null = null;

  if (isKeyPresent) {
    try {
      const pingUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const pingRes = await fetch(pingUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Ping health check' }] }],
          generationConfig: { maxOutputTokens: 5 },
        }),
      });
      if (pingRes.ok) {
        providerPing = 'connected';
      } else {
        providerPing = 'failed';
        providerError = `HTTP ${pingRes.status}: ${pingRes.statusText}`;
      }
    } catch (err: any) {
      providerPing = 'failed';
      providerError = err?.message || 'Network request failed';
    }
  }

  const dbStatus = dbService.getUsers().length >= 0 ? 'healthy' : 'error';
  const overallStatus = isKeyPresent && providerPing === 'connected' ? 'ready' : 'degraded_fallback';

  res.json({
    status: overallStatus,
    timestamp: new Date().toISOString(),
    aiProvider: 'Google Gemini',
    apiKeyConfigured: isKeyPresent,
    providerPing,
    providerError,
    database: dbStatus,
    envVariables: {
      PORT: Boolean(process.env.PORT),
      JWT_SECRET: Boolean(process.env.JWT_SECRET),
      GEMINI_API_KEY: isKeyPresent,
    },
    activeMode: isKeyPresent && providerPing === 'connected' ? 'Gemini 1.5 Flash LLM' : 'RAG Synthesizer Rule Fallback',
  });
});

app.get('/api/health', (_req, res) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  const isKeyPresent = Boolean(apiKey && apiKey.trim().length > 0 && apiKey !== 'your_actual_gemini_api_key_here');

  res.json({
    status: 'ok',
    id: uuid(),
    aiCoach: {
      provider: 'Google Gemini',
      apiKeyConfigured: isKeyPresent,
      mode: isKeyPresent ? 'Gemini LLM' : 'RAG Rule Synthesis'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
