#!/usr/bin/env node
/**
 * Dispara rebuild+deploy en GitHub Actions para acropolis, civis o ambos.
 *
 * Uso:
 *   CMS_GITHUB_REPO=Mayre16/acropolis CMS_GITHUB_DEPLOY_TOKEN=ghp_… node editor/scripts/trigger-cms-deploy.mjs
 *   CMS_GITHUB_REPO=Mayre16/acropolis CMS_GITHUB_DEPLOY_TOKEN=ghp_… node editor/scripts/trigger-cms-deploy.mjs civis
 *   CMS_GITHUB_REPO=Mayre16/acropolis CMS_GITHUB_DEPLOY_TOKEN=ghp_… node editor/scripts/trigger-cms-deploy.mjs both
 */
import { triggerDeployWebhook } from "../lib/deploy-webhook.mjs";

const arg = (process.argv[2] || "both").trim().toLowerCase();
const sites =
  arg === "both" ? ["acropolis", "civis"] : arg === "acropolis" || arg === "civis" ? [arg] : null;

if (!sites) {
  console.error("Uso: node editor/scripts/trigger-cms-deploy.mjs [acropolis|civis|both]");
  process.exit(1);
}

let failed = false;
for (const site of sites) {
  const result = await triggerDeployWebhook(site);
  console.log(site, result);
  if (!result.queued) failed = true;
}

if (failed) {
  console.error(
    "\nNo se pudo encolar el deploy. Define CMS_GITHUB_REPO y CMS_GITHUB_DEPLOY_TOKEN,\n" +
      "o ejecuta manualmente: GitHub → Actions → CMS publish — rebuild and deploy → both",
  );
  process.exit(1);
}

console.log("\nDeploy encolado. Revisa: https://github.com/Mayre16/acropolis/actions");
