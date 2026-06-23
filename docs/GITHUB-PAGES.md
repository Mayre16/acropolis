# GitHub Pages — tres sitios

## Repo activo (desarrollo / preview)

**[Mayre16/acropolis](https://github.com/Mayre16/acropolis)** — monorepo con `principal/`, `civis/`, `tienda/`, `editor/`.

Repo futuro de producción org: `wiserlearningcenter/web-oina` (cuando haya admin).

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
| https://mayre16.github.io/acropolis/ | Índice con enlaces |
| https://mayre16.github.io/acropolis/principal/ | Acropolis |
| https://mayre16.github.io/acropolis/civis/ | Civis |
| https://mayre16.github.io/acropolis/tienda/ | Tienda |

Build local del mismo preview:

```powershell
node .github/scripts/build-github-pages.mjs
# Abrir .pages-site/index.html o servir la carpeta con un servidor estático
```

La primera vez: en el repo → **Settings → Pages → Build and deployment → Deploy from a branch → Branch `gh-pages` / `/ (root)`**.

**Repo privado:** GitHub Pages en cuenta personal gratuita solo funciona en repos **públicos**. Para preview con repo privado hace falta GitHub Pro, o crear el repo como **Public** (solo código del sitio; secretos van en Railway, no en git).

El workflow sube el preview a la rama `gh-pages` en cada push a `main`.

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

- Editor API → cPanel (PHP) + deploy automático al publicar — ver `docs/CMS-DEPLOY.md`
- Tienda catálogo/checkout → Biblioteca hoy, Harmonía mañana (PostgreSQL)

Ver `docs/HARMONIA-TIENDA-API.md`.
