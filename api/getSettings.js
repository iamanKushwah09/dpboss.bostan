const https = require('https');

module.exports = function handler(req, res) {
  https.get("https://jsonblob.com/api/jsonBlob/019e8e65-73ad-76d9-89d0-58feb69ffdb0", (response) => {
    let data = '';
    response.on('data', (chunk) => data += chunk);
    response.on('end', () => {
      try {
        res.status(200).json(JSON.parse(data));
      } catch (e) {
        res.status(500).json({ error: "Invalid JSON response" });
      }
    });
  }).on('error', (err) => {
    res.status(500).json({ error: err.message });
  });
};
