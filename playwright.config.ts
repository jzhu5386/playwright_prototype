// playwright.config.ts
import { PlaywrightTestConfig, webkit } from "@playwright/test";

const config: PlaywrightTestConfig = {
  use: {
    headless: false,
    launchOptions: {
      slowMo: 80,
    },
    viewport: { width: 1460, height: 800 },
    ignoreHTTPSErrors: false,
    video: "retain-on-failure", // 'on'
    screenshot: "only-on-failure",
    // browserName: "firefox",
    baseURL:
      process.env.URL === undefined
        ? "https://dashboard.staging.mainstreet.com"
        : process.env.URL, //  'http://localhost:3000'
  },
  timeout: 4 * 60 * 1000,
  retries: 0,
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/test-results.json" }],
  ],
  workers: process.env.CI ? 2 : undefined,
};
export default config;
