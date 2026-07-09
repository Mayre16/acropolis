import {
  isCmsEditOrigin,
  postToEditor,
  type CmsEditMessage,
} from "@/lib/cms/edit-bridge";

export type CmsEditSession = {
  token: string;
  site: "circulodeamigos";
};

const CMS_EDIT_SESSION_KEY = "circulodeamigos-cms-edit-session";

let session: CmsEditSession | null = null;
const listeners = new Set<(value: CmsEditSession) => void>();

function readStoredSession(): CmsEditSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CMS_EDIT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CmsEditSession;
    if (!parsed?.token || parsed.site !== "circulodeamigos") return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistSession(value: CmsEditSession | null) {
  if (typeof window === "undefined") return;
  try {
    if (value) {
      sessionStorage.setItem(CMS_EDIT_SESSION_KEY, JSON.stringify(value));
    } else {
      sessionStorage.removeItem(CMS_EDIT_SESSION_KEY);
    }
  } catch {
    // quota exceeded
  }
}

export function getCmsEditSession(): CmsEditSession | null {
  if (session) return session;
  session = readStoredSession();
  return session;
}

export function setCmsEditSession(value: CmsEditSession | null) {
  session = value;
  persistSession(value);
  for (const listener of listeners) listener(value ?? ({ token: "", site: "circulodeamigos" } as CmsEditSession));
}

export function registerCmsEditInit(
  onInit: (token: string) => void,
  expectedSite: "circulodeamigos" = "circulodeamigos",
) {
  function handle(msg: CmsEditMessage) {
    if (msg.type !== "cms-edit-init") return;
    if (msg.site !== expectedSite) return;
    setCmsEditSession({ token: msg.token, site: "circulodeamigos" });
    onInit(msg.token);
  }

  function onMessage(ev: MessageEvent<CmsEditMessage>) {
    if (!isCmsEditOrigin(ev.origin)) return;
    handle(ev.data);
  }

  window.addEventListener("message", onMessage);
  postToEditor({ type: "cms-request-init" });

  const existing = getCmsEditSession();
  if (existing?.token) onInit(existing.token);

  return () => window.removeEventListener("message", onMessage);
}
