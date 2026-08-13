import https from 'https';

const nvKey = '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';

function testNvidiaKey() {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      model: 'meta/llama-3.1-8b-instruct',
      messages: [{ role: 'user', content: 'Say hello in English and Arabic JSON: {"en":"Hello","ar":"مرحبا"}' }],
      temperature: 0.7,
      max_tokens: 1000
    });

    const req = https.request({
      hostname: 'integrate.api.nvidia.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${nvKey}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        console.log('NVIDIA status:', res.statusCode);
        console.log('NVIDIA res:', data.slice(0, 300));
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', (err) => {
      console.log('NVIDIA error:', err.message);
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
}

testNvidiaKey();
