import https from 'https';

function testEndpoint(name, url, options = {}) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        console.log(`[${name}] Status: ${res.statusCode} | Data: ${data.slice(0, 150)}`);
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', (e) => {
      console.log(`[${name}] Error: ${e.message}`);
      resolve(false);
    });

    if (options.body) req.write(options.body);
    req.end();
  });
}

async function run() {
  console.log('Testing Free AI & Dictionary Endpoints...');
  
  // 1. Free Dictionary API (Instant & Free)
  await testEndpoint('FreeDict API', 'https://api.dictionaryapi.dev/api/v2/entries/en/opportunity');
  
  // 2. Datamuse Vocabulary API (Instant & Free)
  await testEndpoint('Datamuse API', 'https://api.datamuse.com/words?sp=opportunity&md=d,r,p&ipa=1');

  // 3. Pollinations Text GET API (CORS enabled)
  const promptEnc = encodeURIComponent('Generate JSON: {"sentence":"He seized the opportunity.","arabic":"انتهز الفرصة"}');
  await testEndpoint('Pollinations GET', `https://text.pollinations.ai/${promptEnc}?json=true`);
}

run();
