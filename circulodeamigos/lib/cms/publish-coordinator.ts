import { publishCms } from "@/lib/cms/api-client";
import { postToEditor } from "@/lib/cms/edit-bridge";
import { getCmsEditSession } from "@/lib/cms/edit-session";
import { notifyCmsPublishSuccess } from "@/lib/cms/publish-notify";

export const CMS_PUBLISH_CONFIRM_MSG =
  "¿Publicar? Los visitantes verán estos cambios. Se guarda un respaldo automático.";

const savers = new Set<() => Promise<void>>();
let publishing = false;

/** Registra una rutina que fusiona su sección en el borrador antes de publicar. */
export function registerCmsDraftSaver(fn: () => Promise<void>) {
  savers.add(fn);
  return () => savers.delete(fn);
}

/** Guarda todos los borradores registrados y publica una sola vez (un solo diálogo). */
export async function runCoordinatedCmsPublish(): Promise<void> {
  if (publishing) return;

  const session = getCmsEditSession();
  if (!session?.token) return;

  if (!window.confirm(CMS_PUBLISH_CONFIRM_MSG)) return;

  publishing = true;
  postToEditor({ type: "cms-status", text: "Publicando…", ok: true });

  try {
    for (const save of [...savers]) {
      await save();
    }
    const result = await publishCms(session.site, session.token);
    notifyCmsPublishSuccess(result);
  } catch (e) {
    postToEditor({ type: "cms-status", text: String(e), ok: false });
  } finally {
    publishing = false;
  }
}
