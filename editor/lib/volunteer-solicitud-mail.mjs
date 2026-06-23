import { verifyTurnstile } from "./turnstile.mjs";
import {
  sendFormMailOrDev,
  validateContactFields,
} from "./form-mail-utils.mjs";
import { loadSmtpConfig } from "./smtp-config.mjs";

const ALLOWED_AREAS = new Set([
  "Humanitario con niños",
  "Humanitario con ancianos",
  "Punto Focal Esfera",
  "Feria de la salud",
  "Ecológico",
]);

export function validateVolunteerPayload(body) {
  const contact = validateContactFields(body);
  if (!contact.ok) return contact;

  const areas = Array.isArray(body?.areas)
    ? body.areas.map((a) => String(a).trim()).filter(Boolean)
    : [];
    const validAreas = areas.filter((a) => ALLOWED_AREAS.has(a));
  if (validAreas.length === 0) {
    return { ok: false, error: "Elija al menos una línea de participación." };
  }

  const mensaje = String(body?.mensaje ?? "").trim();
  if (mensaje.length > 4000) {
    return { ok: false, error: "El comentario es demasiado largo." };
  }

  const message = String(body?.message ?? "").trim();
  if (message.length < 40) {
    return { ok: false, error: "El contenido de la solicitud es incompleto." };
  }
  if (message.length > 12000) {
    return { ok: false, error: "La solicitud supera el tamaño permitido." };
  }

  return {
    ok: true,
    data: {
      ...contact.data,
      areas: validAreas,
      mensaje,
      message,
    },
  };
}

export async function sendVolunteerSolicitudMail(body, remoteIp) {
  const bot = await verifyTurnstile(
    body?.turnstileToken,
    remoteIp,
    body?.website,
  );
  if (!bot.ok) return bot;

  const check = validateVolunteerPayload(body);
  if (!check.ok) return check;

  const cfg = loadSmtpConfig();
  const form = cfg.forms?.voluntariado_solicitud ?? {};
  const toEmail = String(
    form.to_email ?? "voluntariado.humanitario-RD@acropolis.org",
  ).trim();
  const toName = String(form.to_name ?? "Voluntariado Humanitario").trim();
  const subject = `[Nueva Acrópolis RD] Solicitud de voluntariado — ${check.data.nombre}`;

  const cc = [];
  const senderEmail = check.data.email;
  if (senderEmail && (form.copy_to_sender ?? false) !== false) {
    cc.push(senderEmail);
  }

  return sendFormMailOrDev({
    formId: "voluntariado-solicitud",
    toEmail,
    toName,
    subject,
    body: check.data.message,
    replyTo: senderEmail || undefined,
    cc,
  });
}
