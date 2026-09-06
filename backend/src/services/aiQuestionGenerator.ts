import { v4 as uuid } from 'uuid';
import { AptQuestion, AptCategory, Difficulty } from '../models/types.js';
import { createHash } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

function generateHash(str: string): string {
  return createHash('md5').update(str.trim().toLowerCase()).digest('hex');
}

export async function generateAIQuestion(
  category: AptCategory,
  difficulty: Difficulty = 'medium',
  topic?: string
): Promise<AptQuestion | null> {
  if (!GEMINI_API_KEY) {
    return null; // fallback to procedural engine
  }

  try {
    const prompt = `Generate a single multiple-choice aptitude question for campus placement exams.
Category: ${category}
${topic ? `Topic: ${topic}` : ''}
Difficulty: ${difficulty}

Return ONLY valid JSON matching this exact structure with no markdown formatting:
{
  "question": "Question text here",
  "topic": "${topic || 'General'}",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answerIndex": 0,
  "explanation": "Detailed step-by-step solution and explanation here"
}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!res.ok) {
      console.warn('Gemini API request failed:', res.statusText);
      return null;
    }

    const data: any = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText);
    if (!parsed.question || !Array.isArray(parsed.options) || parsed.options.length !== 4 || typeof parsed.answerIndex !== 'number') {
      return null;
    }

    return {
      id: uuid(),
      category,
      topic: parsed.topic || topic || 'General',
      difficulty,
      question: parsed.question,
      options: parsed.options,
      answerIndex: Math.max(0, Math.min(3, parsed.answerIndex)),
      explanation: parsed.explanation || 'Detailed solution step-by-step.',
      isDynamic: true,
      contentHash: generateHash(parsed.question)
    };
  } catch (err) {
    console.error('Error generating question with Gemini API:', err);
    return null;
  }
}
