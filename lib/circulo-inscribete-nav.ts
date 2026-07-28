import {
  CIRCULO_HOME_PATH,
  CIRCULO_INSCRIPCION_HASH,
} from "@/lib/circulo-amigos-content";

export function scrollToCirculoInscripcionSection() {
  if (typeof window === "undefined") return;
  const run = () => {
    document.getElementById(CIRCULO_INSCRIPCION_HASH)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  requestAnimationFrame(run);
  window.setTimeout(run, 120);
}

export function applyCirculoInscripcionHash() {
  if (typeof window === "undefined") return;
  const target = `#${CIRCULO_INSCRIPCION_HASH}`;
  if (window.location.hash === target) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    return;
  }
  window.location.hash = CIRCULO_INSCRIPCION_HASH;
}

export function isCirculoHomePath(pathname: string) {
  const normalized = pathname.replace(/\/$/, "") || "/";
  const home = CIRCULO_HOME_PATH.replace(/\/$/, "") || "/";
  return normalized === home;
}
