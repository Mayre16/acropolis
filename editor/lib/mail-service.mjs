import nodemailer from "nodemailer";
import { loadSmtpConfig } from "./smtp-config.mjs";

export async function sendPlainMail({
  to,
  toName,
  cc,
  replyTo,
  subject,
  body,
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

  const mail = {
    from: `"${cfg.from_name}" <${cfg.from_email}>`,
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
