import { createHash } from 'crypto';
import { v4 as uuid } from 'uuid';
import { codingBank } from '../data/codingBank.js';
import { CodingQuestion, CodingAssessmentSession, DSATopic } from '../models/codingTypes.js';

function hashString(str: string): number {
  const hash = createHash('md5').update(str).digest('hex');
  return parseInt(hash.substring(0, 8), 16);
}

class CodingEngine {
  public generateAssessment(userId: string, customAttemptId?: string): CodingAssessmentSession {
    const attemptId = customAttemptId || `coding-attempt-${Date.now()}`;
    const seed = `${userId}-${attemptId}`;
    const seedNumber = hashString(seed);

    const easyPool = codingBank.filter((q) => q.difficulty === 'easy');
    const mediumPool = codingBank.filter((q) => q.difficulty === 'medium');
    const hardPool = codingBank.filter((q) => q.difficulty === 'hard');

    const chosenQuestions: CodingQuestion[] = [];
    const usedTopics = new Set<DSATopic>();

    // 1. Pick 1 Easy question
    const shuffledEasy = this.shufflePool(easyPool, seedNumber);
    const easyQ = shuffledEasy.find((q) => !usedTopics.has(q.topic));
    if (easyQ) {
      chosenQuestions.push(easyQ);
      usedTopics.add(easyQ.topic);
    }

    // 2. Pick 2 Medium questions (with non-overlapping topics)
    const shuffledMedium = this.shufflePool(mediumPool, seedNumber + 1);
    for (const q of shuffledMedium) {
      if (!usedTopics.has(q.topic)) {
        chosenQuestions.push(q);
        usedTopics.add(q.topic);
        if (chosenQuestions.length === 3) break;
      }
    }

    // 3. Pick 1 Hard question (with non-overlapping topic)
    const shuffledHard = this.shufflePool(hardPool, seedNumber + 2);
    const hardQ = shuffledHard.find((q) => !usedTopics.has(q.topic));
    if (hardQ) {
      chosenQuestions.push(hardQ);
      usedTopics.add(hardQ.topic);
    }

    // Fallback if pools constrained
    if (chosenQuestions.length < 4) {
      for (const q of codingBank) {
        if (!chosenQuestions.some((cq) => cq.id === q.id)) {
          chosenQuestions.push(q);
          if (chosenQuestions.length === 4) break;
        }
      }
    }

    const durationMinutes = 90;
    const startTime = Date.now();
    const expiresAt = startTime + durationMinutes * 60 * 1000;

    return {
      assessmentId: attemptId,
      userId,
      questions: chosenQuestions,
      durationMinutes,
      startTime,
      expiresAt,
    };
  }

  private shufflePool(pool: CodingQuestion[], seed: number): CodingQuestion[] {
    const arr = [...pool];
    let m = arr.length;
    let t: CodingQuestion;
    let i: number;

    let localSeed = seed;
    const pseudoRandom = () => {
      localSeed = (localSeed * 9301 + 49297) % 233280;
      return localSeed / 233280;
    };

    while (m) {
      i = Math.floor(pseudoRandom() * m--);
      t = arr[m];
      arr[m] = arr[i];
      arr[i] = t;
    }

    return arr;
  }
}

export const codingEngine = new CodingEngine();
