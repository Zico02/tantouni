// The photos committed in server/uploads are published as static files (served by Vercel's CDN).
import fs from 'node:fs';

fs.cpSync('server/uploads', 'dist/uploads', { recursive: true });
console.log('[tantoni] copied server/uploads -> dist/uploads');
