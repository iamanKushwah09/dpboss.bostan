const https = require('https');

module.exports = function handler(req, res) {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = JSON.stringify(req.body || {});

  const options = {
    hostname: 'jsonblob.com',
    port: 443,
    path: '/api/jsonBlob/019e8e65-73ad-76d9-89d0-58feb69ffdb0',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const request = https.request(options, (response) => {
    let responseData = '';
    response.on('data', (chunk) => responseData += chunk);
    response.on('end', () => {
      try {
        res.status(200).json(JSON.parse(responseData));
      } catch (e) {
        res.status(500).json({ error: "Invalid JSON response" });
      }
    });
  });

  request.on('error', (error) => {
    res.status(500).json({ error: error.message });
  });

  request.write(data);
  request.end();
};
