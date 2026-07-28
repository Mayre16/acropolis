/**
 * @deprecated Usar scripts/build-diplomado-map-monogram.mjs con el PNG del anagrama completo.
 * Este script queda como alias del flujo anterior (logo-na-white recortado).
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const script = join(
  dirname(fileURLToPath(import.meta.url)),
  "build-diplomado-map-monogram.mjs",
);

const result = spawnSync(process.execPath, [script], { stdio: "inherit" });
process.exit(result.status ?? 1);
