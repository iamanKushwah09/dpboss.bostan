const { put } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = JSON.stringify(req.body || {});
    
    // Save settings.json to Vercel Blob
    const blob = await put('settings.json', data, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false, // Overwrite the same file so we can easily retrieve it
      allowOverwrite: true
    });

    res.status(200).json({ success: true, url: blob.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
