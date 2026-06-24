import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SMTP_FILE = path.join(ROOT, "data", "system", "smtp.json");
const LOCAL_CONFIG = path.join(ROOT, "api", "config.local.php");

const DEFAULTS = {
  host: "mail.acropolis.org",
  port: 465,
  secure: "ssl",
  user: "smtp_user@acropolis.org",
  password: "",
  from_email: "no-reply@acropolis.org",
  from_name: "Nueva Acrópolis RD",
  forms: {
    civis_solicitud: {
      to_email: "civis@acropolis.org",
      to_name: "Civis Consulting",
      subject_prefix: "[CIVIS] Solicitud de propuesta",
      copy_to_sender: true,
    },
    esfera_solicitud: {
      to_email: "esferard@acropolis.org",
      to_name: "Punto Focal Esfera",
      cc_email: "Santiago.a@acropolis.org",
      subject_prefix: "[Esfera] Solicitud taller",
      copy_to_sender: true,
    },
    voluntariado_solicitud: {
      to_email: "voluntariadord@acropolis.org",
      to_name: "Voluntariado Humanitario",
      copy_to_sender: false,
    },
  },
};

function ensureSystemDir() {
  fs.mkdirSync(path.dirname(SMTP_FILE), { recursive: true });
}

function readLocalPhpPassword() {
  if (!fs.existsSync(LOCAL_CONFIG)) return "";
  const raw = fs.readFileSync(LOCAL_CONFIG, "utf8");
  const m = /['"]smtp_password['"]\s*=>\s*['"]([^'"]*)['"]/.exec(raw);
  return m?.[1] ?? "";
}

export function loadSmtpConfig() {
  ensureSystemDir();
  let stored = {};
  if (fs.existsSync(SMTP_FILE)) {
    try {
      stored = JSON.parse(fs.readFileSync(SMTP_FILE, "utf8"));
    } catch {
      stored = {};
    }
  } else {
    fs.writeFileSync(SMTP_FILE, JSON.stringify(DEFAULTS, null, 2));
    stored = { ...DEFAULTS };
  }

  const merged = {
    ...DEFAULTS,
    ...stored,
    forms: {
      ...DEFAULTS.forms,
      ...(stored.forms ?? {}),
      civis_solicitud: {
        ...DEFAULTS.forms.civis_solicitud,
        ...(stored.forms?.civis_solicitud ?? {}),
      },
      esfera_solicitud: {
        ...DEFAULTS.forms.esfera_solicitud,
        ...(stored.forms?.esfera_solicitud ?? {}),
      },
      voluntariado_solicitud: {
        ...DEFAULTS.forms.voluntariado_solicitud,
        ...(stored.forms?.voluntariado_solicitud ?? {}),
      },
    },
  };

  if (!merged.password) {
    merged.password =
      process.env.CMS_SMTP_PASSWORD?.trim() || readLocalPhpPassword();
  }

  return merged;
}

export function saveSmtpConfig(next, { keepPasswordIfBlank = true } = {}) {
  ensureSystemDir();
  const current = loadSmtpConfig();
  const password =
    typeof next.password === "string" && next.password.trim()
      ? next.password.trim()
      : keepPasswordIfBlank
        ? current.password
        : "";

  const doc = {
    host: String(next.host ?? current.host).trim(),
    port: Number(next.port ?? current.port) || 465,
    secure: String(next.secure ?? current.secure).trim() || "ssl",
    user: String(next.user ?? current.user).trim(),
    password,
    from_email: String(next.from_email ?? current.from_email).trim(),
    from_name: String(next.from_name ?? current.from_name).trim(),
    forms: {
      civis_solicitud: {
        ...current.forms.civis_solicitud,
        ...(next.forms?.civis_solicitud ?? {}),
        to_email: String(
          next.forms?.civis_solicitud?.to_email ??
            current.forms.civis_solicitud.to_email,
        ).trim(),
        to_name: String(
          next.forms?.civis_solicitud?.to_name ??
            current.forms.civis_solicitud.to_name,
        ).trim(),
        subject_prefix: String(
          next.forms?.civis_solicitud?.subject_prefix ??
            current.forms.civis_solicitud.subject_prefix,
        ).trim(),
        copy_to_sender:
          next.forms?.civis_solicitud?.copy_to_sender ??
          current.forms.civis_solicitud.copy_to_sender,
      },
      esfera_solicitud: {
        ...current.forms.esfera_solicitud,
        ...(next.forms?.esfera_solicitud ?? {}),
        to_email: String(
          next.forms?.esfera_solicitud?.to_email ??
            current.forms.esfera_solicitud.to_email,
        ).trim(),
        to_name: String(
          next.forms?.esfera_solicitud?.to_name ??
            current.forms.esfera_solicitud.to_name,
        ).trim(),
        cc_email: String(
          next.forms?.esfera_solicitud?.cc_email ??
            current.forms.esfera_solicitud.cc_email,
        ).trim(),
        subject_prefix: String(
          next.forms?.esfera_solicitud?.subject_prefix ??
            current.forms.esfera_solicitud.subject_prefix,
        ).trim(),
        copy_to_sender:
          next.forms?.esfera_solicitud?.copy_to_sender ??
          current.forms.esfera_solicitud.copy_to_sender,
      },
    },
  };

  fs.writeFileSync(SMTP_FILE, JSON.stringify(doc, null, 2));
  return doc;
}

export function publicSmtpConfig(cfg = loadSmtpConfig()) {
  return {
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    user: cfg.user,
    passwordSet: Boolean(cfg.password),
    from_email: cfg.from_email,
    from_name: cfg.from_name,
    forms: cfg.forms,
  };
}
