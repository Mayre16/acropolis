# Lockups de marca — sitio principal

**Fuente de verdad para adesa:** `principal/deploy/acropolis-principal-2026-06-19.zip`  
(fecha del build: 19 jun 2026, 18:53 — el ZIP más reciente en `deploy/`; no hay ZIP del 20 ni 21).

La tabla anterior salía del **código fuente local**; **no coincide** con lo empaquetado en ese ZIP (lo que está en acropolis.adesa.com.do si subieron ese archivo).

Comparación automatizada: `node principal/scripts/compare-deploy-logos.mjs`

---

## Qué lockup va en cada zona (confirmado en el ZIP de adesa)

| Ubicación | Lockup | Descriptor | Preset altura |
|-----------|--------|------------|---------------|
| Header | `na` | — | `headerFilial` |
| Hero inicio | `oinadom` | REPÚBLICA DOMINICANA | `hero` + `descriptorProminence="hero"` |
| Footer | `oinadom` | REPÚBLICA DOMINICANA | `footer` |
| `/contenido` | **`oina`** | ORGANIZACIÓN INTERNACIONAL | `contenidoHub` |
| Home banda digital | `trilogo` | FILOSOFÍA • CULTURA • VOLUNTARIADO | `contentDigital` |
| Home banda internacional | `oina` | ORGANIZACIÓN INTERNACIONAL | `internationalBand` |
| Voluntariado, cultura, cursos, eventos, artículos, relaciones, viajes | `trilogo` | (igual) | `pageHeroTrilogo` |
| Filosofía (PageHero) | `escuela` | ESCUELA DE FILOSOFÍA | `pageHero` |
| Diplomado | `escuela` | ESCUELA DE FILOSOFÍA | `diplomadoHero` |
| Quiénes somos hero | `oina` | ORGANIZACIÓN INTERNACIONAL | `pageHero` |
| Quiénes somos OINA | `oina` | ORGANIZACIÓN INTERNACIONAL | `sectionStacked` |

### Civis (submarca)

| Ubicación | Lockup | Preset | Descriptor |
|-----------|--------|--------|------------|
| Footer | `oinadom` | `civisFooterOinadom` (2.5 → 3rem) | SVG al ancho del wordmark · centrado en columna |
| Quiénes somos → Nueva Acrópolis | `oina` | `quienesSomos` (1.7 → 2rem) | SVG al ancho del wordmark · alineado izquierda |

Componente: `CivisNaSectionLogo` + `fitDescriptorToWordmark` en `civis/components/BrandLogo.tsx`.

**Posiciones** (start/center) no cambian entre adesa y local; lo distinto es **tamaño y tipografía del descriptor**.

---

## Presets `--brand-logo-h` en el ZIP de adesa (19 jun)

| Preset | Mobile → md+ (adesa) |
|--------|----------------------|
| `headerFilial` | 2.35rem → 2.5rem |
| `hero` | 6.25rem → 7.25rem → 8rem → 8.75rem (lg) |
| **`footer`** | **3.5rem → 3.85rem → 4.1rem** |
| `pageHero` | 2.85rem → 3.15rem → 3.35rem |
| `pageHeroTrilogo` | 4.25rem → 4.85rem → 5.35rem |
| `contenidoHub` | 3.35rem → 3.75rem → 4.1rem |
| `contentDigital` | 4.25rem → 4.75rem → 5.1rem |
| `internationalBand` | 4.75rem → 5.5rem → 6rem |
| `sectionStacked` | 3.65rem → 4rem → 4.25rem |
| **`diplomadoHero`** | **3.75rem → 4.15rem → 4.5rem (lg)** |

---

## Tipografía del descriptor en el ZIP de adesa

Fuente: Noto Sans 700. **Todos los descriptores son HTML** (no hay `OinadomDescriptor` SVG / `textLength` en este build).

| Lockup | marginTop | fontSize (`clamp`) | letterSpacing |
|--------|-----------|-------------------|---------------|
| **Hero oinadom** | 0.3em | min **0.8125rem**, × **0.055**, max **1.25rem** | 0.1em |
| `oina` | 0.24em | min 0.5rem, × **0.027**, max 0.625rem | 0.038em |
| `oinadom` default | 0.24em | min 0.5625rem, × **0.03**, max 0.6875rem | 0.05em |
| `trilogo` | 0.22em | min 0.5rem, × 0.026, max 0.625rem | 0.032em |
| `escuela` | 0.24em | min 0.5625rem, × 0.03, max 0.6875rem | 0.05em |

---

## Diferencias: ZIP adesa vs código local actual

| Aspecto | adesa (ZIP 19 jun) | local (tras revert) |
|---------|-------------------|---------------------|
| Footer altura | 3.5 → 4.1rem | 2.65 → 3rem |
| Diplomado altura | 3.75 → 4.5rem | 4.25 → 5.35rem |
| Descriptor oina | × 0.027, min 0.5rem | × 0.19, min 0.4375rem |
| Descriptor oinadom | × 0.03, min 0.5625rem | × 0.21 + SVG wordmark en footer |
| Hero oinadom | × 0.055, max 1.25rem | × 0.058, max 1.35rem |
| Footer oinadom | HTML default | SVG al ancho del wordmark |

**Conclusión:** alinear fuente con el ZIP del 19 jun. Tras el fix local, ejecutar `compare-deploy-logos.mjs` (footer `3.5rem`, `0.8125rem` = ok).

## GitHub Pages (estado al 21 jun, antes del próximo deploy)

Preview: https://mayre16.github.io/acropolis/principal/

El chunk `_next/static/chunks/7088-*.js` en GitHub **no coincidía** con adesa:

| Señal | GitHub (viejo) | adesa (ZIP 19 jun) |
|-------|----------------|---------------------|
| Footer preset | 2.65 → 3rem | 3.5 → 4.1rem |
| Hero descriptor | sin 0.8125rem | 0.8125rem × 0.055 |
| Descriptor oina | 0.21 / 0.4375rem | × 0.027 |
| SVG textLength | presente | ausente |

Verificación: `node principal/scripts/compare-github-logos.mjs`

Referencia visual producción: https://acropolis.adesa.com.do/
