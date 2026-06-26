# Deploy automático al publicar en el CMS

Guía paso a paso (cPanel + GitHub, lenguaje claro): **`docs/CONFIGURAR-DEPLOY-CMS.txt`**

Cuando alguien pulsa **Publicar** en el editor, la API guarda `published.json` y dispara un **repository_dispatch** en GitHub. Un workflow reconstruye el sitio y lo sube a cPanel por FTP.

Al publicar **Acropolis**, también se encola rebuild de **Editorial (tienda)** para sincronizar sedes.

## Flujo

```
Publicar (editor) → published.json (cPanel)
                 → GitHub repository_dispatch (cms-publish)
                 → Actions: npm run build:cpanel
                 → FTP → public_html del sitio
```

El editor muestra: *«Los cambios estarán visibles en el sitio en 3–5 minutos»*.

## URLs de producción (cPanel / adesa)

| Sitio | URL |
|-------|-----|
| Principal | `https://acropolis.adesa.com.do` |
| Civis | `https://civis.acropolis.adesa.com.do` |
| Editorial | `https://tienda.acropolis.adesa.com.do` |
| Editor (API CMS) | `https://editor.acropolis.adesa.com.do/api` |

## 1. Token de GitHub (PAT)

Crear en GitHub → **Settings → Developer settings → Personal access tokens**:

- Tipo: **Fine-grained** (recomendado) o classic
- Repo: `Mayre16/acropolis` (o el que uses)
- Permisos: **Contents** read, **Actions** read and write, **Metadata** read

Guardar el token; no va en git.

## 2. Secrets en el repo GitHub

**Settings → Secrets and variables → Actions → New repository secret**

| Secret | Ejemplo | Uso |
|--------|---------|-----|
| `CMS_API_URL` | `https://editor.acropolis.adesa.com.do/api` | Build lee el JSON publicado |
| `PRINCIPAL_SITE_URL` | `https://acropolis.adesa.com.do` | Build principal |
| `CIVIS_SITE_URL` | `https://civis.acropolis.adesa.com.do` | Build civis |
| `TIENDA_SITE_URL` | `https://tienda.acropolis.adesa.com.do` | Build editorial |
| `STORE_API_URL` | `https://biblioteca-oina.adesa.com.do` | Catálogo/checkout tienda |
| `PRINCIPAL_FTP_*` | (servidor, usuario, contraseña, carpeta) | Deploy Acropolis |
| `CIVIS_FTP_*` | (igual) | Deploy Civis |
| `TIENDA_FTP_*` | (igual) | Deploy Editorial |
| `EDITOR_SITE_URL` | `https://editor.acropolis.adesa.com.do` | Build panel editor |
| `EDITOR_FTP_*` | (igual) | Deploy panel editor (front + api PHP; no borra `data/` ni `config.php`) |
| `TURNSTILE_SITE_KEY` | clave **pública** de Cloudflare Turnstile | Build principal + civis (widget «No soy un robot») |

La **clave secreta** de Turnstile va solo en `editor/api/config.php` → `turnstile_secret_key` (no en GitHub del front).

Si FTP no está configurado, el workflow igual hace build y deja un **artifact** descargable en Actions.

## Seguridad en cPanel (revisar tras cada deploy)

| Riesgo | Mitigación en el repo |
|--------|------------------------|
| `data/` (JSON, SMTP, usuarios, backups) accesible por URL | `editor/data/.htaccess` → `Require all denied`; raíz del editor bloquea `/data/` |
| Plantillas con secretos (`config.php.example`) en el servidor | El build **no** copia `.example` ni `config.php`; FTP los excluye |
| PHP auxiliar ejecutable por HTTP (`mail.php`, etc.) | `editor/api/.htaccess` solo permite `index.php` |
| Borrador CMS legible sin login | `GET …/content/{site}/draft` exige autenticación |
| Imágenes CMS sin exponer `data/` | `/uploads/{site}/…` se sirve vía `api/index.php` |
| Sitios públicos con carpetas CMS sueltas | `.htaccess` bloquea `data/acropolis`, `auth`, `system` si existieran en `public_html` |

**Una vez en cPanel:** confirma que `editor/data/.htaccess` existe y que `api/config.php` **no** es descargable (debe dar 403). `published.json` sigue siendo público vía API (los sitios lo necesitan).

## 3. config.php del editor (cPanel)

Copiar `editor/api/config.php.example` → `config.php`:

```php
'github_repo' => 'Mayre16/acropolis',
'github_deploy_token' => 'ghp_…',
'allowed_origins' => [ /* URLs de editor, principal, civis, tienda */ ],
```

## 4. Desarrollo local (opcional)

En la terminal del API (`dev:editor-api`):

```powershell
$env:CMS_GITHUB_REPO="Mayre16/acropolis"
$env:CMS_GITHUB_DEPLOY_TOKEN="ghp_…"
npm run dev:editor-api
```

Disparar deploy manual desde la raíz del repo:

```powershell
$env:CMS_GITHUB_REPO="Mayre16/acropolis"
$env:CMS_GITHUB_DEPLOY_TOKEN="ghp_…"
npm run cms:deploy:all
```

## 5. Probar manualmente

GitHub → **Actions** → **CMS publish — rebuild and deploy** → **Run workflow** → site `all`, `acropolis`, `civis`, `tienda` o `editor`.

## 6. Qué se actualiza al instante (sin esperar el build)

Home, agenda, sedes, textos de secciones y **ediciones** de artículos/eventos ya existentes — el sitio en vivo lee el API del CMS.

## 7. Qué requiere el build (3–5 min)

**Artículos, eventos o URLs nuevas** (slug que no existía en el build anterior). El workflow genera los HTML estáticos nuevos.

Cambios en **sedes** del principal también requieren rebuild de Editorial (se dispara automáticamente al publicar Acropolis).

## Workflow

`.github/workflows/cms-publish-deploy.yml`
