#!/usr/bin/env node
/**
 * Dispara rebuild+deploy en GitHub Actions para acropolis, civis, tienda o todos.
 *
 * Uso:
 *   CMS_GITHUB_REPO=Mayre16/acropolis CMS_GITHUB_DEPLOY_TOKEN=ghp_… node editor/scripts/trigger-cms-deploy.mjs
 *   CMS_GITHUB_REPO=Mayre16/acropolis CMS_GITHUB_DEPLOY_TOKEN=ghp_… node editor/scripts/trigger-cms-deploy.mjs all
 *   CMS_GITHUB_REPO=Mayre16/acropolis CMS_GITHUB_DEPLOY_TOKEN=ghp_… node editor/scripts/trigger-cms-deploy.mjs tienda
 */
import { triggerDeployAfterPublish, triggerDeployWebhook } from "../lib/deploy-webhook.mjs";

const arg = (process.argv[2] || "all").trim().toLowerCase();
const siteMap = {
  all: ["acropolis", "civis", "tienda"],
  both: ["acropolis", "civis"],
  acropolis: ["acropolis"],
  civis: ["civis"],
  tienda: ["tienda"],
};
const sites = siteMap[arg];

if (!sites) {
  console.error("Uso: node editor/scripts/trigger-cms-deploy.mjs [all|acropolis|civis|tienda|both]");
  process.exit(1);
}

let failed = false;
for (const site of sites) {
  const result =
    site === "acropolis" ? await triggerDeployAfterPublish(site) : await triggerDeployWebhook(site);
  console.log(site, result);
  const queued =
    result.queued ||
    result.primary?.queued ||
    result.tienda?.queued;
  if (!queued) failed = true;
}

if (failed) {
  console.error(
    "\nNo se pudo encolar el deploy. Define CMS_GITHUB_REPO y CMS_GITHUB_DEPLOY_TOKEN,\n" +
      "o ejecuta manualmente: GitHub → Actions → CMS publish — rebuild and deploy → all",
  );
  process.exit(1);
}

console.log("\nDeploy encolado. Revisa: https://github.com/Mayre16/acropolis/actions");
