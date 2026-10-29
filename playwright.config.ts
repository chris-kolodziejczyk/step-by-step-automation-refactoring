import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: process.env.QC_SMOKE === '1' ? '**/smoke/*.spec.ts' : '**/{legacy,refactored}/*.spec.ts',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  timeout: 15_000,
  expect: { timeout: 4_000 },
  outputDir: process.env.QC_OUTPUT_DIR || 'evidence/latest/traces',
  reporter: [
    ['line'],
    ['./scripts/evidence-reporter.ts'],
    ['html', { outputFolder: process.env.QC_HTML_DIR || 'evidence/latest/html', open: 'never' }],
  ],
  use: {
    baseURL: process.env.QC_BASE_URL || 'http://127.0.0.1:3100',
    browserName: 'chromium',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  webServer: process.env.QC_EXTERNAL_SERVER === '1' ? undefined : {
    command: 'node app/server.mjs',
    url: 'http://127.0.0.1:3100/healthz',
    reuseExistingServer: false,
    timeout: 10_000,
  },
});
