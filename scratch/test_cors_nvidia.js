import https from 'https';

const nvKey = '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';

function testCorsProxy(proxyUrl) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      model: 'meta/llama-3.1-8b-instruct',
      messages: [{ role: 'user', content: 'Return JSON: {"hello":"world"}' }],
      temperature: 0.7,
      max_tokens: 500
    });

    const parsed = new URL(proxyUrl);
    const req = https.request({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
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
        console.log(`[${proxyUrl}] Status: ${res.statusCode} | Res: ${data.slice(0, 150)}`);
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', (err) => {
      console.log(`[${proxyUrl}] Error: ${err.message}`);
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('Testing CORS Proxies for NVIDIA API...');
  await testCorsProxy('https://corsproxy.io/?https://integrate.api.nvidia.com/v1/chat/completions');
  await testCorsProxy('https://api.codetabs.com/v1/proxy?quest=https://integrate.api.nvidia.com/v1/chat/completions');
}

run();
