# Envío Automático de Frases del Día por WhatsApp

Esta guía explica cómo configurar el envío automático de frases del día a través de WhatsApp.

## Opciones Disponibles

| Opción | Costo | Automatización | Dificultad |
|--------|-------|----------------|------------|
| **Twilio Sandbox** | Gratis | ✅ Automático | ⭐ Fácil |
| Canales de WhatsApp | Gratis | ❌ Manual | ⭐ Muy fácil |
| WhatsApp Business API | ~$0.05/msg | ✅ Automático | ⭐⭐⭐ Avanzado |

---

## Opción 1: Twilio WhatsApp Sandbox (Recomendado para empezar)

El sandbox de Twilio es **GRATUITO** y permite probar el envío automático de mensajes.

### Paso 1: Crear cuenta en Twilio

1. Ve a [twilio.com](https://www.twilio.com/try-twilio) y crea una cuenta gratuita
2. No necesitas tarjeta de crédito para el sandbox
3. Verifica tu número de teléfono

### Paso 2: Configurar el sandbox de WhatsApp

1. En la consola de Twilio, ve a **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Verás un número de sandbox (usualmente `+1 415 523 8886`)
3. Envía el código de unión desde tu WhatsApp al número del sandbox:
   ```
   join <palabra-clave>
   ```
   (Twilio te mostrará el código exacto)

### Paso 3: Obtener credenciales

En la consola de Twilio, copia:
- **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Auth Token**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Paso 4: Configurar variables de entorno

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### Paso 5: Agregar suscriptores al sandbox

**Importante:** En el sandbox, cada persona que quiera recibir mensajes debe:
1. Enviar el código de unión (`join <palabra>`) al número del sandbox
2. Mantener el sandbox activo (se desactiva después de 72h sin actividad)

### Paso 6: Probar el envío

```bash
# Modo de prueba (no envía mensajes)
WHATSAPP_DRY_RUN=true node scripts/send-frase-del-dia.mjs

# Envío real
node scripts/send-frase-del-dia.mjs
```

### Limitaciones del Sandbox

- Solo funciona con números que se hayan unido al sandbox
- El sandbox se desactiva después de 72 horas sin actividad
- Máximo ~500 mensajes/día

Para producción con muchos usuarios, considera Twilio de pago o WhatsApp Business API.

---

## Opción 2: Canales de WhatsApp (Sin código)

La forma más sencilla es crear un **Canal de WhatsApp** (WhatsApp Channel):

1. Abre WhatsApp Business en tu teléfono
2. Ve a **Canales** → **Crear canal**
3. Nombra el canal "Frases del Día - Nueva Acrópolis RD"
4. Comparte el enlace del canal en el sitio web
5. Publica manualmente las frases cada día

**Ventajas:**
- Gratis
- No requiere código ni API
- Los usuarios se suscriben voluntariamente

**Desventajas:**
- Requiere publicación manual diaria
- No se pueden personalizar los mensajes

---

## Opción 3: WhatsApp Business API (Producción)

Para envío completamente automático a gran escala.

### Requisitos

1. **Cuenta de Meta Business** verificada
2. **Aplicación en Meta for Developers** con el producto WhatsApp
3. **Número de teléfono** dedicado para WhatsApp Business API
4. **Template de mensaje** aprobado por Meta (para mensajes con imagen)

## Configuración

### Paso 1: Crear aplicación en Meta

1. Ve a [Meta for Developers](https://developers.facebook.com/)
2. Crea una nueva aplicación de tipo **Business**
3. Agrega el producto **WhatsApp**
4. En el panel de WhatsApp, obtén:
   - **Phone Number ID**: El identificador de tu número
   - **Access Token**: Token de acceso permanente

### Paso 2: Crear Template de Mensaje

Para enviar mensajes con imágenes, necesitas un template aprobado:

1. Ve a **WhatsApp Manager** → **Message Templates**
2. Crea un nuevo template:
   - **Nombre**: `frase_del_dia`
   - **Categoría**: Marketing
   - **Idioma**: Español
   - **Header**: Imagen (variable)
   - **Body**: "🌟 Frase del día — Nueva Acrópolis RD"
3. Envía para aprobación (puede tomar 24-48 horas)

### Paso 3: Configurar Variables de Entorno

Copia las variables a tu archivo `.env.local`:

```env
# WhatsApp Business API
WHATSAPP_BUSINESS_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxx
WHATSAPP_API_VERSION=v18.0

# Opcional: Template para mensajes con imagen
WHATSAPP_TEMPLATE_NAME=frase_del_dia

# URL del sitio (para construir URLs de imágenes)
NEXT_PUBLIC_SITE_URL=https://acropolis.org.do
```

### Paso 4: Configurar Cron Job

El script `scripts/send-frase-del-dia.mjs` envía la frase del día a todos los suscriptores.

#### En servidor Linux (crontab):

```bash
# Editar crontab
crontab -e

# Agregar línea para enviar a las 7:00 AM todos los días
0 7 * * * cd /ruta/al/proyecto && node scripts/send-frase-del-dia.mjs >> /var/log/frase-del-dia.log 2>&1
```

#### En Vercel (Cron Jobs):

Crea `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-frase",
      "schedule": "0 11 * * *"
    }
  ]
}
```

Y crea `app/api/cron/send-frase/route.ts`:

```typescript
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Verificar que la solicitud viene de Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Aquí va la lógica de envío
  // ...

  return NextResponse.json({ success: true });
}
```

## Gestión de Suscriptores

### Agregar suscriptores desde el sitio web

El componente `FrasesWhatsAppSubscribe` permite a los usuarios suscribirse:

```tsx
import { FrasesWhatsAppSubscribe } from "@/components/home/FrasesWhatsAppSubscribe";

// En tu página o componente
<FrasesWhatsAppSubscribe />
```

### API de suscripción

**Suscribirse:**
```bash
curl -X POST https://acropolis.org.do/api/whatsapp-subscribe \
  -H "Content-Type: application/json" \
  -d '{"phone": "18095551234", "name": "Juan"}'
```

**Desuscribirse:**
```bash
curl -X POST https://acropolis.org.do/api/whatsapp-subscribe \
  -H "Content-Type: application/json" \
  -d '{"phone": "18095551234", "action": "unsubscribe"}'
```

**Verificar suscripción:**
```bash
curl "https://acropolis.org.do/api/whatsapp-subscribe?phone=18095551234"
```

### Archivo de suscriptores

Los suscriptores se guardan en `data/whatsapp-subscribers.json`:

```json
{
  "version": 1,
  "subscribers": [
    {
      "id": "sub_1234567890_abc123",
      "phone": "18095551234",
      "name": "Juan Pérez",
      "subscribedAt": "2024-01-15T10:30:00.000Z",
      "active": true,
      "optInMethod": "website"
    }
  ]
}
```

> **Nota:** Para producción con muchos suscriptores, considera usar una base de datos como PostgreSQL, MongoDB o Supabase.

## Modo de Prueba

Para probar sin enviar mensajes reales:

```bash
WHATSAPP_DRY_RUN=true node scripts/send-frase-del-dia.mjs
```

## Selección de Frase

El script selecciona automáticamente una frase diferente cada día basándose en el día del año:

```javascript
const dayOfYear = /* día 1-365 */;
const index = dayOfYear % totalFrases;
```

Esto asegura que:
- Cada día se muestra una frase diferente
- El ciclo se repite cuando se agotan las frases
- La selección es determinística (misma frase para todos)

## Costos

La WhatsApp Business API tiene costos por mensaje:

| Tipo | Costo aproximado |
|------|------------------|
| Template (marketing) | ~$0.05 USD |
| Conversación iniciada por usuario | Gratis (primeras 1000/mes) |

Para 100 suscriptores diarios ≈ $150 USD/mes

## Alternativas de Bajo Costo

1. **Twilio WhatsApp Sandbox** - Gratis para pruebas
2. **WhatsApp Channels** - Gratis (sin API)
3. **Telegram Bot** - Gratis y más fácil de configurar
4. **Email Newsletter** - Económico con servicios como Resend

## Troubleshooting

### Error: "Template not found"
- Verifica que el template esté aprobado
- Confirma el nombre exacto del template

### Error: "Access token expired"
- Genera un token permanente en Meta Business Suite
- Los tokens temporales expiran en ~24 horas

### Error: "Phone number not registered"
- El destinatario debe tener WhatsApp instalado
- El número debe incluir código de país

### Mensajes no llegan
- Verifica que el número esté en formato internacional
- Revisa los logs: `tail -f /var/log/frase-del-dia.log`

## Recursos

- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Meta Business Suite](https://business.facebook.com/)
- [Twilio WhatsApp](https://www.twilio.com/whatsapp)
