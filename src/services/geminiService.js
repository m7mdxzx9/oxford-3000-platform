export const DEFAULT_GEMINI_KEY = 'AIzaSyAJJYxSvml0VsoaC-rhseLPfI0APtAFnr4';

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
 * Robust Universal Gemini API poster with multi-model fallback chain & strict JSON config.
 */
const callGeminiApi = async (promptText, apiKey = '') => {
  const keysToTry = Array.from(
    new Set([
      apiKey ? apiKey.trim() : '',
      typeof window !== 'undefined' && window.localStorage ? (localStorage.getItem('oxford3000_gemini_api_key') || '').trim() : '',
      DEFAULT_GEMINI_KEY,
    ])
  ).filter(Boolean);

  const body = JSON.stringify({
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7,
    },
  });

  for (const currentKey of keysToTry) {
    for (const endpoint of GEMINI_MODEL_ENDPOINTS) {
      try {
        const res = await fetch(`${endpoint}?key=${currentKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        });
        if (res.ok) {
          const data = await res.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        } else {
          console.warn(`Gemini endpoint ${endpoint} status ${res.status} for key:`, currentKey.substring(0, 10));
        }
      } catch (e) {
        console.warn(`Gemini endpoint ${endpoint} fetch error:`, e);
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

const DYNAMIC_FALLBACK_PATTERNS = [
  {
    sentence: (w) => `The specialist inspected the modern ${w} to ensure it was operating safely.`,
    arabic: (w, ar) => `قام المتخصص بفحص ${ar || w} لضمان عمله بآمان.`,
    translations: (w, ar) => ({ "specialist": "المتخصص", "inspected": "فحص", "modern": "الحديث", [w]: ar || w, "ensure": "لضمان", "operating": "عمله", "safely": "بآمان" })
  },
  {
    sentence: (w) => `She demonstrated an exceptional ability to handle ${w} effectively.`,
    arabic: (w, ar) => `أظهرت قدرة استثنائية في التعامل مع ${ar || w} بفاعلية.`,
    translations: (w, ar) => ({ "demonstrated": "أظهرت", "exceptional": "استثنائية", "ability": "قدرة", "handle": "التعامل", [w]: ar || w, "effectively": "بفاعلية" })
  },
  {
    sentence: (w) => `Recent research highlights the significant impact of ${w} on daily progress.`,
    arabic: (w, ar) => `يسلط البحث الحديث الضوء على التأثير الكبير لـ ${ar || w} على التقدم اليومي.`,
    translations: (w, ar) => ({ "research": "البحث", "highlights": "يسلط الضوء", "impact": "التأثير", [w]: ar || w, "progress": "التقدم" })
  },
  {
    sentence: (w) => `They developed a comprehensive plan to integrate ${w} into their workflow.`,
    arabic: (w, ar) => `طوروا خطة شاملة لدمج ${ar || w} في بيئة عملهم.`,
    translations: (w, ar) => ({ "developed": "طوروا", "plan": "خطة", "integrate": "دمج", [w]: ar || w, "workflow": "بيئة عملهم" })
  },
  {
    sentence: (w) => `Mastering the proper usage of ${w} will boost your overall language fluency.`,
    arabic: (w, ar) => `إتقان الاستخدام المناسب لـ ${ar || w} سيعزز طلاقتك اللغوية الإجمالية.`,
    translations: (w, ar) => ({ "Mastering": "إتقان", "usage": "الاستخدام", [w]: ar || w, "boost": "سيعزز", "fluency": "طلاقتك" })
  },
  {
    sentence: (w) => `The team discussed how ${w} could improve the overall efficiency of the system.`,
    arabic: (w, ar) => `ناقش الفريق كيف يمكن لـ ${ar || w} تحسين الكفاءة الإجمالية للنظام.`,
    translations: (w, ar) => ({ "team": "الفريق", "discussed": "ناقش", [w]: ar || w, "improve": "تحسين", "efficiency": "الكفاءة", "system": "النظام" })
  }
];

let fallbackPatternCounter = 0;

/**
 * Advanced AI Sentence Generation with Real Gemini AI Logic & Dynamic Fallback Engine
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

  const promptText = `Act as an expert English Linguist. Generate a single highly natural, educational English sentence using the Oxford 3000 vocabulary word: "${word}".
Target word: "${word}"
Target CEFR Difficulty Level: ${cefrLevel} (A1: simple beginner, A2: elementary, B1: intermediate, B2: upper-intermediate, C1: advanced sophisticated)
Length: ${length} (short: 5-8 words, medium: 9-13 words, long: 14-22 words)
Position of "${word}": ${position} (beginning, middle, end, or any)
Genre/Style: ${style}
Grammatical Tense Focus: ${tense}

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
        if (parsed && parsed.sentence) return { ...parsed, isRealAi: true, aiModel: 'Gemini 2.5 Flash' };
      } catch (e) {}
    }
  }

  // Smart Dynamic Fallback sentence builder if offline or API key is unavailable
  fallbackPatternCounter = (fallbackPatternCounter + 1) % DYNAMIC_FALLBACK_PATTERNS.length;
  const pattern = DYNAMIC_FALLBACK_PATTERNS[fallbackPatternCounter];
  const cleanWord = String(word).trim().toLowerCase();

  return {
    sentence: pattern.sentence(cleanWord),
    arabic: pattern.arabic(cleanWord, null),
    grammarNote: `Educational context for "${cleanWord}". (Note: Connected with offline template. Check your internet connection for live AI).`,
    wordTranslations: pattern.translations(cleanWord, null),
    isRealAi: false,
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
7. "wordTranslations": Key-value dictionary mapping EACH English word in "text" to its Arabic translation.

Return ONLY a valid raw JSON array of 4 scene objects:
[
  {
    "sceneNumber": 1,
    "text": "...",
    "arabic": "...",
    "focusWord": "...",
    "comprehensionQuestion": "...",
    "correctAnswer": "...",
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
