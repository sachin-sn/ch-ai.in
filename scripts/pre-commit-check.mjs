#!/usr/bin/env node
// Runs before every commit (see .husky/pre-commit). This repo has four
// independent projects, each with its own package.json/tsconfig
// (code/, code/infra/, code/infra-bootstrap/, code/lambda/resume-api/), so
// "lint the repo" means figuring out which of those a commit actually
// touches and running THAT project's own checks -- the same commands CI
// runs, just earlier, on your machine, before a bad commit exists at all.
//
// Deliberately whole-project checks, not per-file linting of only the
// staged lines: the four projects here are small enough that a full check
// takes a few seconds, and a per-file-only tool would have missed exactly
// the kind of issue this was added after (a lint error in an unrelated
// file broke CI on an unrelated push -- see code/eslint.config.mjs's
// Chitragpta/** exclusion).

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function stagedFiles() {
  const out = execFileSync(
    "git",
    ["diff", "--cached", "--name-only", "--diff-filter=ACMR"],
    { cwd: repoRoot, encoding: "utf8" }
  );
  return out.split("\n").filter(Boolean);
}

function currentBranch() {
  return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
}

// Client-side mirror of the GitHub branch-protection rule on main: fails
// fast, locally, instead of making you find out only when `git push` is
// rejected.
const PROTECTED_BRANCHES = new Set(["main", "master"]);
const branch = currentBranch();
if (PROTECTED_BRANCHES.has(branch)) {
  console.error(
    `\n✖ Commits directly to "${branch}" are blocked locally (it's also protected on GitHub).\n` +
      `  Create a branch first: git checkout -b your-branch-name\n`
  );
  process.exit(1);
}

const files = stagedFiles();
if (files.length === 0) {
  process.exit(0);
}

// Order matters only for readability of the output, not correctness.
const projects = [
  {
    name: "code (Next.js app)",
    cwd: "code",
    // Everything under code/ EXCEPT the other three projects' own
    // directories and the excluded legacy folder -- those are handled by
    // their own entries below (or, for Chitragpta, intentionally not
    // checked at all -- see eslint.config.mjs).
    match: (f) =>
      f.startsWith("code/") &&
      !f.startsWith("code/infra/") &&
      !f.startsWith("code/infra-bootstrap/") &&
      !f.startsWith("code/lambda/") &&
      !f.startsWith("code/Chitragpta/"),
    // Mirrors .github/workflows/app-deploy.yml's actual gate exactly.
    steps: [{ label: "eslint", command: ["npm", "run", "lint"] }],
  },
  {
    name: "code/infra (CDKTF)",
    cwd: "code/infra",
    match: (f) => f.startsWith("code/infra/"),
    steps: [{ label: "tsc --noEmit", command: ["npm", "run", "compile"] }],
  },
  {
    name: "code/infra-bootstrap (CDKTF)",
    cwd: "code/infra-bootstrap",
    match: (f) => f.startsWith("code/infra-bootstrap/"),
    steps: [{ label: "tsc --noEmit", command: ["npm", "run", "compile"] }],
  },
  {
    name: "code/lambda/resume-api",
    cwd: "code/lambda/resume-api",
    match: (f) => f.startsWith("code/lambda/resume-api/"),
    // Mirrors .github/workflows/infra.yml's "Build resume-api Lambda
    // bundle" step -- a type error OR an esbuild bundling error would
    // both fail that step, so check both here too.
    steps: [
      { label: "tsc --noEmit", command: ["npm", "run", "compile"] },
      { label: "esbuild bundle", command: ["npm", "run", "build"] },
    ],
  },
];

let anyFailed = false;

for (const project of projects) {
  const touched = files.some(project.match);
  if (!touched) continue;

  const absCwd = path.join(repoRoot, project.cwd);
  if (!existsSync(path.join(absCwd, "node_modules"))) {
    console.error(
      `\n✖ ${project.name}: staged changes here, but node_modules is missing.\n` +
        `  Run: (cd ${project.cwd} && npm install)\n`
    );
    anyFailed = true;
    continue;
  }

  console.log(`\n→ ${project.name}`);
  for (const step of project.steps) {
    const result = spawnSync(step.command[0], step.command.slice(1), {
      cwd: absCwd,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    if (result.status !== 0) {
      console.error(`  ✖ ${step.label} failed`);
      anyFailed = true;
      break; // no point running the next step once one has already failed
    }
    console.log(`  ✓ ${step.label}`);
  }
}

if (anyFailed) {
  console.error(
    "\nCommit blocked. Fix the above, or in a real emergency skip with `git commit --no-verify`.\n"
  );
  process.exit(1);
}

process.exit(0);
