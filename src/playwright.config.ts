import { defineConfig, devices } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
if (!process.env.BEST5_E2E_DB_PATH) process.env.BEST5_E2E_DB_PATH=join(mkdtempSync(join(tmpdir(),'best5-browser-tests-')),'e2e.db');
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'list',
  use: { baseURL:'http://127.0.0.1:5175', trace:'retain-on-failure' },
  projects: [{name:'chromium',use:{...devices['Desktop Chrome']}}],
  webServer: [
    {command:'../../football_exhibition_backend/src/.venv/bin/python ../../football_exhibition_backend/src/scripts/e2e-server.py',url:'http://127.0.0.1:8001/api/v1/health',reuseExistingServer:false},
    {command:'npm run dev -- --host 127.0.0.1 --port 5175 --strictPort',url:'http://127.0.0.1:5175',env:{BEST5_BACKEND_URL:'http://127.0.0.1:8001',FRONTEND_PORT:'5175',VITE_FRONTEND_BASE_URL:'http://127.0.0.1:5175',VITE_ALLOWED_HOSTS:'localhost,127.0.0.1'},reuseExistingServer:false},
  ],
});
