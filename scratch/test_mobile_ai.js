import https from 'https';

const geminiKey = 'AIzaSyAJJYxSvml0VsoaC-rhseLPfI0APtAFnr4';

function testGeminiEndpoint(url) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      contents: [{ parts: [{ text: 'Say hello in English and Arabic in JSON format: {"en":"Hello","ar":"مرحبا"}' }] }]
    });

    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        console.log(`[Gemini Test] Status: ${res.statusCode} | Data: ${data.slice(0, 150)}`);
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', (err) => {
      console.log(`[Gemini Test Error]: ${err.message}`);
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
}

function testPollinationsAI() {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      messages: [{ role: 'user', content: 'Generate JSON: {"sentence":"She had an opportunity.","arabic":"كانت لديها فرصة"}' }],
      jsonMode: true
    });

    const req = https.request({
      hostname: 'text.pollinations.ai',
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        console.log(`[Pollinations Test] Status: ${res.statusCode} | Data: ${data.slice(0, 150)}`);
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', (err) => {
      console.log(`[Pollinations Error]: ${err.message}`);
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('Testing Mobile AI Endpoints...');
  await testGeminiEndpoint(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`);
  await testGeminiEndpoint(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`);
  await testPollinationsAI();
}

run();
