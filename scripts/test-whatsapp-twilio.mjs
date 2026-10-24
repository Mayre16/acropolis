#!/usr/bin/env node
/**
 * Script para probar la configuración de Twilio WhatsApp Sandbox.
 *
 * USO:
 *   node scripts/test-whatsapp-twilio.mjs <tu-numero>
 *
 * EJEMPLO:
 *   node scripts/test-whatsapp-twilio.mjs 18095551234
 *
 * IMPORTANTE: El número debe haber enviado el código de unión al sandbox primero.
 *
 * VARIABLES DE ENTORNO REQUERIDAS:
 *   - TWILIO_ACCOUNT_SID
 *   - TWILIO_AUTH_TOKEN
 *   - TWILIO_WHATSAPP_FROM (opcional, default: whatsapp:+14155238886)
 */

const phone = process.argv[2];

if (!phone) {
  console.log("❌ Error: Debes proporcionar un número de teléfono");
  console.log("");
  console.log("Uso: node scripts/test-whatsapp-twilio.mjs <numero>");
  console.log("Ejemplo: node scripts/test-whatsapp-twilio.mjs 18095551234");
  console.log("");
  console.log("⚠️  IMPORTANTE: El número debe haberse unido al sandbox primero.");
  console.log("   Envía 'join <codigo>' al número del sandbox de Twilio.");
  process.exit(1);
}

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

if (!accountSid || !authToken) {
  console.log("❌ Error: Twilio no está configurado");
  console.log("");
  console.log("Configura las siguientes variables de entorno:");
  console.log("  export TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
  console.log("  export TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
  console.log("");
  console.log("Puedes obtener estas credenciales en: https://console.twilio.com/");
  process.exit(1);
}

async function sendTestMessage() {
  const digits = phone.replace(/\D/g, "");
  const toNumber = `whatsapp:+${digits}`;

  console.log("📱 Enviando mensaje de prueba...");
  console.log(`   De: ${fromNumber}`);
  console.log(`   A: ${toNumber}`);
  console.log("");

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const formData = new URLSearchParams();
  formData.append("From", fromNumber);
  formData.append("To", toNumber);
  formData.append("Body", "🌟 ¡Hola! Este es un mensaje de prueba de Nueva Acrópolis RD.\n\nSi recibes este mensaje, la configuración de WhatsApp está funcionando correctamente. ✅");

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

  try {
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
      console.log("❌ Error al enviar mensaje:");
      console.log(`   Código: ${data.error_code || res.status}`);
      console.log(`   Mensaje: ${data.error_message || "Error desconocido"}`);
      console.log("");
      
      if (data.error_code === 21608) {
        console.log("💡 Este error significa que el número no se ha unido al sandbox.");
        console.log("   Solución: Envía 'join <codigo>' al número del sandbox desde WhatsApp.");
      }
      
      process.exit(1);
    }

    console.log("✅ ¡Mensaje enviado exitosamente!");
    console.log(`   SID: ${data.sid}`);
    console.log(`   Estado: ${data.status}`);
    console.log("");
    console.log("📬 Revisa tu WhatsApp, deberías recibir el mensaje en unos segundos.");
  } catch (err) {
    console.log("❌ Error de conexión:", err.message);
    process.exit(1);
  }
}

sendTestMessage();
