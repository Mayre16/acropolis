import { cmsApiBase } from "@/lib/cms/api-client";

export type FormSubmitResult =
  | { ok: true; dev?: boolean; message?: string }
  | { ok: false; error: string };

export async function postForm(
  path: string,
  payload: Record<string, unknown>,
): Promise<FormSubmitResult> {
  try {
    const res = await fetch(`${cmsApiBase()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      dev?: boolean;
      message?: string;
      error?: string;
    };
    if (!res.ok || data.ok === false) {
      return {
        ok: false,
        error:
          data.error ??
          "No se pudo enviar la solicitud. Inténtelo de nuevo en unos minutos.",
      };
    }
    return {
      ok: true,
      dev: data.dev === true,
      message: data.message,
    };
  } catch {
    return {
      ok: false,
      error:
        "No se pudo conectar con el servidor. Compruebe su conexión e inténtelo de nuevo.",
    };
  }
}
