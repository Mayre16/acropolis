/**
 * Publica fotos de tarjetas de agenda en public/img/agenda/
 * a partir de imágenes ya existentes del sitio (variedad sin repetir).
 *
 * Uso: npm run agenda:images
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMG = path.join(ROOT, "public/img");
const OUT = path.join(IMG, "agenda");

const SOURCES = {
  "teatro-taller.webp": "cultura/agenda/teatro.webp",
  "coro-musica.webp": "cultura/agenda/coro.webp",
  "danza-ensayo.webp": "cultura/agenda/danza.webp",
  "jovenes-encuentro.webp": "actividades/liderazgo-juvenil.webp",
  "cine-foro.webp": "actividades/cineforum.webp",
  "vol-reforestacion.webp": "actividades/dia-madre-tierra.webp",
  "vol-ninos-juegos.webp": "actividades/encuentro-cultural.webp",
  "vol-ancianos-visita.webp": "voluntariado/cards/ancianos.webp",
  "esfera-simulacro-campo.webp": "eventos/simulacros.webp",
  "conferencia-auditorio.webp": "actividades/unibe.webp",
  "cultura-velada.webp": "cultura/eventos/velada.webp",
  "filosofia-sesion.webp": "home/filosofia-para-vivir.webp",
  "pintura-taller.webp": "cursos/pintura.webp",
  "astronomia-noche.webp": "actividades/noche-estrellas.webp",
  "viaje-colonial.webp": "cultura/viajes/zona-colonial.webp",
};

fs.mkdirSync(OUT, { recursive: true });

for (const [dest, src] of Object.entries(SOURCES)) {
  const from = path.join(IMG, src);
  const to = path.join(OUT, dest);
  if (!fs.existsSync(from)) {
    console.warn("Falta fuente:", src);
    continue;
  }
  fs.copyFileSync(from, to);
  console.log(`${src} → agenda/${dest}`);
}
