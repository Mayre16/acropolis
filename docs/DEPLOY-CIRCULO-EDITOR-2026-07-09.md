# Deploy — Círculo como sitio CMS + editor (2026-07-09)

## 1) GitHub Pages (automático tras push a `main`)

Workflow: **Deploy GitHub Pages preview**

Preview esperado:
- https://mayre16.github.io/acropolis/principal/ (botón **Amigos**)
- https://mayre16.github.io/acropolis/circulodeamigos/
- https://mayre16.github.io/acropolis/civis/
- https://mayre16.github.io/acropolis/tienda/

## 2) Editor cPanel — subir archivo por archivo

Origen local: `editor/out/`  
Destino: document root de `editor.acropolis.adesa.com.do`

**No borrar en servidor:** `data/`, `api/config.php`, `api/config.local.php`

### Front (mismo build)

| Subir | Notas |
|-------|--------|
| `na-assets/` | Carpeta completa (obligatorio) |
| `edit/` | Incluye `edit/circulodeamigos/` |
| `dashboard/` | Incluye usuarios/SMTP |
| `analytics/` | Incluye `circulodeamigos` |
| `login/`, `invitacion/`, `404/` | |
| `index.html`, `.htaccess` | |

### API PHP (archivo por archivo)

| Archivo local | Destino servidor |
|---------------|------------------|
| `editor/out/api/index.php` | `api/index.php` |
| `editor/out/api/auth-service.php` | `api/auth-service.php` |
| `editor/out/api/analytics.php` | `api/analytics.php` |
| `editor/out/api/deploy-webhook.php` | `api/deploy-webhook.php` |
| `editor/out/api/mail.php` | `api/mail.php` |
| `editor/out/api/.htaccess` | `api/.htaccess` |
| `editor/out/api/vendor/PHPMailer/*` | `api/vendor/PHPMailer/` |
| `editor/out/api/mail-assets/*` | `api/mail-assets/` (si existe) |

**No subir:** `api/config.php` ni plantillas `.example`.

### Ajuste manual en `api/config.php` (servidor)

Añadir a `allowed_origins` si faltan:
- `https://circulodeamigos.acropolis.adesa.com.do`
- `https://circulodeamigos.acropolis.org.do`
- `http://localhost:3500`
- `http://127.0.0.1:3500`
- `https://mayre16.github.io`

### Datos CMS Círculo (primera vez)

Crear en servidor (si no existe):
- `data/circulodeamigos/draft.json`
- `data/circulodeamigos/published.json`

Puedes copiar el seed de `circulodeamigos/data/circulodeamigos/published.json` del repo.

## 3) Verificación

1. Login editor → dashboard muestra tile **Círculo de Amigos**
2. `/edit/circulodeamigos/?tab=circuloHome` abre iframe (GitHub Pages o localhost en dev)
3. Principal preview: botón superior dice **Amigos**
4. Actions: workflow Pages en verde
