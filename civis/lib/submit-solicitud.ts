import { postForm } from "@/lib/submit-form";

export type CivisSolicitudPayload = {
  empresa: string;
  contactoNombre: string;
  contactoApellido: string;
  email: string;
  telefono: string;
  message: string;
  turnstileToken: string;
  website?: string;
};

export async function submitCivisSolicitud(payload: CivisSolicitudPayload) {
  return postForm("/forms/civis-solicitud", payload);
}
