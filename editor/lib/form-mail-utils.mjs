import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSmtpConfig } from "./smtp-config.mjs";
import { sendPlainMail } from "./mail-service.mjs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function smtpReady(cfg) {
  return Boolean(cfg.host && cfg.user && cfg.password);
}

export function saveDevSubmission(formId, data) {
  const inbox = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "data",
    "forms",
    formId,
    "inbox",
  );
  fs.mkdirSync(inbox, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = path.join(inbox, `${stamp}.json`);
  fs.writeFileSync(
    file,
    JSON.stringify({ receivedAt: new Date().toISOString(), ...data }, null, 2),
    "utf8",
  );
  return file;
}

export async function sendFormMailOrDev({
  formId,
  toEmail,
  toName,
  subject,
  body,
  replyTo,
  cc,
}) {
  const cfg = loadSmtpConfig();

  if (!smtpReady(cfg)) {
    const isDev =
      process.env.NODE_ENV !== "production" ||
      process.env.CMS_DEV_SAVE_FORMS === "1";
    if (isDev) {
      const savedTo = saveDevSubmission(formId, {
        toEmail,
        toName,
        subject,
        body,
        replyTo,
        cc,
      });
      console.log(`[${formId}] SMTP sin configurar — guardado en ${savedTo}`);
      return {
        ok: true,
        dev: true,
        message:
          "Modo desarrollo: solicitud guardada localmente (SMTP no configurado).",
      };
    }
    return {
      ok: false,
      error:
        "El correo SMTP no está configurado. Contacte al administrador del sitio.",
    };
  }

  await sendPlainMail({
    cfg,
    to: toEmail,
    toName,
    cc: cc?.length ? cc : undefined,
    replyTo,
    subject,
    body,
  });

  return { ok: true };
}

export function validateContactFields(body, { emailRequired = false } = {}) {
  const nombre = String(body?.nombre ?? "").trim();
  const telefono = String(body?.telefono ?? "").trim();
  const email = String(body?.email ?? "").trim();

  if (!nombre) return { ok: false, error: "Indique su nombre." };
  if (!telefono) return { ok: false, error: "Indique teléfono o WhatsApp." };
  if (emailRequired && (!email || !EMAIL_RE.test(email))) {
    return { ok: false, error: "Indique un correo válido." };
  }
  if (email && !EMAIL_RE.test(email)) {
    return { ok: false, error: "El correo indicado no es válido." };
  }

  return { ok: true, data: { nombre, telefono, email } };
}
