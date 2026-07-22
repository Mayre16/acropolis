import nodemailer from "nodemailer";
import { loadSmtpConfig } from "./smtp-config.mjs";

/** Remitente visible por marca de sitio (alineado con cms_mail_brand_theme en mail.php). */
export const MAIL_BRAND_FROM_NAMES = {
  acropolis: "Nueva Acrópolis RD",
  esfera: "Punto Focal Esfera",
  civis: "Civis Consulting",
  circulo: "Círculo de Amigos",
  tienda: "Librería Logos",
  biblioteca: "Biblioteca SOPHIA",
};

export function mailFromNameForBrand(brand, fallback = "Nueva Acrópolis RD") {
  const key = String(brand ?? "").trim();
  return MAIL_BRAND_FROM_NAMES[key] || fallback;
}

export async function sendPlainMail({
  to,
  toName,
  cc,
  replyTo,
  subject,
  body,
  fromName,
  brand,
  cfg = loadSmtpConfig(),
}) {
  if (!cfg.host || !cfg.user || !cfg.password) {
    throw new Error("SMTP no configurado. Revisa la configuración en el editor.");
  }

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure === "ssl",
    auth: {
      user: cfg.user,
      pass: cfg.password,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const displayFrom =
    String(fromName ?? "").trim() ||
    mailFromNameForBrand(brand, cfg.from_name || "Nueva Acrópolis RD");

  const mail = {
    from: `"${displayFrom}" <${cfg.from_email}>`,
    to: toName ? `"${toName}" <${to}>` : to,
    subject,
    text: body,
    replyTo: replyTo || undefined,
  };

  if (cc) {
    mail.cc = Array.isArray(cc) ? cc.filter(Boolean).join(", ") : cc;
  }

  await transporter.sendMail(mail);
}
