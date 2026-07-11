module.exports = async function handler(req, res) {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const apiKey = req.query.api_key || process.env.SERPAPI_KEY;

    if (!apiKey) {
        return res.status(400).json({ error: 'Missing_API_Key' });
    }

    try {
        const serpApiUrl = `https://serpapi.com/account?api_key=${encodeURIComponent(apiKey)}`;
        const response = await fetch(serpApiUrl);
        const data = await response.json();
        
        res.status(response.status).json(data);
    } catch (error) {
        console.error('SerpApi Error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}
