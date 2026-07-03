import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  EDITOR_SMTP_DEFAULTS,
  isRealSmtpSecret,
} from "./editor-smtp-defaults.mjs";

const EDITOR_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function bibliotecaConfigCandidates() {
  const fromEnv = process.env.BIBLIOTECA_CONFIG_PATH?.trim();
  return [
    fromEnv,
    path.join(EDITOR_ROOT, "..", "..", "Biblioteca-OINA", "api", "config.php"),
    path.join(EDITOR_ROOT, "..", "Biblioteca-OINA", "api", "config.php"),
  ].filter(Boolean);
}

function readPhpSmtpBlock(raw) {
  const start = raw.indexOf("'SMTP'");
  if (start === -1) return "";
  const open = raw.indexOf("[", start);
  if (open === -1) return "";
  let depth = 0;
  for (let i = open; i < raw.length; i += 1) {
    const ch = raw[i];
    if (ch === "[") depth += 1;
    if (ch === "]") {
      depth -= 1;
      if (depth === 0) {
        return raw.slice(open, i + 1);
      }
    }
  }
  return "";
}

function readPhpSmtpValue(block, key) {
  const re = new RegExp(
    `'${key}'\\s*=>\\s*['"]([^'"]*)['"]`,
    "i",
  );
  const m = re.exec(block);
  return m?.[1]?.trim() ?? "";
}

export function readBibliotecaSmtpFromPhp() {
  for (const file of bibliotecaConfigCandidates()) {
    if (!fs.existsSync(file)) continue;
    const raw = fs.readFileSync(file, "utf8");
    const block = readPhpSmtpBlock(raw);
    if (!block) continue;

    const host = readPhpSmtpValue(block, "host");
    const user = readPhpSmtpValue(block, "user");
    const password = readPhpSmtpValue(block, "password");
    const fromEmail = readPhpSmtpValue(block, "from_email");
    const fromName = readPhpSmtpValue(block, "from_name");
    const portRaw = readPhpSmtpValue(block, "port");
    const secure = readPhpSmtpValue(block, "secure");
    const replyTo = readPhpSmtpValue(block, "reply_to");

    const out = { ...EDITOR_SMTP_DEFAULTS };
    if (host) out.host = host;
    if (user) out.user = user;
    if (fromEmail) out.from_email = fromEmail;
    if (fromName) out.from_name = fromName;
    if (replyTo) out.reply_to = replyTo;
    if (secure) out.secure = secure;
    if (portRaw) out.port = Number(portRaw) || 465;
    if (isRealSmtpSecret(password)) out.password = password;
    return out;
  }
  return { ...EDITOR_SMTP_DEFAULTS };
}
