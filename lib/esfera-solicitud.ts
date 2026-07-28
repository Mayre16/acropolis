/** Ruta histórica del formulario (CMS / enlaces antiguos). */
export const ESFERA_SOLICITUD_PATH = "/esfera/solicitud/";

export function isEsferaSolicitudHref(href: string): boolean {
  const normalized = href.trim().replace(/\/$/, "") || "/";
  return normalized === "/esfera/solicitud";
}
