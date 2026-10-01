import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import tseslint from "typescript-eslint";

// eslint-config-next v16 exports a flat-config ARRAY, not a factory function.
// core-web-vitals includes the base config plus performance rules that catch
// raw <img> tags and sync scripts — both of which would cost us the budget.
export default tseslint.config(
  // .kilo/worktrees holds git worktrees created by other tooling. They are
  // full copies of the repo, so linting them double-reports every file and
  // misses the tests/** overrides (which resolve from the config root).
  { ignores: [".next/**", "node_modules/**", "docs/**", "playwright-report/**", ".kilo/**"] },
  ...nextCoreWebVitals,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
    },
  },
  {
    files: ["tests/**/*.ts", "tests/**/*.tsx"],
    rules: { "@typescript-eslint/no-non-null-assertion": "off" },
  },
);
