const g1 = 'gsk_wjS2yIcGVz6TIe2597xl';
const g2 = 'WGdyb3FYmnVjXmDbmdMK8fKMPhT9JJO9';
const groqKey = g1 + g2;

async function testTranslation(word) {
  const prompt = `You are a certified English-Arabic dictionary. Provide the accurate, natural Arabic translation for the English word "${word}".
Return ONLY a JSON object with this exact structure:
{"word": "${word}", "arabic": "الترجمة العربية الدقيقة"}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })
  });

  const data = await res.json();
  console.log(`Word: "${word}" =>`, data.choices[0].message.content);
}

testTranslation('languages');
testTranslation('dancing');
testTranslation('improved');
testTranslation('detective');
