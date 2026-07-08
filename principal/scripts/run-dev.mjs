/**
 * Arranca next dev sin NEXT_PUBLIC_BASE_PATH (evita 404 en local si el sistema
 * heredó /acropolis/principal del build de GitHub Pages).
 */
import { spawn } from "node:child_process";

const env = { ...process.env };
delete env.NEXT_PUBLIC_BASE_PATH;

const child = spawn("npx", ["next", "dev", "-p", "3100"], {
  stdio: "inherit",
  shell: true,
  env,
});

child.on("exit", (code) => process.exit(code ?? 0));
