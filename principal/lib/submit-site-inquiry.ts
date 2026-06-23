import { postForm } from "@/lib/submit-form";

export type SiteInquiryFormKey =
  | "curso_info"
  | "salon_inquiry"
  | "voluntariado_donacion"
  | "esfera_donar"
  | "esfera_alianzas"
  | "esfera_info"
  | "viaje_info";

export async function submitSiteInquiry(payload: {
  formKey: SiteInquiryFormKey;
  subject: string;
  message: string;
  nombre: string;
  telefono: string;
  email: string;
  turnstileToken: string;
  website?: string;
}) {
  return postForm("/forms/site-inquiry", payload);
}

/** Extrae el asunto de un enlace mailto generado en el cliente. */
export function subjectFromMailto(href: string): string {
  const query = href.includes("?") ? href.split("?").slice(1).join("?") : "";
  const params = new URLSearchParams(query);
  return params.get("subject") ?? "Consulta — Nueva Acrópolis RD";
}
