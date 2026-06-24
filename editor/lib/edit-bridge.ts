/** Mensajes iframe ↔ editor (mismos tipos que principal/lib/cms/edit-bridge.ts). */

export type CmsEditMessage =
  | { type: "cms-edit-init"; token: string; site: "acropolis" | "civis" | "editorial" }
  | { type: "cms-request-init" }
  | { type: "cms-save" }
  | { type: "cms-publish" }
  | { type: "cms-status"; text: string; ok?: boolean }
  | { type: "cms-ready" }
  | { type: "cms-dirty"; dirty: boolean }
  | { type: "cms-published" };
