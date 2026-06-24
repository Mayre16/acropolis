import type { CmsDocument, SiteId } from "./content-types";

const API_URL =
  process.env.NEXT_PUBLIC_CMS_API_URL?.replace(/\/$/, "") ||
  "http://localhost:3401";

function authHeaders(token?: string | null): HeadersInit {
  const h: HeadersInit = { "Content-Type": "application/json" };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export function getApiUrl() {
  return API_URL;
}

type AuthJson = {
  ok?: boolean;
  error?: string;
  pendingToken?: string;
  need_2fa?: boolean;
  need_2fa_setup?: boolean;
  token?: string;
  role?: string;
  label?: string;
  secret?: string;
  uri?: string;
  message?: string;
  totpEnabled?: boolean;
};

export type AuthResult = AuthJson & { ok: boolean };

async function authFetch(
  path: string,
  body?: Record<string, unknown>,
  sessionToken?: string | null,
): Promise<{ res: Response; data: AuthJson }> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: authHeaders(sessionToken),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as AuthJson;
  return { res, data };
}

export async function authLogin(
  username: string,
  password: string,
): Promise<AuthResult> {
  const { res, data } = await authFetch("/auth/login", { username, password });
  return { ok: res.ok && data.ok !== false, ...data };
}

export async function authSetup2fa(
  sessionToken: string,
  pendingToken?: string,
): Promise<AuthResult> {
  const { res, data } = await authFetch(
    "/auth/setup-2fa",
    pendingToken ? { pendingToken } : {},
    sessionToken,
  );
  return { ok: res.ok && data.ok !== false, ...data };
}

export async function authVerify2fa(
  pendingToken: string,
  code: string,
): Promise<AuthResult> {
  const { res, data } = await authFetch("/auth/verify-2fa", {
    pendingToken,
    code,
  });
  return { ok: res.ok && data.ok !== false, ...data };
}

export async function authConfirm2fa(
  sessionToken: string,
  code: string,
  pendingToken?: string,
): Promise<AuthResult> {
  const { res, data } = await authFetch(
    "/auth/confirm-2fa",
    { pendingToken: pendingToken ?? "", code },
    sessionToken,
  );
  return { ok: res.ok && data.ok !== false, ...data };
}

export async function fetchAuthMe(token: string) {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) return null;
  return res.json() as Promise<{
    ok: boolean;
    role: string;
    label: string;
    username: string;
    totpEnabled?: boolean;
  }>;
}

export type AuthCheckResult = "ok" | "invalid" | "offline";

export async function checkAuth(token: string): Promise<AuthCheckResult> {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: authHeaders(token),
      credentials: "include",
    });
    if (res.status === 401 || res.status === 403) return "invalid";
    if (!res.ok) return "offline";
    return "ok";
  } catch {
    return "offline";
  }
}

export async function fetchDraft(site: SiteId, token: string) {
  const res = await fetch(`${API_URL}/content/${site}/draft`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("No se pudo cargar el borrador");
  return res.json() as Promise<CmsDocument>;
}

export async function saveDraft(site: SiteId, token: string, doc: CmsDocument) {
  const res = await fetch(`${API_URL}/content/${site}/draft`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(doc),
  });
  if (!res.ok) throw new Error("Error al guardar borrador");
  return res.json();
}

export type PublishResult = {
  ok?: boolean;
  deploy?: {
    queued?: boolean;
    site?: string;
    reason?: string;
  };
  message?: string;
};

export async function publish(site: SiteId, token: string): Promise<PublishResult> {
  const res = await fetch(`${API_URL}/content/${site}/publish`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Error al publicar");
  return res.json() as Promise<PublishResult>;
}

export async function listBackups(site: SiteId, token: string) {
  const res = await fetch(`${API_URL}/content/${site}/backups`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Error al listar respaldos");
  return res.json() as Promise<{ backups: string[] }>;
}

export async function rollback(site: SiteId, token: string, filename: string) {
  const res = await fetch(`${API_URL}/content/${site}/rollback`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ filename }),
  });
  if (!res.ok) throw new Error("Error al restaurar");
}

export async function uploadImage(
  site: SiteId,
  token: string,
  file: File,
): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_URL}/upload/${site}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!res.ok) throw new Error("Error al subir imagen");
  const data = await res.json();
  const url = data.url as string;
  if (url.startsWith("/uploads/")) return url;
  const rel = url.match(/(\/uploads\/(?:acropolis|civis|editorial)\/[^\s"?#]+)/)?.[1];
  if (rel) return rel;
  return url;
}

export type UploadInventoryFile = {
  filename: string;
  publicPath: string;
  relativePath: string;
  sizeBytes: number;
  modifiedAt: string;
  inUse: boolean;
  status: "in_use" | "orphan";
};

export type UploadInventory = {
  files: UploadInventoryFile[];
  referencedCount: number;
  orphanCount: number;
  uploadsFolder: string;
};

export type SmtpSettings = {
  host: string;
  port: number;
  secure: string;
  user: string;
  passwordSet?: boolean;
  from_email: string;
  from_name: string;
  forms: {
    civis_solicitud: {
      to_email: string;
      to_name: string;
      subject_prefix: string;
      copy_to_sender: boolean;
    };
  };
};

export async function fetchSmtpSettings(token: string): Promise<SmtpSettings> {
  const res = await fetch(`${API_URL}/settings/smtp`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("No se pudo cargar la configuración SMTP");
  return res.json() as Promise<SmtpSettings>;
}

export async function saveSmtpSettings(
  token: string,
  settings: SmtpSettings & { password?: string },
): Promise<SmtpSettings & { ok?: boolean }> {
  const res = await fetch(`${API_URL}/settings/smtp`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error("Error al guardar configuración SMTP");
  return res.json() as Promise<SmtpSettings & { ok?: boolean }>;
}

export async function fetchUploadInventory(
  site: SiteId,
  token: string,
): Promise<UploadInventory> {
  const res = await fetch(`${API_URL}/uploads/${site}/inventory`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("No se pudo cargar el inventario de archivos");
  return res.json() as Promise<UploadInventory>;
}

/** URL pública del JSON publicado (sin auth). */
export function publishedJsonUrl(site: SiteId) {
  return `${API_URL}/content/${site}/published`;
}

export type CmsUser = {
  id: string;
  username: string;
  email: string;
  role: string;
  label: string;
  totpEnabled: boolean;
  disabled: boolean;
  createdAt: string | null;
};

export async function fetchCmsUsers(token: string): Promise<CmsUser[]> {
  const res = await fetch(`${API_URL}/auth/users`, {
    headers: authHeaders(token),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    users?: CmsUser[];
    error?: string;
  };
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "No se pudo cargar usuarios");
  }
  return data.users ?? [];
}

export async function createCmsUser(
  token: string,
  body: {
    email: string;
    password: string;
    role: string;
    label: string;
  },
): Promise<CmsUser> {
  const res = await fetch(`${API_URL}/auth/users`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    user?: CmsUser;
    error?: string;
  };
  if (!res.ok || !data.ok || !data.user) {
    throw new Error(data.error || "No se pudo crear el usuario");
  }
  return data.user;
}

export async function updateCmsUser(
  token: string,
  userId: string,
  body: { label?: string; role?: string; disabled?: boolean },
): Promise<CmsUser> {
  const res = await fetch(`${API_URL}/auth/users/${userId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    user?: CmsUser;
    error?: string;
  };
  if (!res.ok || !data.ok || !data.user) {
    throw new Error(data.error || "No se pudo actualizar el usuario");
  }
  return data.user;
}

export async function resetCmsUserPassword(
  token: string,
  userId: string,
  password: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/auth/users/${userId}/reset-password`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ password }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
  };
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "No se pudo cambiar la contraseña");
  }
}

export async function clearCmsUserTotp(
  token: string,
  userId: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/auth/users/${userId}/totp`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
  };
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "No se pudo desactivar 2FA");
  }
}

export async function deleteCmsUser(
  token: string,
  userId: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/auth/users/${userId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
  };
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "No se pudo eliminar el usuario");
  }
}
