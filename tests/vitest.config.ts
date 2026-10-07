import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Lives in tests/ with the tests it runs; the project root is one level up.
const root = fileURLToPath(new URL("../", import.meta.url));

export default defineConfig({
  root,
  plugins: [react()],
  resolve: { alias: { "@": root } },
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    globals: true,
  },
});
