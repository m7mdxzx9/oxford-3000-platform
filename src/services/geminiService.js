export const DEFAULT_GEMINI_KEY = 'AIzaSyAJJYxSvml0VsoaC-rhseLPfI0APtAFnr4';
export const DEFAULT_NVIDIA_KEY = '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';

export const GEMINI_MODEL_ENDPOINTS = [
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
];

// Helper to clean API Key
const getApiKey = (providedKey) => {
  if (providedKey && providedKey.trim()) return providedKey.trim();
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = localStorage.getItem('oxford3000_gemini_api_key') || localStorage.getItem('gemini_api_key');
    if (stored && stored.trim()) return stored.trim();
  }
  return DEFAULT_GEMINI_KEY;
};

/**
 * Universal Multi-Provider AI poster (Gemini, Groq, NVIDIA).
 */
const callGeminiApi = async (promptText, apiKey = '') => {
  const keysToTry = Array.from(
    new Set([
      apiKey ? apiKey.trim() : '',
      typeof window !== 'undefined' && window.localStorage ? (localStorage.getItem('oxford3000_gemini_api_key') || '').trim() : '',
      DEFAULT_NVIDIA_KEY,
      DEFAULT_GEMINI_KEY,
    ])
  ).filter(Boolean);

  const geminiBody = JSON.stringify({
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7,
    },
  });

  for (const currentKey of keysToTry) {
    // 1. NVIDIA NIM API Provider (nvapi-...) with CORS Proxy fallback for Web Browsers
    if (currentKey.startsWith('nvapi-')) {
      const endpointsToTry = [
        'https://integrate.api.nvidia.com/v1/chat/completions',
        'https://cors.eu.org/https://integrate.api.nvidia.com/v1/chat/completions',
      ];

      for (const nvEp of endpointsToTry) {
        try {
          const res = await fetch(nvEp, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentKey}`,
            },
            body: JSON.stringify({
              model: 'meta/llama-3.1-8b-instruct',
              messages: [{ role: 'user', content: promptText }],
              temperature: 0.7,
              max_tokens: 1000,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            const text = data?.choices?.[0]?.message?.content;
            if (text) return text;
          }
        } catch (e) {
          console.warn(`NVIDIA API endpoint ${nvEp} error:`, e);
        }
      }
      continue;
    }

    // 2. Groq API Provider (gsk_...)
    if (currentKey.startsWith('gsk_')) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.1-70b-versatile',
            messages: [{ role: 'user', content: promptText }],
            temperature: 0.7,
            max_tokens: 1000,
            response_format: { type: 'json_object' }
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const text = data?.choices?.[0]?.message?.content;
          if (text) return text;
        }
      } catch (e) {
        console.warn('Groq API error:', e);
      }
      continue;
    }

    // 3. Google Gemini API Provider (AIzaSy...)
    if (currentKey.startsWith('AIzaSy') || currentKey === DEFAULT_GEMINI_KEY) {
      for (const endpoint of GEMINI_MODEL_ENDPOINTS) {
        try {
          const res = await fetch(`${endpoint}?key=${currentKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: geminiBody,
          });
          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) return text;
          }
        } catch (e) {
          console.warn(`Gemini endpoint ${endpoint} error:`, e);
        }
      }
    }
  }

  return null;
};

/**
 * Dynamically queries Gemini API endpoint for an uncatalogued vocabulary word.
 */
export const fetchMissingTerm = async (term, apiKey = '') => {
  if (!term || typeof term !== 'string' || !term.trim()) return null;
  const cleanTerm = term.trim().toLowerCase();

  const promptText = `Define the English vocabulary word: "${cleanTerm}". Return raw JSON object with keys: "word", "pos", "cefr" (A1, A2, B1, B2, or C1), "ipa", "arabic", "example" (a natural English example sentence).`;
  const rawText = await callGeminiApi(promptText, apiKey);
  if (rawText) {
    const cleanedText = rawText.replace(/```json\s*|\s*```/g, '').replace(/```/g, '').trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed && parsed.word) return { ...parsed, isCustom: true };
      } catch (e) {}
    }
  }

  return null;
};

/**
 * Advanced AI Sentence Generation with Real Gemini AI Logic
 */
export const generateSentence = async (
  word,
  length = 'medium',
  position = 'any',
  style = 'Casual Conversation',
  tense = 'Present',
  apiKey = '',
  cefrLevel = 'B1'
) => {
  if (!word) return { sentence: 'Please select or enter a target vocabulary word.', arabic: '', grammarNote: '', wordTranslations: {} };

  const randomSeed = Math.floor(Math.random() * 10000);
  const promptText = `Act as an expert English Linguist. Generate a unique, creative, educational English sentence using the Oxford 3000 vocabulary word: "${word}".
Target word: "${word}"
Target CEFR Difficulty Level: ${cefrLevel} (A1: simple beginner, A2: elementary, B1: intermediate, B2: upper-intermediate, C1: advanced sophisticated)
Length: ${length} (short: 5-8 words, medium: 9-13 words, long: 14-22 words)
Position of "${word}": ${position} (beginning, middle, end, or any)
Genre/Style: ${style}
Grammatical Tense Focus: ${tense}
Random Seed: ${randomSeed}

Return ONLY raw JSON object:
{
  "sentence": "A natural, grammatically rich English sentence tailored strictly to ${cefrLevel} difficulty",
  "arabic": "الترجمة العربية الدقيقة والمناسبة للجملة الكاملة",
  "grammarNote": "Brief educational tip explaining why this sentence works or highlighting a collocation",
  "wordTranslations": {
    "word1": "ترجمة الكلمة 1 بالعربية",
    "word2": "ترجمة الكلمة 2 بالعربية"
  }
}`;

  const rawText = await callGeminiApi(promptText, apiKey);
  if (rawText) {
    const cleaned = rawText.replace(/```json\s*|\s*```/g, '').replace(/```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed && parsed.sentence) return { ...parsed, isRealAi: true, aiModel: 'NVIDIA Llama 3.1 AI' };
      } catch (e) {}
    }
  }

  // Pure AI Notice (No local fallback templates)
  return {
    sentence: `To generate live AI sentences for "${word}", please check your NVIDIA API key settings.`,
    arabic: `لتوليد جمل حية ومباشرة بالذكاء الاصطناعي لكلمة "${word}"، يرجى التأكد من مفتاح NVIDIA API الخاص بك.`,
    grammarNote: `Requires active NVIDIA API Key.`,
    wordTranslations: {},
    isRealAi: false,
    needsApiKey: true,
  };
};

/**
 * Advanced Interactive Multi-Scene AI Story Generator (5-6 Rich Chapters with Full Paragraphs & Quizzes)
 */
export const generateStory = async (words = [], genre = 'adventure', cefrLevel = 'B1', apiKey = '') => {
  const wordList = Array.isArray(words) ? words.map((w) => (typeof w === 'string' ? w : w.word)) : [String(words)];
  const targetWordsStr = wordList.filter(Boolean).join(', ') || 'journey, achieve, obstacle, adventure';

  const promptText = `Act as an award-winning English novelist and CEFR master linguist. Create an immersive, highly engaging 5-chapter story incorporating these target vocabulary words: [${targetWordsStr}].
Genre: ${genre}
CEFR Difficulty Level: ${cefrLevel}

For each of the 5 chapters, output:
1. "sceneNumber": 1, 2, 3, 4, or 5
2. "sceneTitle": A captivating chapter title (e.g. "Chapter 1: The Unexpected Encounter")
3. "text": Rich, well-written multi-sentence paragraph (25-45 words) tailored to ${cefrLevel} level, using target vocabulary naturally in story context.
4. "arabic": Beautiful, accurate Arabic translation of the full paragraph.
5. "focusWord": The target vocabulary word highlighted in this chapter.
6. "comprehensionQuestion": An engaging reading comprehension question about this chapter.
7. "options": Array of 4 multiple-choice options in English: ["Option A", "Option B", "Option C", "Option D"].
8. "correctAnswer": Exact correct option string from the options array.
9. "wordTranslations": Key-value dictionary mapping key English words in "text" to their Arabic translations.

Return ONLY a valid raw JSON array of 5 chapter objects:
[
  {
    "sceneNumber": 1,
    "sceneTitle": "Chapter 1: ...",
    "text": "...",
    "arabic": "...",
    "focusWord": "...",
    "comprehensionQuestion": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "wordTranslations": { "word1": "ترجمة1", "word2": "ترجمة2" }
  }
]`;

  const rawText = await callGeminiApi(promptText, apiKey);
  if (rawText) {
    const cleaned = rawText.replace(/```json\s*|\s*```/g, '').replace(/```/g, '').trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
  }

  // Fallback story generator if offline
  const w1 = wordList[0] || 'journey';
  const w2 = wordList[1] || 'achieve';
  const w3 = wordList[2] || 'adventure';
  const w4 = wordList[3] || 'goal';

  return [
    {
      sceneNumber: 1,
      text: `Every great ${genre} begins with a single bold step toward the unknown ${w1}.`,
      arabic: `تبدأ كل مغامرة عظيمة بخطوة شجاعة واحدة نحو المجهول.`,
      focusWord: w1,
      comprehensionQuestion: 'How does every great adventure begin?',
      correctAnswer: 'With a single bold step',
      wordTranslations: { "Every": "كل", "great": "عظيمة", "begins": "تبدأ", "single": "واحدة", "bold": "شجاعة", "step": "خطوة", "unknown": "المجهول", [w1]: w1 }
    },
    {
      sceneNumber: 2,
      text: `Despite unexpected difficulties, the team worked hard to ${w2} their primary objectives.`,
      arabic: `على الرغم من الصعوبات غير المتوقعة، عمل الفريق بجد لتحقيق أهدافهم الأساسية.`,
      focusWord: w2,
      comprehensionQuestion: 'What did the team work hard to do?',
      correctAnswer: `Achieve their primary objectives`,
      wordTranslations: { "Despite": "على الرغم", "difficulties": "الصعوبات", "team": "الفريق", "worked": "عمل", "hard": "بجد", [w2]: "تحقيق", "objectives": "أهدافهم" }
    },
    {
      sceneNumber: 3,
      text: `They embraced the exciting ${w3} and shared valuable insights along the way.`,
      arabic: `لقد خاضوا المغامرة المثيرة وتشاركوا أفكارًا قيمة طوال الطريق.`,
      focusWord: w3,
      comprehensionQuestion: 'What did they share along the way?',
      correctAnswer: 'Valuable insights',
      wordTranslations: { "embraced": "خاضوا", "exciting": "المثيرة", [w3]: "المغامرة", "shared": "تشاركوا", "valuable": "قيمة", "insights": "أفكارًا" }
    },
    {
      sceneNumber: 4,
      text: `Finally, they celebrated their success together and reached their ultimate ${w4}.`,
      arabic: `أخيرًا، احتفلوا بنجاحهم معًا ووصلوا إلى هدفهم النهائي.`,
      focusWord: w4,
      comprehensionQuestion: 'What did they reach in the end?',
      correctAnswer: `Their ultimate ${w4}`,
      wordTranslations: { "Finally": "أخيرًا", "celebrated": "احتفلوا", "success": "نجاحهم", "together": "معًا", "reached": "وصلوا", "ultimate": "النهائي", [w4]: "هدفهم" }
    },
  ];
};

/**
 * Advanced AI Personal Tutor Response with Real Gemini AI
 */
export const getTutorResponse = async (roleplayScenario = 'General', userMessage = '', history = [], apiKey = '') => {
  const promptText = `You are a world-class AI English Speech & Grammar Coach conducting a roleplay scenario: "${roleplayScenario}".
User message: "${userMessage}"
Recent History: ${JSON.stringify(history.slice(-4))}

Analyze user message for grammar, natural phrasing, and CEFR level.
Return raw JSON object:
{
  "reply": "Empathetic, highly encouraging, conversational English reply continuing the roleplay scenario naturally",
  "arabic": "الترجمة العربية الدقيقة لإجابتك",
  "wordTranslations": { "key_word1": "ترجمة_1", "key_word2": "ترجمة_2" },
  "corrections": [
    { "original": "flawed phrase", "improved": "natural polished phrase", "reason": "Grammar or collocation explanation" }
  ],
  "suggestedReplies": [
    "Suggested response 1 for user",
    "Suggested response 2 for user"
  ],
  "cefrRating": "A1|A2|B1|B2"
}`;

  const rawText = await callGeminiApi(promptText, apiKey);
  if (rawText) {
    const cleaned = rawText.replace(/```json\s*|\s*```/g, '').replace(/```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed && parsed.reply) return parsed;
      } catch (e) {}
    }
  }

  const hasIssue = /\b(i is|he do|wants me|they plays)\b/i.test(userMessage);
  return {
    reply: `That's great! In our ${roleplayScenario} session, practice makes perfect. Tell me more!`,
    arabic: `هذا رائع! في جلسة ${roleplayScenario}، التدريب يصنع الإتقان. أخبرني المزيد!`,
    wordTranslations: { "practice": "التدريب", "perfect": "الإتقان" },
    corrections: hasIssue ? [{ original: userMessage, improved: 'I am ready to practice.', reason: 'Subject-verb agreement' }] : [],
    suggestedReplies: ['I agree with that point.', 'Could you give me an example?'],
    cefrRating: 'B1',
  };
};

export default {
  fetchMissingTerm,
  generateSentence,
  generateStory,
  getTutorResponse,
  DEFAULT_GEMINI_KEY,
  GEMINI_MODEL_ENDPOINTS,
};
