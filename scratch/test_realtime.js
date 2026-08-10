import http from 'https';

const room = 'oxford3000_pvp_room_m7md_ryof';
const url = `https://ntfy.sh/${room}/json`;

console.log('Testing ntfy.sh SSE connection to:', url);

const req = http.get(url, (res) => {
  console.log('Status code:', res.statusCode);
  res.on('data', (chunk) => {
    console.log('Received chunk:', chunk.toString());
  });
});

req.on('error', (err) => {
  console.error('Request error:', err);
});

// Send a test message after 2 seconds
setTimeout(async () => {
  console.log('Sending test POST message...');
  const postData = JSON.stringify({ type: 'TEST', text: 'Hello from Node!' });
  
  const postReq = http.request(`https://ntfy.sh/${room}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (res) => {
    console.log('POST status:', res.statusCode);
  });
  
  postReq.write(postData);
  postReq.end();
}, 2000);

setTimeout(() => {
  console.log('Done test.');
  process.exit(0);
}, 6000);
