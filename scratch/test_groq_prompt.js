const g1 = 'gsk_wjS2yIcGVz6TIe2597xl';
const g2 = 'WGdyb3FYmnVjXmDbmdMK8fKMPhT9JJO9';
const groqKey = g1 + g2;

async function testGroqTranslation(word) {
  const systemPrompt = `You are a professional English-Arabic dictionary.
Translate the English word into standard Arabic (الفصحى).
Rules:
1. Return ONLY pure Arabic translation. Never phonetically transliterate English sounds into Arabic letters.
2. Provide the primary, natural dictionary definition.
3. Output valid JSON in format: {"arabic": "الترجمة بالعربية"}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Translate word: "${word}"` }
      ],
      temperature: 0.0,
      response_format: { type: 'json_object' }
    })
  });

  const data = await res.json();
  console.log(`Word: "${word}" =>`, data.choices[0].message.content);
}

testGroqTranslation('dancing');
testGroqTranslation('improved');
testGroqTranslation('languages');
testGroqTranslation('since');
testGroqTranslation('taking');
testGroqTranslation('lessons');
testGroqTranslation('ability');
