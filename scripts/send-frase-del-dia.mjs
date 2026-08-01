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
 * VARIABLES DE ENTORNO REQUERIDAS:
 *   - WHATSAPP_BUSINESS_PHONE_NUMBER_ID
 *   - WHATSAPP_BUSINESS_ACCESS_TOKEN
 *   - NEXT_PUBLIC_SITE_URL (para construir la URL de la imagen)
 *
 * OPCIONALES:
 *   - WHATSAPP_TEMPLATE_NAME (si usas templates pre-aprobados)
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

async function sendWhatsAppImage(phone, imageUrl, caption) {
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

async function main() {
  log("=== Inicio del envío de frase del día ===");

  if (DRY_RUN) {
    log("⚠️  MODO DE PRUEBA (DRY_RUN=true) - No se enviarán mensajes reales");
  }

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
