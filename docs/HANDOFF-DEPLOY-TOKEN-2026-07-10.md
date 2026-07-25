# Handoff — token de deploy CMS (mañana)

Fecha: 2026-07-09 / 10 (noche). Retomar cuando el usuario diga.

## Qué pasó

- **Publicar en el editor SÍ guarda** el contenido en el CMS (`published.json`).
- El mensaje de error era solo el **rebuild automático en GitHub**: HTTP **403** al llamar `repository_dispatch`.
- Causa: `github_deploy_token` en `editor/api/config.php` (cPanel) inválido, caducado o sin permisos.
- Comprobado: `updatedAt` del published de Acropolis ya se actualiza (ej. `2026-07-10T03:02:52+00:00`).

## Qué hacer mañana

1. En GitHub → Settings → Developer settings → Personal access tokens:
   - Classic: scopes **`repo`** + **`workflow`**, o
   - Fine-grained: repo `Mayre16/acropolis`, permisos Contents + Actions (y lo necesario para dispatch).
2. En cPanel del editor → `api/config.php` (no tocar `data/`):
   ```php
   'github_repo' => 'Mayre16/acropolis',
   'github_deploy_token' => 'ghp_…', // o el token nuevo
   ```
3. Publicar de nuevo en Acropolis → mensaje esperado: deploy en cola / “3–5 minutos”.
4. Si no quieres tocar el token aún: GitHub → Actions → **CMS publish — rebuild and deploy** → Run workflow.

## Relacionado (código local, sin push obligatorio)

- Mensajes de publish más claros: `editor/api/deploy-webhook.php` (Publicado correctamente + aviso de token).
- Librería: la URL del CMS debe usarse **tal cual** (sin reescribir GitHub → adesa) — `principal/lib/cms/platform-nav-edit.ts` + build Pages en `.github/scripts/build-github-pages.mjs`. Hace falta **push/deploy** del principal para que el preview del iframe lo use.
- Handshake “Conectando…”: fixes en editor + `principal/lib/cms/edit-session.ts` (también pendientes de deploy Pages / subir ZIP editor).

## Archivos a subir al editor si aún no

- `editor/deploy/acropolis-editor-2026-07-10.zip` → al menos `edit/`, `na-assets/`, `api/index.php`, `api/deploy-webhook.php` (sin sobrescribir `api/config.php` salvo el token nuevo).

## No confundir

| Qué | Estado |
|-----|--------|
| Guardar en CMS al Publicar | Funciona |
| Rebuild/FTP automático vía token | Roto (403) hasta renovar token |
| Deploy manual por Actions | Funciona |
