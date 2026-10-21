const fs = require('node:fs');
const input = process.env.SHOPAI_API_URL;
if (!input) throw new Error('Set SHOPAI_API_URL, for example http://127.0.0.1:3000/api');
const url = new URL(input);
if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Invalid API URL');
if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') throw new Error('Production API must use HTTPS');
fs.writeFileSync('src/constants/environment.ts', `// Public server URL. Never put API keys here.\nexport const API_BASE_URL = ${JSON.stringify(input.replace(/\/$/, ''))};\n`);
