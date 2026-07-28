import { postForm } from "@/lib/submit-form";

export type EsferaSolicitudPayload = {
  empresa: string;
  contactoNombre: string;
  contactoApellido: string;
  email: string;
  telefono: string;
  message: string;
  turnstileToken: string;
  website?: string;
};

export async function submitEsferaSolicitud(payload: EsferaSolicitudPayload) {
  return postForm("/forms/esfera-solicitud", payload);
}
