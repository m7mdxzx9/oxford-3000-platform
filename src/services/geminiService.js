export const DEFAULT_GEMINI_KEY = 'AIzaSyC747z4ewiUEQTenTLdphM11WLbr1EVbXs';

export const GEMINI_MODEL_ENDPOINTS = [
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent',
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
 * Robust Universal Gemini API poster with multi-model fallback chain & strict JSON config.
 */
const callGeminiApi = async (promptText, apiKey = '') => {
  const key = getApiKey(apiKey);
  const body = JSON.stringify({
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });

  for (const endpoint of GEMINI_MODEL_ENDPOINTS) {
    try {
      const res = await fetch(`${endpoint}?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        console.warn(`Gemini endpoint ${endpoint} status:`, res.status);
      }
    } catch (e) {
      console.warn(`Gemini endpoint ${endpoint} error:`, e);
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

  const promptText = `Provide exact raw JSON for the English vocabulary word "${cleanTerm}". Output structure:
{
  "word": "${cleanTerm}",
  "pos": "noun|verb|adjective|adverb|preposition|conjunction",
  "cefr": "A1|A2|B1|B2",
  "arabic": "دقيقة ومضبوطة بالشكل",
  "example": "Natural English example sentence using the word",
  "ipa": "/phonetic transcription/",
  "collocations": ["common pairing 1", "common pairing 2"],
  "synonyms": ["synonym1", "synonym2"]
}`;

  const rawText = await callGeminiApi(promptText, apiKey);
  if (rawText) {
    const cleanedText = rawText.replace(/```json\s*|\s*```/g, '').replace(/```/g, '').trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed && parsed.word) {
          return {
            id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            word: (parsed.word || cleanTerm).toLowerCase(),
            pos: parsed.pos || 'noun',
            cefr: parsed.cefr || 'B1',
            arabic: parsed.arabic || `ترجمة ${cleanTerm}`,
            example: parsed.example || `Example sentence featuring ${cleanTerm}.`,
            ipa: parsed.ipa || `/${cleanTerm}/`,
            collocations: parsed.collocations || [],
            synonyms: parsed.synonyms || [],
            isCustom: true,
          };
        }
      } catch (e) {}
    }
  }

  return {
    id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    word: cleanTerm,
    pos: 'noun',
    cefr: 'B1',
    arabic: `ترجمة ${cleanTerm}`,
    example: `This is an example sentence featuring ${cleanTerm}.`,
    ipa: `/${cleanTerm}/`,
    collocations: [`use ${cleanTerm}`, `good ${cleanTerm}`],
    synonyms: [],
    isCustom: true,
  };
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
  apiKey = ''
) => {
  if (!word) return { sentence: 'Please select or enter a target vocabulary word.', arabic: '', grammarNote: '' };

  const promptText = `Act as an expert English Linguist. Generate a single highly natural, educational English sentence using the Oxford 3000 vocabulary word: "${word}".
Target word: "${word}"
Length: ${length} (short: 5-8 words, medium: 9-13 words, long: 14-22 words)
Position of "${word}": ${position} (beginning, middle, end, or any)
Genre/Style: ${style}
Grammatical Tense Focus: ${tense}

Return ONLY raw JSON object:
{
  "sentence": "A natural, grammatically rich English sentence",
  "arabic": "الترجمة العربية الدقيقة والمناسبة للجملة",
  "grammarNote": "Brief educational tip explaining why this sentence works or highlighting a collocation"
}`;

  const rawText = await callGeminiApi(promptText, apiKey);
  if (rawText) {
    const cleaned = rawText.replace(/```json\s*|\s*```/g, '').replace(/```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed && parsed.sentence) return parsed;
      } catch (e) {}
    }
  }

  // Fallback sentence builder if offline
  return {
    sentence: `To achieve our goal, we need to understand how to use "${word}" correctly in daily ${style.toLowerCase()}.`,
    arabic: `لتحقيق هدفنا، نحتاج إلى فهم كيفية استخدام مصطلح "${word}" بشكل صحيح في المحادثات اليومية.`,
    grammarNote: `Natural usage of "${word}" in ${tense} tense context.`,
  };
};

/**
 * Advanced Interactive Multi-Scene AI Story Generator with Real Gemini AI
 */
export const generateStory = async (words = [], genre = 'adventure', cefrLevel = 'B1', apiKey = '') => {
  const wordList = Array.isArray(words) ? words.map((w) => (typeof w === 'string' ? w : w.word)) : [String(words)];
  const targetWordsStr = wordList.filter(Boolean).join(', ') || 'journey, achieve, obstacle';

  const promptText = `Act as an expert English author & language teacher. Create an engaging 4-scene interactive short story incorporating these target vocabulary words: [${targetWordsStr}].
Genre: ${genre}
CEFR Difficulty Level: ${cefrLevel}

For each scene, output:
1. "sceneNumber": 1, 2, 3, or 4
2. "text": High quality English sentence (12-20 words) for this scene, naturally using one of the target words.
3. "arabic": Precise and beautiful Arabic translation of the sentence.
4. "focusWord": The target vocabulary word used in this scene line.
5. "comprehensionQuestion": An engaging comprehension question in English about this scene line.
6. "correctAnswer": Short, clear answer to the comprehension question.

Return ONLY a valid raw JSON array of 4 scene objects:
[
  {
    "sceneNumber": 1,
    "text": "...",
    "arabic": "...",
    "focusWord": "...",
    "comprehensionQuestion": "...",
    "correctAnswer": "..."
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
    },
    {
      sceneNumber: 2,
      text: `Despite unexpected difficulties, the team worked hard to ${w2} their primary objectives.`,
      arabic: `على الرغم من الصعوبات غير المتوقعة، عمل الفريق بجد لتحقيق أهدافهم الأساسية.`,
      focusWord: w2,
      comprehensionQuestion: 'What did the team work hard to do?',
      correctAnswer: `Achieve their primary objectives`,
    },
    {
      sceneNumber: 3,
      text: `They embraced the exciting ${w3} and shared valuable insights along the way.`,
      arabic: `لقد خاضوا المغامرة المثيرة وتشاركوا أفكارًا قيمة طوال الطريق.`,
      focusWord: w3,
      comprehensionQuestion: 'What did they share along the way?',
      correctAnswer: 'Valuable insights',
    },
    {
      sceneNumber: 4,
      text: `Finally, they celebrated their success together and reached their ultimate ${w4}.`,
      arabic: `أخيرًا، احتفلوا بنجاحهم معًا ووصلوا إلى هدفهم النهائي.`,
      focusWord: w4,
      comprehensionQuestion: 'What did they reach in the end?',
      correctAnswer: `Their ultimate ${w4}`,
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
