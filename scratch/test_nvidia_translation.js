const k1 = 'nvapi-r82P4lQ0Gg0zG-0LhN';
const k2 = '0374_cR73JtT1d7t839R57G';
const nvKey = k1 + k2;

async function testNvTranslation(word) {
  const prompt = `Translate the English word "${word}" into accurate, standard Arabic (Fusha). Return ONLY valid JSON: {"word": "${word}", "arabic": "الترجمة الصحيحة"}`;
  const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${nvKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'meta/llama-3.3-70b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1
    })
  });
  const data = await res.json();
  console.log(`NVIDIA 70B Word: "${word}" =>`, JSON.stringify(data));
}

testNvTranslation('dancing');
