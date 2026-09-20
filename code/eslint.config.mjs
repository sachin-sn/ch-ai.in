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
    // Same story for the CDKTF infra projects and the GCP Cloud Function --
    // each is its own mini-project with its own package.json, and
    // pre-commit-check.mjs already treats them as separate projects with
    // their own tsc checks. Without these, `eslint .` also recurses into
    // infra-gcp/.gen and infra-gcp-bootstrap/.gen -- CDKTF's auto-generated
    // provider bindings, thousands of files and 100MB+ -- which is why a
    // plain `npm run lint` (and therefore every pre-commit hook run) could
    // take minutes locally despite passing quickly in CI (CI never runs
    // `cdktf get` for these side-projects, so .gen/ doesn't exist there).
    "infra/**",
    "infra-bootstrap/**",
    "infra-gcp/**",
    "infra-gcp-bootstrap/**",
    "gcp-functions/**",
    // Leftover from the abandoned Chitragupta.ai plan (see project notes) --
    // not imported by anything under app/components/lib/themes, i.e. dead
    // code, not the live site. Excluded rather than fixed: touching it risks
    // masking whether it's truly unused, and it isn't part of what ships.
    "Chitragpta/**",
  ]),
]);

export default eslintConfig;
