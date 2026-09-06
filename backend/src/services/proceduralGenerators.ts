import { v4 as uuid } from 'uuid';
import { AptQuestion, AptCategory, Difficulty, Topic } from '../models/types.js';
import { createHash } from 'crypto';

function generateHash(str: string): string {
  return createHash('md5').update(str.trim().toLowerCase()).digest('hex');
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleOptions<T>(arr: T[], correctIndex: number): { options: T[]; newAnswerIndex: number } {
  const indexed = arr.map((item, idx) => ({ item, isCorrect: idx === correctIndex }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }
  const options = indexed.map((x) => x.item);
  const newAnswerIndex = indexed.findIndex((x) => x.isCorrect);
  return { options, newAnswerIndex };
}

// -------------------------------------------------------------
// 1. QUANTITATIVE APTITUDE GENERATORS
// -------------------------------------------------------------

function generateProfitAndLoss(difficulty: Difficulty): AptQuestion {
  const cp = getRandomInt(10, 50) * 10; // e.g. 100, 150, ..., 500
  const profitPct = getRandomChoice([10, 15, 20, 25, 30, 40, 50]);
  const sp = cp * (1 + profitPct / 100);

  const question = `A shopkeeper buys a smartphone for ₹${cp} and sells it at a profit of ${profitPct}%. What is the selling price?`;
  const correctAnswer = `₹${sp}`;
  const wrong1 = `₹${sp - 20}`;
  const wrong2 = `₹${sp + 30}`;
  const wrong3 = `₹${cp + profitPct}`;

  const { options, newAnswerIndex } = shuffleOptions([correctAnswer, wrong1, wrong2, wrong3], 0);

  const explanation = `Step 1: Formula for Selling Price (SP) when Cost Price (CP) and Profit% are given is:\n` +
    `SP = CP × (1 + Profit% / 100)\n` +
    `Step 2: Substitute values: SP = ${cp} × (1 + ${profitPct}/100) = ${cp} × ${(1 + profitPct / 100).toFixed(2)} = ₹${sp}.\n` +
    `Hence, the selling price is ₹${sp}.`;

  return {
    id: uuid(),
    category: 'Quantitative',
    topic: 'Profit & Loss',
    difficulty,
    question,
    options,
    answerIndex: newAnswerIndex,
    explanation,
    formula: 'SP = CP × (1 + Profit / 100)',
    isDynamic: true,
    contentHash: generateHash(question),
  };
}

function generateTimeAndWork(difficulty: Difficulty): AptQuestion {
  const daysA = getRandomChoice([10, 12, 15, 20, 30]);
  const daysB = getRandomChoice([12, 15, 20, 30, 60]);

  // Combined rate = 1/daysA + 1/daysB = (daysA + daysB) / (daysA * daysB)
  const combinedDays = (daysA * daysB) / (daysA + daysB);
  const formattedCombined = Number.isInteger(combinedDays)
    ? `${combinedDays} days`
    : `${combinedDays.toFixed(2)} days`;

  const question = `Worker A can finish a project in ${daysA} days and Worker B can finish the same project in ${daysB} days. How many days will they take to complete the project working together?`;

  const correctAnswer = formattedCombined;
  const wrong1 = `${(combinedDays + 2).toFixed(1)} days`;
  const wrong2 = `${Math.abs(daysA - daysB)} days`;
  const wrong3 = `${Math.round((daysA + daysB) / 2)} days`;

  const { options, newAnswerIndex } = shuffleOptions([correctAnswer, wrong1, wrong2, wrong3], 0);

  const explanation = `Step 1: Calculate individual 1-day work rates:\n` +
    `Rate of A = 1 / ${daysA}\nRate of B = 1 / ${daysB}\n` +
    `Step 2: Combined 1-day rate = (1/${daysA}) + (1/${daysB}) = (${daysA} + ${daysB}) / (${daysA} × ${daysB}) = ${daysA + daysB} / ${daysA * daysB}.\n` +
    `Step 3: Total time required = (${daysA} × ${daysB}) / (${daysA} + ${daysB}) = ${daysA * daysB} / ${daysA + daysB} = ${formattedCombined}.`;

  return {
    id: uuid(),
    category: 'Quantitative',
    topic: 'Time & Work',
    difficulty,
    question,
    options,
    answerIndex: newAnswerIndex,
    explanation,
    formula: 'Time Together = (A × B) / (A + B)',
    isDynamic: true,
    contentHash: generateHash(question),
  };
}

function generateSpeedDistance(difficulty: Difficulty): AptQuestion {
  const speed = getRandomInt(4, 12) * 10; // e.g. 40, 50, 60, ..., 120 km/h
  const timeHours = getRandomChoice([1.5, 2, 2.5, 3, 4, 5]);
  const distance = speed * timeHours;

  const question = `A bullet train travels at a uniform speed of ${speed} km/h. What distance will it cover in ${timeHours} hours?`;
  const correctAnswer = `${distance} km`;
  const wrong1 = `${distance - 15} km`;
  const wrong2 = `${distance + 25} km`;
  const wrong3 = `${(speed * (timeHours + 1)).toFixed(0)} km`;

  const { options, newAnswerIndex } = shuffleOptions([correctAnswer, wrong1, wrong2, wrong3], 0);

  const explanation = `Step 1: Use the fundamental formula: Distance = Speed × Time.\n` +
    `Step 2: Given Speed = ${speed} km/h and Time = ${timeHours} hours.\n` +
    `Step 3: Distance = ${speed} × ${timeHours} = ${distance} km.\n` +
    `Therefore, the total distance covered is ${distance} km.`;

  return {
    id: uuid(),
    category: 'Quantitative',
    topic: 'Speed, Distance & Time',
    difficulty,
    question,
    options,
    answerIndex: newAnswerIndex,
    explanation,
    formula: 'Distance = Speed × Time',
    isDynamic: true,
    contentHash: generateHash(question),
  };
}

function generateSimpleInterest(difficulty: Difficulty): AptQuestion {
  const principal = getRandomInt(10, 50) * 1000; // 10000, 20000...
  const rate = getRandomChoice([5, 8, 10, 12, 15]);
  const time = getRandomInt(2, 5);
  const si = (principal * rate * time) / 100;

  const question = `Calculate the Simple Interest on a principal amount of ₹${principal} invested at an interest rate of ${rate}% per annum for ${time} years.`;
  const correctAnswer = `₹${si}`;
  const wrong1 = `₹${si + 500}`;
  const wrong2 = `₹${si - 400}`;
  const wrong3 = `₹${(principal * rate) / 100}`;

  const { options, newAnswerIndex } = shuffleOptions([correctAnswer, wrong1, wrong2, wrong3], 0);

  const explanation = `Step 1: Formula for Simple Interest (SI) is:\n` +
    `SI = (P × R × T) / 100\n` +
    `Where Principal P = ₹${principal}, Rate R = ${rate}%, Time T = ${time} years.\n` +
    `Step 2: SI = (${principal} × ${rate} × ${time}) / 100 = ${principal * rate * time} / 100 = ₹${si}.`;

  return {
    id: uuid(),
    category: 'Quantitative',
    topic: 'Simple & Compound Interest',
    difficulty,
    question,
    options,
    answerIndex: newAnswerIndex,
    explanation,
    formula: 'SI = (P × R × T) / 100',
    isDynamic: true,
    contentHash: generateHash(question),
  };
}

// -------------------------------------------------------------
// 2. LOGICAL REASONING GENERATORS
// -------------------------------------------------------------

function generateNumberSeries(difficulty: Difficulty): AptQuestion {
  const start = getRandomInt(2, 10);
  const step = getRandomInt(3, 8);
  const isMultiplication = Math.random() > 0.5;

  let series: number[] = [];
  if (isMultiplication) {
    const factor = getRandomChoice([2, 3]);
    series = [start, start * factor, start * factor * factor, start * Math.pow(factor, 3)];
    const nextVal = start * Math.pow(factor, 4);
    const question = `Find the missing term in the sequence: ${series.join(', ')}, ?`;
    const correctAnswer = `${nextVal}`;
    const wrong1 = `${nextVal + factor}`;
    const wrong2 = `${nextVal - factor * 2}`;
    const wrong3 = `${nextVal * 2}`;

    const { options, newAnswerIndex } = shuffleOptions([correctAnswer, wrong1, wrong2, wrong3], 0);

    const explanation = `Pattern Analysis:\n` +
      `Each term is multiplied by a common ratio r = ${factor}.\n` +
      `${series[0]} × ${factor} = ${series[1]}\n` +
      `${series[1]} × ${factor} = ${series[2]}\n` +
      `${series[2]} × ${factor} = ${series[3]}\n` +
      `Next Term = ${series[3]} × ${factor} = ${nextVal}.`;

    return {
      id: uuid(),
      category: 'Logical',
      topic: 'Number Series',
      difficulty,
      question,
      options,
      answerIndex: newAnswerIndex,
      explanation,
      isDynamic: true,
      contentHash: generateHash(question),
    };
  } else {
    // Arithmetic series
    series = [start, start + step, start + 2 * step, start + 3 * step];
    const nextVal = start + 4 * step;
    const question = `Identify the next number in the arithmetic series: ${series.join(', ')}, ?`;
    const correctAnswer = `${nextVal}`;
    const wrong1 = `${nextVal + 2}`;
    const wrong2 = `${nextVal - 3}`;
    const wrong3 = `${nextVal + step * 2}`;

    const { options, newAnswerIndex } = shuffleOptions([correctAnswer, wrong1, wrong2, wrong3], 0);

    const explanation = `Pattern Analysis:\n` +
      `The common difference between consecutive terms d = +${step}.\n` +
      `${series[0]} + ${step} = ${series[1]}\n` +
      `${series[1]} + ${step} = ${series[2]}\n` +
      `${series[2]} + ${step} = ${series[3]}\n` +
      `Next Term = ${series[3]} + ${step} = ${nextVal}.`;

    return {
      id: uuid(),
      category: 'Logical',
      topic: 'Number Series',
      difficulty,
      question,
      options,
      answerIndex: newAnswerIndex,
      explanation,
      isDynamic: true,
      contentHash: generateHash(question),
    };
  }
}

function generateCodingDecoding(difficulty: Difficulty): AptQuestion {
  const words = ['APPLE', 'BRAIN', 'CLOUD', 'DRIVE', 'EARTH', 'FLAME', 'SMART'];
  const word = getRandomChoice(words);
  const shift = getRandomChoice([1, 2, 3]);

  const encode = (str: string, s: number) =>
    str
      .split('')
      .map((c) => String.fromCharCode(((c.charCodeAt(0) - 65 + s) % 26) + 65))
      .join('');

  const coded = encode(word, shift);

  const testWord = getRandomChoice(['GRANT', 'STORM', 'TRAIN', 'LIGHT', 'PRIME'].filter((w) => w !== word));
  const codedTestWord = encode(testWord, shift);

  const wrong1 = encode(testWord, shift + 1);
  const wrong2 = encode(testWord, shift - 1 || 4);
  const wrong3 = testWord.split('').reverse().join('');

  const question = `If in a secret language code, '${word}' is written as '${coded}', how will '${testWord}' be coded in the same language?`;

  const { options, newAnswerIndex } = shuffleOptions([codedTestWord, wrong1, wrong2, wrong3], 0);

  const explanation = `Pattern Analysis:\n` +
    `Compare '${word}' and '${coded}': Each letter is shifted forward by +${shift} positions in the alphabet.\n` +
    `Applying +${shift} shift to '${testWord}':\n` +
    testWord
      .split('')
      .map((c) => `${c} (+${shift}) ➜ ${String.fromCharCode(((c.charCodeAt(0) - 65 + shift) % 26) + 65)}`)
      .join(', ') +
    `.\nTherefore, '${testWord}' is coded as '${codedTestWord}'.`;

  return {
    id: uuid(),
    category: 'Logical',
    topic: 'Coding & Decoding',
    difficulty,
    question,
    options,
    answerIndex: newAnswerIndex,
    explanation,
    isDynamic: true,
    contentHash: generateHash(question),
  };
}

// -------------------------------------------------------------
// 3. VERBAL ABILITY GENERATORS
// -------------------------------------------------------------

function generateSynonymAntonym(difficulty: Difficulty): AptQuestion {
  const items = [
    { word: 'CANDID', type: 'Synonym', answer: 'Frank / Honest', distractors: ['Deceitful', 'Secretive', 'Arrogant'], exp: 'Candid means truthful and straightforward; frank is its synonym.' },
    { word: 'METICULOUS', type: 'Synonym', answer: 'Extremely Careful', distractors: ['Careless', 'Hasty', 'Lazy'], exp: 'Meticulous refers to showing great attention to detail and precision.' },
    { word: 'OBSOLETE', type: 'Synonym', answer: 'Outdated / Defunct', distractors: ['Modern', 'Trendy', 'Functional'], exp: 'Obsolete means no longer produced or used; out of date.' },
    { word: 'PRUDENT', type: 'Antonym', answer: 'Imprudent / Reckless', distractors: ['Wise', 'Cautious', 'Discreet'], exp: 'Prudent means acting with care and thought for the future. Reckless is its exact antonym.' },
    { word: 'EPHEMERAL', type: 'Antonym', answer: 'Permanent / Lasting', distractors: ['Fleeting', 'Transient', 'Brief'], exp: 'Ephemeral means lasting for a very short time; permanent is its antonym.' }
  ];

  const item = getRandomChoice(items);
  const isSynonym = item.type === 'Synonym';
  const question = `Select the option that is most nearly ${isSynonym ? 'SIMILAR in meaning to (Synonym)' : 'OPPOSITE in meaning to (Antonym)'} the word: "${item.word}".`;

  const { options, newAnswerIndex } = shuffleOptions([item.answer, ...item.distractors], 0);

  return {
    id: uuid(),
    category: 'Verbal',
    topic: 'Synonyms & Antonyms',
    difficulty,
    question,
    options,
    answerIndex: newAnswerIndex,
    explanation: `Vocabulary Insight:\n${item.exp}\nTarget word: ${item.word}.\nCorrect Option: ${item.answer}.`,
    isDynamic: true,
    contentHash: generateHash(question),
  };
}

// -------------------------------------------------------------
// 4. DATA INTERPRETATION GENERATORS
// -------------------------------------------------------------

function generateDataInterpretationTable(difficulty: Difficulty): AptQuestion {
  const companyA = getRandomInt(12, 25) * 10;
  const companyB = getRandomInt(15, 30) * 10;
  const companyC = getRandomInt(10, 20) * 10;
  const total = companyA + companyB + companyC;
  const avg = Math.round(total / 3);

  const question = `Sales Data Table (in Lakh ₹):\n- Company Alpha: ${companyA}\n- Company Beta: ${companyB}\n- Company Gamma: ${companyC}\n\nWhat is the average sales across all three companies?`;
  const correctAnswer = `${avg} Lakh ₹`;
  const wrong1 = `${avg + 15} Lakh ₹`;
  const wrong2 = `${avg - 20} Lakh ₹`;
  const wrong3 = `${total} Lakh ₹`;

  const { options, newAnswerIndex } = shuffleOptions([correctAnswer, wrong1, wrong2, wrong3], 0);

  const explanation = `Step 1: Calculate Total Sales = Alpha (${companyA}) + Beta (${companyB}) + Gamma (${companyC}) = ${total} Lakh ₹.\n` +
    `Step 2: Average Sales = Total Sales / Number of Companies = ${total} / 3 = ${avg} Lakh ₹.`;

  return {
    id: uuid(),
    category: 'DataInterpretation',
    topic: 'Table Interpretation',
    difficulty,
    question,
    options,
    answerIndex: newAnswerIndex,
    explanation,
    formula: 'Average = Sum of values / Count',
    isDynamic: true,
    contentHash: generateHash(question),
  };
}

// Master Procedural Generator function
export function generateProceduralQuestion(category: AptCategory, difficulty: Difficulty = 'medium'): AptQuestion {
  switch (category) {
    case 'Quantitative': {
      const fn = getRandomChoice([generateProfitAndLoss, generateTimeAndWork, generateSpeedDistance, generateSimpleInterest]);
      return fn(difficulty);
    }
    case 'Logical': {
      const fn = getRandomChoice([generateNumberSeries, generateCodingDecoding]);
      return fn(difficulty);
    }
    case 'Verbal': {
      return generateSynonymAntonym(difficulty);
    }
    case 'DataInterpretation': {
      return generateDataInterpretationTable(difficulty);
    }
  }
}

export function generateProceduralBatch(category: AptCategory, count: number, difficulty: Difficulty = 'medium'): AptQuestion[] {
  const result: AptQuestion[] = [];
  const hashes = new Set<string>();

  let attempts = 0;
  while (result.length < count && attempts < count * 5) {
    attempts++;
    const q = generateProceduralQuestion(category, difficulty);
    if (!hashes.has(q.contentHash || q.id)) {
      hashes.add(q.contentHash || q.id);
      result.push(q);
    }
  }
  return result;
}
