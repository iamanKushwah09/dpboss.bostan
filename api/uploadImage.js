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

    const timestamp = Date.now();
    const namePrefix = filename ? filename.split('.')[0] : 'banner';
    const extMatch = type.match(/\/([a-zA-Z0-9]+)$/);
    const ext = extMatch ? (extMatch[1] === 'jpeg' ? 'jpg' : extMatch[1]) : 'jpg';
    const finalFilename = `${namePrefix}-${timestamp}.${ext}`;

    const blob = await put(finalFilename, buffer, {
      access: 'public',
      contentType: type,
      addRandomSuffix: true
    });

    res.status(200).json({ url: blob.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
