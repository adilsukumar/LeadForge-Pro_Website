const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3847;

// Simple zero-dependency .env parser
let backendApiKey = process.env.SERPAPI_KEY || '';
try {
    const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    const match = envContent.match(/^SERPAPI_KEY=(.*)$/m);
    if (match) backendApiKey = match[1].trim();
} catch (e) {
    // Ignore if .env doesn't exist
}

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    // 1. SerpApi Proxy Endpoint
    if (parsedUrl.pathname === '/api/search') {
        const query = encodeURIComponent(parsedUrl.query.q || '');
        // Prefer frontend-provided key, fallback to backend environment key
        const apiKey = parsedUrl.query.api_key || backendApiKey;
        const encodedKey = encodeURIComponent(apiKey);
        
        if (!query || !apiKey) {
            res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            return res.end(JSON.stringify({ error: 'Missing_API_Key' }));
        }

        const serpApiUrl = `https://serpapi.com/search.json?engine=google_local&q=${query}&api_key=${encodedKey}`;

        https.get(serpApiUrl, (apiRes) => {
            res.writeHead(apiRes.statusCode, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // Allow CORS
            });
            apiRes.pipe(res);
        }).on('error', (err) => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        });
        return;
    }

    // 2. SerpApi Account Endpoint
    if (parsedUrl.pathname === '/api/account') {
        const apiKey = parsedUrl.query.api_key || backendApiKey;
        const encodedKey = encodeURIComponent(apiKey);
        
        if (!apiKey) {
            res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            return res.end(JSON.stringify({ error: 'Missing_API_Key' }));
        }

        const serpApiUrl = `https://serpapi.com/account?api_key=${encodedKey}`;

        https.get(serpApiUrl, (apiRes) => {
            res.writeHead(apiRes.statusCode, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // Allow CORS
            });
            apiRes.pipe(res);
        }).on('error', (err) => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        });
        return;
    }

    // 3. Static File Server
    let pathname = `.${parsedUrl.pathname}`;
    if (pathname === './') {
        pathname = './index.html';
    }

    const ext = path.parse(pathname).ext;
    const mimeType = MIME_TYPES[ext] || 'text/plain';

    fs.readFile(pathname, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end(`File not found: ${pathname}`);
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(data);
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n🚀 LeadForge Pro server running at http://localhost:${PORT}/`);
    console.log(`📡 SerpApi proxy active on /api/search`);
    console.log(`Press Ctrl+C to stop.\n`);
});
