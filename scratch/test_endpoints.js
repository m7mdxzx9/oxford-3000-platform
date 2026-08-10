import https from 'https';

function testEndpoint(name, url, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        console.log(`[${name}] Status: ${res.statusCode} | Res: ${data.slice(0, 100)}`);
        resolve(res.statusCode === 200);
      });
    });

    req.on('error', (err) => {
      console.log(`[${name}] Error: ${err.message}`);
      resolve(false);
    });

    if (body) req.write(body);
    req.end();
  });
}

async function runTests() {
  console.log('Testing public REST sync endpoints...');
  
  await testEndpoint('PubNub GET', 'https://ps.pubnub.com/v2/subscribe/demo/oxford3000_pvp/0?tt=0');
  await testEndpoint('Pusher Test', 'https://api-ping.pusher.com/ping');
  await testEndpoint('KVDB Put', 'https://kvdb.io/oxford3000_pvp_room_m7md_ryof_test/roomState', 'POST', JSON.stringify({ test: 123 }));
  await testEndpoint('KVDB Get', 'https://kvdb.io/oxford3000_pvp_room_m7md_ryof_test/roomState');
  await testEndpoint('Keyvalue GET', 'https://keyvalue.immanuel.co/api/KeyVal/GetValue/oxford3000_pvp_room/1');
}

runTests();
