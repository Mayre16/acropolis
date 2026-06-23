import {
  CURSOS_EMAIL,
  ESFERA_CC_EMAIL,
  INFO_EMAIL,
  VOLUNTARIADO_EMAIL,
} from "@/lib/site-config";

export type InquiryContactValues = {
  nombre: string;
  telefono: string;
  email: string;
  mensaje: string;
};

export type CourseInfoFormValues = InquiryContactValues & {
  curso: string;
  kind?: string;
  sede?: string;
  facilitador?: string;
};

export type SalonInquiryFormValues = InquiryContactValues & {
  salon?: string;
  sede?: string;
};

export const SALON_INQUIRY_DEFAULT_MESSAGE =
  "Me interesa alquilar un salón de Nueva Acrópolis para un taller o curso. ¿Me pueden dar disponibilidad y tarifas?";

export const CIRCULO_AMIGOS_MAIL_BODY = [
  "Hola, me interesa conocer más sobre el Círculo de Amigos de Nueva Acrópolis.",
  "¿Me pueden dar información sobre encuentros, horarios y cómo participar?",
].join("\n");

/** Líneas del formulario «Quiero ser voluntario/a» (solo voluntariado humanitario). */
export const VOLUNTEER_AREAS = [
  "Humanitario con niños",
  "Humanitario con ancianos",
  "Punto Focal Esfera",
  "Feria de la salud",
  "Ecológico",
] as const;

export type VolunteerArea = (typeof VOLUNTEER_AREAS)[number];

/** @deprecated Usar VOLUNTEER_AREAS — formulario general descontinuado. */
export const PARTICIPATION_AREAS = [
  "Escuela de Filosofía",
  "Cultura",
  "Voluntariado",
  "Punto Focal Esfera",
] as const;

export type ParticipationArea = (typeof PARTICIPATION_AREAS)[number];

export type VolunteerFormValues = {
  nombre: string;
  telefono: string;
  email: string;
  areas: string[];
  mensaje: string;
};

/** @deprecated Alias de VolunteerFormValues. */
export type ParticipationFormValues = VolunteerFormValues;

export function resolveVolunteerRecipients(_areas: string[]): string[] {
  return [VOLUNTARIADO_EMAIL];
}

/** @deprecated Usar resolveVolunteerRecipients. */
export function resolveParticipationRecipients(areas: string[]): string[] {
  const emails = new Set<string>();
  for (const area of areas) {
    if ((VOLUNTEER_AREAS as readonly string[]).includes(area)) {
      emails.add(VOLUNTARIADO_EMAIL);
      continue;
    }
    if (area === "Escuela de Filosofía") emails.add(INFO_EMAIL);
    else if (area === "Cultura") emails.add(CURSOS_EMAIL);
    else if (area === "Voluntariado" || area === "Punto Focal Esfera") {
      emails.add(VOLUNTARIADO_EMAIL);
    }
  }
  if (emails.size === 0) emails.add(INFO_EMAIL);
  return [...emails];
}

export function buildVolunteerMessage(v: VolunteerFormValues): string {
  return [
    "=== SOLICITUD DE VOLUNTARIADO — NUEVA ACRÓPOLIS RD ===",
    "",
    `Nombre: ${v.nombre.trim()}`,
    `Teléfono / WhatsApp: ${v.telefono.trim()}`,
    v.email.trim() ? `Correo: ${v.email.trim()}` : null,
    "",
    "Me interesa participar en:",
    v.areas.length
      ? v.areas.map((a) => `  · ${a}`).join("\n")
      : "  (sin especificar)",
    v.mensaje.trim() ? `\nComentario:\n${v.mensaje.trim()}` : null,
    "",
    "---",
    "Enviado desde acropolis.org.do/voluntariado",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

/** @deprecated Usar buildVolunteerMessage. */
export function buildParticipationMessage(v: ParticipationFormValues): string {
  return buildVolunteerMessage(v);
}

export function buildVolunteerMailto(
  values: VolunteerFormValues,
): { href: string; recipients: string[]; body: string } {
  const recipients = resolveVolunteerRecipients(values.areas);
  const body = buildVolunteerMessage(values);
  const subject = encodeURIComponent(
    `[Nueva Acrópolis RD] Solicitud de voluntariado — ${values.nombre.trim()}`,
  );
  const bodyEnc = encodeURIComponent(body);
  const href = `mailto:${recipients.join(",")}?subject=${subject}&body=${bodyEnc}`;
  return { href, recipients, body };
}

/** @deprecated Usar buildVolunteerMailto. */
export function buildParticipationMailto(
  values: ParticipationFormValues,
): { href: string; recipients: string[]; body: string } {
  return buildVolunteerMailto(values);
}

export type MailtoResult = {
  href: string;
  recipients: string[];
  cc?: string[];
  body: string;
};

function buildMailtoLink(
  recipients: string[],
  subject: string,
  body: string,
  cc?: string[],
): MailtoResult {
  const subjectEnc = encodeURIComponent(subject);
  const bodyEnc = encodeURIComponent(body);
  const ccParam =
    cc && cc.length > 0 ? `&cc=${encodeURIComponent(cc.join(","))}` : "";
  const href = `mailto:${recipients.join(",")}?subject=${subjectEnc}&body=${bodyEnc}${ccParam}`;
  return { href, recipients, cc, body };
}

/** Correo Esfera → voluntariado humanitario + copia a coordinación. */
export function buildEsferaMailto(
  subject: string,
  body: string,
): MailtoResult {
  return buildMailtoLink(
    [VOLUNTARIADO_EMAIL],
    subject,
    body,
    [ESFERA_CC_EMAIL],
  );
}

export type EsferaCollaborateKind = "donar" | "alianzas";

export type EsferaInfoFormValues = InquiryContactValues & {
  taller?: string;
  date?: string;
  time?: string;
  sede?: string;
};

export function buildEsferaInfoMessage(v: EsferaInfoFormValues): string {
  return [
    "=== CONSULTA — PUNTO FOCAL ESFERA ===",
    "",
    v.taller
      ? `Taller / actividad de interés: «${v.taller.trim()}»`
      : "Consulta general sobre Punto Focal Esfera.",
    v.date ? `Fecha: ${v.date}` : null,
    v.time ? `Hora: ${v.time}` : null,
    v.sede ? `Sede: ${v.sede}` : null,
    "",
    `Nombre: ${v.nombre.trim()}`,
    `Teléfono / WhatsApp: ${v.telefono.trim()}`,
    v.email.trim() ? `Correo: ${v.email.trim()}` : null,
    "",
    "Solicito más información.",
    v.mensaje.trim() ? `\nComentario:\n${v.mensaje.trim()}` : null,
    "",
    "---",
    "Enviado desde acropolis.org.do/esfera",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export function buildEsferaInfoMailto(
  values: EsferaInfoFormValues,
): MailtoResult {
  const subject = values.taller
    ? `[Esfera] Consulta — ${values.taller.trim()}`
    : `[Esfera] Más información — ${values.nombre.trim()}`;
  return buildEsferaMailto(subject, buildEsferaInfoMessage(values));
}

export function buildEsferaCollaborateMessage(
  kind: EsferaCollaborateKind,
  v: InquiryContactValues,
): string {
  const intro =
    kind === "donar"
      ? "Quiero hacer una donación para los proyectos de Punto Focal Esfera."
      : "Me gustaría proponer una alianza institucional con Punto Focal Esfera.";

  return [
    `=== ${kind === "donar" ? "DONACIÓN" : "ALIANZA"} — PUNTO FOCAL ESFERA ===`,
    "",
    intro,
    "",
    `Nombre: ${v.nombre.trim()}`,
    `Teléfono / WhatsApp: ${v.telefono.trim()}`,
    v.email.trim() ? `Correo: ${v.email.trim()}` : null,
    v.mensaje.trim() ? `\nComentario:\n${v.mensaje.trim()}` : null,
    "",
    "---",
    "Enviado desde acropolis.org.do/esfera",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export function buildEsferaCollaborateMailto(
  kind: EsferaCollaborateKind,
  v: InquiryContactValues,
): MailtoResult {
  const body = buildEsferaCollaborateMessage(kind, v);
  const subject =
    kind === "donar"
      ? `[Esfera] Donación — ${v.nombre.trim()}`
      : `[Esfera] Alianza institucional — ${v.nombre.trim()}`;
  return buildEsferaMailto(subject, body);
}

export function buildVoluntariadoDonacionMessage(v: InquiryContactValues): string {
  return [
    "=== DONACIÓN — VOLUNTARIADO NUEVA ACRÓPOLIS RD ===",
    "",
    "Quiero hacer una donación para apoyar los proyectos de voluntariado de Nueva Acrópolis RD.",
    "",
    `Nombre: ${v.nombre.trim()}`,
    `Teléfono / WhatsApp: ${v.telefono.trim()}`,
    v.email.trim() ? `Correo: ${v.email.trim()}` : null,
    v.mensaje.trim() ? `\nComentario:\n${v.mensaje.trim()}` : null,
    "",
    "---",
    "Enviado desde acropolis.org.do/voluntariado",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export function buildVoluntariadoDonacionMailto(
  v: InquiryContactValues,
): MailtoResult {
  return buildMailtoLink(
    [VOLUNTARIADO_EMAIL],
    `[Nueva Acrópolis RD] Donación voluntariado — ${v.nombre.trim()}`,
    buildVoluntariadoDonacionMessage(v),
  );
}

export function buildCourseInfoMessage(v: CourseInfoFormValues): string {
  return [
    "=== SOLICITUD DE INFORMACIÓN — CURSOS Y TALLERES ===",
    "",
    `Curso / taller de interés: «${v.curso.trim()}»`,
    v.kind ? `Tipo: ${v.kind}` : null,
    v.sede ? `Sede de interés: ${v.sede}` : null,
    v.facilitador ? `Facilitador: ${v.facilitador}` : null,
    "",
    `Nombre: ${v.nombre.trim()}`,
    `Teléfono / WhatsApp: ${v.telefono.trim()}`,
    v.email.trim() ? `Correo: ${v.email.trim()}` : null,
    "",
    "Solicito información sobre próximas fechas, horarios e inscripción.",
    v.mensaje.trim() ? `\nComentario adicional:\n${v.mensaje.trim()}` : null,
    "",
    "---",
    "Enviado desde acropolis.org.do/cursos",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export function buildCourseInfoMailto(
  values: CourseInfoFormValues,
): { href: string; recipients: string[]; body: string } {
  const body = buildCourseInfoMessage(values);
  return buildMailtoLink(
    [CURSOS_EMAIL],
    `[Nueva Acrópolis RD] Consulta curso/taller — ${values.curso.trim()}`,
    body,
  );
}

export function buildSalonInquiryMessage(v: SalonInquiryFormValues): string {
  return [
    "=== CONSULTA ALQUILER DE SALONES — NUEVA ACRÓPOLIS RD ===",
    "",
    v.salon ? `Salón de interés: ${v.salon}` : null,
    v.sede ? `Sede: ${v.sede}` : null,
    "",
    `Nombre: ${v.nombre.trim()}`,
    `Teléfono / WhatsApp: ${v.telefono.trim()}`,
    v.email.trim() ? `Correo: ${v.email.trim()}` : null,
    "",
    SALON_INQUIRY_DEFAULT_MESSAGE,
    v.mensaje.trim() ? `\nComentario adicional:\n${v.mensaje.trim()}` : null,
    "",
    "---",
    "Enviado desde acropolis.org.do/cursos#salones",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export function buildSalonInquiryMailto(
  values: SalonInquiryFormValues,
): { href: string; recipients: string[]; body: string } {
  const body = buildSalonInquiryMessage(values);
  return buildMailtoLink(
    [CURSOS_EMAIL],
    `[Nueva Acrópolis RD] Consulta alquiler de salones — ${values.nombre.trim()}`,
    body,
  );
}

export type ViajeInfoFormValues = InquiryContactValues & {
  viaje: string;
  location?: string;
  proximaFecha?: string;
};

export function buildViajeInfoMessage(v: ViajeInfoFormValues): string {
  return [
    "=== CONSULTA — VIAJES CULTURALES ===",
    "",
    `Viaje de interés: «${v.viaje.trim()}»`,
    v.location ? `Destino / ubicación: ${v.location}` : null,
    v.proximaFecha ? `Próxima salida: ${v.proximaFecha}` : null,
    "",
    `Nombre: ${v.nombre.trim()}`,
    `Teléfono / WhatsApp: ${v.telefono.trim()}`,
    v.email.trim() ? `Correo: ${v.email.trim()}` : null,
    "",
    "Solicito información sobre fechas, itinerario e inscripción.",
    v.mensaje.trim() ? `\nComentario:\n${v.mensaje.trim()}` : null,
    "",
    "---",
    "Enviado desde acropolis.org.do/cultura/viajes",
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export function buildViajeInfoMailto(
  values: ViajeInfoFormValues,
): { href: string; recipients: string[]; body: string } {
  const body = buildViajeInfoMessage(values);
  return buildMailtoLink(
    [INFO_EMAIL],
    `[Nueva Acrópolis RD] Consulta viaje cultural — ${values.viaje.trim()}`,
    body,
  );
}

export function buildCirculoAmigosMailto(): {
  href: string;
  recipients: string[];
  body: string;
} {
  return buildMailtoLink(
    [INFO_EMAIL],
    "Consulta — Círculo de Amigos Nueva Acrópolis RD",
    CIRCULO_AMIGOS_MAIL_BODY,
  );
}
