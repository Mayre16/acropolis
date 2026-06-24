# Carrito y pasarela Azul — Editorial Logos

> Documento para compartir con quien configure el backend (Biblioteca) y/o la cuenta Azul.
> Editar las secciones marcadas con `________` antes de enviar.

---

## Encabezado (completar al enviar)

| | |
|---|---|
| **Para** | _______________________________________ |
| **De** | _______________________________________ |
| **Fecha** | _______________________________________ |
| **Asunto** | Activación checkout Azul — Librería Editorial Logos |

---

## Resumen

La **tienda editorial** (`tienda.acropolis.adesa.com.do`) ya tiene carrito y botón «Pagar con Azul» en el front. El pago **no se procesa en la tienda**: el navegador pide al backend de **Biblioteca** que cree el pedido y devuelva los campos firmados; luego redirige al cliente a la **Página de Pago Azul**.

**Estado actual (jun 2026):**

- Front editorial: listo.
- Catálogo de libros (`bookstore_public_list.php`): responde OK.
- Checkout (`checkout_create.php`): responde, pero **Azul no está configurado** en Biblioteca.

Error actual al intentar pagar:

```json
{"ok":false,"error":"Azul no configurado. Añada INTEGRATIONS.AZUL en api/config.php"}
```

---

## Arquitectura

```
[Cliente] → [Tienda estática Next.js]
                │
                │  POST JSON (items + cliente + returnBase)
                ▼
         [Biblioteca PHP / MySQL]
                │  crea pedido, calcula AuthHash
                │  responde paymentUrl + fields
                ▼
         [Tienda] → POST formulario oculto
                ▼
         [Azul Payment Page]  ← tarjeta se captura aquí (PCI)
                │
                ├── redirect → tienda/pago/aprobado|rechazado|cancelado
                └── notificación servidor → Biblioteca (debe existir)
```

**Repositorio del front:** `Mayre16/acropolis` → carpeta `tienda/`  
**Backend de pagos:** app PHP en `https://biblioteca-oina.adesa.com.do` (no está en ese repo).

---

## URLs de producción

| Rol | URL |
|-----|-----|
| Tienda editorial | `https://tienda.acropolis.adesa.com.do` |
| API catálogo + checkout | `https://biblioteca-oina.adesa.com.do` |
| Página pago aprobado | `https://tienda.acropolis.adesa.com.do/pago/aprobado/` |
| Página pago rechazado | `https://tienda.acropolis.adesa.com.do/pago/rechazado/` |
| Página pago cancelado | `https://tienda.acropolis.adesa.com.do/pago/cancelado/` |

**Desarrollo local:** tienda en `http://localhost:3300`, misma API de Biblioteca.

---

## Contrato API — lo que la tienda envía hoy

**Endpoint:** `POST https://biblioteca-oina.adesa.com.do/api/checkout_create.php`  
**Headers:** `Content-Type: application/json`  
**CORS:** hoy responde `Access-Control-Allow-Origin: *` (recomendamos restringir a orígenes de tienda).

### Request (ejemplo)

```json
{
  "items": [
    {
      "kind": "book",
      "id": 25,
      "title": "Título del libro",
      "subtitle": "Autor",
      "price": 650,
      "currency": "DOP",
      "quantity": 1
    }
  ],
  "customer": {
    "name": "Nombre Apellido",
    "email": "cliente@ejemplo.com",
    "phone": "8095550000"
  },
  "returnBase": "https://tienda.acropolis.adesa.com.do"
}
```

- `kind`: `"book"` (libro en BD) o `"regalo"` (artículos definidos solo en el front — ver nota abajo).
- `returnBase`: URL base de la tienda; Azul/Biblioteca deben redirigir a `{returnBase}/pago/aprobado/` (etc.).

### Response esperada (éxito)

```json
{
  "ok": true,
  "orderNumber": "ORD-2026-0001",
  "paymentUrl": "https://pruebas.azul.com.do/PaymentPage/",
  "fields": {
    "MerchantId": "...",
    "OrderNumber": "...",
    "Amount": "...",
    "AuthHash": "...",
    "...": "..."
  }
}
```

La tienda crea un `<form method="POST">` con cada par `fields` y hace submit hacia `paymentUrl`.

### Response error

```json
{
  "ok": false,
  "error": "mensaje legible"
}
```

---

## Configuración Azul en Biblioteca

Completar en `api/config.php` de Biblioteca (nombre según código existente):

```php
'INTEGRATIONS' => [
    'AZUL' => [
        // Completar con datos del portal Azul / ejecutivo de negocios
        'merchant_id'   => '________',
        'auth_key'      => '________',   // NUNCA en git ni en el front
        'auth1'         => '________',   // si aplica
        'auth2'         => '________',   // si aplica
        'sandbox'       => true,         // false en producción
        'payment_url'   => 'https://pruebas.azul.com.do/PaymentPage/',
        // 'payment_url' => 'https://...', // URL producción (Azul la entrega)
        'itbis_rate'    => '________',   // según perfil comercio
        'return_paths'  => [
            'approved' => '/pago/aprobado/',
            'declined' => '/pago/rechazado/',
            'cancelled'=> '/pago/cancelado/',
        ],
    ],
],
```

> **Nota:** Los nombres exactos de claves pueden variar según la implementación PHP en Biblioteca. Ajustar a lo que espere `checkout_create.php`.

**Documentación Azul:** https://dev.azul.com.do/Pages/developer/pages/lib/index.aspx  
**Ambiente pruebas Payment Page:** `https://pruebas.azul.com.do/PaymentPage/`

---

## Datos que necesitamos de Azul / Banco Popular

Marcar cuando se obtengan:

- [ ] Cuenta comercio activa (entidad legal en RD: _________________________)
- [ ] Merchant ID
- [ ] AuthKey (clave privada servidor)
- [ ] Auth1 / Auth2 (si aplica)
- [ ] Acceso portal administrativo Azul
- [ ] Credenciales ambiente **pruebas**
- [ ] Credenciales ambiente **producción** (tras certificación)
- [ ] Contacto soporte técnico Azul: _________________________

---

## Lo que debe hacer Biblioteca (backend)

### Obligatorio para ir a producción

1. **Configurar `INTEGRATIONS.AZUL`** en `config.php` (bloqueador actual).
2. **Validar pedido en servidor:** recalcular total desde precios en MySQL; verificar stock; no confiar en `price` del JSON del cliente.
3. **Generar AuthHash** (HMAC SHA-512) al crear el pago — solo en servidor.
4. **Verificar AuthHash** en la respuesta/callback de Azul antes de marcar pedido como pagado.
5. **Notificación servidor (IPN/webhook):** confirmar pago aunque el cliente cierre el navegador.
6. **Idempotencia:** un `orderNumber` no puede cobrarse dos veces.
7. **Descontar stock** solo tras pago confirmado (tablas `store_orders` / `bookstore_listings`).
8. **Whitelist de `returnBase`:** solo `https://tienda.acropolis.adesa.com.do` y `http://localhost:3300` en dev.
9. **CORS:** reemplazar `*` por orígenes explícitos de la tienda.
10. **Correo de confirmación** al cliente (SMTP: `mail.acropolis.org`, remitente `no-reply@acropolis.org` o `editorial@acropolis.org` — definir: __________).

### Recomendado

- Rate limit en `checkout_create.php`.
- Logs de pedidos **sin** guardar PAN, CVV ni datos sensibles de tarjeta.
- 3D Secure habilitado (Azul lo soporta por defecto en ecommerce).
- Tabla/estados de pedido: `pending` → `paid` → `fulfilled` / `cancelled`.

---

## Regalos vs libros

| Tipo | Origen precio/stock | Estado |
|------|---------------------|--------|
| Libros (`kind: "book"`) | MySQL Biblioteca vía `bookstore_public_list.php` | OK para checkout |
| Regalos (`kind: "regalo"`) | Definidos en front (`tienda/lib/editorial-extras.ts`) | **Pendiente decidir** |

**Opciones para regalos:**

- [ ] A) Crear entradas equivalentes en BD Biblioteca y tratarlos como productos.
- [ ] B) Deshabilitar checkout de regalos hasta tener catálogo en BD.
- [ ] C) Otra: _______________________________________

Decisión: _______________________________________

---

## Seguridad (resumen para cumplimiento)

| Tema | Enfoque |
|------|---------|
| PCI | Tarjeta solo en Página de Pago Azul; la tienda estática no toca CHD |
| Secretos | AuthKey y credenciales solo en `config.php` del servidor |
| Integridad | AuthHash en ida y vuelta |
| Fraude | 3D Secure + validación server-side de montos |
| Cumplimiento | Cuestionario PCI (típicamente SAQ A con Payment Page redirect) |

Política de privacidad del sitio principal ya enlaza desde el footer editorial.

---

## Plan de pruebas

### 1. Sandbox Azul (Biblioteca configurada)

1. Abrir `https://tienda.acropolis.adesa.com.do`
2. Añadir un libro con stock al carrito
3. Completar nombre y correo → «Pagar con Azul»
4. Debe abrir `pruebas.azul.com.do` (o URL de prueba configurada)
5. Completar pago de prueba con tarjeta de test Azul
6. Verificar redirect a `/pago/aprobado/`
7. Verificar en BD: pedido `paid`, stock descontado
8. Verificar correo de confirmación recibido

### 2. Casos negativos

- [ ] Pago rechazado → `/pago/rechazado/`
- [ ] Cancelar en Azul → `/pago/cancelado/`
- [ ] Precio manipulado en DevTools → backend rechaza
- [ ] Stock insuficiente → error antes de redirect
- [ ] Cerrar pestaña tras pagar → IPN igual marca pedido pagado

### 3. Producción

- [ ] Certificación Azul completada
- [ ] Cambiar `sandbox: false` y URLs de producción
- [ ] Una transacción real de monto bajo
- [ ] Monitoreo 24–48 h

---

## Variables de entorno (tienda — ya en CI/build)

No contienen secretos Azul; solo apuntan al API:

```env
NEXT_PUBLIC_SITE_URL=https://tienda.acropolis.adesa.com.do
NEXT_PUBLIC_STORE_API_URL=https://biblioteca-oina.adesa.com.do
NEXT_PUBLIC_STORE_CHECKOUT_PATH=/api/checkout_create.php
```

Build: `npm run build:cpanel` en carpeta `tienda/`.  
Deploy automático vía GitHub Actions al publicar CMS (requiere secrets FTP tienda).

---

## Contactos internos (completar)

| Rol | Nombre | Correo |
|-----|--------|--------|
| Responsable editorial / tienda | __________ | __________ |
| Admin Biblioteca / hosting | __________ | __________ |
| Desarrollo web (repo acropolis) | __________ | __________ |
| Finanzas / cuenta Azul | __________ | __________ |

---

## Preguntas abiertas

1. ¿Ya existe cuenta Azul a nombre de NA RD o hay que abrirla?
2. ¿Quién tiene acceso SSH/FTP a `biblioteca-oina.adesa.com.do` para editar `config.php`?
3. ¿El handler de callback/IPN ya está escrito en Biblioteca o hay que implementarlo?
4. ¿Correo de confirmación de pedidos: `editorial@acropolis.org` u otro?
5. ¿Regalos entran en la primera versión o solo libros?

---

## Referencias en el repo

| Archivo | Qué hace |
|---------|----------|
| `tienda/lib/checkout.ts` | Llama API y redirige a Azul |
| `tienda/components/cart/EditorialCartDrawer.tsx` | UI carrito + botón pagar |
| `tienda/lib/site-config.ts` | URLs API y tienda |
| `tienda/app/pago/*/page.tsx` | Páginas de retorno |
| `docs/HARMONIA-TIENDA-API.md` | Plan futuro (Harmonía/Railway) |

---

*Última revisión: junio 2026. Actualizar este documento cuando Azul quede configurado o cambien URLs.*
