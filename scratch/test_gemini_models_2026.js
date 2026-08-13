import https from 'https';

const key = 'AIzaSyAJJYxSvml0VsoaC-rhseLPfI0APtAFnr4';

function listModels() {
  return new Promise((resolve) => {
    https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        console.log('List models status:', res.statusCode);
        try {
          const parsed = JSON.parse(data);
          if (parsed.models) {
            console.log('Available models:');
            parsed.models.forEach(m => console.log(' -', m.name));
          } else {
            console.log('No models key:', data);
          }
        } catch (e) {
          console.log('Raw res:', data.slice(0, 300));
        }
        resolve();
      });
    }).on('error', (e) => {
      console.log('Error:', e.message);
      resolve();
    });
  });
}

listModels();
