import http from 'https';

const room = 'oxford3000_pvp_room_m7md_ryof_v3';

console.log('Sending DIALOGUE_GENERATE event...');

const payload = JSON.stringify({
  id: `dialogue-${Date.now()}`,
  type: 'DIALOGUE_GENERATE',
  senderDeviceId: 'dev_test',
  dialogueScript: {
    topic: 'Coffee Shop',
    level: 'A2',
    turns: [
      { speaker: 'A', name: 'محمد', en: 'Hello Ryof!', ar: 'مرحبا ريوف' },
      { speaker: 'B', name: 'ريوف', en: 'Hi Mohammed!', ar: 'مرحبا محمد' }
    ]
  }
});

const req = http.request(`https://ntfy.sh/${room}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  console.log('POST status:', res.statusCode);
  res.on('data', (d) => console.log('POST res:', d.toString()));
});

req.write(payload);
req.end();

// Fetch poll to see what ntfy returns!
setTimeout(async () => {
  http.get(`https://ntfy.sh/${room}/json?poll=1&since=1m`, (res) => {
    let data = '';
    res.on('data', (c) => data += c);
    res.on('end', () => {
      console.log('--- POLL OUTPUT ---');
      console.log(data);
    });
  });
}, 1500);
