const { list } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  try {
    const { blobs } = await list({ prefix: 'settings.json' });
    if (blobs.length > 0) {
      // Fetch the file contents directly
      const response = await fetch(blobs[0].url, { cache: 'no-store' });
      const data = await response.json();
      res.status(200).json(data);
    } else {
      res.status(200).json({}); // No settings yet
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
