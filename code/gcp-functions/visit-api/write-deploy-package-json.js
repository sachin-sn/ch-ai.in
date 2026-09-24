// Cloud Build's Node.js buildpack auto-runs a "build" script if one is
// present in the deployed package.json -- so the package.json inside
// dist.zip has to be a stripped-down runtime-only copy (name, main,
// dependencies), not the same file used for local `npm run build`/
// `tsc --noEmit`. Shipping the dev copy verbatim (with its own "build"
// script) makes the buildpack try to run `tsc` again inside the zip,
// which has no tsconfig.json or src/ to compile -- that's the failure
// this file exists to avoid.
const fs = require("fs");

const pkg = require("./package.json");

const deployPkg = {
  name: pkg.name,
  version: pkg.version,
  private: pkg.private,
  main: pkg.main,
  engines: pkg.engines,
  dependencies: pkg.dependencies,
};

fs.writeFileSync("dist/package.json", JSON.stringify(deployPkg, null, 2) + "\n");
