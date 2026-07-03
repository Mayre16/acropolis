/**
 * Copia la configuración SMTP de Biblioteca-OINA al editor (data/system/smtp.json).
 * Uso: node scripts/sync-smtp-from-biblioteca.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSmtpConfig, saveSmtpConfig } from "../lib/smtp-config.mjs";
import { readBibliotecaSmtpFromPhp } from "../lib/smtp-biblioteca-config.mjs";
import { isRealSmtpSecret } from "../lib/smtp-biblioteca-defaults.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const biblioteca = readBibliotecaSmtpFromPhp();
const current = loadSmtpConfig();

const next = {
  host: biblioteca.host,
  port: biblioteca.port,
  secure: biblioteca.secure,
  user: biblioteca.user,
  password: biblioteca.password || current.password,
  from_email: biblioteca.from_email,
  from_name: current.from_name,
  forms: current.forms,
};

if (!isRealSmtpSecret(next.password)) {
  console.error(
    "No hay contraseña SMTP real en Biblioteca-OINA/api/config.php.\n" +
      "Pon la misma contraseña en editor/api/config.local.php (smtp_password) o CMS_SMTP_PASSWORD.",
  );
  process.exit(1);
}

saveSmtpConfig(next, { keepPasswordIfBlank: false });
console.log("SMTP del editor sincronizado con Biblioteca:");
console.log(`  host: ${next.host}`);
console.log(`  user: ${next.user}`);
console.log(`  from: ${next.from_email}`);
console.log(`  → ${path.join(ROOT, "data", "system", "smtp.json")}`);
