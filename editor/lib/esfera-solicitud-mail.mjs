import { loadSmtpConfig } from "./smtp-config.mjs";
import { sendPlainMail } from "./mail-service.mjs";
import { verifyTurnstile } from "./turnstile.mjs";
import { saveDevSubmission, smtpReady } from "./form-mail-utils.mjs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function saveDevSubmissionLocal(data) {
  return saveDevSubmission("esfera-solicitud", data);
}

export function validateEsferaSolicitudPayload(body) {
  const empresa = String(body?.empresa ?? "").trim();
  const contactoNombre = String(body?.contactoNombre ?? "").trim();
  const contactoApellido = String(body?.contactoApellido ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const telefono = String(body?.telefono ?? "").trim();
  const message = String(body?.message ?? body?.body ?? "").trim();

  if (!empresa) {
    return { ok: false, error: "Indique el nombre de la empresa u organización." };
  }
  if (!contactoNombre) {
    return { ok: false, error: "Indique el nombre de la persona de contacto." };
  }
  if (!contactoApellido) {
    return { ok: false, error: "Indique el apellido." };
  }
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "Indique un correo de contacto válido." };
  }
  if (!telefono) {
    return { ok: false, error: "Indique teléfono o WhatsApp." };
  }
  if (message.length < 80) {
    return { ok: false, error: "El contenido de la solicitud es incompleto." };
  }
  if (message.length > 12000) {
    return { ok: false, error: "La solicitud supera el tamaño permitido." };
  }

  return {
    ok: true,
    data: { empresa, contactoNombre, contactoApellido, email, telefono, message },
  };
}

export async function sendEsferaSolicitudMail(body, remoteIp) {
  const bot = await verifyTurnstile(
    body?.turnstileToken,
    remoteIp,
    body?.website,
  );
  if (!bot.ok) return bot;

  const check = validateEsferaSolicitudPayload(body);
  if (!check.ok) return check;

  const cfg = loadSmtpConfig();
  const form = cfg.forms?.esfera_solicitud ?? {};

  if (!smtpReady(cfg)) {
    const isDev =
      process.env.NODE_ENV !== "production" ||
      process.env.CMS_DEV_SAVE_FORMS === "1";
    if (isDev) {
      const savedTo = saveDevSubmissionLocal(check.data);
      console.log(`[esfera-solicitud] SMTP sin configurar — guardado en ${savedTo}`);
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

  const toEmail = String(
    form.to_email ?? "voluntariado.humanitario-RD@acropolis.org",
  ).trim();
  const toName = String(form.to_name ?? "Voluntariado Humanitario").trim();
  const prefix = String(form.subject_prefix ?? "[Esfera] Solicitud taller").trim();
  const subject = `${prefix} — ${check.data.empresa}`;
  const copyToSender = form.copy_to_sender !== false;
  const internalCc = String(form.cc_email ?? "Santiago.a@acropolis.org").trim();

  const cc = [];
  if (copyToSender) cc.push(check.data.email);
  if (internalCc && internalCc !== check.data.email) cc.push(internalCc);

  await sendPlainMail({
    cfg,
    to: toEmail,
    toName,
    cc: cc.length ? cc : undefined,
    replyTo: check.data.email,
    subject,
    body: check.data.message,
  });

  return { ok: true };
}
