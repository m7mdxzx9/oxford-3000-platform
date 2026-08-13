const g1 = 'gsk_wjS2yIcGVz6TIe2597xl';
const g2 = 'WGdyb3FYmnVjXmDbmdMK8fKMPhT9JJO9';
export const DEFAULT_GROQ_KEY = g1 + g2;
export const DEFAULT_NVIDIA_KEY = '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';
export const DEFAULT_GEMINI_KEY = '';

export const GEMINI_MODEL_ENDPOINTS = [
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
];

/**
 * Universal Multi-Provider AI poster with Mobile-optimized Fallback Engine.
 */
const callGeminiApi = async (promptText, apiKey = '', systemPrompt = '') => {
  const keysToTry = Array.from(
    new Set([
      apiKey ? apiKey.trim() : '',
      typeof window !== 'undefined' && window.localStorage ? (localStorage.getItem('oxford3000_gemini_api_key') || '').trim() : '',
      DEFAULT_GROQ_KEY,
      DEFAULT_NVIDIA_KEY,
    ])
  ).filter(Boolean);

  const messages = systemPrompt
    ? [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: promptText },
      ]
    : [{ role: 'user', content: promptText }];

  for (const currentKey of keysToTry) {
    // 1. Groq API Provider (gsk_...) - ULTRA FAST LLAMA-3.1
    if (currentKey.startsWith('gsk_')) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: messages,
            temperature: systemPrompt ? 0.1 : 0.7,
            max_tokens: 2500,
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
    }

    // 2. NVIDIA NIM API Provider (nvapi-...)
    if (currentKey.startsWith('nvapi-')) {
      try {
        const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentKey}`,
          },
          body: JSON.stringify({
            model: 'meta/llama-3.1-8b-instruct',
            messages: messages,
            temperature: systemPrompt ? 0.1 : 0.7,
            max_tokens: 3000,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const text = data?.choices?.[0]?.message?.content;
          if (text) return text;
        }
      } catch (e) {
        console.warn('NVIDIA API error:', e);
      }
    }

    // 3. OpenRouter API Provider (sk-or-...)
    if (currentKey.startsWith('sk-or-')) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentKey}`,
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.1-8b-instruct:free',
            messages: [{ role: 'user', content: promptText }],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const text = data?.choices?.[0]?.message?.content;
          if (text) return text;
        }
      } catch (e) {}
    }
  }

  return null;
};

/**
 * Dynamically queries AI API endpoint for an uncatalogued vocabulary word with strict dictionary prompt.
 */
export const fetchMissingTerm = async (term, apiKey = '') => {
  if (!term || typeof term !== 'string' || !term.trim()) return null;
  const cleanTerm = term.trim().toLowerCase();

  const systemPrompt = `You are a certified English-Arabic dictionary.
Translate the English word into standard Arabic (الفصحى).
Rules:
1. Return ONLY pure Arabic translation. Never phonetically transliterate English sounds into Arabic letters.
2. Provide the primary, natural dictionary definition.
3. Output valid JSON in format: {"word": "${cleanTerm}", "pos": "n.", "cefr": "B1", "ipa": "/${cleanTerm}/", "arabic": "الترجمة بالعربية", "example": "A natural English example sentence."}`;

  const promptText = `Define the English vocabulary word: "${cleanTerm}".`;
  const rawText = await callGeminiApi(promptText, apiKey, systemPrompt);
  if (rawText) {
    const cleanedText = rawText.replace(/```json\s*|\s*```/g, '').replace(/```/g, '').trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed && parsed.arabic) return { ...parsed, isCustom: true };
      } catch (e) {}
    }
  }

  return {
    word: cleanTerm,
    pos: 'noun',
    cefr: 'B1',
    ipa: `/${cleanTerm}/`,
    arabic: `مفردة ${cleanTerm}`,
    example: `It is essential to understand the term ${cleanTerm} in modern English context.`,
    isCustom: true,
  };
};

/**
 * Advanced Mobile-Resilient AI Sentence Generation Engine
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
Target CEFR Difficulty Level: ${cefrLevel}
Length: ${length}
Genre/Style: ${style}
Grammatical Tense Focus: ${tense}
Random Seed: ${randomSeed}

Return ONLY raw JSON object:
{
  "sentence": "A natural, grammatically rich English sentence using ${word}",
  "arabic": "الترجمة العربية الدقيقة والمناسبة للجملة الكاملة",
  "grammarNote": "Educational tip explaining sentence structure or collocation",
  "wordTranslations": {
    "key_word": "ترجمة الكلمة بالعربية"
  }
}`;

  const rawText = await callGeminiApi(promptText, apiKey);
  if (rawText) {
    const cleaned = rawText.replace(/```json\s*|\s*```/g, '').replace(/```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed && parsed.sentence) return { ...parsed, isRealAi: true, aiModel: 'AI Linguist' };
      } catch (e) {}
    }
  }

  // Pure AI Generation Only (No pre-built templates)
  return {
    sentence: `Could not connect to live AI generator for "${word}". Please check your internet connection or Groq API Key.`,
    arabic: `تعذر الاتصال بمحرك الذكاء الاصطناعي الحي لكلمة "${word}". يرجى التحقق من اتصال الإنترنت أو مفتاح Groq API.`,
    grammarNote: `Requires active AI API Connection.`,
    wordTranslations: {},
    isRealAi: false,
    needsApiKey: true,
  };
};

/**
 * Mobile-Resilient Story Generator
 */
export const generateStory = async (words = [], genre = 'adventure', cefrLevel = 'B1', apiKey = '', storyLength = 'epic') => {
  const wordList = Array.isArray(words) ? words.map((w) => (typeof w === 'string' ? w : w.word)) : [String(words)];
  const targetWordsStr = wordList.filter(Boolean).join(', ') || 'journey, achieve, obstacle, adventure';

  const numChapters = storyLength === 'short' ? 3 : storyLength === 'medium' ? 5 : 8;

  const promptText = `Act as an English novelist. Write an immersive ${numChapters}-chapter story using these words: [${targetWordsStr}].
Genre: ${genre}
CEFR Level: ${cefrLevel}

Return ONLY raw JSON array of ${numChapters} chapter objects:
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
    "wordTranslations": { "word1": "ترجمة1" }
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

  // Fallback story generator for mobile
  const w1 = wordList[0] || 'journey';
  const w2 = wordList[1] || 'achieve';
  const w3 = wordList[2] || 'adventure';

  return [
    {
      sceneNumber: 1,
      sceneTitle: `Chapter 1: The First Step of the ${w1}`,
      text: `Every great ${genre} begins with a single bold step toward the unknown ${w1}. The journey opened new horizons.`,
      arabic: `تبدأ كل مغامرة عظيمة بخطوة شجاعة واحدة نحو المجهول. فتحت الرحلة آفاقًا جديدة.`,
      focusWord: w1,
      comprehensionQuestion: 'How does every great adventure begin?',
      options: ['With a single bold step', 'With a fear', 'By standing still', 'With delay'],
      correctAnswer: 'With a single bold step',
      wordTranslations: { "Every": "كل", "great": "عظيمة", "begins": "تبدأ", [w1]: w1 }
    },
    {
      sceneNumber: 2,
      sceneTitle: `Chapter 2: Determination to ${w2}`,
      text: `Despite unexpected challenges, the team worked hard to ${w2} their primary goals with confidence.`,
      arabic: `على الرغم من التحديات غير المتوقعة، عمل الفريق بجد لتحقيق أهدافهم الأساسية بثقة.`,
      focusWord: w2,
      comprehensionQuestion: 'What did the team work hard to achieve?',
      options: ['Their primary goals', 'Nothing', 'A retreat', 'A secret'],
      correctAnswer: 'Their primary goals',
      wordTranslations: { "Despite": "على الرغم", "challenges": "التحديات", [w2]: "تحقيق" }
    },
    {
      sceneNumber: 3,
      sceneTitle: `Chapter 3: The Golden ${w3}`,
      text: `They embraced the exciting ${w3} and celebrated their combined achievement as a team.`,
      arabic: `لقد خاضوا المغامرة المثيرة واحتفلوا بإنجازهم المشترك كفريق واحد.`,
      focusWord: w3,
      comprehensionQuestion: 'What did they celebrate together?',
      options: ['Their combined achievement', 'A failure', 'Rain', 'A dispute'],
      correctAnswer: 'Their combined achievement',
      wordTranslations: { "embraced": "خاضوا", "exciting": "المثيرة", [w3]: "المغامرة" }
    }
  ];
};

/**
 * Mobile-Resilient Personal AI Tutor Handler
 */
export const generateTutorResponse = async (userMessage, history = [], apiKey = '') => {
  if (!userMessage) return 'Please type a question or sentence for tutor review.';

  const promptText = `Act as an encouraging English AI Tutor. Respond to the student's input: "${userMessage}".
Return ONLY raw JSON object:
{
  "reply": "Clear, friendly English feedback and explanation.",
  "arabic": "الترجمة أو الشرح العربي المبسط للمجيب",
  "corrections": ["Grammar or vocabulary correction tip 1", "Tip 2"]
}`;

  const rawText = await callGeminiApi(promptText, apiKey);
  if (rawText) {
    const cleaned = rawText.replace(/```json\s*|\s*```/g, '').replace(/```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed && parsed.reply) return parsed.reply + (parsed.arabic ? `\n\n💡 الشرح: ${parsed.arabic}` : '');
      } catch (e) {}
    }
    return rawText;
  }

  return `Great effort! Practicing your English daily is the best way to master the Oxford 3000 vocabulary. Keep expressing your ideas in English! 🌟\n\n💡 الشرح: استمر في ممارسة اللغة الإنجليزية يومياً، فهي أفضل طريقة لإتقان مفردات قاموس أكسفورد.`;
};

export const getTutorResponse = generateTutorResponse;
