require('dotenv').config();
const express = require('express');
const request = require('request');
const morgan = require('morgan');
const app = express();
const PORT = process.env.PORT || 3000;

// Logger
app.use(morgan('dev'));

// CORS Middleware
app.use((req, res, next) => {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(',');
  const origin = req.headers.origin;
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'CORS Blocked Origin' });
  }
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  next();
});

// ✅ Home route (open for everyone)
app.get('/', (req, res) => {
  res.send('✅ Stream Proxy is running. No API key required here.');
});

// API Key Middleware (only for /stream route)
app.use('/stream', (req, res, next) => {
  const key = req.headers['x-api-key'];
  if (process.env.API_KEY && key !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized - Invalid API key' });
  }
  next();
});

// 🎥 Stream Endpoint
app.get('/stream', (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl || !/^https?:\/\/.+/.test(targetUrl)) {
    return res.status(400).json({ error: 'Invalid or missing "url" parameter.' });
  }

  if (!targetUrl.match(/\.(m3u8|mp4|ts|webm)(\?.*)?$/i)) {
    return res.status(400).json({ error: 'Unsupported media type.' });
  }

  const customHeaders = {
    'User-Agent': req.query.ua || 'MyAdvancedClient/1.0',
    'Referer': req.query.referer || 'https://appx-play.akamai.net.in/',
    'Origin': req.query.origin || 'https://appx-play.akamai.net.in/',
    'X-Custom-Auth': req.query.token || undefined
  };

  console.log(`[+] Streaming: ${targetUrl}`);

  request
    .get({
      url: targetUrl,
      headers: customHeaders,
      timeout: 10000
    })
    .on('error', (err) => {
      console.error('[-] Stream error:', err.message);
      res.status(500).send('Stream Error');
    })
    .pipe(res);
});

app.listen(PORT, () => {
  console.log(`🚀 Advanced Stream Proxy running on port ${PORT}`);
});
