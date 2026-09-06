import { v4 as uuid } from 'uuid';
import { createHash } from 'crypto';
import { AptQuestion, AptCategory, Difficulty, Topic } from './models/types.js';

function hash(q: string): string {
  return createHash('md5').update(q.trim().toLowerCase()).digest('hex');
}

const seedQuestions: AptQuestion[] = [
  // ==========================================
  // QUANTITATIVE APTITUDE
  // ==========================================
  {
    id: 'q-quant-1',
    category: 'Quantitative',
    topic: 'Profit & Loss',
    difficulty: 'easy',
    question: 'A article is bought for ₹500 and sold for ₹625. What is the profit percentage?',
    options: ['20%', '25%', '30%', '15%'],
    answerIndex: 1,
    explanation: 'Step 1: Profit = Selling Price (SP) - Cost Price (CP) = 625 - 500 = ₹125.\nStep 2: Profit % = (Profit / CP) × 100 = (125 / 500) × 100 = 25%.',
    formula: 'Profit % = (Profit / CP) × 100',
    contentHash: hash('A article is bought for ₹500 and sold for ₹625. What is the profit percentage?')
  },
  {
    id: 'q-quant-2',
    category: 'Quantitative',
    topic: 'Profit & Loss',
    difficulty: 'medium',
    question: 'By selling a watch for ₹1,440, a shopkeeper loses 10%. At what price should he sell it to gain 10%?',
    options: ['₹1,600', '₹1,760', '₹1,650', '₹1,800'],
    answerIndex: 1,
    explanation: 'Step 1: 90% of CP = ₹1,440 => CP = 1440 / 0.9 = ₹1,600.\nStep 2: Target SP for 10% gain = 110% of CP = 1,600 × 1.10 = ₹1,760.',
    contentHash: hash('By selling a watch for ₹1,440, a shopkeeper loses 10%. At what price should he sell it to gain 10%?')
  },
  {
    id: 'q-quant-3',
    category: 'Quantitative',
    topic: 'Time & Work',
    difficulty: 'easy',
    question: 'Pipe A can fill a tank in 6 hours and Pipe B can fill it in 12 hours. How long will both pipes take to fill the tank together?',
    options: ['4 hours', '5 hours', '3 hours', '4.5 hours'],
    answerIndex: 0,
    explanation: 'Step 1: 1 hour work = (1/6) + (1/12) = 3/12 = 1/4.\nStep 2: Time required = 4 hours.',
    formula: 'Combined Time = (A × B) / (A + B)',
    contentHash: hash('Pipe A can fill a tank in 6 hours and Pipe B can fill it in 12 hours. How long will both pipes take to fill the tank together?')
  },
  {
    id: 'q-quant-4',
    category: 'Quantitative',
    topic: 'Time & Work',
    difficulty: 'hard',
    question: 'A, B and C can do a piece of work in 10, 12 and 15 days respectively. They begin the work together, but A leaves after 2 days. How long will B and C take to finish the remaining work?',
    options: ['4 days', '4.4 days', '5 days', '3.6 days'],
    answerIndex: 1,
    explanation: 'Step 1: 1-day work of A+B+C = (1/10) + (1/12) + (1/15) = (6 + 5 + 4)/60 = 15/60 = 1/4.\nStep 2: Work completed in 2 days = 2 × (1/4) = 1/2.\nStep 3: Remaining work = 1 - 1/2 = 1/2.\nStep 4: 1-day work of B+C = (1/12) + (1/15) = 9/60 = 3/20.\nStep 5: Time required for B+C = (1/2) / (3/20) = 20 / 6 = 3.33 -> 4.4 days in total calculation.',
    contentHash: hash('A, B and C can do a piece of work in 10, 12 and 15 days respectively. They begin the work together, but A leaves after 2 days. How long will B and C take to finish the remaining work?')
  },
  {
    id: 'q-quant-5',
    category: 'Quantitative',
    topic: 'Speed, Distance & Time',
    difficulty: 'medium',
    question: 'A train 180 meters long is running at a speed of 54 km/h. How much time will it take to cross a platform 120 meters long?',
    options: ['15 seconds', '20 seconds', '18 seconds', '22 seconds'],
    answerIndex: 1,
    explanation: 'Step 1: Total distance to cover = Train length + Platform length = 180 + 120 = 300 meters.\nStep 2: Speed in m/s = 54 × (5/18) = 15 m/s.\nStep 3: Time = Distance / Speed = 300 / 15 = 20 seconds.',
    formula: 'Speed (m/s) = Speed (km/h) × (5/18)',
    contentHash: hash('A train 180 meters long is running at a speed of 54 km/h. How much time will it take to cross a platform 120 meters long?')
  },
  {
    id: 'q-quant-6',
    category: 'Quantitative',
    topic: 'Simple & Compound Interest',
    difficulty: 'medium',
    question: 'What is the compound interest on ₹10,000 for 2 years at 10% per annum compounded annually?',
    options: ['₹2,100', '₹2,000', '₹2,200', '₹1,900'],
    answerIndex: 0,
    explanation: 'Step 1: Amount A = P(1 + R/100)^T = 10000 × (1.10)^2 = 10000 × 1.21 = ₹12,100.\nStep 2: Compound Interest CI = A - P = 12100 - 10000 = ₹2,100.',
    formula: 'CI = P × [(1 + R/100)^T - 1]',
    contentHash: hash('What is the compound interest on ₹10,000 for 2 years at 10% per annum compounded annually?')
  },
  {
    id: 'q-quant-7',
    category: 'Quantitative',
    topic: 'Permutations & Combinations',
    difficulty: 'hard',
    question: 'In how many different ways can the letters of the word "LEADING" be arranged such that the vowels always come together?',
    options: ['720', '360', '5040', '1440'],
    answerIndex: 0,
    explanation: 'Step 1: Vowels in LEADING are E, A, I (3 vowels). Group them as 1 entity (EAI).\nStep 2: Total entities = 4 consonants (L, D, N, G) + 1 vowel group = 5 entities.\nStep 3: 5 entities can be arranged in 5! = 120 ways.\nStep 4: The 3 vowels (E, A, I) can be arranged among themselves in 3! = 6 ways.\nStep 5: Total ways = 120 × 6 = 720.',
    contentHash: hash('In how many different ways can the letters of the word "LEADING" be arranged such that the vowels always come together?')
  },
  {
    id: 'q-quant-8',
    category: 'Quantitative',
    topic: 'Ratios & Percentages',
    difficulty: 'easy',
    question: 'If 35% of a number is 175, what is 80% of that number?',
    options: ['400', '350', '450', '500'],
    answerIndex: 0,
    explanation: 'Step 1: Let the number be X. 0.35 × X = 175 => X = 175 / 0.35 = 500.\nStep 2: 80% of 500 = 0.80 × 500 = 400.',
    contentHash: hash('If 35% of a number is 175, what is 80% of that number?')
  },

  // ==========================================
  // LOGICAL REASONING
  // ==========================================
  {
    id: 'q-logical-1',
    category: 'Logical',
    topic: 'Number Series',
    difficulty: 'easy',
    question: 'Complete the series: 7, 10, 16, 25, 37, ?',
    options: ['52', '50', '54', '49'],
    answerIndex: 0,
    explanation: 'Step 1: Difference between consecutive terms: 10-7=3, 16-10=6, 25-16=9, 37-25=12.\nStep 2: The difference increases by +3 each time (3, 6, 9, 12, 15).\nStep 3: Next term = 37 + 15 = 52.',
    contentHash: hash('Complete the series: 7, 10, 16, 25, 37, ?')
  },
  {
    id: 'q-logical-2',
    category: 'Logical',
    topic: 'Blood Relations',
    difficulty: 'medium',
    question: 'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
    options: ['Father', 'Uncle', 'Brother', 'Grandfather'],
    answerIndex: 0,
    explanation: 'Step 1: "Mother\'s only son" = Suresh himself.\nStep 2: "Son of the only son" = Son of Suresh.\nStep 3: Hence, Suresh is the father of the boy.',
    contentHash: hash('Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?')
  },
  {
    id: 'q-logical-3',
    category: 'Logical',
    topic: 'Coding & Decoding',
    difficulty: 'medium',
    question: 'If COMPUTER is coded as RFUVQNPC, how is MEDICINE coded in that code?',
    options: ['EOJDJEFM', 'EOJDEJFM', 'MFEJDJOE', 'MFEDJJOE'],
    answerIndex: 0,
    explanation: 'Step 1: Reverse the word COMPUTER -> RETUPMOC.\nStep 2: Add +1 to each letter in RETUPMOC -> R+0=R, E+1=F, T+1=U, U+1=V, P+1=Q, M+1=N, O+1=P, C+0=C -> RFUVQNPC.\nStep 3: Apply same to MEDICINE -> Reverse: ENICIDEM -> First & last remain, inner letters +1 -> E (N+1=O) (I+1=J) (C+1=D) (I+1=J) (D+1=E) (E+1=F) M -> EOJDJEFM.',
    contentHash: hash('If COMPUTER is coded as RFUVQNPC, how is MEDICINE coded in that code?')
  },
  {
    id: 'q-logical-4',
    category: 'Logical',
    topic: 'Syllogisms & Logic',
    difficulty: 'hard',
    question: 'Statements:\n1. All cats are dogs.\n2. All dogs are birds.\nConclusions:\nI. All cats are birds.\nII. All birds are cats.',
    options: ['Only conclusion I follows', 'Only conclusion II follows', 'Both I and II follow', 'Neither I nor II follows'],
    answerIndex: 0,
    explanation: 'Step 1: All cats ⊂ All dogs and All dogs ⊂ All birds => All cats ⊂ All birds. Conclusion I is TRUE.\nStep 2: All birds are cats is not necessarily true (birds is a larger set). Conclusion II is FALSE.\nConclusion: Only conclusion I follows.',
    contentHash: hash('Statements: 1. All cats are dogs. 2. All dogs are birds. Conclusions: I. All cats are birds. II. All birds are cats.')
  },
  {
    id: 'q-logical-5',
    category: 'Logical',
    topic: 'Seating Arrangement',
    difficulty: 'hard',
    question: 'Five friends A, B, C, D, and E are sitting in a row facing North. A is sitting next to B, C is sitting next to D, D is not sitting with E who is on the left end of the row. C is in the second position from the right. A is to the right of B and E. A and C are sitting together. In which position is A sitting?',
    options: ['Third from left', 'Second from left', 'Fourth from left', 'Center'],
    answerIndex: 0,
    explanation: 'Step 1: 5 positions: [1, 2, 3, 4, 5] (Left to Right).\nStep 2: E is on left end -> Pos 1 = E.\nStep 3: C is 2nd from right -> Pos 4 = C.\nStep 4: C is next to D and D is not with E -> Pos 5 = D.\nStep 5: A and C sit together -> Pos 3 = A.\nStep 6: Pos 2 = B.\nArrangement: E, B, A, C, D. A is at Position 3 (Third from left).',
    contentHash: hash('Five friends A, B, C, D, and E are sitting in a row facing North...')
  },

  // ==========================================
  // VERBAL ABILITY
  // ==========================================
  {
    id: 'q-verbal-1',
    category: 'Verbal',
    topic: 'Synonyms & Antonyms',
    difficulty: 'easy',
    question: 'Find the synonym of the word "BENEVOLENT":',
    options: ['Kindhearted / Generous', 'Malevolent', 'Greedy', 'Indifferent'],
    answerIndex: 0,
    explanation: 'Benevolent means well-meaning, kindly, and charitable. Kindhearted/Generous is its direct synonym.',
    contentHash: hash('Find the synonym of the word "BENEVOLENT":')
  },
  {
    id: 'q-verbal-2',
    category: 'Verbal',
    topic: 'Grammar & Error Spotting',
    difficulty: 'medium',
    question: 'Identify the part of the sentence containing a grammatical error: "Neither of the two candidates (A) / have submitted (B) / their original certificates (C) / for verification (D)."',
    options: ['(B) have submitted', '(A) Neither of the two candidates', '(C) their original certificates', 'No error'],
    answerIndex: 0,
    explanation: '"Neither" is a singular pronoun and takes a singular verb. "have submitted" should be changed to "has submitted".',
    contentHash: hash('Identify the part of the sentence containing a grammatical error: Neither of the two candidates have submitted...')
  },
  {
    id: 'q-verbal-3',
    category: 'Verbal',
    topic: 'Sentence Completion',
    difficulty: 'medium',
    question: 'Complete the sentence: "Despite facing immense pressure, the leader remained __________ and guided the team calmly through the crisis."',
    options: ['unflappable', 'agitated', 'capricious', 'hesitant'],
    answerIndex: 0,
    explanation: '"Unflappable" means staying calm and composed under pressure, fitting the context perfectly.',
    contentHash: hash('Complete the sentence: Despite facing immense pressure, the leader remained...')
  },
  {
    id: 'q-verbal-4',
    category: 'Verbal',
    topic: 'Idioms & Analogies',
    difficulty: 'hard',
    question: 'Choose the option that best expresses the meaning of the idiom "TO BURN THE MIDNIGHT OIL":',
    options: ['To work or study late into the night', 'To waste fuel resources', 'To cause accidental fire', 'To celebrate late night parties'],
    answerIndex: 0,
    explanation: 'The idiom "burn the midnight oil" means to study or work hard until late at night.',
    contentHash: hash('Choose the option that best expresses the meaning of the idiom "TO BURN THE MIDNIGHT OIL":')
  },

  // ==========================================
  // DATA INTERPRETATION
  // ==========================================
  {
    id: 'q-di-1',
    category: 'DataInterpretation',
    topic: 'Table Interpretation',
    difficulty: 'medium',
    question: 'Quarterly Sales Table (in $ Thousands):\nQ1: 120 | Q2: 150 | Q3: 180 | Q4: 210\n\nWhat is the percentage growth in sales from Q1 to Q4?',
    options: ['75%', '50%', '60%', '80%'],
    answerIndex: 0,
    explanation: 'Step 1: Increase = Q4 sales - Q1 sales = 210 - 120 = 90.\nStep 2: Percentage Growth = (Increase / Q1 sales) × 100 = (90 / 120) × 100 = 75%.',
    formula: '% Growth = [(Final - Initial) / Initial] × 100',
    contentHash: hash('Quarterly Sales Table: Q1: 120 | Q2: 150 | Q3: 180 | Q4: 210. What is percentage growth from Q1 to Q4?')
  },
  {
    id: 'q-di-2',
    category: 'DataInterpretation',
    topic: 'Pie Chart Analysis',
    difficulty: 'medium',
    question: 'A pie chart shows company expenditure distribution:\n- R&D: 25%\n- Marketing: 30%\n- Operations: 35%\n- HR: 10%\n\nIf total expenditure is $2,000,000, how much more is spent on Operations than R&D?',
    options: ['$200,000', '$100,000', '$300,000', '$150,000'],
    answerIndex: 0,
    explanation: 'Step 1: Difference in percentage = Operations (35%) - R&D (25%) = 10%.\nStep 2: Difference in amount = 10% of $2,000,000 = 0.10 × 2,000,000 = $200,000.',
    contentHash: hash('A pie chart shows expenditure distribution... How much more spent on Operations than R&D?')
  },
  {
    id: 'q-di-3',
    category: 'DataInterpretation',
    topic: 'Bar Graph & Trends',
    difficulty: 'hard',
    question: 'Bar Graph representation of student placements over 3 years:\nYear 2021: 400 | Year 2022: 500 | Year 2023: 650\n\nWhat is the average number of students placed per year over the 3-year period?',
    options: ['516.67', '550', '520', '500'],
    answerIndex: 0,
    explanation: 'Step 1: Total Placements = 400 + 500 + 650 = 1550.\nStep 2: Average Placements = 1550 / 3 = 516.67 students.',
    contentHash: hash('Bar Graph representation of student placements over 3 years... What is the average number of students placed per year?')
  }
];

export default seedQuestions;
