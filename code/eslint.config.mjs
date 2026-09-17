import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // lambda/resume-api is a separate mini-project (its own package.json,
    // its own esbuild bundling) -- not part of the Next.js app. Its dist/
    // bundle is a large minified file that this app's lint has no business
    // parsing (it isn't even valid to typescript-eslint's parser as JS).
    "lambda/**",
  ]),
]);

export default eslintConfig;
