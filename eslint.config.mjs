import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import tseslint from "typescript-eslint";

// eslint-config-next v16 exports a flat-config ARRAY, not a factory function.
// core-web-vitals includes the base config plus performance rules that catch
// raw <img> tags and sync scripts — both of which would cost us the budget.
export default tseslint.config(
  { ignores: [".next/**", "node_modules/**", "docs/**", "playwright-report/**"] },
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
