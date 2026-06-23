import { verifyTurnstile } from "./turnstile.mjs";
import {
  sendFormMailOrDev,
  validateContactFields,
} from "./form-mail-utils.mjs";

const ROUTES = {
  curso_info: {
    to_email: "cursos.oinadom@acropolis.org",
    to_name: "Cursos y Talleres",
    copy_to_sender: false,
  },
  salon_inquiry: {
    to_email: "cursos.oinadom@acropolis.org",
    to_name: "Cursos y Talleres",
    copy_to_sender: false,
  },
  voluntariado_donacion: {
    to_email: "voluntariado.humanitario-RD@acropolis.org",
    to_name: "Voluntariado Humanitario",
    copy_to_sender: false,
  },
  esfera_donar: {
    to_email: "voluntariado.humanitario-RD@acropolis.org",
    to_name: "Voluntariado Humanitario",
    cc_email: "Santiago.a@acropolis.org",
    copy_to_sender: false,
  },
  esfera_alianzas: {
    to_email: "voluntariado.humanitario-RD@acropolis.org",
    to_name: "Voluntariado Humanitario",
    cc_email: "Santiago.a@acropolis.org",
    copy_to_sender: false,
  },
  esfera_info: {
    to_email: "voluntariado.humanitario-RD@acropolis.org",
    to_name: "Voluntariado Humanitario",
    cc_email: "Santiago.a@acropolis.org",
    copy_to_sender: false,
  },
  viaje_info: {
    to_email: "info.oinadom@acropolis.org",
    to_name: "Nueva Acrópolis RD",
    copy_to_sender: false,
  },
};

export function validateSiteInquiryPayload(body) {
  const formKey = String(body?.formKey ?? "").trim();
  if (!ROUTES[formKey]) {
    return { ok: false, error: "Tipo de formulario no válido." };
  }

  const contact = validateContactFields(body);
  if (!contact.ok) return contact;

  const subject = String(body?.subject ?? "").trim();
  const message = String(body?.message ?? "").trim();
  if (!subject || subject.length > 200) {
    return { ok: false, error: "Asunto de solicitud no válido." };
  }
  if (message.length < 40) {
    return { ok: false, error: "El contenido de la solicitud es incompleto." };
  }
  if (message.length > 12000) {
    return { ok: false, error: "La solicitud supera el tamaño permitido." };
  }

  return {
    ok: true,
    data: { formKey, subject, message, ...contact.data },
  };
}

export async function sendSiteInquiryMail(body, remoteIp) {
  const bot = await verifyTurnstile(
    body?.turnstileToken,
    remoteIp,
    body?.website,
  );
  if (!bot.ok) return bot;

  const check = validateSiteInquiryPayload(body);
  if (!check.ok) return check;

  const route = ROUTES[check.data.formKey];
  const cc = [];
  const internalCc = String(route.cc_email ?? "").trim();
  if (internalCc) cc.push(internalCc);
  const senderEmail = check.data.email;
  if (senderEmail && route.copy_to_sender) cc.push(senderEmail);

  return sendFormMailOrDev({
    formId: `site-inquiry-${check.data.formKey}`,
    toEmail: route.to_email,
    toName: route.to_name,
    subject: check.data.subject,
    body: check.data.message,
    replyTo: senderEmail || undefined,
    cc,
  });
}
