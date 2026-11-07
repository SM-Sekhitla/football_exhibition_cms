import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
  // loadEnv includes .env, .env.local and mode files; shell overrides still win.
  // Only selected values below configure Vite. Server secrets are never exposed via define.
  const env = { ...loadEnv(mode, root, ''), ...process.env };
  const frontend = env.VITE_FRONTEND_BASE_URL ? new URL(env.VITE_FRONTEND_BASE_URL) : undefined;
  const port = Number(env.FRONTEND_PORT || frontend?.port || 5173);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('FRONTEND_PORT must be between 1 and 65535.');
  const rawHosts = env.VITE_ALLOWED_HOSTS || 'localhost,127.0.0.1';
  const allowedHosts: string[] = rawHosts.trim().startsWith('[') ? JSON.parse(rawHosts) : rawHosts.split(',').map(x => x.trim()).filter(Boolean);
  if (!Array.isArray(allowedHosts) || allowedHosts.some(host => typeof host !== 'string' || host === '*')) throw new Error('VITE_ALLOWED_HOSTS must list explicit hostnames.');
  const target = process.env.BEST5_BACKEND_URL || process.env.VITE_API_TARGET || env.VITE_API_TARGET || env.BEST5_BACKEND_URL || 'http://127.0.0.1:8002';
  const backend = new URL(target);
  if (!['http:', 'https:'].includes(backend.protocol)) throw new Error('VITE_API_TARGET must be an HTTP(S) URL.');
  const api = env.VITE_API_URL || '/api/v1';
  const proxyPath = api.startsWith('/') ? api.replace(/\/$/, '') : '/api';
  const proxy = { [proxyPath]: { target, changeOrigin: true } };
  return {
    plugins: [react()],
    server: { port, strictPort: true, allowedHosts, origin: frontend?.origin, proxy },
    preview: { port, strictPort: true, allowedHosts, proxy },
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    optimizeDeps: { exclude: ['lucide-react'] },
  };
});
