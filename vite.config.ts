import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import http from 'node:http';

// Dev-only proxy: keeps the OpenRouter API key on the server side.
// Set OPENROUTER_API_KEY in the environment to enable.
function openrouterProxyPlugin(): Plugin {
  return {
    name: 'openrouter-proxy',
    configureServer(server) {
      server.middlewares.use('/api/openrouter', (req, res) => {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'OPENROUTER_API_KEY not set' }));
          return;
        }
        const chunks: Buffer[] = [];
        req.on('data', (c) => chunks.push(c as Buffer));
        req.on('end', () => {
          const body = Buffer.concat(chunks);
          const proxyReq = http.request(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              method: req.method || 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
                'HTTP-Referer': 'http://localhost:5173',
                'X-Title': 'FitStart AI',
                'Content-Length': String(body.length),
              },
            },
            (proxyRes) => {
              res.statusCode = proxyRes.statusCode || 502;
              Object.entries(proxyRes.headers).forEach(([k, v]) => {
                if (v !== undefined) res.setHeader(k, v as string | string[]);
              });
              proxyRes.pipe(res);
            },
          );
          proxyReq.on('error', (err) => {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: String(err) }));
          });
          proxyReq.write(body);
          proxyReq.end();
        });
      });
    },
  };
}

export default defineConfig({
  base: '/FitStart_AI/',
  plugins: [react(), openrouterProxyPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});