#!/usr/bin/env node
/**
 * Script para enviar la frase del día a todos los suscriptores de WhatsApp.
 *
 * USO:
 *   node scripts/send-frase-del-dia.mjs
 *
 * Este script se puede ejecutar manualmente o configurar en un cron job.
 * Ejemplo de cron (enviar a las 7:00 AM todos los días):
 *   0 7 * * * cd /path/to/project && node scripts/send-frase-del-dia.mjs >> logs/frase-del-dia.log 2>&1
 *
 * PROVEEDORES SOPORTADOS:
 *   1. Twilio WhatsApp Sandbox (RECOMENDADO para pruebas - GRATIS)
 *   2. WhatsApp Business API (Meta) - para producción
 *
 * VARIABLES DE ENTORNO - TWILIO (sandbox gratuito):
 *   - TWILIO_ACCOUNT_SID: Tu Account SID de Twilio
 *   - TWILIO_AUTH_TOKEN: Tu Auth Token de Twilio
 *   - TWILIO_WHATSAPP_FROM: Número del sandbox (default: whatsapp:+14155238886)
 *
 * VARIABLES DE ENTORNO - META (producción):
 *   - WHATSAPP_BUSINESS_PHONE_NUMBER_ID
 *   - WHATSAPP_BUSINESS_ACCESS_TOKEN
 *
 * OPCIONALES:
 *   - NEXT_PUBLIC_SITE_URL (para construir la URL de la imagen)
 *   - WHATSAPP_PROVIDER=twilio|meta (default: detecta automáticamente)
 *   - WHATSAPP_DRY_RUN=true (para probar sin enviar mensajes)
 */

import { readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const PUBLISHED_FILE = path.join(DATA_DIR, "acropolis", "published.json");
const SUBSCRIBERS_FILE = path.join(DATA_DIR, "whatsapp-subscribers.json");

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://acropolis.org.do";

const DRY_RUN = process.env.WHATSAPP_DRY_RUN === "true";

function detectProvider() {
  const explicit = process.env.WHATSAPP_PROVIDER?.toLowerCase();
  if (explicit === "twilio") return "twilio";
  if (explicit === "meta") return "meta";

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    return "twilio";
  }
  if (
    process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID &&
    process.env.WHATSAPP_BUSINESS_ACCESS_TOKEN
  ) {
    return "meta";
  }
  return null;
}

const PROVIDER = detectProvider();

function log(message, ...args) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, ...args);
}

function logError(message, ...args) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR: ${message}`, ...args);
}

async function loadFrasesDelDia() {
  if (!existsSync(PUBLISHED_FILE)) {
    throw new Error(`No se encontró el archivo de contenido publicado: ${PUBLISHED_FILE}`);
  }

  const content = await readFile(PUBLISHED_FILE, "utf-8");
  const published = JSON.parse(content);

  const frases = published.sections?.frasesDelDia || [];
  return frases.filter((f) => f.src?.trim());
}

async function loadSubscribers() {
  if (!existsSync(SUBSCRIBERS_FILE)) {
    return [];
  }

  const content = await readFile(SUBSCRIBERS_FILE, "utf-8");
  const store = JSON.parse(content);
  return store.subscribers?.filter((s) => s.active) || [];
}

function selectTodaysFrase(frases) {
  if (frases.length === 0) return null;

  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % frases.length;

  return frases[index];
}

function buildImageUrl(src) {
  if (/^https?:\/\//i.test(src)) {
    return src;
  }
  return `${SITE_URL}${src.startsWith("/") ? "" : "/"}${src}`;
}

// ============================================================================
// TWILIO WHATSAPP SANDBOX (Gratuito para pruebas)
// ============================================================================

async function sendViaTwilio(phone, imageUrl, caption) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

  if (!accountSid || !authToken) {
    throw new Error(
      "Twilio no configurado. Configura TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN."
    );
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const digits = phone.replace(/\D/g, "");
  const toNumber = `whatsapp:+${digits}`;

  const formData = new URLSearchParams();
  formData.append("From", fromNumber);
  formData.append("To", toNumber);
  formData.append("Body", caption);
  if (imageUrl) {
    formData.append("MediaUrl", imageUrl);
  }

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const data = await res.json();

  if (!res.ok || data.error_code) {
    throw new Error(data.error_message || `HTTP ${res.status}`);
  }

  return data.sid;
}

// ============================================================================
// META WHATSAPP BUSINESS API (Producción)
// ============================================================================

async function sendViaMeta(phone, imageUrl, caption) {
  const phoneNumberId = process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_BUSINESS_ACCESS_TOKEN;
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v18.0";

  if (!phoneNumberId || !accessToken) {
    throw new Error(
      "WhatsApp Business API no configurada. Configura WHATSAPP_BUSINESS_PHONE_NUMBER_ID y WHATSAPP_BUSINESS_ACCESS_TOKEN."
    );
  }

  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: phone.replace(/\D/g, ""),
    type: "image",
    image: {
      link: imageUrl,
      caption: caption,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `HTTP ${res.status}`);
  }

  return data.messages?.[0]?.id;
}

// ============================================================================
// FUNCIÓN UNIFICADA DE ENVÍO
// ============================================================================

async function sendWhatsAppImage(phone, imageUrl, caption) {
  if (PROVIDER === "twilio") {
    return sendViaTwilio(phone, imageUrl, caption);
  } else if (PROVIDER === "meta") {
    return sendViaMeta(phone, imageUrl, caption);
  } else {
    throw new Error(
      "No hay proveedor de WhatsApp configurado. Configura Twilio (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) o Meta (WHATSAPP_BUSINESS_PHONE_NUMBER_ID, WHATSAPP_BUSINESS_ACCESS_TOKEN)."
    );
  }
}

async function main() {
  log("=== Inicio del envío de frase del día ===");

  if (DRY_RUN) {
    log("⚠️  MODO DE PRUEBA (DRY_RUN=true) - No se enviarán mensajes reales");
  }

  if (!PROVIDER) {
    logError("No hay proveedor de WhatsApp configurado.");
    logError("Opciones:");
    logError("  1. Twilio (sandbox gratuito): TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN");
    logError("  2. Meta (producción): WHATSAPP_BUSINESS_PHONE_NUMBER_ID + WHATSAPP_BUSINESS_ACCESS_TOKEN");
    process.exit(1);
  }

  log(`Proveedor: ${PROVIDER === "twilio" ? "Twilio WhatsApp Sandbox" : "Meta WhatsApp Business API"}`);

  try {
    const frases = await loadFrasesDelDia();
    log(`Frases disponibles: ${frases.length}`);

    if (frases.length === 0) {
      log("No hay frases del día configuradas. Saliendo.");
      return;
    }

    const frase = selectTodaysFrase(frases);
    if (!frase) {
      logError("No se pudo seleccionar una frase para hoy.");
      return;
    }

    const imageUrl = buildImageUrl(frase.src);
    const caption = frase.alt || "Frase del día — Nueva Acrópolis RD 🌟";

    log(`Frase seleccionada: ${frase.id}`);
    log(`Imagen: ${imageUrl}`);
    log(`Caption: ${caption}`);

    const subscribers = await loadSubscribers();
    log(`Suscriptores activos: ${subscribers.length}`);

    if (subscribers.length === 0) {
      log("No hay suscriptores activos. Saliendo.");
      return;
    }

    let sent = 0;
    let failed = 0;

    for (const subscriber of subscribers) {
      try {
        if (DRY_RUN) {
          log(`[DRY_RUN] Simularía envío a ${subscriber.phone} (${subscriber.name || "Sin nombre"})`);
          sent++;
        } else {
          const messageId = await sendWhatsAppImage(
            subscriber.phone,
            imageUrl,
            caption
          );
          log(`✓ Enviado a ${subscriber.phone} - ID: ${messageId}`);
          sent++;
        }
      } catch (err) {
        logError(`✗ Error enviando a ${subscriber.phone}: ${err.message}`);
        failed++;
      }

      if (!DRY_RUN && subscribers.indexOf(subscriber) < subscribers.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    log("=== Resumen ===");
    log(`Total: ${subscribers.length} | Enviados: ${sent} | Fallidos: ${failed}`);
    log("=== Fin del envío ===");
  } catch (err) {
    logError(`Error fatal: ${err.message}`);
    process.exit(1);
  }
}

main();
