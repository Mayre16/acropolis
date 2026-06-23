import { postForm } from "@/lib/submit-form";
import type { VolunteerFormValues } from "@/lib/contact-routing";
import { buildVolunteerMessage } from "@/lib/contact-routing";

export type VolunteerSolicitudPayload = VolunteerFormValues & {
  turnstileToken: string;
  website?: string;
};

export async function submitVolunteerSolicitud(
  values: VolunteerFormValues,
  turnstileToken: string,
  website = "",
) {
  return postForm("/forms/voluntariado-solicitud", {
    nombre: values.nombre.trim(),
    telefono: values.telefono.trim(),
    email: values.email.trim(),
    areas: values.areas,
    mensaje: values.mensaje.trim(),
    message: buildVolunteerMessage(values),
    turnstileToken,
    website,
  });
}
