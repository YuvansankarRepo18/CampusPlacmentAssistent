import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv';
import { dbService } from './dbService.js';
import { ragContextService } from './ragContextService.js';
import {
  CoachingMode,
  CoachMessage,
  UserActionPlan,
  ActionItem,
  ProactiveInsight,
  PlanGenerationOptions,
  StudentPlacementContext
} from '../models/coachTypes.js';

dotenv.config();

export class CoachEngineService {
  /**
   * Intelligently determines whether the user query requires placement/performance context
   * and identifies which specific performance modules are relevant.
   */
  public determineRelevantContext(
    userInput: string,
    history: CoachMessage[] = []
  ): {
    isPlacementRelated: boolean;
    modules: { aptitude: boolean; interview: boolean; resume: boolean; coding: boolean; readiness: boolean };
  } {
    const lower = userInput.toLowerCase().trim();

    // Specific Module Triggers
    const hasAptitude = /(aptitude|quant|quantitative|logical reasoning|verbal ability|data interpretation|math question|puzzle|my aptitude|aptitude score|aptitude accuracy)/i.test(lower);
    const hasInterview = /(mock interview|interview|hr round|technical round|behavioral|communication score|star method|interview score|interview feedback|my interview)/i.test(lower);
    const hasResume = /(resume|ats|cv|ats score|missing keywords|resume score|formatting check|resume feedback|my resume)/i.test(lower);
    const hasCoding = /(dsa|leetcode|coding assessment|coding score|coding accuracy|solved problems|leaderboard|my coding|coding performance|dynamic programming weakness)/i.test(lower);
    const hasReadiness = /(placement|campus placement|readiness|ready for|am i ready|where am i weak|what should i improve|what should i focus|my performance|my strength|my weakness|preparation plan|30-day plan|study roadmap|placement strategy|what to study this week|skill improvement)/i.test(lower);

    // Context continuation check for short follow-up questions (e.g. "What should I improve first?", "Where am I weak?")
    let isFollowUpPlacement = false;
    if (history.length > 0 && lower.length < 60) {
      const recentUserMsgs = [...history].reverse().filter(m => m.role === 'user').slice(0, 2);
      for (const msg of recentUserMsgs) {
        if (/(aptitude|interview|resume|ats|coding|placement|readiness|score|weakness|performance|study)/i.test(msg.content.toLowerCase())) {
          isFollowUpPlacement = true;
          break;
        }
      }
    }

    const isPlacementRelated = hasAptitude || hasInterview || hasResume || hasCoding || hasReadiness || isFollowUpPlacement;

    // Check if prompt is a general greeting / smalltalk / programming Q without explicit personal metrics request
    const isGreeting = /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|howdy|sup)[\s!.]*$/i.test(lower);
    const isSmallTalk = /^(how are you|how are you doing|who are you|what is your name|tell me a joke)[\s!.]*$/i.test(lower);
    const isGeneralQ = /^(what is|explain|how does|what are|define|why is|help me write|write an email|capital of|tell me|who created) /i.test(lower) &&
      !/(aptitude|ats|resume|mock interview|placement|my score|my performance|my readiness|my accuracy|my dsa|my coding|my rank|my weakness|my strength)/i.test(lower);

    if ((isGreeting || isSmallTalk || isGeneralQ) && !isPlacementRelated) {
      return {
        isPlacementRelated: false,
        modules: { aptitude: false, interview: false, resume: false, coding: false, readiness: false },
      };
    }

    if (!isPlacementRelated) {
      return {
        isPlacementRelated: false,
        modules: { aptitude: false, interview: false, resume: false, coding: false, readiness: false },
      };
    }

    const isOverallQuery = hasReadiness || isFollowUpPlacement || (hasAptitude && hasCoding);

    return {
      isPlacementRelated: true,
      modules: {
        aptitude: hasAptitude || isOverallQuery,
        interview: hasInterview || isOverallQuery,
        resume: hasResume || isOverallQuery,
        coding: hasCoding || isOverallQuery,
        readiness: hasReadiness || isOverallQuery,
      },
    };
  }

  /**
   * Automatically routes user input to the appropriate coaching mode if mode is 'General' or auto-detect is enabled
   */
  public detectCoachingMode(input: string, currentMode: CoachingMode): CoachingMode {
    if (currentMode !== 'General') return currentMode;

    const lower = input.toLowerCase();
    if (lower.includes('resume') || lower.includes('ats') || lower.includes('cv') || lower.includes('keyword')) {
      return 'Resume';
    }
    if (lower.includes('code') || lower.includes('coding') || lower.includes('dsa') || lower.includes('algorithm') || lower.includes('leetcode') || lower.includes('dp') || lower.includes('graph')) {
      return 'Coding';
    }
    if (lower.includes('aptitude') || lower.includes('quant') || lower.includes('logical') || lower.includes('reasoning') || lower.includes('math') || lower.includes('verbal')) {
      return 'Aptitude';
    }
    if (lower.includes('interview') || lower.includes('hr') || lower.includes('mock') || lower.includes('communication') || lower.includes('star')) {
      return 'Interview';
    }
    if (lower.includes('company') || lower.includes('google') || lower.includes('amazon') || lower.includes('tcs') || lower.includes('role') || lower.includes('career') || lower.includes('salary')) {
      return 'Career';
    }
    if (lower.includes('readiness') || lower.includes('plan') || lower.includes('30-day') || lower.includes('strategy') || lower.includes('roadmap') || lower.includes('predict')) {
      return 'Strategy';
    }
    return 'General';
  }

  /**
   * Triggers Proactive Insights generation based on student performance metrics across platform
   */
  public generateProactiveInsights(userId: string): ProactiveInsight[] {
    const ctx = ragContextService.getStudentPlacementContext(userId);
    const insights: ProactiveInsight[] = [];

    // 1. Check Aptitude Weakness
    if (ctx.aptitude.overallAccuracy < 60 || ctx.aptitude.weakestCategory !== 'None') {
      const category = ctx.aptitude.weakestCategory !== 'None' ? ctx.aptitude.weakestCategory : 'Logical Reasoning';
      insights.push({
        id: uuid(),
        userId,
        type: 'aptitude_weakness',
        title: `🎯 Target Improvement: ${category}`,
        summary: `Your ${category} accuracy is currently low (${ctx.aptitude.categoryPerformance[category as keyof typeof ctx.aptitude.categoryPerformance]?.accuracy || 45}%). Focused practice will boost your overall aptitude score.`,
        actionPrompt: `Generate a 7-day practice plan for ${category}`,
        topic: category,
        generatedAt: Date.now(),
        dismissed: false,
      });
    }

    // 2. Check ATS Score
    if (!ctx.resume.hasResume || ctx.resume.latestScore < 75) {
      insights.push({
        id: uuid(),
        userId,
        type: 'ats_low',
        title: '📄 Resume Keyword Optimization Required',
        summary: ctx.resume.hasResume
          ? `Your current ATS score is ${ctx.resume.latestScore}/100. Missing keywords like ${ctx.resume.missingKeywords.slice(0, 3).join(', ') || 'Docker, System Design'} are lowering your pass rate.`
          : 'You have not uploaded a resume for ATS analysis yet. Uploading a resume increases your placement match precision.',
        actionPrompt: 'How can I improve my ATS score to 85+?',
        topic: 'Resume',
        generatedAt: Date.now(),
        dismissed: false,
      });
    }

    // 3. Check Coding Weaknesses
    if (ctx.coding.weakestTopics.length > 0 || ctx.coding.totalAttempts === 0) {
      const topic = ctx.coding.weakestTopics[0] || 'Dynamic Programming & Graphs';
      insights.push({
        id: uuid(),
        userId,
        type: 'coding_weakness',
        title: `💻 DSA Weak Spot Detected: ${topic}`,
        summary: `Platform analytics indicate lower confidence in ${topic}. Solving targeted problem sets will raise your tech interview clearance rate.`,
        actionPrompt: `Suggest top coding problems to master ${topic}`,
        topic,
        generatedAt: Date.now(),
        dismissed: false,
      });
    }

    // 4. Check Interview Communication
    if (ctx.interview.totalSessions > 0 && ctx.interview.avgCommunicationScore < 70) {
      insights.push({
        id: uuid(),
        userId,
        type: 'interview_comm',
        title: '🗣️ Enhance Interview Communication',
        summary: `Your mock interview communication score averaged ${ctx.interview.avgCommunicationScore}/100. Practicing STAR method structuring will make your answers punchier.`,
        actionPrompt: 'Suggest communication exercises for technical interviews',
        topic: 'Interview',
        generatedAt: Date.now(),
        dismissed: false,
      });
    }

    // Save insights to DB
    insights.forEach((insight) => dbService.saveProactiveInsight(insight));
    return dbService.getProactiveInsights(userId);
  }

  /**
   * Generates or Updates a customized 30-day placement preparation plan with trackable action items
   */
  public generatePersonalizedPlan(userId: string, options?: PlanGenerationOptions): UserActionPlan {
    const ctx = ragContextService.getStudentPlacementContext(userId);
    const targetRole = options?.targetRole || ctx.user.targetRole || 'Software Development Engineer';
    const targetCompanies = options?.targetCompanies || ctx.user.targetCompanies || ['Google', 'Amazon', 'TCS Prime'];

    const items: ActionItem[] = [
      {
        id: uuid(),
        title: `Upload & Optimize Resume for ${targetRole}`,
        description: `Fix ATS formatting issues and add missing keywords (${ctx.resume.missingKeywords.slice(0, 3).join(', ') || 'System Design, Microservices'}).`,
        category: 'Resume',
        priority: 'High',
        completed: false,
        dueDate: 'Day 3',
      },
      {
        id: uuid(),
        title: `Master Weak Aptitude Area: ${ctx.aptitude.weakestCategory !== 'None' ? ctx.aptitude.weakestCategory : 'Logical Reasoning'}`,
        description: 'Complete 3 adaptive practice sessions targeting logical puzzles, syllogisms, and data arrangement.',
        category: 'Aptitude',
        topic: ctx.aptitude.weakestCategory,
        priority: 'High',
        completed: false,
        dueDate: 'Day 7',
      },
      {
        id: uuid(),
        title: `DSA Focus Sprint: ${ctx.coding.weakestTopics[0] || 'Dynamic Programming & Graphs'}`,
        description: 'Solve 5 Medium difficulty problems focusing on memoization, 2D grid DP, and BFS/DFS graph traversals.',
        category: 'Coding',
        topic: ctx.coding.weakestTopics[0] || 'Dynamic Programming',
        priority: 'High',
        completed: false,
        dueDate: 'Day 14',
      },
      {
        id: uuid(),
        title: 'Conduct AI Technical Mock Interview',
        description: 'Practice 1-on-1 technical interview simulation for SDE role with focus on code complexity explanation.',
        category: 'Interview',
        priority: 'Medium',
        completed: false,
        dueDate: 'Day 21',
      },
      {
        id: uuid(),
        title: `Target Company Prep: ${targetCompanies[0] || 'Tier-1 Product Companies'}`,
        description: `Review previous company interview questions and core computer science fundamentals for ${targetCompanies[0] || 'Tier-1'}.`,
        category: 'Strategy',
        targetCompany: targetCompanies[0],
        priority: 'Medium',
        completed: false,
        dueDate: 'Day 30',
      },
    ];

    const weeklySchedule = [
      {
        day: 'Week 1',
        focus: 'Resume ATS Optimization & Foundational Aptitude',
        tasks: ['Run ATS Checker on current resume', 'Fix missing tech keywords', 'Attempt 2 Quantitative & Logical Aptitude tests'],
      },
      {
        day: 'Week 2',
        focus: 'Core DSA Sprints (Arrays, Trees, Dynamic Programming)',
        tasks: ['Solve 4 Medium Array/String problems', 'Practice DP state transitions', 'Analyze code complexity in execution engine'],
      },
      {
        day: 'Week 3',
        focus: 'Technical Mock Interviews & Communication Drills',
        tasks: ['Complete AI Voice/Text Technical Mock Session', 'Practice STAR method for HR behavioral questions', 'Review system design basics'],
      },
      {
        day: 'Week 4',
        focus: 'Company-Specific Mock Rounds & Final Readiness Evaluation',
        tasks: [`Attempt ${targetCompanies[0]} specialized mock test`, 'Review Placement Readiness Score radar', 'Refine portfolio projects'],
      },
    ];

    const newPlan: UserActionPlan = {
      id: uuid(),
      userId,
      goalTitle: `30-Day Placement Sprint to Land ${targetRole} at ${targetCompanies[0] || 'Top Product Companies'}`,
      items,
      targetRole,
      targetCompanies,
      weeklySchedule,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    dbService.saveUserActionPlan(newPlan);
    return newPlan;
  }

  /**
   * Primary Chat Generation Pipeline combining RAG context, mode routing, LLM API call & fallback engine
   */
  public async generateCoachResponse(
    userId: string,
    sessionId: string,
    userInput: string,
    modeOverride?: CoachingMode
  ): Promise<{ responseMessage: CoachMessage; actionPlan?: UserActionPlan }> {
    const ctx = ragContextService.getStudentPlacementContext(userId);
    const activeMode = this.detectCoachingMode(userInput, modeOverride || 'General');

    // Save user message to memory
    const userMessage: CoachMessage = {
      id: uuid(),
      sessionId,
      userId,
      role: 'user',
      content: userInput,
      mode: activeMode,
      timestamp: Date.now(),
    };
    dbService.saveCoachMessage(userMessage);

    // Fetch conversation memory for active session
    const conversationHistory = dbService.getCoachMessages(sessionId);

    // ALWAYS query Gemini API first for ALL messages (general or placement)
    let generated = await this.queryGeminiLlm(userInput, activeMode, ctx, conversationHistory);

    if (!generated) {
      console.log('[CoachEngine] Gemini API call returned null. Using fallback synthesis engine.');
      generated = this.synthesizeResponse(userInput, activeMode, ctx, conversationHistory);
    }

    const { content, metadata } = generated;

    // Save assistant response to memory
    const assistantMessage: CoachMessage = {
      id: uuid(),
      sessionId,
      userId,
      role: 'assistant',
      content,
      mode: activeMode,
      metadata,
      timestamp: Date.now(),
    };
    dbService.saveCoachMessage(assistantMessage);

    const actionPlan = dbService.getUserActionPlan(userId) || undefined;

    return { responseMessage: assistantMessage, actionPlan };
  }

  /**
   * Queries Google Gemini API using dynamic RAG system context and conversation history
   */
  private async queryGeminiLlm(
    userInput: string,
    mode: CoachingMode,
    ctx: StudentPlacementContext,
    history: CoachMessage[]
  ): Promise<{ content: string; metadata?: CoachMessage['metadata'] } | null> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (!apiKey || apiKey.trim() === '' || apiKey === 'your_actual_gemini_api_key_here') {
      console.warn('[CoachEngine] GEMINI_API_KEY is not set or is using template placeholder in backend .env file. Falling back to synthesis.');
      return null;
    }

    try {
      const { isPlacementRelated, modules } = this.determineRelevantContext(userInput, history);

      console.log(`[CoachEngine] User message: "${userInput.slice(0, 80)}${userInput.length > 80 ? '...' : ''}"`);
      console.log(`[CoachEngine] Placement context required: ${isPlacementRelated}`);

      let ragSystemPrompt = '';
      if (isPlacementRelated) {
        ragSystemPrompt = ragContextService.buildSelectiveRagPromptSystemContext(ctx, modules);
      }

      const systemInstruction = `You are a general-purpose AI assistant and a personalized AI Placement & Career Coach integrated into a campus placement platform.

Answer the user's actual question directly and naturally.

You can answer:
- general knowledge questions (e.g. "What is ChatGPT?", "What is the capital of France?")
- casual conversation (e.g. "Hi", "How are you?", "Tell me a joke")
- educational and technical questions (e.g. "What is Python?", "Explain binary search", "Explain recursion")
- career and campus placement questions (e.g. "How am I doing in aptitude?", "How can I improve my resume?", "Am I ready for campus placements?")

You are NOT restricted to placement-related questions.

For general questions, casual conversation, or technical explanations, answer normally using your general knowledge and reasoning. Do not force general conversations toward campus placement.

For career and placement questions, use the student's performance context when it is provided below.

Student performance context may include:
- aptitude results
- mock interview results
- ATS resume results
- coding results

Use performance context only when it is relevant to the user's question. Never invent student performance information. If no performance context is provided, do not pretend that you know the student's performance.

Do not say that you are only a placement assistant.

Do not respond with generic statements such as "I'm here to assist you with general questions..." when the user has asked an actual question.

Answer the actual question.

Maintain natural conversational behavior similar to a general AI assistant while providing personalized career coaching when appropriate.

${ragSystemPrompt ? `=== STUDENT PERFORMANCE CONTEXT (RAG) ===\n${ragSystemPrompt}\n=========================================` : ''}`;

      // Build contents array for Gemini REST API
      const recentHistory = history.slice(-10); // keep recent context
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      recentHistory.forEach((msg) => {
        if (msg.role === 'user') {
          contents.push({ role: 'user', parts: [{ text: msg.content }] });
        } else if (msg.role === 'assistant') {
          contents.push({ role: 'model', parts: [{ text: msg.content }] });
        }
      });

      // Ensure last message is present
      if (contents.length === 0 || contents[contents.length - 1].parts[0].text !== userInput) {
        contents.push({ role: 'user', parts: [{ text: userInput }] });
      }

      // Candidate models list prioritizing working Gemini models
      const candidateModels = [
        'gemini-3.6-flash',
        'gemini-2.5-flash',
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro-latest'
      ];

      let responseText = '';
      let usedModel = '';

      for (const modelName of candidateModels) {
        try {
          console.log(`[CoachEngine] Querying Gemini model '${modelName}'...`);
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemInstruction }] },
              contents,
              generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                maxOutputTokens: 2048,
              },
            }),
          });

          if (res.ok) {
            const data: any = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim().length > 0) {
              responseText = text.trim();
              usedModel = modelName;
              console.log(`[CoachEngine] Gemini API call successful using model '${usedModel}'.`);
              break;
            }
          } else {
            const errText = await res.text();
            console.warn(`[CoachEngine] Model '${modelName}' call returned HTTP ${res.status}: ${errText}`);
          }
        } catch (err: any) {
          console.warn(`[CoachEngine] Network error attempting model '${modelName}':`, err?.message || err);
        }
      }

      if (!responseText) {
        console.warn('[CoachEngine] All Gemini candidate models failed. Falling back to rule synthesis.');
        return null;
      }

      return {
        content: responseText,
        metadata: {
          aiGenerated: true,
          modelUsed: usedModel,
          suggestedTopics: isPlacementRelated
            ? [
                'Analyze my placement readiness.',
                'How can I improve my ATS score?',
                'What should I study this week?',
                'Create a 30-day placement preparation plan.',
              ]
            : [
                'What is Python?',
                'Explain binary search.',
                'How am I doing in aptitude?',
                'Analyze my placement readiness.',
              ],
        },
      };
    } catch (err: any) {
      console.error('[CoachEngine] Exception during Gemini API call:', err);
      return null;
    }
  }

  /**
   * Fallback response engine used if Gemini API is unreachable or network error occurs
   */
  private synthesizeResponse(
    input: string,
    mode: CoachingMode,
    ctx: StudentPlacementContext,
    history: CoachMessage[]
  ): { content: string; metadata?: CoachMessage['metadata'] } {
    const lower = input.toLowerCase().trim();
    const { isPlacementRelated } = this.determineRelevantContext(input, history);

    // General Conversation Fallback Handling
    if (!isPlacementRelated) {
      if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|howdy|sup)/i.test(lower)) {
        return {
          content: `Hi **${ctx.user.name}**! I'm doing great and ready to help. What would you like to talk about today?`,
          metadata: {
            suggestedTopics: [
              'What is Python?',
              'Explain recursion in programming.',
              'How am I doing in aptitude?',
              'How can I improve my resume?',
            ],
          },
        };
      }

      if (lower.includes('how are you')) {
        return {
          content: `Hi! I'm doing great and ready to help. What would you like to talk about today?`,
        };
      }

      if (lower.includes('joke')) {
        return {
          content: `Here's a quick joke for you:\n\n*Why do programmers prefer dark mode?*\n*Because light attracts bugs!* 😄`,
        };
      }

      if (lower.includes('chatgpt')) {
        return {
          content: `**ChatGPT** is an artificial intelligence (AI) chatbot developed by **OpenAI** and launched in November 2022. It uses large language models (LLMs) to understand human prompt inputs and generate natural, human-like responses for writing, coding, reasoning, and answering questions.`,
        };
      }

      if (lower.includes('python')) {
        return {
          content: `### 🐍 What is Python?\n\n**Python** is a high-level, interpreted programming language known for its clear, readable syntax and versatile applications.\n\n#### Key Features:\n- **Easy to Read & Learn**: Clean syntax that resembles pseudocode.\n- **Versatile Ecosystem**: Web development (Django/Flask), AI/ML (PyTorch/TensorFlow), Data Science (Pandas/NumPy), and Automation.\n- **Dynamically Typed**: No need to declare variable types explicitly.\n\nWould you like a code example or an explanation of a specific Python concept?`,
        };
      }

      if (lower.includes('recursion')) {
        return {
          content: `### 🔄 What is Recursion?\n\n**Recursion** is a programming technique where a function calls itself to solve a smaller sub-problem until it hits a **base case**.\n\n#### Key Components:\n1. **Base Case**: Halts execution to prevent infinite loops / stack overflow.\n2. **Recursive Step**: Reduces problem size and calls the function again.\n\n#### Example (Factorial in JavaScript):\n\`\`\`js\nfunction factorial(n) {\n  if (n <= 1) return 1; // Base case\n  return n * factorial(n - 1); // Recursive step\n}\n\`\`\``,
        };
      }

      if (lower.includes('binary search')) {
        return {
          content: `### 🔍 Binary Search Algorithm\n\n**Binary Search** is an efficient searching algorithm for sorted arrays with a time complexity of **O(log N)**.\n\n#### How it works:\n1. Find middle element of array.\n2. If target equals middle, return index.\n3. If target < middle, search left half.\n4. If target > middle, search right half.\n5. Repeat until found or search range is empty.`,
        };
      }

      return {
        content: `I am happy to help answer any general knowledge, programming, or conceptual questions you have! Feel free to ask about any topic.`,
        metadata: {
          suggestedTopics: [
            'What is ChatGPT?',
            'What is Python?',
            'How am I doing in aptitude?',
            'How can I improve my ATS score?',
          ],
        },
      };
    }

    // 1. Placement Readiness Analysis
    if (lower.includes('readiness') || lower.includes('analyze my placement') || lower.includes('how ready am i') || lower.includes('ready for campus')) {
      const overall = ctx.readiness.overallScore;
      const prob = ctx.readiness.placementProbability;
      const tier = ctx.readiness.confidenceLevel;

      const response = `
### 📊 Personalized Placement Readiness Analysis

Hello **${ctx.user.name}**! Based on your real-time platform data across all modules, here is your comprehensive placement evaluation:

#### 🏆 Overall Readiness Overview
- **Placement Readiness Score:** **\`${overall}%\`**
- **Estimated Placement Probability:** **\`${prob}%\`**
- **Readiness Status:** **\`${tier.toUpperCase()}\`**
- **Target Role:** **${ctx.user.targetRole}**

---

#### 🔍 Module-Wise Breakdown

1. **📄 ATS Resume Status (${ctx.resume.latestScore}/100)**
   - ${ctx.resume.hasResume ? `Score is currently **${ctx.resume.latestScore}%**. Missing keywords: \`${ctx.resume.missingKeywords.slice(0, 4).join(', ') || 'None'}\`.` : '⚠️ No resume uploaded yet for ATS analysis.'}

2. **🧠 Aptitude Assessment (${ctx.aptitude.overallAccuracy}% Accuracy)**
   - ${ctx.aptitude.totalTests > 0 ? `Total Tests: **${ctx.aptitude.totalTests}** | Strongest: **${ctx.aptitude.strongestCategory}** | Weakest: **${ctx.aptitude.weakestCategory !== 'None' ? ctx.aptitude.weakestCategory : 'Quantitative / Logical'}**` : '⚠️ No aptitude tests completed yet on the platform.'}

3. **💻 Coding & DSA Performance (${ctx.coding.solvedTotal} Solved)**
   - ${ctx.coding.totalAttempts > 0 ? `Accuracy: **${ctx.coding.codingAccuracy}%** | Leaderboard Rank: **${ctx.coding.leaderboardRank ? `#${ctx.coding.leaderboardRank}` : 'Unranked'}** | Key Weak Areas: \`${ctx.coding.weakestTopics.join(', ') || 'Dynamic Programming'}\`` : '⚠️ No coding assessments attempted yet.'}

4. **🗣️ AI Mock Interview Score (${ctx.interview.avgOverallScore}/100)**
   - ${ctx.interview.totalSessions > 0 ? `Technical Score: **${ctx.interview.avgTechnicalScore}/100** | Communication Score: **${ctx.interview.avgCommunicationScore}/100**` : '⚠️ No mock interviews completed yet.'}

---

#### 🚀 Recommended Next Actions
1. **Focus Sprint:** Spend 3 days practicing **${ctx.aptitude.weakestCategory !== 'None' ? ctx.aptitude.weakestCategory : 'Logical Reasoning'}** aptitude questions.
2. **DSA Booster:** Solve 3 Medium problems in **${ctx.coding.weakestTopics[0] || 'Dynamic Programming'}**.
3. **Resume Tune-Up:** Add missing keywords \`${ctx.resume.missingKeywords.slice(0, 2).join(', ') || 'Microservices, Docker'}\` to your skills section.
      `.trim();

      return {
        content: response,
        metadata: {
          suggestedTopics: ['Create a 30-day preparation plan', 'Which companies am I ready for?', 'How can I improve my ATS score?'],
        },
      };
    }

    // 2. Aptitude Performance Analysis
    if (lower.includes('aptitude') || lower.includes('quant') || lower.includes('logical')) {
      if (ctx.aptitude.totalTests === 0) {
        return {
          content: `### 🧠 Aptitude Performance\n\nYou haven't completed any full aptitude tests on the platform yet!\n\nTo see personalized topic breakdowns and accuracy analytics for **Quantitative**, **Logical Reasoning**, and **Verbal Ability**, take an adaptive aptitude assessment in the Aptitude module.`,
        };
      }

      const overall = ctx.aptitude.overallAccuracy;
      const weak = ctx.aptitude.weakestCategory !== 'None' ? ctx.aptitude.weakestCategory : 'Quantitative Aptitude';
      const strong = ctx.aptitude.strongestCategory !== 'None' ? ctx.aptitude.strongestCategory : 'Logical Reasoning';

      const response = `
### 🧠 Aptitude Performance Breakdown

Here is your current aptitude standing across **${ctx.aptitude.totalTests} test attempts**:

- **Overall Accuracy:** **\`${overall}%\`**
- **Strongest Area:** **\`${strong}\`** 🟢
- **Weakest Area:** **\`${weak}\`** 🔴 *(Priority Focus)*

#### 📊 Category Breakdown:
- **Quantitative Aptitude:** ${ctx.aptitude.categoryPerformance.Quantitative ? `**\`${ctx.aptitude.categoryPerformance.Quantitative.accuracy}%\`** (${ctx.aptitude.categoryPerformance.Quantitative.correct}/${ctx.aptitude.categoryPerformance.Quantitative.total} correct)` : '*Not attempted*'}
- **Logical Reasoning:** ${ctx.aptitude.categoryPerformance.Logical ? `**\`${ctx.aptitude.categoryPerformance.Logical.accuracy}%\`** (${ctx.aptitude.categoryPerformance.Logical.correct}/${ctx.aptitude.categoryPerformance.Logical.total} correct)` : '*Not attempted*'}
- **Verbal Ability:** ${ctx.aptitude.categoryPerformance.Verbal ? `**\`${ctx.aptitude.categoryPerformance.Verbal.accuracy}%\`** (${ctx.aptitude.categoryPerformance.Verbal.correct}/${ctx.aptitude.categoryPerformance.Verbal.total} correct)` : '*Not attempted*'}
- **Data Interpretation:** ${ctx.aptitude.categoryPerformance.DataInterpretation ? `**\`${ctx.aptitude.categoryPerformance.DataInterpretation.accuracy}%\`** (${ctx.aptitude.categoryPerformance.DataInterpretation.correct}/${ctx.aptitude.categoryPerformance.DataInterpretation.total} correct)` : '*Not attempted*'}

#### 💡 Coach Strategy:
I recommend prioritizing **${weak}** practice sessions, especially Probability and Data Arrangement. Your **${strong}** score indicates strong analytical reasoning!
      `.trim();

      return {
        content: response,
        metadata: {
          suggestedTopics: ['What should I study this week?', 'Analyze my placement readiness', 'Create 30-day preparation plan'],
        },
      };
    }

    // 3. ATS Score & Resume Improvement Query
    if (lower.includes('ats') || lower.includes('resume') || lower.includes('cv')) {
      if (!ctx.resume.hasResume) {
        return {
          content: `### 📄 ATS Resume Optimization\n\nYou haven't uploaded a resume for ATS analysis yet!\n\nUpload your resume in PDF/Word format in the Resume module to unlock instant ATS scoring, keyword gap analysis, and recruiter readability feedback.`,
        };
      }

      const ats = ctx.resume.latestScore;
      const missing = ctx.resume.missingKeywords.length > 0 ? ctx.resume.missingKeywords : ['System Design', 'Docker', 'React Redux', 'CI/CD', 'REST APIs'];

      const response = `
### 📄 ATS Resume Optimization Coach

Your current ATS Score is **\`${ats}/100\`** for the **${ctx.user.targetRole}** role.

#### 🎯 Critical Key Improvements Needed:
1. **Insert High-Demand Technical Keywords**:
   Adding these missing keywords directly matching top job descriptions will increase your match score by up to **+18 points**:
   - \`${missing.slice(0, 5).join('` • `')}\`

2. **Action-Oriented Bullet Format**:
   - ❌ *Old:* "Built a web application for user management."
   - ✅ *Optimized:* "Engineered a scalable user authentication microservice using Node.js & React, reducing login latency by 35% across 2,000+ test users."

3. **Recommended Resume Project Additions**:
   To impress interviewers at **${(ctx.user.targetCompanies || ['Google', 'Amazon']).slice(0, 2).join(' & ')}**, highlight projects featuring:
   - **${ctx.user.projects?.[0] || 'Real-time Generative AI Platform'}**: Emphasize backend API latency, database indexing, and deployment pipelines.
   - **Distributed System / Cloud Infrastructure**: Mention AWS / Docker containerization.
      `.trim();

      return {
        content: response,
        metadata: {
          suggestedTopics: ['Recommend projects to strengthen my resume', 'Analyze my placement readiness', 'Create 30-day preparation plan'],
        },
      };
    }

    // Default Fallback Mode Synthesis
    const modeName = mode === 'General' ? 'Placement Coach' : `${mode} Coach`;
    const response = `
### 🤖 ${modeName} Guidance for ${ctx.user.name}

Here is your current platform performance snapshot:

- **Placement Readiness Score:** **\`${ctx.readiness.overallScore}%\`**
- **ATS Resume Score:** **\`${ctx.resume.hasResume ? `${ctx.resume.latestScore}/100` : 'Not uploaded'}\`**
- **Aptitude Accuracy:** **\`${ctx.aptitude.totalTests > 0 ? `${ctx.aptitude.overallAccuracy}%` : 'No tests taken'}\`**
- **Coding Solved:** **\`${ctx.coding.solvedTotal}\`** problems solved

How can I best assist your preparation right now? You can ask me anything about your career strategy or technical topics!
    `.trim();

    return {
      content: response,
      metadata: {
        suggestedTopics: [
          'Analyze my placement readiness.',
          'How can I improve my ATS score?',
          'What should I study this week?',
          'Create a 30-day placement preparation plan.',
        ],
      },
    };
  }
}

export const coachEngineService = new CoachEngineService();
