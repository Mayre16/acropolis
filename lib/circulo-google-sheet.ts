import type { CirculoAmigosInscriptionValues } from "@/lib/circulo-amigos-content";
import {
  CIRCULO_AMIGOS_DOCUMENT_TYPES,
  CIRCULO_AMIGOS_INTEREST_AREAS,
  CIRCULO_AMIGOS_REFERRAL_SOURCES,
} from "@/lib/circulo-amigos-content";

/**
 * Webhook Apps Script → Google Sheet «Círculo de Amigos – Respuestas».
 * El secret también está en el script de Google; a medio plazo conviene
 * proxy PHP en el editor (sin exponer el secret en el JS público).
 */
const CIRCULO_SHEET_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbyB2Te1ZYHQXOKoGsE9Em4Kch4ENkzUGylkIhbnM8oh9zhR8OJFil6OdPM3IwS3BBRATg/exec";

const CIRCULO_SHEET_SECRET = "circulo-rd-2026-na";

/** Escribe una fila en el Sheet. No lanza: el correo ya se envió. */
export async function appendCirculoInscriptionToSheet(
  values: CirculoAmigosInscriptionValues,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const docLabel =
      CIRCULO_AMIGOS_DOCUMENT_TYPES.find((d) => d.value === values.tipoDocumento)
        ?.label ?? values.tipoDocumento;
    const viaLabel =
      CIRCULO_AMIGOS_REFERRAL_SOURCES.find(
        (v) => v.value === values.viaReferencia,
      )?.label ?? values.viaReferencia;
    const areas = values.areasInteres.map(
      (id) =>
        CIRCULO_AMIGOS_INTEREST_AREAS.find((a) => a.value === id)?.label ?? id,
    );

    const res = await fetch(CIRCULO_SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        secret: CIRCULO_SHEET_SECRET,
        email: values.email.trim(),
        nombre: values.nombre.trim(),
        telefono: values.telefono.trim(),
        pais: values.pais.trim(),
        ciudad: values.ciudad.trim(),
        motivacion: values.motivacion.trim(),
        areasInteres: areas,
        confirmaCompromiso: values.confirmaCompromiso,
        tipoDocumento: values.tipoDocumento,
        tipoDocumentoLabel: docLabel,
        numeroDocumento: values.numeroDocumento.trim(),
        fechaNacimiento: values.fechaNacimiento.trim(),
        viaReferencia: viaLabel,
      }),
      // Apps Script redirige; en navegador fetch sigue el redirect.
      redirect: "follow",
      mode: "cors",
    });

    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
    };
    if (!res.ok || data.ok === false) {
      return { ok: false, error: data.error ?? `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
