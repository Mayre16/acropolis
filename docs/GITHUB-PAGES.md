# GitHub Pages — tres sitios

## Repo

`wiserlearningcenter/web-oina` — monorepo con `principal/`, `civis/`, `tienda/`, `editor/`.

## Limitación importante

**Un repo de GitHub = un sitio Pages con un dominio custom principal.**

Para tres subdominios de producción:

| Subdominio | Opción recomendada |
|------------|-------------------|
| acropolis.org.do | GitHub Pages (repo `web-oina`, carpeta `principal/out`) |
| civis.acropolis.org.do | Segundo proyecto Pages **o** Cloudflare Pages apuntando a `civis/out` |
| tienda.acropolis.org.do | Tercer proyecto Pages **o** Cloudflare Pages |

Alternativa: un solo dominio con rutas (`/`, `/civis/`, `/tienda/`) — requiere ajustar `basePath` en Next (hoy no está configurado).

## Preview sin tocar DNS

Workflow **Deploy GitHub Pages preview** (`.github/workflows/deploy-pages.yml`).

Tras cada push a `main`:

| URL preview | Sitio |
|-------------|--------|
| https://wiserlearningcenter.github.io/web-oina/ | Índice con enlaces |
| https://wiserlearningcenter.github.io/web-oina/principal/ | Acropolis |
| https://wiserlearningcenter.github.io/web-oina/civis/ | Civis |
| https://wiserlearningcenter.github.io/web-oina/tienda/ | Tienda |

Build local del mismo preview:

```powershell
node .github/scripts/build-github-pages.mjs
# Abrir .pages-site/index.html o servir la carpeta con un servidor estático
```

La primera vez: en el repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.

También existen artifacts del workflow `Build sites` (`principal-out`, etc.) por 7 días.

## Build local para Pages

```powershell
$env:NEXT_PUBLIC_SITE_URL="https://acropolis.org.do"
$env:NEXT_PUBLIC_CMS_URL="https://editor.acropolis.org.do/api"
npm run build --prefix principal

$env:NEXT_PUBLIC_SITE_URL="https://civis.acropolis.org.do"
npm run build --prefix civis

$env:NEXT_PUBLIC_SITE_URL="https://tienda.acropolis.org.do"
$env:NEXT_PUBLIC_STORE_API_URL="https://biblioteca-oina.adesa.com.do"
npm run build --prefix tienda
```

Contenido de cada `out/` → hosting estático.

## Backend (no va en Pages)

- Editor API → Railway
- Tienda catálogo/checkout → Biblioteca hoy, Harmonía mañana (PostgreSQL)

Ver `docs/HARMONIA-TIENDA-API.md`.
