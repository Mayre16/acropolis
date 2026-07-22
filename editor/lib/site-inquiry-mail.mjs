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
    brand: "acropolis",
    subject_label: "Cursos — Solicitud de información",
  },
  salon_inquiry: {
    to_email: "cursos.oinadom@acropolis.org",
    to_name: "Cursos y Talleres",
    copy_to_sender: false,
    brand: "acropolis",
    subject_label: "Salones — Solicitud de información",
  },
  voluntariado_donacion: {
    to_email: "voluntariadord@acropolis.org",
    to_name: "Voluntariado Humanitario",
    copy_to_sender: false,
    brand: "acropolis",
    subject_label: "Voluntariado — Solicitud de donación",
  },
  esfera_donar: {
    to_email: "esferard@acropolis.org",
    to_name: "Punto Focal Esfera",
    cc_email: "Santiago.a@acropolis.org",
    copy_to_sender: false,
    brand: "esfera",
    subject_label: "Esfera — Solicitud de donación",
  },
  esfera_alianzas: {
    to_email: "esferard@acropolis.org",
    to_name: "Punto Focal Esfera",
    cc_email: "Santiago.a@acropolis.org",
    copy_to_sender: false,
    brand: "esfera",
    subject_label: "Esfera — Solicitud de alianza",
  },
  esfera_info: {
    to_email: "esferard@acropolis.org",
    to_name: "Punto Focal Esfera",
    cc_email: "Santiago.a@acropolis.org",
    copy_to_sender: false,
    brand: "esfera",
    subject_label: "Esfera — Solicitud de información",
  },
  viaje_info: {
    to_email: "info.oinadom@acropolis.org",
    to_name: "Nueva Acrópolis RD",
    copy_to_sender: false,
    brand: "acropolis",
    subject_label: "Viajes — Solicitud de información",
  },
  circulo_amigos_inscription: {
    to_email: "amigos_dominicana@acropolis.org",
    to_name: "Círculo de Amigos",
    copy_to_sender: false,
    brand: "circulo",
    subject_label: "Círculo de Amigos — Solicitud de inscripción",
  },
};

function buildSiteInquirySubject(formKey, route, body, contact) {
  const label = String(route.subject_label ?? "Solicitud de información").trim();
  const clientSubject = String(body?.subject ?? "").trim();
  const nombre = String(contact?.nombre ?? "").trim();
  if (clientSubject && clientSubject.startsWith(label)) {
    return clientSubject.slice(0, 200);
  }
  let detail = "";
  if (clientSubject) {
    detail = clientSubject
      .replace(/^(\[?Nueva Acr[oó]polis RD\]?\s*[—\-:.]?\s*|Consulta\s*[—\-:.]?\s*)/iu, "")
      .trim();
    if (detail === label || detail.startsWith(label)) detail = "";
  }
  if (!detail && nombre) detail = nombre;
  const subject = detail ? `${label} — ${detail}` : label;
  return subject.slice(0, 200);
}

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

export async function sendSiteInquiryMail(body, remoteIp, referer) {
  const bot = await verifyTurnstile(
    body?.turnstileToken,
    remoteIp,
    body?.website,
    referer,
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

  const subject = buildSiteInquirySubject(
    check.data.formKey,
    route,
    body,
    check.data,
  );

  return sendFormMailOrDev({
    formId: `site-inquiry-${check.data.formKey}`,
    toEmail: route.to_email,
    toName: route.to_name,
    subject,
    body: check.data.message,
    replyTo: senderEmail || undefined,
    cc,
    brand: route.brand || "acropolis",
  });
}
