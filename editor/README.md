# Editor CMS — Acropolis + Civis

Panel en **editor.acropolis.org.do** (local: http://localhost:3400).

Un solo login, selector de sitio (**Acropolis** o **Civis**), pestañas por sección, borrador → publicar con respaldo automático.

La tienda editorial y Biblioteca OINA tienen su propio ecosistema (Harmonío / otro repo); no forman parte de este editor.

## Probar en local

Abre **3 o 4 terminales** desde `acropolis.org.do/`:

```powershell
# 1 — API (guarda JSON en editor/data/)
npm run dev:editor-api

# 2 — Editor (login)
npm run dev:editor

# 3 — Acropolis principal
npm run dev:principal

# 4 — Civis (opcional)
npm run dev:civis
```

Configura cada sitio (copia `.env.local.example` → `.env.local`):

**principal/.env.local**
```
NEXT_PUBLIC_CMS_URL=http://localhost:3401
```

**civis/.env.local**
```
NEXT_PUBLIC_CMS_URL=http://localhost:3401
```

### Login local

- URL editor: http://localhost:3400
- Contraseña por defecto: `acropolis-edit` (cambia con `CMS_ADMIN_PASSWORD` al arrancar la API)

### Flujo de prueba — Acropolis

1. Entra al editor → elige **Acropolis**.
2. Pestaña **Artículos** o **Eventos** → crea entrada con foto portada + galería (1 o varias fotos).
3. **Guardar borrador** → **Publicar**.
4. Recarga http://localhost:3100/articulos o /eventos — verás el contenido del CMS mezclado con los del código.

Los artículos/eventos que ya existen en el código se pueden **sobrescribir** publicando uno con el mismo slug, o **ocultar** añadiendo el slug a `articulosHidden` / `eventosHidden` en el JSON (próxima mejora en UI).

### Flujo de prueba — Civis

1. Editor → **Civis** → pestañas **Talleres realizados** y **Próximas actividades**.
2. Publica → recarga http://localhost:3200 (home y /talleres).

Si las listas del CMS están vacías, el sitio sigue mostrando las fotos del código fuente.

## Despliegue (editor.acropolis.adesa.com.do)

1. Subdominio en cPanel apuntando a `editor/` (build estático + carpeta `api/` PHP).
2. `npm run build` en `editor/` → subir `out/` + `api/` + `data/` (permisos escritura).
3. Copiar `api/config.php.example` → `config.php` con contraseña admin, `github_repo` y `github_deploy_token`.
4. En builds de principal/civis: `NEXT_PUBLIC_CMS_URL=https://editor.acropolis.adesa.com.do/api` (sin barra final).

**Deploy automático al publicar:** ver `docs/CMS-DEPLOY.md` (webhook → GitHub Actions → FTP cPanel).

## Secciones conectadas al sitio

| Pestaña | Acropolis | Civis |
|---------|-----------|-------|
| Inicio (H1/H2) | ✓ home | ✓ hero |
| Diplomado badge | ✓ | — |
| Agenda | ✓ home + diplomado | ✓ (guardado) |
| Artículos / blog | ✓ listado + detalle + galería | — |
| Eventos | ✓ listado + detalle + galería | — |
| Talleres realizados | — | ✓ carrusel home |
| Próximas actividades | — | ✓ /talleres |

## Imágenes

Subidas van a `editor/data/{site}/uploads/` y se sirven desde la API. En local la URL será `http://localhost:3401/uploads/acropolis/...`.

**Nota:** artículos/eventos **nuevos** (slug que no existía en el build) funcionan en `next dev`. Para el export estático a cPanel hay que volver a hacer build incluyendo esos slugs, o añadirlos después en el servidor.
