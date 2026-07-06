# Civis Consulting — subdominio oficial

Plataforma **Civis** de Nueva Acrópolis RD. Es la **única** app Civis activa del ecosistema.

| | |
|--|--|
| **Código fuente (carpeta en tu PC)** | `acropolis.org.do/civis/` — solo nombre de carpeta del monorepo |
| **URL pública (producción)** | **https://civis.acropolis.org.do** — subdominio propio, no es una ruta `/civis` del sitio principal |
| **Preview cPanel** | `civis.acropolis.adesa.com.do` |
| **Local** | http://localhost:3200 |

## Qué incluye

- Talleres corporativos (oferta formativa in company)
- Alquiler de salones (Naco y Los Prados)
- Quiénes somos, clientes y **equipo de entrenadores**
- Formulario de inscripción / solicitud de propuesta

## Qué no es este sitio

El proyecto Civis **duplicado** en `Cursor Projects/Civis` (con rutas `/corporativo`, `/cultura`, `/esfera`) fue retirado. **No** era el del subdominio.

## Desarrollo local

Desde la raíz del monorepo:

```powershell
cd "c:\Users\marth\Cursor Projects\acropolis.org.do"
npm run dev:civis
```

→ http://localhost:3200

## Build cPanel

```powershell
cd civis
npm run build:cpanel
```

Subir el contenido generado en `upload-cpanel-civis/` (o según `scripts/build-cpanel.mjs`).
