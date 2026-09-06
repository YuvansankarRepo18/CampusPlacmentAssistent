import { dbService } from './dbService.js';
import { userService } from './userService.js';
import { getUserAnalytics } from './analyticsService.js';
import { ReadinessEngineService } from './readinessEngineService.js';
import { StudentPlacementContext } from '../models/coachTypes.js';

const readinessService = new ReadinessEngineService();

export class RagContextService {
  /**
   * Retrieves and formats comprehensive RAG student context across all modules
   */
  public getStudentPlacementContext(userId: string): StudentPlacementContext {
    const userRecord = userService.findById(userId);

    // 1. Placement Readiness Snapshot
    const readinessReport = readinessService.calculatePlacementReadiness(userId);

    // 2. Resume Data
    const resumeReports = dbService.getUserResumeReports(userId);
    const latestResume = resumeReports && resumeReports.length > 0 ? resumeReports[0] : null;

    // 3. Aptitude Analytics
    const aptitudeAttempts = dbService.getUserTestAttempts(userId);
    const analytics = getUserAnalytics(userId);
    const catPerf = analytics.categoryPerformance || {};

    let weakestCat = 'None';
    let strongestCat = 'None';
    let minAcc = 101;
    let maxAcc = -1;

    Object.entries(catPerf).forEach(([cat, data]: [string, any]) => {
      if (data.attempted > 0) {
        if (data.accuracy < minAcc) {
          minAcc = data.accuracy;
          weakestCat = cat;
        }
        if (data.accuracy > maxAcc) {
          maxAcc = data.accuracy;
          strongestCat = cat;
        }
      }
    });

    // 4. Coding Attempts & DSA Topic Breakdown
    const codingAttempts = dbService.getUserCodingAttempts(userId);
    const codingLeaderboard = dbService.getCodingLeaderboard();
    const userLeaderboardEntry = codingLeaderboard.find((entry) => entry.userId === userId);

    const topicMap: Record<string, { attempted: number; passed: number; score: number }> = {};
    let solvedTotal = 0;
    let totalScoreSum = 0;

    codingAttempts.forEach((attempt) => {
      solvedTotal += attempt.solvedQuestionsCount || 0;
      totalScoreSum += attempt.totalScore || 0;

      if (attempt.topicBreakdown) {
        Object.entries(attempt.topicBreakdown).forEach(([topic, data]: [string, any]) => {
          if (!topicMap[topic]) {
            topicMap[topic] = { attempted: 0, passed: 0, score: 0 };
          }
          topicMap[topic].attempted += 1;
          if (data.passed) topicMap[topic].passed += 1;
          topicMap[topic].score = Math.max(topicMap[topic].score, data.score || 0);
        });
      }
    });

    const weakCodingTopics: string[] = [];
    Object.entries(topicMap).forEach(([topic, data]) => {
      if (data.score < 60 || data.passed < data.attempted) {
        weakCodingTopics.push(topic);
      }
    });

    const avgCodingScore = codingAttempts.length > 0 ? Math.round(totalScoreSum / codingAttempts.length) : 0;
    const avgCodingAcc = codingAttempts.length > 0
      ? Math.round(codingAttempts.reduce((acc, a) => acc + (a.accuracy || 0), 0) / codingAttempts.length)
      : 0;

    // 5. Mock Interview Data
    const interviewHistory = dbService.getUserInterviewHistory(userId);
    const totalInterviews = interviewHistory.length;

    let avgOverall = 0;
    let avgTech = 0;
    let avgComm = 0;
    let avgConf = 0;
    const recentStrengths: string[] = [];
    const recentWeaknesses: string[] = [];

    if (totalInterviews > 0) {
      avgOverall = Math.round(interviewHistory.reduce((s, i) => s + (i.overallScore || 0), 0) / totalInterviews);
      avgTech = Math.round(interviewHistory.reduce((s, i) => s + (i.technicalScore || 0), 0) / totalInterviews);
      avgComm = Math.round(interviewHistory.reduce((s, i) => s + (i.communicationScore || 0), 0) / totalInterviews);
      avgConf = Math.round(interviewHistory.reduce((s, i) => s + (i.confidenceScore || 0), 0) / totalInterviews);

      interviewHistory.slice(0, 3).forEach((sess) => {
        if (sess.topStrengths) recentStrengths.push(...sess.topStrengths);
        if (sess.keyWeaknesses) recentWeaknesses.push(...sess.keyWeaknesses);
      });
    }

    // 6. Action Plan & Proactive Insights
    const actionPlan = dbService.getUserActionPlan(userId);
    const proactiveInsights = dbService.getProactiveInsights(userId);

    const missingKw = latestResume?.jobMatch?.missingKeywords || latestResume?.benchmarking?.competencyGaps || ['System Design', 'Docker', 'React'];
    const formatIssues = latestResume?.formattingChecks?.filter(f => f.status !== 'PASS').map(f => f.recommendation) || [];
    const improvementsList = latestResume?.roadmap?.map(r => r.action) || [];

    return {
      user: {
        id: userId,
        name: userRecord?.name || 'Student',
        email: userRecord?.email || '',
        role: userRecord?.role || 'student',
        skills: ['JavaScript', 'React', 'Data Structures', 'Python', 'Node.js'],
        targetRole: 'Software Development Engineer (SDE-1)',
        targetCompanies: ['Google', 'Amazon', 'Microsoft', 'TCS Prime'],
        projects: ['Campus Placement Assistant Platform', 'E-Commerce Microservices'],
        certifications: ['AWS Certified Developer', 'LeetCode 50 Days Badge'],
      },
      readiness: {
        overallScore: readinessReport.overallReadinessScore,
        placementProbability: readinessReport.placementProbability,
        confidenceLevel: readinessReport.confidenceLevel,
        companyReadiness: readinessReport.companyReadiness,
      },
      resume: {
        hasResume: !!latestResume,
        latestScore: latestResume ? latestResume.overallAtsScore : 0,
        missingKeywords: missingKw,
        formattingIssues: formatIssues,
        categoryScores: latestResume ? {
          skillsScore: latestResume.categoryScores.skillsMatch?.score,
          experienceScore: latestResume.categoryScores.experienceQuality?.score,
          structureScore: latestResume.categoryScores.formatting?.score,
          impactScore: latestResume.categoryScores.projectQuality?.score,
        } : undefined,
        improvements: improvementsList,
      },
      aptitude: {
        totalTests: aptitudeAttempts.length,
        overallAccuracy: Math.round(analytics.overallAccuracy || 0),
        weakestCategory: weakestCat,
        strongestCategory: strongestCat,
        categoryPerformance: {
          Quantitative: catPerf.Quantitative ? { accuracy: Math.round(catPerf.Quantitative.accuracy || 0), total: catPerf.Quantitative.attempted, correct: catPerf.Quantitative.correct } : undefined,
          Logical: catPerf.Logical ? { accuracy: Math.round(catPerf.Logical.accuracy || 0), total: catPerf.Logical.attempted, correct: catPerf.Logical.correct } : undefined,
          Verbal: catPerf.Verbal ? { accuracy: Math.round(catPerf.Verbal.accuracy || 0), total: catPerf.Verbal.attempted, correct: catPerf.Verbal.correct } : undefined,
          DataInterpretation: catPerf.DataInterpretation ? { accuracy: Math.round(catPerf.DataInterpretation.accuracy || 0), total: catPerf.DataInterpretation.attempted, correct: catPerf.DataInterpretation.correct } : undefined,
        },
      },
      coding: {
        totalAttempts: codingAttempts.length,
        solvedTotal,
        codingAccuracy: avgCodingAcc,
        avgScore: avgCodingScore,
        leaderboardRank: userLeaderboardEntry ? userLeaderboardEntry.rank : undefined,
        weakestTopics: weakCodingTopics,
        topicBreakdown: topicMap,
      },
      interview: {
        totalSessions: totalInterviews,
        avgOverallScore: avgOverall,
        avgTechnicalScore: avgTech,
        avgCommunicationScore: avgComm,
        avgConfidenceScore: avgConf,
        recentStrengths: Array.from(new Set(recentStrengths)),
        recentWeaknesses: Array.from(new Set(recentWeaknesses)),
      },
      actionPlan,
      proactiveInsights,
    };
  }

  /**
   * Selectively converts the StudentPlacementContext object into a targeted markdown system prompt string
   * based on which modules are relevant to the user's query.
   */
  public buildSelectiveRagPromptSystemContext(
    ctx: StudentPlacementContext,
    modules: { aptitude: boolean; interview: boolean; resume: boolean; coding: boolean; readiness: boolean }
  ): string {
    const parts: string[] = [];

    parts.push(`STUDENT NAME: ${ctx.user.name}`);
    parts.push(`TARGET ROLE: ${ctx.user.targetRole}`);
    if (ctx.user.targetCompanies && ctx.user.targetCompanies.length > 0) {
      parts.push(`TARGET COMPANIES: ${ctx.user.targetCompanies.join(', ')}`);
    }

    if (modules.readiness) {
      parts.push(`\n--- OVERALL PLACEMENT READINESS ---`);
      parts.push(`- Overall Readiness Score: ${ctx.readiness.overallScore}% (${ctx.readiness.confidenceLevel} confidence)`);
      parts.push(`- Estimated Placement Probability: ${ctx.readiness.placementProbability}%`);
      if (ctx.readiness.companyReadiness && ctx.readiness.companyReadiness.length > 0) {
        parts.push(`- Company Readiness Index:`);
        ctx.readiness.companyReadiness.forEach((c) => {
          parts.push(`  * ${c.company}: ${c.readinessScore}% (${c.status}) - Primary Focus: ${c.primaryFocus}`);
        });
      }
    }

    if (modules.aptitude) {
      parts.push(`\n--- APTITUDE ASSESSMENT PERFORMANCE ---`);
      if (ctx.aptitude.totalTests === 0) {
        parts.push(`- Status: No aptitude tests attempted yet on the platform.`);
      } else {
        parts.push(`- Total Tests Attempted: ${ctx.aptitude.totalTests}`);
        parts.push(`- Overall Aptitude Accuracy: ${ctx.aptitude.overallAccuracy}%`);
        parts.push(`- Strongest Category: ${ctx.aptitude.strongestCategory}`);
        parts.push(`- Weakest Category: ${ctx.aptitude.weakestCategory !== 'None' ? ctx.aptitude.weakestCategory : 'Quantitative / Logical'}`);
        parts.push(`- Category Performance Breakdown:`);
        parts.push(`  * Quantitative: ${ctx.aptitude.categoryPerformance.Quantitative ? `${ctx.aptitude.categoryPerformance.Quantitative.accuracy}%` : 'Not attempted'}`);
        parts.push(`  * Logical Reasoning: ${ctx.aptitude.categoryPerformance.Logical ? `${ctx.aptitude.categoryPerformance.Logical.accuracy}%` : 'Not attempted'}`);
        parts.push(`  * Verbal Ability: ${ctx.aptitude.categoryPerformance.Verbal ? `${ctx.aptitude.categoryPerformance.Verbal.accuracy}%` : 'Not attempted'}`);
        parts.push(`  * Data Interpretation: ${ctx.aptitude.categoryPerformance.DataInterpretation ? `${ctx.aptitude.categoryPerformance.DataInterpretation.accuracy}%` : 'Not attempted'}`);
      }
    }

    if (modules.resume) {
      parts.push(`\n--- ATS RESUME PERFORMANCE ---`);
      if (!ctx.resume.hasResume) {
        parts.push(`- Status: No resume uploaded yet for ATS analysis.`);
      } else {
        parts.push(`- Latest ATS Score: ${ctx.resume.latestScore}/100`);
        parts.push(`- Missing High-Impact Keywords: ${ctx.resume.missingKeywords.length > 0 ? ctx.resume.missingKeywords.join(', ') : 'None detected'}`);
        if (ctx.resume.improvements && ctx.resume.improvements.length > 0) {
          parts.push(`- Recommended ATS Improvements: ${ctx.resume.improvements.slice(0, 3).join('; ')}`);
        }
      }
    }

    if (modules.coding) {
      parts.push(`\n--- CODING & DSA PERFORMANCE ---`);
      if (ctx.coding.totalAttempts === 0) {
        parts.push(`- Status: No coding assessments attempted yet on the platform.`);
      } else {
        parts.push(`- Total Assessments Attempted: ${ctx.coding.totalAttempts}`);
        parts.push(`- Total Solved Problems: ${ctx.coding.solvedTotal}`);
        parts.push(`- Coding Accuracy: ${ctx.coding.codingAccuracy}%`);
        parts.push(`- Leaderboard Rank: ${ctx.coding.leaderboardRank ? `#${ctx.coding.leaderboardRank}` : 'Unranked'}`);
        parts.push(`- Weak DSA Topics: ${ctx.coding.weakestTopics.length > 0 ? ctx.coding.weakestTopics.join(', ') : 'None identified'}`);
      }
    }

    if (modules.interview) {
      parts.push(`\n--- MOCK INTERVIEW PERFORMANCE ---`);
      if (ctx.interview.totalSessions === 0) {
        parts.push(`- Status: No mock interviews completed yet on the platform.`);
      } else {
        parts.push(`- Total Mock Interviews Completed: ${ctx.interview.totalSessions}`);
        parts.push(`- Average Technical Score: ${ctx.interview.avgTechnicalScore}/100`);
        parts.push(`- Average Communication Score: ${ctx.interview.avgCommunicationScore}/100`);
        parts.push(`- Average Confidence Score: ${ctx.interview.avgConfidenceScore}/100`);
        if (ctx.interview.recentWeaknesses.length > 0) {
          parts.push(`- Key Areas for Improvement: ${ctx.interview.recentWeaknesses.join(', ')}`);
        }
        if (ctx.interview.recentStrengths.length > 0) {
          parts.push(`- Key Strengths: ${ctx.interview.recentStrengths.join(', ')}`);
        }
      }
    }

    return parts.join('\n');
  }

  /**
   * Converts the StudentPlacementContext object into a concise markdown system prompt string for RAG injection
   */
  public buildRagPromptSystemContext(ctx: StudentPlacementContext): string {
    return this.buildSelectiveRagPromptSystemContext(ctx, {
      aptitude: true,
      interview: true,
      resume: true,
      coding: true,
      readiness: true,
    });
  }
}

export const ragContextService = new RagContextService();

