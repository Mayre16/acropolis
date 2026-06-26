# Biblioteca OINA — cPanel (repo local)

La app PHP/MySQL de Biblioteca **no está en GitHub**. Vive en:

```
C:\Users\marth\Cursor Projects\Biblioteca-OINA
```

El monorepo `acropolis.org.do` solo consume su API (`NEXT_PUBLIC_STORE_API_URL`).

Harmonía en Railway es **fase 2**; por ahora todo el comercio (catálogo, sync CMS, Azul) apunta a Biblioteca en cPanel.

---

## Subdominios recomendados (cPanel)

| Subdominio | Rol | Carpeta típica |
|------------|-----|----------------|
| `biblioteca-oina.adesa.com.do` | Biblioteca + API tienda | `public_html/` o subcarpeta del subdominio |
| `editor.acropolis.adesa.com.do` | CMS API (ya documentado) | `editor/` build + `api/` + `data/` |
| `tienda.acropolis.adesa.com.do` | Editorial estática | `tienda/out/` |

Puedes crear el subdominio **antes** de que el DNS final esté en producción: en cPanel → **Dominios** → **Crear subdominio** → document root vacío o staging.

### Pasos DNS + cPanel

1. **cPanel** → Dominios → Crear subdominio `biblioteca-oina` (o el que uses).
2. Anotar la ruta del document root (ej. `public_html/biblioteca-oina`).
3. **DNS** (donde esté el dominio `adesa.com.do`): registro **A** o **CNAME** del subdominio → IP del servidor cPanel.
4. Esperar propagación (minutos a horas).
5. Subir el **deploy pack** de Biblioteca (ver abajo).
6. Copiar `api/config.sample.php` → `api/config.php` con BD y tokens.

Mientras el DNS propaga, puedes probar en local con XAMPP o el servidor de desarrollo de Biblioteca.

---

## Despliegue Biblioteca a cPanel

Guía completa paso a paso: **`Biblioteca-OINA/docs/DEPLOY-CPANEL.md`** (repo local).

En `Biblioteca-OINA/`:

```powershell
cd "C:\Users\marth\Cursor Projects\Biblioteca-OINA"
npm install
npm run build:cpanel
node scripts/verify-deploy-pack.mjs
```

Genera `deploy/biblioteca-oina-YYYY-MM-DD.zip` + ZIP de `uploads/`. Subir al document root del subdominio.

- `index.html` + `assets/` (SPA biblioteca)
- `api/` (PHP, incluido `bookstore_upsert.php`)
- `uploads/` (portadas `bookstore_covers/`, permisos escritura)

**No subir** `api/config.php` a git; solo en el servidor.

---

## Sync editorial ↔ Biblioteca (cPanel)

| Pieza | Repo | Estado |
|-------|------|--------|
| Lápiz + merge catálogo | `acropolis.org.do/tienda` | Hecho |
| Sync al publicar | `acropolis.org.do/editor/api` | Hecho |
| `POST /api/bookstore_upsert.php` | `Biblioteca-OINA/api` | Hecho (repo local) |

### Configurar en producción

**Biblioteca** `api/config.php`:

```php
'INTEGRATIONS' => [
    'STORE_SYNC_TOKEN' => 'genera-un-token-largo-aleatorio',
    // …
],
```

**Editor** `api/config.php`:

```php
'store_api_url' => 'https://biblioteca-oina.adesa.com.do',
'store_upsert_path' => '/api/bookstore_upsert.php',
'store_sync_token' => 'el-mismo-token',
```

**Tienda** (build cPanel / GitHub Actions):

```
NEXT_PUBLIC_STORE_API_URL=https://biblioteca-oina.adesa.com.do
```

### Probar sync (PowerShell)

```powershell
$token = "TU_TOKEN"
$body = @{
  title = "Libro prueba sync"
  author = "Autor"
  price = 100
  currency = "DOP"
  stock = 1
  product_type = "impreso"
  cms_slug = "test-123"
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "https://biblioteca-oina.adesa.com.do/api/bookstore_upsert.php" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body $body
```

Respuesta esperada: `{"ok":true,"id":42}`

---

## Railway / Harmonía (después)

Cuando Harmonía tenga paridad REST:

1. Migrar datos MySQL → PostgreSQL (`store_listings`).
2. Cambiar solo URLs en editor + builds de tienda.
3. El contrato JSON de `bookstore_upsert` se mantiene.

No hace falta tocar el lápiz ni el merge del catálogo en la tienda.

Ver también: `docs/EDITORIAL-BIBLIOTECA-SYNC.md`, `docs/HARMONIA-TIENDA-API.md`.
