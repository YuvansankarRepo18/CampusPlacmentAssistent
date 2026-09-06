import { PlacementReadinessReport, DynamicRecommendation, CompanyReadinessItem } from '../models/readinessTypes.js';
import { dbService } from './dbService.js';
import { getUserAnalytics } from './analyticsService.js';

export class ReadinessEngineService {
  /**
   * Calculate real-time Placement Readiness Report dynamically aggregating all module database records
   */
  public calculatePlacementReadiness(userId: string): PlacementReadinessReport {
    // 1. Fetch Resume Data
    const resumeReports = dbService.getUserResumeReports(userId);
    const latestResume = resumeReports && resumeReports.length > 0 ? resumeReports[0] : null;
    const resumeAttempts = resumeReports ? resumeReports.length : 0;
    const resumeScore = latestResume ? latestResume.overallAtsScore : 0;

    // 2. Fetch Coding Data
    const codingAttempts = dbService.getUserCodingAttempts(userId);
    const codingCount = codingAttempts ? codingAttempts.length : 0;
    let codingScore = 0;
    let solvedTotal = 0;
    let codingAccuracy = 0;

    if (codingCount > 0) {
      const avgScore = codingAttempts.reduce((s, a) => s + (a.totalScore || 0), 0) / codingCount;
      solvedTotal = codingAttempts.reduce((s, a) => s + (a.solvedQuestionsCount || 0), 0);
      const avgAcc = codingAttempts.reduce((s, a) => s + (a.accuracy || 0), 0) / codingCount;
      codingAccuracy = Math.round(avgAcc);
      codingScore = Math.min(100, Math.round((avgScore / 400) * 60 + Math.min(20, solvedTotal * 5) + (avgAcc * 0.2)));
    }

    // 3. Fetch Aptitude Data
    const aptitudeAttempts = dbService.getUserTestAttempts(userId);
    const aptitudeCount = aptitudeAttempts ? aptitudeAttempts.length : 0;
    let aptitudeScore = 0;
    let aptitudeAccuracy = 0;
    let quantAcc = 0;
    let logicalAcc = 0;
    let verbalAcc = 0;

    if (aptitudeCount > 0) {
      const analytics = getUserAnalytics(userId);
      aptitudeAccuracy = Math.round(analytics.overallAccuracy || 0);
      aptitudeScore = Math.min(100, Math.round(aptitudeAccuracy * 0.8 + Math.min(20, aptitudeCount * 4)));

      if (analytics.categoryPerformance) {
        quantAcc = Math.round(analytics.categoryPerformance.Quantitative?.accuracy || 0);
        logicalAcc = Math.round(analytics.categoryPerformance.Logical?.accuracy || 0);
        verbalAcc = Math.round(analytics.categoryPerformance.Verbal?.accuracy || 0);
      }
    }

    // 4. Fetch Interview Data
    const interviewSessions = dbService.getUserInterviewHistory(userId);
    const interviewCount = interviewSessions ? interviewSessions.length : 0;
    let interviewScore = 0;
    let technicalAvg = 0;
    let commAvg = 0;

    if (interviewCount > 0) {
      const avgIntScore = interviewSessions.reduce((s, i) => s + (i.overallScore || 0), 0) / interviewCount;
      technicalAvg = Math.round(interviewSessions.reduce((s, i) => s + (i.technicalScore || 0), 0) / interviewCount);
      commAvg = Math.round(interviewSessions.reduce((s, i) => s + (i.communicationScore || 0), 0) / interviewCount);
      interviewScore = Math.min(100, Math.round(avgIntScore));
    }

    // 5. Weighted AI Placement Readiness Score Calculation
    const W_RESUME = 0.20;
    const W_CODING = 0.35;
    const W_APTITUDE = 0.20;
    const W_INTERVIEW = 0.25;

    const weightedResume = Math.round(resumeScore * W_RESUME);
    const weightedCoding = Math.round(codingScore * W_CODING);
    const weightedAptitude = Math.round(aptitudeScore * W_APTITUDE);
    const weightedInterview = Math.round(interviewScore * W_INTERVIEW);

    const totalActivityCount = resumeAttempts + codingCount + aptitudeCount + interviewCount;

    const overallReadinessScore = totalActivityCount === 0 ? 0 : Math.max(
      0,
      Math.min(100, weightedResume + weightedCoding + weightedAptitude + weightedInterview)
    );

    // 6. Placement Probability & Confidence Level
    const placementProbability = totalActivityCount === 0 ? 0 : Math.min(98, Math.max(0, Math.round(overallReadinessScore * 0.95 + (totalActivityCount > 5 ? 5 : 0))));

    const confidenceLevel: 'Very High' | 'High' | 'Moderate' | 'Needs Work' =
      totalActivityCount >= 8 ? 'Very High' : totalActivityCount >= 4 ? 'High' : totalActivityCount >= 1 ? 'Moderate' : 'Needs Work';

    // 7. Company Readiness Index
    const companyReadiness: CompanyReadinessItem[] = [
      {
        company: 'Google',
        readinessScore: Math.min(100, Math.round(codingScore * 0.5 + interviewScore * 0.3 + resumeScore * 0.2)),
        status: codingScore >= 80 ? 'READY' : codingScore >= 65 ? 'COMPETITIVE' : 'NEEDS_PREPARATION',
        primaryFocus: 'DSA Data Structures, System Design & Code Efficiency'
      },
      {
        company: 'Amazon',
        readinessScore: Math.min(100, Math.round(codingScore * 0.4 + interviewScore * 0.4 + resumeScore * 0.2)),
        status: interviewScore >= 80 ? 'READY' : interviewScore >= 65 ? 'COMPETITIVE' : 'NEEDS_PREPARATION',
        primaryFocus: 'Leadership Principles & Scalable Architecture'
      },
      {
        company: 'Microsoft',
        readinessScore: Math.min(100, Math.round(codingScore * 0.45 + aptitudeScore * 0.25 + resumeScore * 0.3)),
        status: codingScore >= 75 ? 'READY' : 'COMPETITIVE',
        primaryFocus: 'OOP Patterns & Problem Solving'
      },
      {
        company: 'TCS',
        readinessScore: Math.min(100, Math.round(aptitudeScore * 0.4 + resumeScore * 0.3 + interviewScore * 0.3)),
        status: aptitudeScore >= 75 ? 'READY' : 'COMPETITIVE',
        primaryFocus: 'NQT Aptitude, Core Fundamentals & Communication'
      },
      {
        company: 'Infosys',
        readinessScore: Math.min(100, Math.round(aptitudeScore * 0.45 + codingScore * 0.3 + resumeScore * 0.25)),
        status: aptitudeScore >= 75 ? 'READY' : 'COMPETITIVE',
        primaryFocus: 'Logical Reasoning & HackWithInfy DSA'
      },
      {
        company: 'Zoho',
        readinessScore: Math.min(100, Math.round(codingScore * 0.6 + aptitudeScore * 0.2 + interviewScore * 0.2)),
        status: codingScore >= 80 ? 'READY' : 'NEEDS_PREPARATION',
        primaryFocus: 'Custom Logic & Independent Coding Rounds'
      }
    ];

    // 8. Dynamic Weakness Recommendations Generator
    const dynamicRecommendations: DynamicRecommendation[] = [];

    if (resumeAttempts === 0 || resumeScore < 75) {
      dynamicRecommendations.push({
        id: 'rec-res-1',
        category: 'Resume',
        priority: 'High',
        title: 'Optimize Resume ATS Score & Keywords',
        action: 'Upload and analyze your resume in the ATS Resume Checker to identify missing technical keywords.',
        reasoning: 'Resumes with ATS scores below 75 are frequently filtered out before reaching technical recruiters.',
        targetModuleRoute: '/resume'
      });
    }

    if (codingCount === 0 || codingScore < 75) {
      dynamicRecommendations.push({
        id: 'rec-cod-1',
        category: 'Coding',
        priority: 'High',
        title: 'Solve DSA & Coding Assessments',
        action: 'Complete timed coding assessment challenges covering Arrays, Subsets, and Two Pointers.',
        reasoning: 'Coding performance carries the largest weight (35%) in campus placement evaluations.',
        targetModuleRoute: '/coding'
      });
    }

    if (logicalAcc < 65 || quantAcc < 65 || aptitudeAttempts.length === 0) {
      dynamicRecommendations.push({
        id: 'rec-apt-1',
        category: 'Aptitude',
        priority: 'High',
        title: 'Improve Aptitude Test Accuracy',
        action: 'Practice Quantitative & Logical Reasoning test sessions under timed conditions.',
        reasoning: 'Aptitude screening is the first elimination round for companies like TCS, Infosys, and Deloitte.',
        targetModuleRoute: '/aptitude'
      });
    }

    if (interviewCount === 0 || interviewScore < 75) {
      dynamicRecommendations.push({
        id: 'rec-int-1',
        category: 'Interview',
        priority: 'Medium',
        title: 'Simulate AI Technical & HR Mock Interviews',
        action: 'Run a live voice/text mock interview session to practice your STAR method explanations.',
        reasoning: 'Structured verbal communication increases technical interview clearance rates by 2.4x.',
        targetModuleRoute: '/interview'
      });
    }

    // 9. Strengths & Critical Gaps
    const topStrengths: string[] = [];
    const criticalGaps: string[] = [];

    if (resumeScore >= 80) topStrengths.push('Strong ATS Resume keyword optimization');
    else criticalGaps.push('Resume requires technical keyword & impact metrics enhancement');

    if (codingScore >= 75) topStrengths.push('Solid coding problem-solving & test case accuracy');
    else criticalGaps.push('Need additional DSA coding assessment practice');

    if (aptitudeScore >= 75) topStrengths.push('High aptitude test accuracy & speed');
    else criticalGaps.push('Aptitude speed and accuracy need improvement');

    if (interviewScore >= 75) topStrengths.push('Confident technical interview communication');
    else criticalGaps.push('Mock interview communication & STAR formatting practice needed');

    const report: PlacementReadinessReport = {
      userId,
      overallReadinessScore,
      placementProbability,
      confidenceLevel,
      moduleScores: {
        resume: {
          moduleName: 'resume',
          label: 'Resume Strength',
          score: resumeScore,
          weight: W_RESUME,
          weightedScore: weightedResume,
          attemptsCount: resumeAttempts,
          status: resumeScore >= 80 ? 'EXCELLENT' : resumeScore >= 65 ? 'GOOD' : 'NEEDS_PRACTICE',
          lastUpdated: latestResume ? latestResume.uploadedAt : Date.now()
        },
        coding: {
          moduleName: 'coding',
          label: 'Coding Score',
          score: codingScore,
          weight: W_CODING,
          weightedScore: weightedCoding,
          attemptsCount: codingCount,
          solvedCount: solvedTotal,
          accuracy: codingAccuracy,
          status: codingScore >= 80 ? 'EXCELLENT' : codingScore >= 65 ? 'GOOD' : 'NEEDS_PRACTICE',
          lastUpdated: Date.now()
        },
        aptitude: {
          moduleName: 'aptitude',
          label: 'Aptitude Score',
          score: aptitudeScore,
          weight: W_APTITUDE,
          weightedScore: weightedAptitude,
          attemptsCount: aptitudeCount,
          accuracy: aptitudeAccuracy,
          status: aptitudeScore >= 80 ? 'EXCELLENT' : aptitudeScore >= 65 ? 'GOOD' : 'NEEDS_PRACTICE',
          lastUpdated: Date.now()
        },
        interview: {
          moduleName: 'interview',
          label: 'Interview Score',
          score: interviewScore,
          weight: W_INTERVIEW,
          weightedScore: weightedInterview,
          attemptsCount: interviewCount,
          technicalAvg,
          commAvg,
          status: interviewScore >= 80 ? 'EXCELLENT' : interviewScore >= 65 ? 'GOOD' : 'NEEDS_PRACTICE',
          lastUpdated: Date.now()
        }
      },
      categoryBreakdown: {
        quantitative: quantAcc,
        logical: logicalAcc,
        verbal: verbalAcc,
        dsaCoding: codingScore,
        webDev: Math.round((resumeScore + codingScore) / 2),
        communication: commAvg
      },
      companyReadiness,
      dynamicRecommendations,
      performanceHistory: [
        {
          timestamp: Date.now(),
          readinessScore: overallReadinessScore,
          resumeScore,
          codingScore,
          aptitudeScore,
          interviewScore
        }
      ],
      topStrengths: topStrengths.length > 0 ? topStrengths : ['Regular platform engagement'],
      criticalGaps: criticalGaps.length > 0 ? criticalGaps : ['Maintain consistent practice'],
      calculatedAt: Date.now()
    };

    // Save snapshot to database
    dbService.saveReadinessSnapshot(report);

    return report;
  }
}

export const readinessEngineService = new ReadinessEngineService();
