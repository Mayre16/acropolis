import type { CmsPublishResult } from "@/lib/cms/api-client";
import { postToEditor } from "@/lib/cms/edit-bridge";

export const CMS_PUBLISH_DEPLOY_MSG =
  "Publicado. Los cambios estarán visibles en el sitio en 3–5 minutos (actualización automática en curso).";

export const CMS_PUBLISH_LIVE_MSG =
  "Publicado. El contenido ya está en el CMS; si el sitio público no cambia, el deploy FTP/GitHub no se ejecutó.";

export function cmsPublishUserMessage(result: CmsPublishResult): string {
  if (result.message) return result.message;
  const deploy = result.deploy as
    | { queued?: boolean; reason?: string; primary?: { queued?: boolean; reason?: string } }
    | undefined;
  if (deploy?.queued || deploy?.primary?.queued) return CMS_PUBLISH_DEPLOY_MSG;
  return CMS_PUBLISH_LIVE_MSG;
}

export function notifyCmsPublishSuccess(result: CmsPublishResult) {
  const text = cmsPublishUserMessage(result);
  postToEditor({ type: "cms-status", text, ok: true });
  postToEditor({ type: "cms-dirty", dirty: false });
  postToEditor({ type: "cms-published" });
}
