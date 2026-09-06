import dotenv from 'dotenv';
import { codingBank } from '../data/codingBank.js';
import {
  CodingQuestion,
  SupportedLanguage,
  TestCaseResult,
  QuestionEvaluationResult,
  SolutionDraft,
  CodingTestAttempt,
} from '../models/codingTypes.js';
import { dbService } from './dbService.js';
import { codeExecutionEngine, isDefaultStarterCode } from './codeExecutionEngine.js';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

class CodingEvaluationService {
  public findQuestion(id: string): CodingQuestion | undefined {
    return codingBank.find((q) => q.id === id);
  }

  public async runSampleCode(
    questionId: string,
    language: SupportedLanguage,
    code: string,
    customInput?: string
  ): Promise<{ testResults: TestCaseResult[]; executionTimeMs: number }> {
    const question = this.findQuestion(questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    const testCasesToRun = customInput
      ? [{ input: customInput, expectedOutput: 'Custom Execution', isHidden: false }]
      : question.visibleTestCases;

    const summary = await codeExecutionEngine.executeSubmission(language, code, testCasesToRun);
    return {
      testResults: summary.testResults,
      executionTimeMs: summary.executionTimeMs,
    };
  }

  public async evaluateQuestionSubmission(
    questionId: string,
    language: SupportedLanguage,
    code: string
  ): Promise<QuestionEvaluationResult> {
    const question = this.findQuestion(questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    // 1. Check if submission is empty or unchanged starter template
    if (isDefaultStarterCode(code)) {
      const allTestCases = [...question.visibleTestCases, ...question.hiddenTestCases];
      const testResults: TestCaseResult[] = allTestCases.map((tc, idx) => ({
        testCaseIndex: idx,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: 'No solution code submitted',
        passed: false,
        runtimeMs: 0,
        isHidden: !!tc.isHidden,
        error: 'Empty or starter template code'
      }));

      return {
        questionId,
        passedCount: 0,
        totalTestCases: allTestCases.length,
        correctnessScore: 0,
        testResults,
        actualTimeComplexity: 'N/A',
        actualSpaceComplexity: 'N/A',
        complexityScore: 0,
        codeQuality: {
          score: 0,
          readability: 0,
          namingConventions: 0,
          modularity: 0,
          formatting: 0,
        },
        suggestions: ['Please write your solution code before submitting.'],
        executionTimeMs: 0,
        memoryUsageMb: 0,
        isEmptyCode: true,
        isStarterCode: true,
        mistakeAnalysis: 'No solution code submitted. AI evaluation cannot be generated.',
        complexityComparison: 'Submitted: N/A vs Expected: ' + question.expectedTimeComplexity,
        overallFeedback: 'No solution submitted. Please write your code in the editor and click Submit Question.'
      };
    }

    // 2. Execute code against hidden and visible test cases
    const allTestCases = [...question.visibleTestCases, ...question.hiddenTestCases];
    const execSummary = await codeExecutionEngine.executeSubmission(language, code, allTestCases);

    const correctnessScore = Math.round((execSummary.passedCount / allTestCases.length) * 100);

    // 3. AI Code Evaluation & Complexity Analysis
    const aiAnalysis = await this.generateAIEvaluation(question, code, language, execSummary);

    return {
      questionId,
      passedCount: execSummary.passedCount,
      totalTestCases: allTestCases.length,
      correctnessScore,
      testResults: execSummary.testResults,
      actualTimeComplexity: aiAnalysis.actualTimeComplexity,
      actualSpaceComplexity: aiAnalysis.actualSpaceComplexity,
      complexityScore: aiAnalysis.complexityScore,
      codeQuality: aiAnalysis.codeQuality,
      suggestions: aiAnalysis.suggestions,
      executionTimeMs: execSummary.executionTimeMs,
      memoryUsageMb: execSummary.memoryUsageMb,
      isEmptyCode: false,
      isStarterCode: false,
      mistakeAnalysis: aiAnalysis.mistakeAnalysis,
      complexityComparison: `Submitted Time: ${aiAnalysis.actualTimeComplexity} (Expected: ${question.expectedTimeComplexity}) | Submitted Space: ${aiAnalysis.actualSpaceComplexity} (Expected: ${question.expectedSpaceComplexity})`,
      overallFeedback: aiAnalysis.overallFeedback,
    };
  }

  private async generateAIEvaluation(
    question: CodingQuestion,
    code: string,
    language: SupportedLanguage,
    execSummary: { passedCount: number; totalCount: number; testResults: TestCaseResult[]; executionTimeMs: number }
  ) {
    // Attempt Gemini AI prompt first if key available
    if (GEMINI_API_KEY) {
      try {
        const prompt = `Analyze this candidate's DSA code submission for the question "${question.title}".
Problem: ${question.description}
Expected Complexity: Time ${question.expectedTimeComplexity}, Space ${question.expectedSpaceComplexity}
Submitted Language: ${language}
Submitted Code:
\`\`\`${language}
${code}
\`\`\`
Execution Results: Passed ${execSummary.passedCount} of ${execSummary.totalCount} test cases.

Return ONLY a JSON object with this exact structure:
{
  "actualTimeComplexity": "O(...)",
  "actualSpaceComplexity": "O(...)",
  "complexityScore": number (0 to 100),
  "mistakeAnalysis": "Detailed analysis of errors, logical flaws, or edge cases missed",
  "overallFeedback": "Summary feedback of the solution quality",
  "readability": number (0-100),
  "namingConventions": number (0-100),
  "modularity": number (0-100),
  "formatting": number (0-100),
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          }
        );

        if (res.ok) {
          const data: any = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            const qualityScore = Math.round(
              ((parsed.readability || 70) +
                (parsed.namingConventions || 70) +
                (parsed.modularity || 70) +
                (parsed.formatting || 70)) /
                4
            );
            return {
              actualTimeComplexity: parsed.actualTimeComplexity || question.expectedTimeComplexity,
              actualSpaceComplexity: parsed.actualSpaceComplexity || question.expectedSpaceComplexity,
              complexityScore: parsed.complexityScore ?? (execSummary.passedCount > 0 ? 80 : 20),
              mistakeAnalysis: parsed.mistakeAnalysis || 'Solution evaluation completed.',
              overallFeedback: parsed.overallFeedback || 'Code analyzed.',
              codeQuality: {
                score: qualityScore,
                readability: parsed.readability || 70,
                namingConventions: parsed.namingConventions || 70,
                modularity: parsed.modularity || 70,
                formatting: parsed.formatting || 70,
              },
              suggestions: parsed.suggestions || [],
            };
          }
        }
      } catch (err) {
        console.warn('Gemini API call for code eval failed, using intelligent static analysis:', err);
      }
    }

    // Static Analysis Fallback Engine
    const lines = code.split('\n').filter((l) => l.trim().length > 0);
    const hasLoops = /for\b|while\b/.test(code);
    const loopMatches = (code.match(/for\b|while\b/g) || []).length;
    const hasRecursion = new RegExp(`def\\s+\\w+|function\\b|${question.slug.replace(/-/g, '_')}`).test(code);

    let estimatedTime = question.expectedTimeComplexity;
    if (loopMatches >= 2) estimatedTime = 'O(N^2)';
    else if (loopMatches === 1) estimatedTime = 'O(N)';
    else if (hasRecursion) estimatedTime = 'O(2^N)';

    let estimatedSpace = question.expectedSpaceComplexity;
    if (/map\b|dict\b|Set\b|list\b|vector\b|new\b/.test(code)) estimatedSpace = 'O(N)';

    const isPassedAll = execSummary.passedCount === execSummary.totalCount;
    const mistakeAnalysis = isPassedAll
      ? `All ${execSummary.totalCount} test cases passed successfully! The algorithm correctly handles inputs and edge cases.`
      : `Passed ${execSummary.passedCount} out of ${execSummary.totalCount} test cases. ` +
        (execSummary.passedCount === 0
          ? 'The code produced incorrect outputs or runtime errors across all test cases. Verify variable initialization and indexing.'
          : 'Failed on edge cases or boundary conditions. Check array bounds and empty inputs.');

    const suggestions: string[] = [];
    if (!isPassedAll) {
      suggestions.push('Review failing test case inputs and test edge cases like empty arrays or zero.');
      if (estimatedTime !== question.expectedTimeComplexity) {
        suggestions.push(`Optimize time complexity from ${estimatedTime} to ${question.expectedTimeComplexity}.`);
      }
    } else {
      suggestions.push(`Optimal time complexity achieved (${estimatedTime}).`);
      suggestions.push('Add inline comments explaining key loop invariants and edge case guards.');
    }

    const readability = Math.min(100, 40 + (lines.length > 5 ? 30 : 15) + (code.includes('#') || code.includes('//') ? 20 : 0));
    const namingConventions = Math.min(100, /let|var|const|int|def|class|val|target|nums/.test(code) ? 85 : 60);
    const modularity = Math.min(100, code.includes('return') ? 90 : 50);
    const formatting = Math.min(100, lines.length >= 4 ? 90 : 60);
    const qualityScore = isPassedAll ? Math.round((readability + namingConventions + modularity + formatting) / 4) : Math.round(((readability + namingConventions + modularity + formatting) / 4) * 0.6);

    return {
      actualTimeComplexity: estimatedTime,
      actualSpaceComplexity: estimatedSpace,
      complexityScore: isPassedAll ? 95 : Math.round((execSummary.passedCount / execSummary.totalCount) * 70),
      mistakeAnalysis,
      overallFeedback: isPassedAll
        ? 'Excellent solution! Passed all test cases with optimal performance.'
        : `Submission failed ${execSummary.totalCount - execSummary.passedCount} test case(s). Refactor your logic and try again.`,
      codeQuality: {
        score: qualityScore,
        readability,
        namingConventions,
        modularity,
        formatting,
      },
      suggestions,
    };
  }

  public async evaluateFullAssessment(
    userId: string,
    userName: string,
    userEmail: string,
    assessmentId: string,
    startTime: number,
    questions: CodingQuestion[],
    solutions: Record<string, SolutionDraft>
  ): Promise<CodingTestAttempt> {
    const completedAt = Date.now();
    const durationSeconds = Math.max(1, Math.round((completedAt - startTime) / 1000));

    let totalScore = 0;
    let solvedQuestionsCount = 0;
    let totalPassedCases = 0;
    let totalTestCasesCount = 0;
    const topicBreakdown: Record<string, { total: number; score: number; passed: boolean }> = {};

    const questionsSummary = questions.map((q) => ({
      id: q.id,
      title: q.title,
      topic: q.topic,
      difficulty: q.difficulty,
    }));

    for (const q of questions) {
      const draft = solutions[q.id];
      let score = 0;
      let isPassed = false;

      if (draft && draft.code && !isDefaultStarterCode(draft.code)) {
        const evalResult = await this.evaluateQuestionSubmission(q.id, draft.language, draft.code);
        draft.evaluation = evalResult;
        draft.isSubmitted = true;

        totalPassedCases += evalResult.passedCount;
        totalTestCasesCount += evalResult.totalTestCases;

        score = evalResult.correctnessScore; // 0 to 100
        if (evalResult.correctnessScore >= 100) {
          isPassed = true;
          solvedQuestionsCount++;
        }
      } else {
        totalTestCasesCount += (q.visibleTestCases.length + q.hiddenTestCases.length);
      }

      totalScore += score;
      topicBreakdown[q.topic] = {
        total: 100,
        score,
        passed: isPassed,
      };
    }

    const accuracy = totalTestCasesCount > 0 ? Math.round((totalPassedCases / totalTestCasesCount) * 100) : 0;

    let status: 'Completed' | 'In Progress' | 'Incomplete' | 'Failed' = 'Completed';
    if (totalScore === 0 || solvedQuestionsCount === 0) {
      status = 'Failed';
    }

    const attempt: CodingTestAttempt = {
      attemptId: assessmentId,
      userId,
      userName,
      userEmail,
      startTime,
      completedAt,
      durationSeconds,
      totalScore,
      maxScore: 400,
      solvedQuestionsCount,
      accuracy,
      status,
      topicBreakdown,
      questionSolutions: solutions,
      questionsSummary,
    };

    dbService.saveCodingAttempt(attempt);
    return attempt;
  }
}

export const codingEvaluationService = new CodingEvaluationService();
