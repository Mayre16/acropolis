import { WHATSAPP_URL, DIPLOMADO_WHATSAPP_URL } from "@/lib/site-config";
import type { AgendaCategory } from "@/lib/agenda";

export type WhatsAppUrls = {
  cursos: string;
  diplomado: string;
};

export type InscribeActivity = {
  title: string;
  kind?: "curso" | "taller" | "actividad" | "conferencia";
  sede?: string;
  facilitador?: string;
};

const KIND_LABEL: Record<NonNullable<InscribeActivity["kind"]>, string> = {
  curso: "curso",
  taller: "taller",
  actividad: "actividad",
  conferencia: "conferencia",
};

/** Mensaje prellenado para WhatsApp según la actividad seleccionada. */
export function buildInscribeMessage({
  title,
  kind = "curso",
  sede,
  facilitador,
}: InscribeActivity): string {
  const tipo = KIND_LABEL[kind];
  const lines = [
    `Hola, me interesa el ${tipo} «${title}» de Nueva Acrópolis.`,
    "¿Me pueden dar información sobre próximas fechas, horarios e inscripción?",
  ];
  if (sede) lines.push("", `Sede de interés: ${sede}`);
  if (facilitador) lines.push(`Facilitador: ${facilitador}`);
  return lines.join("\n");
}

export function whatsAppHref(message: string, baseUrl = WHATSAPP_URL): string {
  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}

export function whatsAppUrlForCategory(
  category: AgendaCategory,
  urls?: WhatsAppUrls,
): string {
  const cursos = urls?.cursos ?? WHATSAPP_URL;
  const diplomado = urls?.diplomado ?? DIPLOMADO_WHATSAPP_URL;
  return category === "diplomado" ? diplomado : cursos;
}

export function agendaInscribeHref(
  item: {
    category: AgendaCategory;
    title?: string;
    sede?: string;
    inscribeMessage?: string;
  },
  urls?: WhatsAppUrls,
): string | null {
  if (item.category === "esfera") return null;
  const message =
    item.inscribeMessage ??
    (item.title
      ? buildInscribeMessage({
          title: item.title,
          kind:
            item.category === "taller"
              ? "taller"
              : item.category === "conferencia"
                ? "conferencia"
                : "curso",
          sede: item.sede,
        })
      : null);
  if (!message) return null;
  return whatsAppHref(message, whatsAppUrlForCategory(item.category, urls));
}

export function inscribeWhatsAppHref(
  activity: InscribeActivity,
  baseUrl?: string,
): string {
  return whatsAppHref(buildInscribeMessage(activity), baseUrl ?? WHATSAPP_URL);
}
