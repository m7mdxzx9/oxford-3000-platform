export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Helper to clean API Key
const getApiKey = (providedKey) => {
  if (providedKey) return providedKey;
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('oxford3000_gemini_api_key') || localStorage.getItem('gemini_api_key') || '';
  }
  return '';
};

/**
 * Dynamically queries Gemini API endpoint for an uncatalogued vocabulary word.
 */
export const fetchMissingTerm = async (term, apiKey = '') => {
  if (!term || typeof term !== 'string' || !term.trim()) return null;
  const cleanTerm = term.trim().toLowerCase();
  const key = getApiKey(apiKey);

  if (!key) {
    return {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      word: cleanTerm,
      pos: 'noun',
      cefr: 'B1',
      arabic: `ترجمة ${cleanTerm}`,
      example: `This is an example sentence featuring ${cleanTerm}.`,
      ipa: `/${cleanTerm}/`,
      isCustom: true
    };
  }

  try {
    const promptText = `Provide exact raw JSON for the English vocabulary word "${cleanTerm}". Do not include markdown or code block fences. Output structure:
{
  "word": "${cleanTerm}",
  "pos": "noun|verb|adjective|adverb|preposition|conjunction",
  "cefr": "A1|A2|B1|B2",
  "arabic": "accurate Arabic translation",
  "example": "Natural English example sentence using the word",
  "ipa": "/phonetic transcription/"
}`;

    const response = await fetch(`${GEMINI_API_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    if (response.ok) {
      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanedText = rawText.replace(/```json\s*|\s*```/g, '').trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
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
            isCustom: true
          };
        }
      }
    }
  } catch (err) {
    console.warn(`fetchMissingTerm error for "${cleanTerm}":`, err);
  }

  return {
    id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    word: cleanTerm,
    pos: 'noun',
    cefr: 'B1',
    arabic: `ترجمة ${cleanTerm}`,
    example: `This is an example sentence featuring ${cleanTerm}.`,
    ipa: `/${cleanTerm}/`,
    isCustom: true
  };
};

/**
 * Generate sentence using target word, length, position, and style parameters.
 */
export const generateSentence = async (word, length = 'medium', position = 'any', style = 'natural', apiKey = '') => {
  if (!word) return 'Please select or enter a target vocabulary word.';
  const key = getApiKey(apiKey);

  if (!key) {
    const lengthStr = length === 'short' ? 'short' : length === 'long' ? 'longer detailed' : 'balanced';
    const posStr = position === 'beginning' ? `The term ${word} starts the action.` : position === 'end' ? `In conclusion, we focus on ${word}.` : `We naturally incorporate ${word} in our daily workflow.`;
    return `In this ${lengthStr} ${style} context, ${posStr}`;
  }

  try {
    const promptText = `Generate a single natural English sentence adhering strictly to grammar rules:
Target word: "${word}"
Sentence length: ${length} (short: 4-7 words, medium: 8-12 words, long: 14-20 words)
Position anchor for target word: ${position} (beginning: 1st/2nd word, middle: middle of sentence, end: last 2 words, any: natural)
Genre/Style: ${style} (Casual Conversation, Simple A1/A2, Academic B2, Business, Story Format, Question Format)

Return ONLY the raw sentence text without quotes, markdown, or extra explanations.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
    });

    if (response.ok) {
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (text) return text.trim().replace(/^["']|["']$/g, '');
    }
  } catch (err) {
    console.warn('generateSentence API error:', err);
  }

  return `With great dedication, we use the term ${word} in our ${style} practice.`;
};

/**
 * Generate interactive story line-by-line using 1-5 target words, genre, and CEFR level.
 */
export const generateStory = async (words = [], genre = 'adventure', cefrLevel = 'B1', apiKey = '') => {
  const wordList = Array.isArray(words) ? words.map(w => typeof w === 'string' ? w : w.word) : [String(words)];
  const wordListStr = wordList.filter(Boolean).join(', ') || 'journey';
  const key = getApiKey(apiKey);

  if (!key) {
    return [
      {
        text: `Once upon a time in a ${genre} tale, our protagonists embarked on a mission involving ${wordListStr}.`,
        arabic: `في يوم من الأيام في حكاية ${genre}، انطلق أبطالنا في مهمة تتضمن ${wordListStr}.`
      },
      {
        text: `They learned that mastering ${wordListStr} required courage and practice at ${cefrLevel} level.`,
        arabic: `تعلموا أن إتقان ${wordListStr} يتطلب الشجاعة والممارسة في مستوى ${cefrLevel}.`
      },
      {
        text: `Eventually, their journey ended successfully, celebrating their progress.`,
        arabic: `في النهاية، انتهت رحلتهم بنجاح، محتفلين بتقدمهم.`
      }
    ];
  }

  try {
    const promptText = `Generate an interactive short story in 3-5 lines incorporating these target vocabulary words: [${wordListStr}].
Genre: ${genre}
CEFR Level: ${cefrLevel}

Return raw JSON array without markdown code blocks:
[
  { "text": "English line 1", "arabic": "Accurate Arabic translation of line 1" },
  { "text": "English line 2", "arabic": "Accurate Arabic translation of line 2" },
  ...
]`;

    const response = await fetch(`${GEMINI_API_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
    });

    if (response.ok) {
      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleaned = rawText.replace(/```json\s*|\s*```/g, '').trim();
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }
  } catch (err) {
    console.warn('generateStory API error:', err);
  }

  return [
    {
      text: `In this exciting ${genre} story, we discovered the true meaning of ${wordListStr}.`,
      arabic: `في هذه القصة الممتعة من نوع ${genre}، اكتشفنا المعنى الحقيقي لـ ${wordListStr}.`
    },
    {
      text: `Practicing at ${cefrLevel} level helped us express our ideas clearly and fluently.`,
      arabic: `ساعدتنا الممارسة عند مستوى ${cefrLevel} على التعبير عن أفكارنا بوضوح وطلاقة.`
    }
  ];
};

/**
 * Get AI Tutor Response for Chat/Roleplay
 */
export const getTutorResponse = async (roleplayScenario = 'General', userMessage = '', history = [], apiKey = '') => {
  const key = getApiKey(apiKey);

  if (!key) {
    const hasGrammarIssue = /\b(i is|he do|wants me|they plays)\b/i.test(userMessage) || (userMessage.length > 0 && userMessage.length < 4);
    return {
      reply: `That's an interesting point regarding our scenario: "${roleplayScenario}". Could you elaborate more on "${userMessage || 'your thoughts'}"?`,
      grammarFeedback: hasGrammarIssue ? 'Tip: Check subject-verb agreement or sentence structure.' : null,
      arabic: `هذه نقطة مثيرة للاهتمام فيما يتعلق بسيناريو "${roleplayScenario}". هل يمكنك التوضيح أكثر؟`
    };
  }

  try {
    const promptText = `You are an AI English Tutor facilitating a roleplay scenario: "${roleplayScenario}".
User message: "${userMessage}"
Recent Chat Context: ${JSON.stringify(history.slice(-4))}

Analyze user message for grammar errors.
Return raw JSON object without markdown code fences:
{
  "reply": "Empathetic, encouraging English tutor response continuing the scenario",
  "grammarFeedback": "Constructive grammar tip if error present, else null",
  "arabic": "Accurate Arabic translation of your reply"
}`;

    const response = await fetch(`${GEMINI_API_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
    });

    if (response.ok) {
      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleaned = rawText.replace(/```json\s*|\s*```/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed && parsed.reply) return parsed;
      }
    }
  } catch (err) {
    console.warn('getTutorResponse API error:', err);
  }

  return {
    reply: `Excellent practice! In our ${roleplayScenario} session, practice makes perfect.`,
    grammarFeedback: null,
    arabic: `تدريب ممتاز! في جلسة ${roleplayScenario}، التدريب يصنع الإتقان.`
  };
};

export default {
  fetchMissingTerm,
  generateSentence,
  generateStory,
  getTutorResponse,
  GEMINI_API_URL
};
