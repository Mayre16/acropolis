/**
 * Dispara rebuild en GitHub Actions (dev-api y producción Node).
 * Variables: CMS_GITHUB_REPO, CMS_GITHUB_DEPLOY_TOKEN
 */
export async function triggerDeployWebhook(site) {
  if (!/^(acropolis|civis|tienda)$/.test(site)) {
    return { queued: false, reason: "invalid_site" };
  }

  const repo = process.env.CMS_GITHUB_REPO?.trim() || "";
  const token = process.env.CMS_GITHUB_DEPLOY_TOKEN?.trim() || "";

  if (!repo || !token) {
    return { queued: false, reason: "not_configured" };
  }

  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) {
    return { queued: false, reason: "invalid_repo" };
  }

  const res = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      "User-Agent": "Acropolis-CMS-Deploy",
    },
    body: JSON.stringify({
      event_type: "cms-publish",
      client_payload: {
        site,
        published_at: new Date().toISOString(),
      },
    }),
  });

  if (res.ok) {
    return { queued: true, site };
  }

  const detail = await res.text().catch(() => "");
  return {
    queued: false,
    reason: "github_error",
    status: res.status,
    detail: detail.slice(0, 200),
  };
}

export const CMS_PUBLISH_DEPLOY_MSG =
  "Publicado. Los cambios estarán visibles en el sitio en 3–5 minutos (actualización automática en curso).";

export const CMS_PUBLISH_LIVE_MSG =
  "Publicado. El contenido ya está disponible; recarga la página si no lo ves.";

export function cmsPublishUserMessage(deploy) {
  if (deploy?.queued || deploy?.primary?.queued || deploy?.tienda?.queued) {
    return CMS_PUBLISH_DEPLOY_MSG;
  }
  return CMS_PUBLISH_LIVE_MSG;
}

/** Tras publicar Acropolis, también reconstruye Editorial (sedes/regalos estáticos). */
export async function triggerDeployAfterPublish(site) {
  if (site === "editorial") {
    const tienda = await triggerDeployWebhook("tienda");
    return { site, primary: tienda, tienda };
  }
  const primary = await triggerDeployWebhook(site);
  if (site !== "acropolis") {
    return { site, primary };
  }
  const tienda = await triggerDeployWebhook("tienda");
  return { site, primary, tienda };
}
