import { v4 as uuid } from 'uuid';
import { AptQuestion, AptCategory, Difficulty } from '../models/types.js';
import { dbService } from './dbService.js';
import seedQuestions from '../aptitudeBank.js';
import { generateProceduralQuestion } from './proceduralGenerators.js';

function shuffle<T>(arr: T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface TestSession {
  testId: string;
  userId: string;
  questions: AptQuestion[];
  categoryConfig: AptCategory[] | 'all';
  difficultyConfig: Difficulty | 'adaptive';
  startedAt: number;
  durationSec: number;
}

const activeSessions = new Map<string, TestSession>();

export async function createAdaptiveTestSession(
  userId: string = 'anon',
  categoryConfig: AptCategory[] | 'all' = 'all',
  difficultyConfig: Difficulty | 'adaptive' = 'medium',
  count: number = 20,
  durationSec: number = 30 * 60
): Promise<{ testId: string; questions: Omit<AptQuestion, 'answerIndex' | 'explanation'>[]; totalQuestions: number; totalTimeSec: number }> {
  // Ensure DB seed question pool is loaded
  dbService.saveQuestions(seedQuestions);
  const allDbQuestions = dbService.getQuestions();

  const userHistory = dbService.getUserHistory(userId);
  const attemptedIds = new Set(userHistory.attemptedQuestionIds);
  const attemptedHashes = new Set(userHistory.attemptedHashes);

  const selectedQuestions: AptQuestion[] = [];

  const categoriesToFetch: AptCategory[] =
    categoryConfig === 'all'
      ? ['Quantitative', 'Logical', 'Verbal', 'DataInterpretation']
      : categoryConfig;

  // Determine target count per category
  const questionsPerCategory = categoryConfig === 'all'
    ? Math.floor(count / 4) // 5 per category for 20 questions
    : count;

  for (const cat of categoriesToFetch) {
    let catPool = allDbQuestions.filter((q: AptQuestion) => q.category === cat);

    if (difficultyConfig !== 'adaptive') {
      catPool = catPool.filter((q: AptQuestion) => q.difficulty === difficultyConfig);
    }

    // Exclude attempted questions for this user
    let unattempted = catPool.filter(
      (q: AptQuestion) => !attemptedIds.has(q.id) && !attemptedHashes.has(q.contentHash || '')
    );

    unattempted = shuffle(unattempted);

    const needed = categoryConfig === 'all' ? questionsPerCategory : count - selectedQuestions.length;
    const fromPool = unattempted.slice(0, needed);
    selectedQuestions.push(...fromPool);

    // If unattempted pool is not enough, dynamically generate procedural questions!
    const stillNeeded = needed - fromPool.length;
    if (stillNeeded > 0) {
      let tries = 0;
      while (selectedQuestions.length < (categoryConfig === 'all' ? selectedQuestions.length + stillNeeded : count) && tries < stillNeeded * 5) {
        tries++;
        const targetDiff = difficultyConfig === 'adaptive' ? 'medium' : difficultyConfig;
        const dynamicQ = generateProceduralQuestion(cat, targetDiff);
        if (!attemptedHashes.has(dynamicQ.contentHash || '')) {
          selectedQuestions.push(dynamicQ);
          attemptedHashes.add(dynamicQ.contentHash || '');
        }
      }
    }
  }

  // Final trim or top-up if any shortfall remains
  while (selectedQuestions.length < count) {
    const fallbackCat = categoriesToFetch[selectedQuestions.length % categoriesToFetch.length];
    const targetDiff = difficultyConfig === 'adaptive' ? 'medium' : difficultyConfig;
    const extraQ = generateProceduralQuestion(fallbackCat, targetDiff);
    selectedQuestions.push(extraQ);
  }

  const finalQuestions = selectedQuestions.slice(0, count);

  // Record attempted IDs and hashes for this user so they NEVER repeat!
  const newIds = finalQuestions.map((q) => q.id);
  const newHashes = finalQuestions.map((q) => q.contentHash || '').filter(Boolean);
  dbService.recordUserAttemptedQuestions(userId, newIds, newHashes);

  const testId = uuid();
  const session: TestSession = {
    testId,
    userId,
    questions: finalQuestions,
    categoryConfig,
    difficultyConfig,
    startedAt: Date.now(),
    durationSec,
  };

  activeSessions.set(testId, session);

  // Return questions stripped of answerIndex and explanation for security during test execution
  const clientQuestions = finalQuestions.map((q) => ({
    id: q.id,
    category: q.category,
    topic: q.topic,
    difficulty: q.difficulty,
    question: q.question,
    options: q.options,
  }));

  return {
    testId,
    questions: clientQuestions,
    totalQuestions: clientQuestions.length,
    totalTimeSec: durationSec,
  };
}

export function getSession(testId: string): TestSession | undefined {
  return activeSessions.get(testId);
}

export function removeSession(testId: string) {
  activeSessions.delete(testId);
}
