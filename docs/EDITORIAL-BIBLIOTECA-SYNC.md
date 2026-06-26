# Sincronización Editorial ↔ Biblioteca / Harmonía

Mismo patrón que el carrito Azul: la **tienda estática** solo lee; el **CMS API** escribe en el backend con token de servidor.

## Arquitectura

```
[Lápiz editorial] → draft.json (editor/data/editorial/)
        │
        ├─ Publicar / Sincronizar catálogo
        ▼
CMS API (cPanel o dev-api :3401)
        │  POST + Bearer token
        ▼
Biblioteca hoy / Harmonía mañana
  bookstore_upsert.php  →  MySQL bookstore_listings
  (futuro) /api/store/listings/upsert  →  PostgreSQL store_listings
        │
        ▼
Tienda lee catálogo + checkout (sin cambios de patrón)
  GET  bookstore_public_list.php
  POST checkout_create.php
```

**Sentido inverso (Biblioteca → Editorial):** no requiere sync explícito. Todo listing visible en `bookstore_public_list.php` ya aparece en el catálogo. El lápiz solo añade títulos creados desde la web o personalización (portada, resumen) por `bibliotecaId`.

---

## Qué hay en este repo (implementado)

| Pieza | Ubicación |
|-------|-----------|
| Tipos `bibliotecaId`, `syncStatus` | `tienda/lib/cms/types.ts` |
| Merge catálogo API + CMS | `tienda/lib/bookstore-merge.ts` |
| Carrito solo con `id > 0` | `tienda/lib/cart.ts` |
| UI lápiz + sincronizar | `tienda/components/cms/EditorialCmsEditContext.tsx` |
| Sync al publicar / endpoint | `editor/api/bookstore-sync.php`, `editor/lib/bookstore-sync.mjs` |
| Rutas API configurables | `tienda/lib/site-config.ts` (`STORE_UPSERT_PATH`) |

## Qué falta en Biblioteca (cPanel hoy)

Implementar en el repo local **Biblioteca-OINA** (no está en GitHub):

`C:\Users\marth\Cursor Projects\Biblioteca-OINA\api\bookstore_upsert.php`

Guía cPanel + subdominio: **`docs/BIBLIOTECA-CPANEL.md`**

Configurar en Biblioteca `config.php`:

```php
'STORE_SYNC_TOKEN' => 'mismo-valor-que-en-editor-config',
```

Configurar en editor `api/config.php`:

```php
'store_api_url' => 'https://biblioteca-oina.adesa.com.do',
'store_upsert_path' => '/api/bookstore_upsert.php',
'store_sync_token' => '…',
```

Desarrollo local (`dev-api`):

```powershell
$env:STORE_SYNC_TOKEN="…"
npm run dev:editor-api
```

---

## Contrato `bookstore_upsert.php`

**POST** `Authorization: Bearer <token>`

**Body:**

```json
{
  "id": 42,
  "title": "Título",
  "author": "Autor",
  "isbn": "978-…",
  "price": 650,
  "currency": "DOP",
  "stock": 10,
  "publisher": "Editorial Nueva Acrópolis",
  "area_tema": "Filosofía",
  "summary": "…",
  "cover_url": "https://tienda…/uploads/…",
  "product_type": "impreso",
  "cms_slug": "libro-abc123"
}
```

- Sin `id` → INSERT
- Con `id` → UPDATE del mismo registro

**Response:**

```json
{ "ok": true, "id": 42 }
```

---

## Fases y tiempos estimados

### Fase 1 — cPanel (Biblioteca PHP + MySQL) — **en curso**

| Tarea | Dónde | Esfuerzo | Dependencia |
|-------|-------|----------|-------------|
| Merge catálogo + lápiz + sync CMS | Este repo | ✅ Hecho | — |
| `bookstore_upsert.php` | Biblioteca | **1–2 días** | Acceso repo PHP |
| Token + config en editor cPanel | Ops | **0.5 día** | Token generado |
| Activar Azul (`INTEGRATIONS.AZUL`) | Biblioteca | **1–3 días** | Cuenta Azul / banco |
| Prueba E2E: lápiz → sync → carrito → Azul | QA | **0.5 día** | Upsert + Azul |

**Total Fase 1:** ~**3–6 días laborables** si hay acceso a Biblioteca y Azul. Sin `bookstore_upsert.php` el lápiz guarda en CMS pero la sync devuelve error o “token no configurado”.

### Fase 2 — Railway + PostgreSQL (Harmonía)

| Tarea | Dónde | Esfuerzo |
|-------|-------|----------|
| REST catálogo + checkout (paridad con PHP) | NA_Harmonia | **1–2 semanas** |
| `POST /api/store/listings/upsert` (mismo JSON) | Harmonía | **2–3 días** (si catálogo ya existe) |
| Migración MySQL → PostgreSQL (`store_listings`, pedidos) | Script Harmonía | **2–4 días** |
| Cambiar `STORE_API_URL` + `store_upsert_path` en builds | GitHub Actions / cPanel | **0.5 día** |
| CORS + dominios tienda/editor | Railway | **0.5 día** |
| Pruebas regresión checkout | QA | **1–2 días** |

**Total Fase 2:** ~**2–3 semanas** (puede solaparse con Fase 1 si el contrato JSON es idéntico).

### Fase 3 — Finanzas (opcional, después)

Pedido Azul aprobado → asiento contabilidad Harmonía. **No bloquea** sync ni catálogo. Ver `docs/HARMONIA-TIENDA-API.md`.

---

## Migración cPanel → Railway (solo cambiar URLs)

La tienda **no se reescribe**. Al cortar a Railway:

```env
# tienda build
NEXT_PUBLIC_STORE_API_URL=https://na-harmonia.up.railway.app
NEXT_PUBLIC_STORE_CATALOG_PATH=/api/store/catalog
NEXT_PUBLIC_STORE_CHECKOUT_PATH=/api/store/checkout
NEXT_PUBLIC_STORE_UPSERT_PATH=/api/store/listings/upsert

# editor config.php
store_api_url = https://na-harmonia.up.railway.app
store_upsert_path = /api/store/listings/upsert
store_sync_token = …
```

GitHub Pages, cPanel y Railway comparten el mismo front estático; solo cambia el backend.

---

## Resumen

| Pregunta | Respuesta |
|----------|-----------|
| ¿Funciona en cPanel con Azul? | Sí, cuando exista `bookstore_upsert.php` y Azul configurado |
| ¿Qué falta para cerrar Fase 1? | Endpoint upsert en Biblioteca + token + Azul |
| ¿Cuánto hasta Railway? | ~2–3 semanas adicionales en Harmonía (no obligatorio para lanzar sync en cPanel) |
| ¿La tienda se toca otra vez al migrar? | Solo variables de entorno y `config.php` del editor |
