import { v4 as uuid } from 'uuid';
import {
  InterviewConfig,
  InterviewQuestion,
  AnswerEvaluation,
  InterviewReport
} from '../models/interviewTypes.js';
import { dbService } from './dbService.js';

// Structured Question Bank per Role & Company Type
const ROLE_QUESTION_BANK: Record<string, Array<{ questionText: string; category: string; difficulty: 'Easy' | 'Medium' | 'Hard'; expectedKeyPoints: string[]; idealAnswerSnippet: string }>> = {
  'Software Engineer': [
    {
      questionText: 'Can you explain how a Hash Table handles collisions and what the time complexity of lookup operations is in worst vs average cases?',
      category: 'Data Structures & Algorithms',
      difficulty: 'Medium',
      expectedKeyPoints: ['Chaining with Linked Lists / BSTs', 'Open Addressing (Linear/Quadratic Probing)', 'O(1) average lookup', 'O(N) worst case on hash collision clustering'],
      idealAnswerSnippet: 'Hash tables map keys to indices using a hash function. Collisions are handled via Chaining (storing colliding items in a linked list or Red-Black tree) or Open Addressing. Average time complexity is O(1), but degenerates to O(N) if all keys hash to the same bucket.'
    },
    {
      questionText: 'What is the difference between Process and Thread in Operating Systems, and how does inter-process communication (IPC) work?',
      category: 'Operating Systems',
      difficulty: 'Medium',
      expectedKeyPoints: ['Separate memory space for processes', 'Shared memory space for threads', 'IPC mechanisms (Pipes, Sockets, Shared Memory, Message Queues)'],
      idealAnswerSnippet: 'A process is an executing program instance with its own virtual address space, memory, and resources. Threads are lightweight execution paths within a process that share memory. Processes communicate via IPC mechanisms such as Shared Memory, Message Queues, Pipes, and Sockets.'
    },
    {
      questionText: 'Explain ACID properties in Relational Database Management Systems (RDBMS) with a real-world banking transaction example.',
      category: 'Database Management Systems',
      difficulty: 'Easy',
      expectedKeyPoints: ['Atomicity (All or nothing)', 'Consistency (Valid state transitions)', 'Isolation (Concurrent transactions do not collide)', 'Durability (Committed data persists)'],
      idealAnswerSnippet: 'ACID ensures database transaction reliability. Atomicity guarantees that money transfer between accounts succeeds completely or aborts safely. Consistency enforces constraints like non-negative balance. Isolation ensures concurrent transfers do not interfere. Durability guarantees committed transactions survive system crashes.'
    }
  ],
  'Full Stack Developer': [
    {
      questionText: 'Walk me through how the JavaScript Event Loop handles asynchronous operations like Promises vs setTimeout (Microtasks vs Macrotasks).',
      category: 'Frontend & Async JS',
      difficulty: 'Medium',
      expectedKeyPoints: ['Call Stack', 'Callback Queue / Macrotask Queue', 'Microtask Queue (Promises/process.nextTick)', 'Microtasks execute before next Macrotask'],
      idealAnswerSnippet: 'The Event Loop monitors the Call Stack and task queues. Synchronous code executes first on the stack. When empty, the event loop processes ALL jobs in the Microtask queue (Promises, MutationObserver) before picking the next job from the Macrotask queue (setTimeout, setInterval).'
    },
    {
      questionText: 'How would you design a secure user authentication system using JSON Web Tokens (JWT) and HTTP-only cookies in a Node.js/Express backend?',
      category: 'Backend Security & APIs',
      difficulty: 'Medium',
      expectedKeyPoints: ['Short-lived Access Token in memory/header', 'Long-lived Refresh Token in HTTP-only SameSite cookie', 'Token signing with secret/RSA key', 'CSRF and XSS defense'],
      idealAnswerSnippet: 'Issue a short-lived Access Token (15 mins) for API authorization and store a long-lived Refresh Token in an HTTP-only, Secure, SameSite Cookie to mitigate XSS attacks. Validate tokens on protected Express middleware routes and rotate refresh tokens upon renewal.'
    },
    {
      questionText: 'What strategies do you use for optimizing React application rendering performance and reducing unnecessary re-renders?',
      category: 'React & Web Optimization',
      difficulty: 'Medium',
      expectedKeyPoints: ['React.memo', 'useCallback and useMemo hooks', 'Virtualization for long lists', 'Code splitting with React.lazy and Suspense'],
      idealAnswerSnippet: 'Key optimization techniques include memoizing expensive components with React.memo, preserving function references with useCallback, computing heavy calculations with useMemo, virtualizing large lists using react-window, and splitting code via React.lazy and Suspense.'
    }
  ],
  'Data Analyst': [
    {
      questionText: 'Explain the difference between WHERE and HAVING clauses in SQL, and how window functions like ROW_NUMBER() and RANK() differ.',
      category: 'SQL & Data Wrangling',
      difficulty: 'Easy',
      expectedKeyPoints: ['WHERE filters rows before aggregation', 'HAVING filters aggregated groups', 'ROW_NUMBER assigns sequential unique integers', 'RANK leaves gaps for ties'],
      idealAnswerSnippet: 'WHERE filters individual records before GROUP BY runs, whereas HAVING filters aggregated groups after GROUP BY. ROW_NUMBER assigns sequential 1,2,3 values regardless of ties, while RANK assigns the same rank to ties and skips subsequent numbers (e.g. 1, 2, 2, 4).'
    },
    {
      questionText: 'How do you handle missing values, outliers, and skewed distributions during Exploratory Data Analysis (EDA) in Python?',
      category: 'Python & Data Preprocessing',
      difficulty: 'Medium',
      expectedKeyPoints: ['Imputation (Mean/Median/KNN)', 'Outlier detection (IQR, Z-score)', 'Log transformation / Box-Cox for skewness', 'Domain-specific imputation'],
      idealAnswerSnippet: 'Missing values are handled via mean/median imputation for numerical data or mode for categorical data. Outliers are detected using IQR bounds (Q1 - 1.5*IQR, Q3 + 1.5*IQR) and either capped or transformed. Skewed distributions are normalized using log or Box-Cox transformations.'
    }
  ],
  'AI Engineer': [
    {
      questionText: 'What is the Transformer architecture mechanism (Self-Attention) and how does it overcome Recurrent Neural Network (RNN) limitations?',
      category: 'Deep Learning & LLMs',
      difficulty: 'Hard',
      expectedKeyPoints: ['Query, Key, Value vectors', 'Scaled Dot-Product Attention', 'Parallel processing vs sequential RNN processing', 'Eliminating vanishing gradients across long sequences'],
      idealAnswerSnippet: 'Transformers use Self-Attention to calculate relationships between all words in a sequence simultaneously using Query, Key, and Value matrices. Unlike RNNs which process sequentially and suffer from vanishing gradients over long distances, Transformers allow massive parallel training and capture long-range contextual dependencies.'
    }
  ]
};

// Company-Specific Interview Nuances
const COMPANY_STYLE_PROMPTS: Record<string, string> = {
  Google: 'Focus heavily on Data Structures, Algorithm Efficiency, Scalability, and Clean Code.',
  Amazon: 'Emphasize Leadership Principles (Customer Obsession, Ownership, Bias for Action) and System Architecture.',
  Microsoft: 'Focus on Problem Solving, OOP Design Patterns, Data Structures, and System Efficiency.',
  TCS: 'Focus on Core Technical Fundamentals, Java/Python, DBMS, Communication Skills, and HR Versatility.',
  Infosys: 'Focus on Core Engineering Concepts, Project Understanding, Logical Reasoning, and HR Readiness.',
  Zoho: 'Focus on Deep Coding Logic, Custom Algorithms, Problem Solving, and Independent Execution.'
};

export class InterviewService {
  /**
   * Start a new Interview Simulation Session
   */
  public async startInterview(config: InterviewConfig, userId = 'anon'): Promise<{ sessionId: string; questions: InterviewQuestion[]; config: InterviewConfig }> {
    const sessionId = `int_sess_${Date.now()}_${uuid().slice(0, 8)}`;
    const questions: InterviewQuestion[] = [];

    // 1. Check if candidate has uploaded a resume report in DB for personalization
    let resumeContextText = '';
    if (config.useResumeContext && userId !== 'anon') {
      const reports = dbService.getUserResumeReports(userId);
      if (reports && reports.length > 0) {
        const latest = reports[0];
        const skillsStr = latest.parsedContent?.skills?.allFound?.join(', ') || '';
        const projectsStr = latest.parsedContent?.projects?.map((p) => p.title).join(', ') || '';
        resumeContextText = `[Candidate Resume Context: Skills (${skillsStr}), Projects (${projectsStr})]`;

        // Inject personalized resume project question
        if (latest.parsedContent?.projects && latest.parsedContent.projects.length > 0) {
          const proj = latest.parsedContent.projects[0];
          questions.push({
            id: `q_res_1`,
            questionText: `I noticed on your resume that you built "${proj.title}". Can you walk me through its architecture, technical challenges you solved, and your specific role?`,
            category: 'Resume Project Deep Dive',
            difficulty: 'Medium',
            expectedKeyPoints: ['Project Architecture', 'Tech Stack Choice', 'Challenges Solved', 'Measurable Impact'],
            contextTag: `Resume Project: ${proj.title}`
          });
        }
      }
    }

    // 2. Select questions matching Role & Company
    const pool = ROLE_QUESTION_BANK[config.role] || ROLE_QUESTION_BANK['Software Engineer'];
    pool.forEach((item, idx) => {
      questions.push({
        id: `q_role_${idx + 1}`,
        questionText: item.questionText,
        category: item.category,
        difficulty: item.difficulty,
        expectedKeyPoints: item.expectedKeyPoints,
        idealAnswerSnippet: item.idealAnswerSnippet,
        contextTag: `${config.company} ${item.category}`
      });
    });

    // 3. Add Behavioral / HR / Company-Specific Question
    if (config.type === 'HR' || config.type === 'Behavioral' || config.type === 'Mixed Interview') {
      questions.push({
        id: `q_hr_1`,
        questionText: `Tell me about a challenging situation you faced in a team project or internship. How did you resolve conflict and what was the outcome?`,
        category: 'Behavioral & STAR Method',
        difficulty: 'Easy',
        expectedKeyPoints: ['Situation context', 'Task objective', 'Action taken', 'Result achieved (STAR format)'],
        contextTag: `${config.company} Leadership & Behavioral`
      });
    }

    return {
      sessionId,
      questions: questions.slice(0, Math.max(3, config.questionCount || 5)),
      config
    };
  }

  /**
   * Evaluate a single answer and generate dynamic AI follow-up
   */
  public async evaluateAnswer(
    questionId: string,
    questionText: string,
    candidateAnswer: string,
    config: InterviewConfig
  ): Promise<AnswerEvaluation> {
    const cleanedAnswer = candidateAnswer ? candidateAnswer.trim() : '';
    const wordCount = cleanedAnswer.split(/\s+/).filter((w) => w.length > 0).length;

    // Evaluate scores based on content depth, keywords, and word count
    let score = 50;
    let technicalScore = 50;
    let communicationScore = 60;
    let confidenceScore = 60;

    const lower = cleanedAnswer.toLowerCase();
    const strengths: string[] = [];
    const missingPoints: string[] = [];

    if (wordCount >= 30) {
      score += 20;
      communicationScore += 20;
      strengths.push('Detailed explanation provided');
    } else {
      missingPoints.push('Answer was brief; elaborate with more technical details');
    }

    // Technical Keyword Matching
    const techKeywords = ['o(1)', 'o(n)', 'memory', 'cpu', 'react', 'node', 'sql', 'database', 'api', 'thread', 'process', 'async', 'promise', 'security', 'latency', 'architecture'];
    const matchedCount = techKeywords.filter((k) => lower.includes(k)).length;
    if (matchedCount >= 2) {
      technicalScore += 25;
      score += 15;
      strengths.push(`Used key technical terminology (${matchedCount} tech concepts mentioned)`);
    } else {
      missingPoints.push('Include specific technical keywords and system constraints');
    }

    if (lower.includes('for example') || lower.includes('in my project') || lower.includes('we built') || lower.includes('result')) {
      confidenceScore += 20;
      strengths.push('Provided concrete examples/experiences');
    }

    score = Math.max(25, Math.min(100, score));
    technicalScore = Math.max(20, Math.min(100, technicalScore));
    communicationScore = Math.max(30, Math.min(100, communicationScore));
    confidenceScore = Math.max(30, Math.min(100, confidenceScore));

    // Dynamic AI Follow-up Generation
    let followUpQuestion: InterviewQuestion | undefined;

    if (lower.includes('react') || lower.includes('node') || lower.includes('express')) {
      followUpQuestion = {
        id: `q_followup_${Date.now()}`,
        questionText: `You mentioned web development tools in your answer. How do you handle state management, API error handling, and performance bottlenecks when scaling backend requests?`,
        category: 'Probing Technical Follow-up',
        difficulty: 'Hard',
        expectedKeyPoints: ['State management', 'Error handling middleware', 'Connection pooling / Caching'],
        isFollowUp: true
      };
    } else if (lower.includes('database') || lower.includes('sql') || lower.includes('mongo')) {
      followUpQuestion = {
        id: `q_followup_${Date.now()}`,
        questionText: `Following up on database design: How do you decide between SQL indexing vs NoSQL caching strategies like Redis when optimizing high-traffic read queries?`,
        category: 'Probing Database Architecture',
        difficulty: 'Hard',
        expectedKeyPoints: ['Index B-Trees', 'In-memory cache', 'Cache invalidation'],
        isFollowUp: true
      };
    }

    return {
      questionId,
      questionText,
      candidateAnswer: cleanedAnswer || 'No response provided.',
      score,
      technicalScore,
      communicationScore,
      confidenceScore,
      problemSolvingScore: Math.round((technicalScore + score) / 2),
      behavioralScore: Math.round((communicationScore + confidenceScore) / 2),
      strengths: strengths.length > 0 ? strengths : ['Candidate addressed the core question'],
      missingPoints: missingPoints.length > 0 ? missingPoints : ['Add deeper technical metrics'],
      idealAnswerSnippet: `A top-tier answer for ${config.role} should clearly define core principles, state time/space complexities, and illustrate with a STAR scenario.`,
      starFormatFeedback: 'Structure answers using STAR: Situation -> Task -> Action -> Result.',
      followUpQuestion
    };
  }

  /**
   * Finalize Interview and Generate Comprehensive Report & Scorecard
   */
  public async finishInterview(
    sessionId: string,
    config: InterviewConfig,
    evaluations: AnswerEvaluation[],
    durationSeconds: number,
    userId = 'anon'
  ): Promise<InterviewReport> {
    const count = evaluations.length || 1;
    const avgScore = Math.round(evaluations.reduce((s, e) => s + e.score, 0) / count);
    const avgTech = Math.round(evaluations.reduce((s, e) => s + e.technicalScore, 0) / count);
    const avgComm = Math.round(evaluations.reduce((s, e) => s + e.communicationScore, 0) / count);
    const avgConf = Math.round(evaluations.reduce((s, e) => s + e.confidenceScore, 0) / count);
    const avgProb = Math.round(evaluations.reduce((s, e) => s + e.problemSolvingScore, 0) / count);
    const avgBeh = Math.round(evaluations.reduce((s, e) => s + e.behavioralScore, 0) / count);

    const roleReadinessScore = Math.min(100, Math.round(avgScore * 0.9 + 5));
    const companyReadinessScore = Math.min(100, Math.round(avgTech * 0.85 + avgComm * 0.15));
    const placementReadinessScore = Math.min(100, Math.round((avgScore + avgTech + avgComm) / 3));

    const topStrengths: string[] = Array.from(new Set(evaluations.flatMap((e) => e.strengths))).slice(0, 4);
    const keyWeaknesses: string[] = Array.from(new Set(evaluations.flatMap((e) => e.missingPoints))).slice(0, 4);

    const report: InterviewReport = {
      id: sessionId,
      userId,
      config,
      startTime: Date.now() - durationSeconds * 1000,
      completedAt: Date.now(),
      durationSeconds,
      overallScore: avgScore,
      technicalScore: avgTech,
      communicationScore: avgComm,
      confidenceScore: avgConf,
      problemSolvingScore: avgProb,
      behavioralScore: avgBeh,
      roleReadinessScore,
      companyReadinessScore,
      placementReadinessScore,
      questionEvaluations: evaluations,
      topStrengths,
      keyWeaknesses,
      frequentlyMissedTopics: ['Deep Time Complexity Analysis', 'STAR Method Story Structuring'],
      recommendedResources: [
        'LeetCode Top Interview 150 - Problem Solving',
        'System Design Primer - Scalable Microservices',
        'Google STAR Method Communication Guide'
      ],
      roadmap: [
        { priority: 'High', title: 'Master Time & Space Complexity Explanations', action: 'State Big-O notation explicitly before presenting your code or algorithm approach.' },
        { priority: 'High', title: 'Adopt STAR Method Structuring', action: 'Structure HR and Behavioral answers clearly: Situation, Task, Action, Result.' },
        { priority: 'Medium', title: 'Quantify Project Outcomes', action: 'State specific metrics (e.g. reduced latency by 30%, served 5k users).' }
      ]
    };

    // Save report to database history
    dbService.saveInterviewSession(report);

    return report;
  }
}

export const interviewService = new InterviewService();
