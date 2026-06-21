# Acropolis RD — ecosistema acropolis.org.do

Monorepo para sitios públicos de Nueva Acrópolis República Dominicana.

| Carpeta | URL producción | Dev local |
|---------|----------------|-----------|
| `principal/` | acropolis.org.do | http://localhost:3100 |
| `civis/` | civis.acropolis.org.do | http://localhost:3200 |
| `tienda/` | tienda.acropolis.org.do | http://localhost:3300 |
| `editor/` | editor.acropolis.org.do | http://localhost:3400 |

Harmonía (NA_Harmonia), Biblioteca y contabilidad viven en repos aparte (Railway).

## Desarrollo local

```powershell
npm run dev:principal
npm run dev:civis
npm run dev:tienda
npm run dev:editor
npm run dev:editor-api
```

## GitHub

| Repo | Uso |
|------|-----|
| **[Mayre16/acropolis](https://github.com/Mayre16/acropolis)** | Desarrollo, Pages preview, permisos admin |
| `wiserlearningcenter/web-oina` | Producción org (cuando den admin) |

```powershell
cd "c:\Users\marth\Cursor Projects\acropolis.org.do"
& "C:\Program Files\Git\bin\git.exe" push origin main
```

Preview Pages: https://mayre16.github.io/acropolis/ — ver `docs/GITHUB-PAGES.md`

## GitHub Pages + Railway

- **Pages:** webs estáticas (`principal`, `civis`, `tienda`) — ver `docs/GITHUB-PAGES.md`
- **Railway:** editor API, Harmonía (stock, checkout Azul, contabilidad) — ver `docs/HARMONIA-TIENDA-API.md`

## Build producción

```powershell
npm run build:all
```

Cada sitio genera `out/` para hosting estático.
