// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    /* Ajustado a 127.0.0.1 para coincidir con el --host de tu package.json */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'https://127.0.0.1:5174/',

    /* Ignora errores de certificados SSL auto-firmados (esencial por tu basic-ssl) */
    ignoreHTTPSErrors: true,

    /* Recolecta trazas en caso de fallos */
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'yarn dev',                 
    url: 'https://127.0.0.1:5174/',       
    reuseExistingServer: !process.env.CI, 
    timeout: 60000,                      
  },
});