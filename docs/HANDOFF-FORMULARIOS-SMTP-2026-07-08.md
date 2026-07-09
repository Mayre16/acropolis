# Handoff — Formularios y SMTP (8 jul 2026)

Resumen de la sesión para retomar mañana. Usuario: Martha.

---

## Problemas reportados

1. **Círculo de Amigos** — botón «Enviar inscripción» invisible; error «Tipo de formulario no válido» (400).
2. **Civs, Esfera, Acropolis** — formularios devuelven 400; mensaje «No se pudo enviar la solicitud. Inténtelo más tarde.»
3. **Analytics** — `POST /api/analytics/collect` → 404 en consola (GitHub Pages / principal).
4. **Favicon** — `GET https://mayre16.github.io/favicon.ico` → 404 (menor).

---

## Qué ya se arregló en código (GitHub)

| Commit / cambio | Qué hace |
|-----------------|----------|
| `668a8a2` | Botón inscripción Círculo visible (colores explícitos + `.circulo-inscription-theme`) |
| `dd9657b` | Favicon en layout `circulodeamigos` |
| `29dcc25` | Silenciar analytics en `*.github.io` (principal, civis, tienda) |
| `mail.php` (local, **subir a cPanel**) | Host SMTP `editor.acropolis.adesa.com.do`; ruta `circulo_amigos_inscription`; prioridad `config.php` sobre `smtp.json`; log `data/system/mail-last-error.log`; error detallado en preview GitHub |

**Archivos listos para subir a cPanel** (`editor.acropolis.adesa.com.do` → `public_html/api/`):

- `editor/api/mail.php` → copia en `editor/deploy/mail.php`
- `editor/api/index.php` → `editor/deploy/index.php` (analytics ya responde 200 si está subido)
- `editor/api/analytics.php` → `editor/deploy/analytics.php`

**No tocar** `api/config.php` del servidor al subir ZIP (editar a mano).

---

## Estado de la API en producción (última prueba)

| Endpoint | Estado |
|----------|--------|
| `/api/analytics/collect` | **200** (usuario subió `index.php` + `analytics.php`) |
| `/api/forms/site-inquiry` (esfera, curso, viaje, circulo…) | Llega validación; **falla envío correo** |
| `/api/forms/civis-solicitud` | Igual — **falla SMTP** |
| `circulo_amigos_inscription` | Ya no «tipo no válido» tras subir `mail.php`; falla en SMTP |

Mensaje típico: `{"ok":false,"error":"No se pudo enviar la solicitud. Inténtelo más tarde."}`

---

## Causa raíz SMTP

### 1. `config.php` del editor tenía placeholder

```php
'smtp_password' => 'CONTRASEÑA_SMTP',  // ← texto de ejemplo, no contraseña real
```

Sin líneas `smtp_host`, `smtp_port`, etc. Usuario añadió SMTP después; confirmó misma contraseña en panel editor y `config.php`.

### 2. Host SMTP incorrecto en el proyecto (corregido en repo)

- **Mal (antes):** `mail.acropolis.adesa.com.do`
- **Bien (cPanel cuenta formularios):** `editor.acropolis.adesa.com.do`, puerto **465**, **ssl**
- Usuario: `formularios@editor.acropolis.adesa.com.do`

### 3. `smtp.json` puede pisar `config.php`

Ruta: `public_html/data/system/smtp.json` (guardado desde panel editor).

- Si tiene host viejo o contraseña distinta, ignora `config.php` para la contraseña (lógica antigua).
- **Fix en `mail.php` local:** si `config.php` tiene contraseña real (no `CONTRASEÑA_SMTP`), esa manda.

### 4. Biblioteca usa **otro** SMTP (referencia)

Repo local: `C:\Users\marth\Cursor Projects\Biblioteca-OINA`

| | Biblioteca | Editor |
|---|------------|--------|
| Host | `mail.acropolis.org.do` | `editor.acropolis.adesa.com.do` |
| Usuario | `smtp_user@acropolis.org.do` | `formularios@editor.acropolis.adesa.com.do` |
| Config | Solo `config.php` → `'SMTP' => [...]` | `config.php` + `smtp.json` + panel |
| Prueba | `api/test_email.php?to=email` | No existe aún en editor |

Script en monorepo: `editor/scripts/sync-smtp-from-biblioteca.mjs` (copia SMTP de Biblioteca al editor **local**).

---

## `config.php` del editor — plantilla correcta

Añadir tras `data_root` (contraseña con comillas dobles si tiene caracteres especiales):

```php
    'smtp_host' => 'editor.acropolis.adesa.com.do',
    'smtp_port' => 465,
    'smtp_secure' => 'ssl',
    'smtp_user' => 'formularios@editor.acropolis.adesa.com.do',
    'smtp_from_email' => 'formularios@editor.acropolis.adesa.com.do',
    'smtp_from_name' => 'Nueva Acrópolis RD',
    'smtp_password' => "CONTRASEÑA_REAL",
```

Quitar `'smtp_password' => 'CONTRASEÑA_SMTP'`.

---

## Formularios del sitio → API

| Sitio | Componente | Endpoint | `formKey` / notas |
|-------|------------|----------|-------------------|
| Esfera «Solicitar información» | `InquiryMailForm` / `EsferaInquiryButton` | `/forms/site-inquiry` | `esfera_info` |
| Cursos / salones | `InquiryMailForm` | `/forms/site-inquiry` | `curso_info`, `salon_inquiry` |
| Viajes | `ViajeInquiryButton` | `/forms/site-inquiry` | `viaje_info` |
| Círculo inscripción | `CirculoAmigosInscriptionForm` | `/forms/site-inquiry` | `circulo_amigos_inscription` |
| Civis solicitud | `SolicitudPropuestaForm` | `/forms/civis-solicitud` | campos `empresa`, `contactoNombre`, etc. |
| Voluntariado | `VolunteerForm` | `/forms/voluntariado-solicitud` | |
| Esfera taller (form largo) | `SolicitudEsferaForm` | `/forms/esfera-solicitud` | distinto de `esfera_info` |

API base: `https://editor.acropolis.adesa.com.do/api`

---

## Diagnóstico mañana (checklist)

1. Subir **`mail.php` más reciente** (`editor/deploy/mail.php`) si no está.
2. Verificar **`config.php`** en cPanel (host + contraseña real).
3. Revisar **`data/system/smtp.json`** — host `editor.acropolis.adesa.com.do`; o renombrar a `.bak` para usar solo `config.php`.
4. Tras fallo, leer **`data/system/mail-last-error.log`** (nuevo en `mail.php`).
5. Probar formulario en GitHub Pages — recuadro naranja debería mostrar error SMTP detallado (con `mail.php` nuevo).
6. Comparar con Biblioteca en vivo:
   - `https://biblioteca-oina.adesa.com.do/api/test_email.php?to=EMAIL`
   - SMTP de producción en `Biblioteca-OINA/api/config.php` del **servidor**
7. Decidir: arreglar cuenta `formularios@editor...` **o** reutilizar SMTP de Biblioteca (`mail.acropolis.org.do`).
8. **Opcional:** crear `editor/api/test_email.php` copiando patrón de Biblioteca.

---

## Seguridad

- En captura de pantalla del usuario apareció **`github_deploy_token`** en `config.php` — conviene **revocar y rotar** en GitHub.
- No commitear `config.php` ni contraseñas al repo.

---

## URLs preview

- Círculo: https://mayre16.github.io/acropolis/circulodeamigos/
- Principal / Esfera: https://mayre16.github.io/acropolis/principal/esfera/
- Civis: https://mayre16.github.io/acropolis/civis/
- Editor SMTP: https://editor.acropolis.adesa.com.do/dashboard/smtp

---

## Cambios locales sin commit (al retomar)

```
 M editor/api/mail.php          (host, config priority, mail-last-error.log)
 M editor/api/config.php.example
 M editor/components/SmtpSettingsPanel.tsx
 M editor/lib/editor-smtp-defaults.mjs
```

Considerar commit + push de defaults SMTP y `mail.php` cuando SMTP esté verificado.

---

*Generado al cierre de sesión — 8 jul 2026.*
