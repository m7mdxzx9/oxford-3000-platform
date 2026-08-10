import https from 'https';

const subKey = 'demo';
const pubKey = 'demo';
const channel = 'oxford3000_pvp_sync_m7md_ryof';

function publishMessage(msgObj) {
  return new Promise((resolve) => {
    const payload = JSON.stringify(msgObj);
    const url = `https://ps.pubnub.com/publish/${pubKey}/${subKey}/0/${channel}/0/${encodeURIComponent(payload)}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        console.log('Publish status:', res.statusCode, 'Data:', data);
        resolve(data);
      });
    }).on('error', (err) => {
      console.error('Publish error:', err.message);
      resolve(null);
    });
  });
}

function subscribeMessages(timeToken = 0) {
  return new Promise((resolve) => {
    const url = `https://ps.pubnub.com/v2/subscribe/${subKey}/${channel}/0?tt=${timeToken}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        console.log('Subscribe status:', res.statusCode, 'Data:', data);
        resolve(JSON.parse(data));
      });
    }).on('error', (err) => {
      console.error('Subscribe error:', err.message);
      resolve(null);
    });
  });
}

async function runTest() {
  console.log('1. Getting initial timetoken...');
  const init = await subscribeMessages(0);
  const tt = init ? init.t.t : 0;
  console.log('Timetoken:', tt);

  console.log('2. Publishing test move...');
  await publishMessage({ type: 'DIALOGUE_GENERATE', test: true, time: Date.now() });

  console.log('3. Subscribing for new message...');
  const sub = await subscribeMessages(tt);
  console.log('Subscribed messages:', sub ? sub.m : []);
}

runTest();
