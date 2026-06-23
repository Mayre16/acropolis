# Deploy automático al publicar en el CMS

Guía paso a paso (cPanel + GitHub, lenguaje claro): **`docs/CONFIGURAR-DEPLOY-CMS.txt`**

Cuando alguien pulsa **Publicar** en el editor, la API guarda `published.json` y dispara un **repository_dispatch** en GitHub. Un workflow reconstruye el sitio y lo sube a cPanel por FTP.

## Flujo

```
Publicar (editor) → published.json (cPanel)
                 → GitHub repository_dispatch (cms-publish)
                 → Actions: npm run build:cpanel
                 → FTP → public_html del sitio
```

El editor muestra: *«Los cambios estarán visibles en el sitio en 3–5 minutos»*.

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
| `CMS_API_URL` | `https://editor.acropolis.org.do/api` | Build lee el JSON publicado |
| `PRINCIPAL_SITE_URL` | `https://acropolis.org.do` | Build principal |
| `CIVIS_SITE_URL` | `https://civis.acropolis.org.do` | Build civis |
| `PRINCIPAL_FTP_SERVER` | `ftp.tudominio.com` | Deploy Acropolis |
| `PRINCIPAL_FTP_USERNAME` | usuario cPanel | |
| `PRINCIPAL_FTP_PASSWORD` | contraseña FTP | |
| `PRINCIPAL_FTP_REMOTE_DIR` | `/public_html/` o `/acropolis.adesa.com.do/` | Carpeta del subdominio |
| `CIVIS_FTP_*` | (igual) | Deploy Civis |

Si FTP no está configurado, el workflow igual hace build y deja un **artifact** descargable en Actions.

## 3. config.php del editor (cPanel)

Copiar `editor/api/config.php.example` → `config.php`:

```php
'github_repo' => 'Mayre16/acropolis',
'github_deploy_token' => 'ghp_…',
```

## 4. Desarrollo local (opcional)

En la terminal del API (`dev:editor-api`):

```powershell
$env:CMS_GITHUB_REPO="Mayre16/acropolis"
$env:CMS_GITHUB_DEPLOY_TOKEN="ghp_…"
npm run dev:editor-api
```

## 5. Probar manualmente

GitHub → **Actions** → **CMS publish — rebuild and deploy** → **Run workflow** → site `acropolis` o `civis`.

## 6. Qué se actualiza al instante (sin esperar el build)

Home, agenda, sedes, textos de secciones y **ediciones** de artículos/eventos ya existentes — el sitio en vivo lee el API del CMS.

## 7. Qué requiere el build (3–5 min)

**Artículos, eventos o URLs nuevas** (slug que no existía en el build anterior). El workflow genera los HTML estáticos nuevos.

## Workflow

`.github/workflows/cms-publish-deploy.yml`
