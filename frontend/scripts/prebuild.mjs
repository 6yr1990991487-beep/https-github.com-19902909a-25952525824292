import { execSync } from "node:child_process";

const isCi = String(process.env.CI || "").toLowerCase() === "true";
const isEmergent = Boolean(process.env.EMERGENT_BUILD || process.env.EMERGENT_PROJECT_ID || process.env.EMERGENT_AGENT);

if (isCi || isEmergent) {
  // Emergent/CI builds should not rewrite tracked files during the build step,
  // otherwise the platform can detect repo changes and restart the job.
  execSync("node scripts/seo-validate.mjs", { stdio: "inherit" });
  process.exit(0);
}

execSync("bash ../scripts/write-env-from-secrets.sh", { stdio: "inherit" });
execSync("npm run seo:all", { stdio: "inherit" });
