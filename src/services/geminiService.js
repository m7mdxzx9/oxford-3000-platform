export const DEFAULT_GEMINI_KEY = 'AIzaSyC747z4ewiUEQTenTLdphM11WLbr1EVbXs';
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
export const GEMINI_FALLBACK_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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
 * Universal Gemini API poster with automatic endpoint fallback.
 */
const callGeminiApi = async (promptText, apiKey = '') => {
  const key = getApiKey(apiKey);
  const body = JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] });

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (res.ok) {
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    }
  } catch (e) {
    console.warn('Primary Gemini model error, trying fallback:', e);
  }

  // Secondary fallback model
  try {
    const fallbackRes = await fetch(`${GEMINI_FALLBACK_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    if (fallbackRes.ok) {
      const data = await fallbackRes.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    }
  } catch (e) {
    console.error('Fallback Gemini model error:', e);
  }

  return null;
};

/**
 * Dynamically queries Gemini API endpoint for an uncatalogued vocabulary word.
 */
export const fetchMissingTerm = async (term, apiKey = '') => {
  if (!term || typeof term !== 'string' || !term.trim()) return null;
  const cleanTerm = term.trim().toLowerCase();

  const promptText = `Provide exact raw JSON for the English vocabulary word "${cleanTerm}". Do not include markdown code fences. Output structure:
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
    const cleanedText = rawText.replace(/```json\s*|\s*```/g, '').trim();
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
 * Advanced Sentence Generation with Grammatical Tense, Formality, and Collocation Anchors.
 */
export const generateSentence = async (
  word,
  length = 'medium',
  position = 'any',
  style = 'Casual Conversation',
  tense = 'Present',
  apiKey = ''
) => {
  if (!word) return 'Please select or enter a target vocabulary word.';

  const promptText = `Act as an expert English Linguist. Generate a single highly natural English sentence.
Target word: "${word}"
Sentence length: ${length} (short: 4-7 words, medium: 8-12 words, long: 14-20 words)
Position anchor for "${word}": ${position} (beginning, middle, end, any)
Genre/Style: ${style}
Grammar Tense Focus: ${tense}

Return raw JSON without markdown code fences:
{
  "sentence": "The complete natural English sentence",
  "arabic": "الترجمة العربية الدقيقة والمترابطة للجملة",
  "grammarNote": "Brief tip on why this sentence works or collocation used"
}`;

  const rawText = await callGeminiApi(promptText, apiKey);
  if (rawText) {
    const cleaned = rawText.replace(/```json\s*|\s*```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed && parsed.sentence) return parsed;
      } catch (e) {}
    }
  }

  return {
    sentence: `With great dedication, we use the term ${word} in our daily ${style} practice.`,
    arabic: `مع تفانٍ كبير، نستخدم مصطلح ${word} في ممارستنا اليومية.`,
    grammarNote: `Natural usage of "${word}" in ${tense} tense.`,
  };
};

/**
 * Advanced Interactive Multi-Scene Story Generator.
 */
export const generateStory = async (words = [], genre = 'adventure', cefrLevel = 'B1', apiKey = '') => {
  const wordList = Array.isArray(words) ? words.map((w) => (typeof w === 'string' ? w : w.word)) : [String(words)];
  const wordListStr = wordList.filter(Boolean).join(', ') || 'journey, learn, goal';

  const promptText = `Write an engaging 3-4 scene story using these target vocabulary words: [${wordListStr}].
Genre: ${genre}
CEFR Difficulty Level: ${cefrLevel}

Return raw JSON array of scenes without markdown fences:
[
  {
    "sceneNumber": 1,
    "text": "English line for scene 1",
    "arabic": "الترجمة العربية الدقيقة والجميلة",
    "focusWord": "target word used here",
    "comprehensionQuestion": "Simple question in English about this line",
    "correctAnswer": "Short answer"
  },
  ...
]`;

  const rawText = await callGeminiApi(promptText, apiKey);
  if (rawText) {
    const cleaned = rawText.replace(/```json\s*|\s*```/g, '').trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
  }

  return [
    {
      sceneNumber: 1,
      text: `In this exciting ${genre} journey, we discovered the true value of ${wordListStr}.`,
      arabic: `في هذه الرحلة الممتعة من نوع ${genre}، اكتشفنا القيمة الحقيقية لـ ${wordListStr}.`,
      focusWord: wordList[0] || 'journey',
      comprehensionQuestion: 'What did we discover on our journey?',
      correctAnswer: `The true value of ${wordListStr}`,
    },
    {
      sceneNumber: 2,
      text: `Practicing at ${cefrLevel} level helped us overcome every obstacle ahead.`,
      arabic: `ساعدتنا الممارسة عند مستوى ${cefrLevel} على التغلب على كل عقبة أمامنا.`,
      focusWord: wordList[1] || 'practice',
      comprehensionQuestion: 'What helped us overcome obstacles?',
      correctAnswer: `Practicing at ${cefrLevel} level`,
    },
  ];
};

/**
 * Advanced AI Personal Tutor Response.
 */
export const getTutorResponse = async (roleplayScenario = 'General', userMessage = '', history = [], apiKey = '') => {
  const promptText = `You are a world-class AI English Speech & Grammar Coach conducting a roleplay scenario: "${roleplayScenario}".
User message: "${userMessage}"
Recent History: ${JSON.stringify(history.slice(-4))}

Analyze user message for grammar, natural phrasing, and CEFR level.
Return raw JSON object without markdown code fences:
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
    const cleaned = rawText.replace(/```json\s*|\s*```/g, '').trim();
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
  GEMINI_API_URL,
  GEMINI_FALLBACK_URL,
};
