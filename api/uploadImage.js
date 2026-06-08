const { put } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'No image provided' });

    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 string' });
    }

    const type = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    const blob = await put(filename || `banner-${Date.now()}.jpg`, buffer, {
      access: 'public',
      contentType: type
    });

    res.status(200).json({ url: blob.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
