import {
  isCmsEditOrigin,
  postToEditor,
  type CmsEditMessage,
} from "@/lib/cms/edit-bridge";

export type CmsEditSession = {
  token: string;
  site: "acropolis" | "civis" | "editorial";
};

let session: CmsEditSession | null = null;
const listeners = new Set<(value: CmsEditSession) => void>();

export function setCmsEditSession(value: CmsEditSession) {
  if (session?.token === value.token && session.site === value.site) return;
  session = value;
  for (const listener of listeners) listener(value);
}

export function getCmsEditSession(): CmsEditSession | null {
  return session;
}

export function subscribeCmsEditSession(
  listener: (value: CmsEditSession) => void,
) {
  listeners.add(listener);
  if (session) listener(session);
  return () => listeners.delete(listener);
}

export function registerCmsEditInit(
  onInit: (token: string, site: "acropolis" | "civis" | "editorial") => void,
  site: "acropolis" | "civis" | "editorial",
) {
  function apply(value: CmsEditSession) {
    if (value.site !== site) return;
    onInit(value.token, value.site);
  }

  const unsub = subscribeCmsEditSession(apply);

  function onMessage(ev: MessageEvent<CmsEditMessage>) {
    if (!isCmsEditOrigin(ev.origin)) return;
    const msg = ev.data;
    if (!msg || typeof msg !== "object" || msg.type !== "cms-edit-init") return;
    setCmsEditSession({ token: msg.token, site: msg.site });
  }

  window.addEventListener("message", onMessage);
  postToEditor({ type: "cms-request-init" });

  return () => {
    unsub();
    window.removeEventListener("message", onMessage);
  };
}
