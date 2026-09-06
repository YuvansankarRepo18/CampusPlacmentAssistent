import { v4 as uuid } from 'uuid';
import {
  TestAttempt,
  QuestionResultDetail,
  PerformanceAnalytics,
  TopicInsight,
  AIRoadmapItem,
  AptCategory,
  AptQuestion
} from '../models/types.js';
import { dbService } from './dbService.js';
import { getSession, removeSession } from './testEngine.js';

export function evaluateTestSubmission(
  testId: string,
  userAnswers: Record<string, number>, // questionId -> selectedIndex
  userId: string = 'anon',
  timeSpentSec: number = 0
): {
  attempt: TestAttempt;
  questionDetails: QuestionResultDetail[];
  analytics: PerformanceAnalytics;
} {
  const session = getSession(testId);
  if (!session) {
    throw new Error('Test session not found or expired.');
  }

  let correctCount = 0;
  const totalQuestions = session.questions.length;
  const questionDetails: QuestionResultDetail[] = [];

  const categoryStats: Record<string, { correct: number; total: number; accuracy: number }> = {};
  const topicStats: Record<string, { correct: number; total: number; accuracy: number }> = {};

  for (const q of session.questions) {
    const selectedIndex = userAnswers[q.id] ?? -1;
    const isCorrect = selectedIndex === q.answerIndex;

    if (isCorrect) correctCount++;

    // Category Stats
    categoryStats[q.category] = categoryStats[q.category] || { correct: 0, total: 0, accuracy: 0 };
    categoryStats[q.category].total++;
    if (isCorrect) categoryStats[q.category].correct++;

    // Topic Stats
    topicStats[q.topic] = topicStats[q.topic] || { correct: 0, total: 0, accuracy: 0 };
    topicStats[q.topic].total++;
    if (isCorrect) topicStats[q.topic].correct++;

    questionDetails.push({
      id: q.id,
      question: q.question,
      options: q.options,
      category: q.category,
      topic: q.topic,
      difficulty: q.difficulty,
      selectedIndex,
      correctIndex: q.answerIndex,
      isCorrect,
      explanation: q.explanation || 'Step-by-step solution not provided.'
    });
  }

  // Calculate percentages
  for (const cat in categoryStats) {
    const s = categoryStats[cat];
    s.accuracy = s.total ? Math.round((s.correct / s.total) * 100) : 0;
  }
  for (const t in topicStats) {
    const s = topicStats[t];
    s.accuracy = s.total ? Math.round((s.correct / s.total) * 100) : 0;
  }

  const accuracy = totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const attempt: TestAttempt = {
    id: uuid(),
    userId,
    categoryConfig: session.categoryConfig,
    difficultyConfig: session.difficultyConfig,
    questions: session.questions,
    answers: userAnswers,
    score: correctCount,
    total: totalQuestions,
    accuracy,
    durationSec: session.durationSec,
    timeSpentSec: timeSpentSec || Math.round((Date.now() - session.startedAt) / 1000),
    categoryStats,
    topicStats,
    createdAt: Date.now()
  };

  dbService.saveTestAttempt(attempt);
  removeSession(testId);

  const analytics = getUserAnalytics(userId);

  return { attempt, questionDetails, analytics };
}

export function getUserAnalytics(userId: string = 'anon'): PerformanceAnalytics {
  const attempts = dbService.getUserTestAttempts(userId);

  if (attempts.length === 0) {
    return {
      testsAttempted: 0,
      totalQuestionsAttempted: 0,
      averageScore: 0,
      bestScore: 0,
      overallAccuracy: 0,
      categoryPerformance: {
        Quantitative: { attempted: 0, correct: 0, accuracy: 0 },
        Logical: { attempted: 0, correct: 0, accuracy: 0 },
        Verbal: { attempted: 0, correct: 0, accuracy: 0 },
        DataInterpretation: { attempted: 0, correct: 0, accuracy: 0 }
      },
      strengths: [],
      weaknesses: [],
      roadmap: getDefaultRoadmap(),
      recentAttempts: []
    };
  }

  const testsAttempted = attempts.length;
  let totalScore = 0;
  let totalQuestions = 0;
  let totalCorrect = 0;
  let bestScore = 0;

  const catAgg: Record<AptCategory, { attempted: number; correct: number; accuracy: number }> = {
    Quantitative: { attempted: 0, correct: 0, accuracy: 0 },
    Logical: { attempted: 0, correct: 0, accuracy: 0 },
    Verbal: { attempted: 0, correct: 0, accuracy: 0 },
    DataInterpretation: { attempted: 0, correct: 0, accuracy: 0 }
  };

  const topicAgg: Record<string, { category: AptCategory; attempted: number; correct: number }> = {};

  for (const att of attempts) {
    totalScore += att.score;
    totalQuestions += att.total;
    totalCorrect += att.score;
    if (att.score > bestScore) bestScore = att.score;

    for (const [cat, s] of Object.entries(att.categoryStats as Record<string, { correct: number; total: number; accuracy: number }>)) {
      const validCat = cat as AptCategory;
      if (catAgg[validCat]) {
        catAgg[validCat].attempted += s.total;
        catAgg[validCat].correct += s.correct;
      }
    }

    for (const [top, s] of Object.entries(att.topicStats as Record<string, { correct: number; total: number; accuracy: number }>)) {
      let foundCat: AptCategory = 'Quantitative';
      if (att.questions) {
        const matchingQ = att.questions.find((q: AptQuestion) => q.topic === top);
        if (matchingQ) foundCat = matchingQ.category;
      }
      topicAgg[top] = topicAgg[top] || { category: foundCat, attempted: 0, correct: 0 };
      topicAgg[top].attempted += s.total;
      topicAgg[top].correct += s.correct;
    }
  }

  for (const cat in catAgg) {
    const c = catAgg[cat as AptCategory];
    c.accuracy = c.attempted ? Math.round((c.correct / c.attempted) * 100) : 0;
  }

  const strengths: TopicInsight[] = [];
  const weaknesses: TopicInsight[] = [];

  for (const [topic, stat] of Object.entries(topicAgg)) {
    const acc = stat.attempted ? Math.round((stat.correct / stat.attempted) * 100) : 0;
    const insight: TopicInsight = {
      topic,
      category: stat.category,
      accuracy: acc,
      totalAttempted: stat.attempted,
      status: acc >= 75 ? 'Strong' : acc >= 50 ? 'Moderate' : 'Weak'
    };

    if (acc >= 75) strengths.push(insight);
    else if (acc < 60) weaknesses.push(insight);
  }

  const overallAccuracy = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const recentAttempts = attempts.slice(0, 5).map((a: TestAttempt) => ({
    id: a.id,
    date: new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    score: a.score,
    total: a.total,
    accuracy: a.accuracy,
    category: Array.isArray(a.categoryConfig) ? a.categoryConfig.join(', ') : 'All Categories'
  }));

  const roadmap = generateAIRoadmap(weaknesses, catAgg);

  return {
    testsAttempted,
    totalQuestionsAttempted: totalQuestions,
    averageScore: Math.round(totalScore / testsAttempted),
    bestScore,
    overallAccuracy,
    categoryPerformance: catAgg,
    strengths,
    weaknesses,
    roadmap,
    recentAttempts
  };
}

function generateAIRoadmap(
  weaknesses: TopicInsight[],
  catPerformance: Record<AptCategory, { attempted: number; correct: number; accuracy: number }>
): AIRoadmapItem[] {
  const roadmap: AIRoadmapItem[] = [];

  // Find lowest category
  const sortedCats = (Object.keys(catPerformance) as AptCategory[]).sort(
    (a, b) => catPerformance[a].accuracy - catPerformance[b].accuracy
  );

  const lowestCat = sortedCats[0];
  const lowestCatAcc = catPerformance[lowestCat].accuracy;

  if (lowestCatAcc < 70) {
    roadmap.push({
      id: 'rm-1',
      title: `Master ${lowestCat} Fundamentals`,
      description: `Your ${lowestCat} accuracy is currently at ${lowestCatAcc}%. Focus on key formulas and problem-solving shortcuts.`,
      category: lowestCat,
      priority: 'High',
      actionableSteps: [
        `Review step-by-step solutions for ${lowestCat} topics.`,
        `Solve 2 timed practice sets of 20 questions each.`,
        `Memorize core formulas and shortcut techniques.`
      ],
      estimatedHours: 4
    });
  }

  if (weaknesses.length > 0) {
    const targetWeakness = weaknesses[0];
    roadmap.push({
      id: 'rm-2',
      title: `Targeted Practice: ${targetWeakness.topic}`,
      description: `Topic accuracy is ${targetWeakness.accuracy}%. Focused drill will significantly boost overall score.`,
      category: targetWeakness.category,
      priority: 'High',
      actionableSteps: [
        `Complete 15 high-difficulty questions on ${targetWeakness.topic}.`,
        `Analyze mistake reasons (Calculation Error vs. Concept Gap).`
      ],
      estimatedHours: 3
    });
  }

  roadmap.push({
    id: 'rm-3',
    title: 'Full Mock Test & Time Management Strategy',
    description: 'Simulate AMCAT/HackerRank speed test conditions with balanced 20-question mock tests.',
    category: 'Quantitative',
    priority: 'Medium',
    actionableSteps: [
      'Aim for under 1.5 minutes per question average.',
      'Skip and mark questions for review if taking over 2 minutes.'
    ],
    estimatedHours: 5
  });

  return roadmap;
}

function getDefaultRoadmap(): AIRoadmapItem[] {
  return [
    {
      id: 'rm-default-1',
      title: 'Take Initial 20-Question Full Assessment',
      description: 'Establish your baseline placement readiness score across Quantitative, Logical, Verbal, and Data Interpretation.',
      category: 'Quantitative',
      priority: 'High',
      actionableSteps: [
        'Complete a 20-question "All Categories" mock test.',
        'Review explanations for all incorrect answers.'
      ],
      estimatedHours: 1
    }
  ];
}
