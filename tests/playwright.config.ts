import { defineConfig, devices } from "@playwright/test";

// E2E_PORT lets the suite run against its own production server while a dev
// server is already using 3000.
const port = Number(process.env.E2E_PORT ?? 3000);
const url = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: { baseURL: url, trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Run from the project root, one level up from this file.
    cwd: "..",
    command: `npm run build && npm run start -- -p ${port}`,
    url,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
