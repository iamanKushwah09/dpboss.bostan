module.exports = async function handler(req, res) {
  try {
    const response = await fetch("https://jsonblob.com/api/jsonBlob/019e8e65-73ad-76d9-89d0-58feb69ffdb0");
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
