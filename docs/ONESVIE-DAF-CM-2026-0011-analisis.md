# Análisis de licitación ONESVIE-DAF-CM-2026-0011

**Fecha de análisis:** 7 de julio de 2026  
**Fuente:** Pliego de condiciones ONESVIE-DAF-CM-2026-0011  
**Entidad:** Oficina Nacional de Evaluación Sísmica y Vulnerabilidad de Infraestructura y Edificaciones (ONESVIE)

---

## Resumen ejecutivo

| Pregunta | Respuesta |
|----------|-----------|
| ¿Qué se pide? | CRM de gestión de casos/solicitudes sobre **Microsoft Power Platform** |
| ¿Plazo de entrega? | Máximo **90 días calendario** (cronograma interno: 12 semanas) |
| ¿Criterio de adjudicación? | **Menor precio** entre ofertas que cumplan técnicamente |
| ¿Experiencia requerida? | 2 años, 10 proyectos PP, 5 referencias similares |
| ¿Participar sin experiencia PP? | **No recomendado** — riesgo alto de descalificación e incumplimiento |
| ¿Costo estimado realista? | **RD$1,800,000 – 2,600,000** (~USD $30,000 – $43,000) |

---

## 1. Objeto del contrato

Contratación de servicios especializados para el **diseño, desarrollo e implementación de software personalizado** conforme a las necesidades institucionales de ONESVIE.

**Rubro UNSPSC:** 81110000 — Servicios informáticos

**Referencia:** ONESVIE-DAF-CM-2026-0011

---

## 2. Alcance técnico

No es un software a medida tradicional (código desde cero). Es una **solución low-code** en el ecosistema Microsoft.

| Componente | Tecnología |
|----------|------------|
| App interna | Power Apps (Model Driven o Canvas) |
| Base de datos | Dataverse o SharePoint Online |
| Documentos | SharePoint Online (versionamiento nativo) |
| Automatización | Power Automate (flujos en la nube) |
| Autenticación | Microsoft Entra ID / Azure AD |
| Reportes | Dashboard operativo + preparado para Power BI |

### Módulos funcionales (6)

#### Módulo 1: Captura de Solicitudes
- Formulario de registro interno
- Recepción por canales configurables (presencial, oficio, teléfono, correo)
- Numeración automática según nomenclatura institucional (no editable)
- Relación jerárquica: Institución → Solicitud → Casos (1:N)
- Notificaciones automáticas por correo con diseño institucional

#### Módulo 2: Gestión de Solicitudes y Casos
- Bandeja con indicadores visuales: vencidos, próximos a vencer, vigentes
- Workflow de estados configurable con transiciones válidas por regla
- Estados mínimos: Revisión, En Planificación, Asignado, En Campo, Pendiente de Información, En Análisis, Cerrado, Entregado
- Cálculo automático de antigüedad y tiempo total de atención
- Búsqueda general (texto libre) y avanzada (filtros combinados)
- Bitácora automática e **inmutable** de cambios (usuario, fecha/hora, estado origen/destino)
- Exportación de vista actual a Excel (.xlsx)

#### Módulo 3: Asignación Regional de Técnicos
- 5 oficinas: Sede Central (Santo Domingo), Regional Romana, Santiago, Puerto Plata, Barahona
- Asignación manual: supervisor selecciona técnico con carga visible
- Asignación automática: por oficina, disponibilidad y tope de carga (menor carga como desempate)
- Estados de disponibilidad: Disponible, Asignado/En Atención, No disponible (Vacaciones, Licencia, Otra causa)
- Tope máximo de carga configurable por técnico

#### Módulo 4: Expediente Digital
- Carga de documentos: PDF, DOCX, XLSX, JPG, PNG, DWG
- Clasificación documental configurable por catálogo
- Versionamiento automático en SharePoint Online
- Trazabilidad: usuario, fecha/hora
- Documentos obligatorios para cierre de caso
- Documentos no eliminables una vez asociados a caso cerrado

#### Módulo 5: Dashboard y Reportes
- Dashboard: casos por estado, oficina/sede, tipo de evento, tiempo promedio de atención
- Reportes operativos: creados por período, por estado, vencidos, por técnico, por canal, por tipo de evento
- Reportes de desempeño: tiempo promedio, carga operativa por técnico
- Filtrable por rango de fechas y segmentación por rol
- Exportación a Excel (.xlsx)

#### Módulo 6: Administración y Catálogos
- Catálogo de tipos de evento (SLA por tipo, plantilla de notificación)
- Catálogo de oficinas regionales con jerarquía
- Catálogo de técnicos (nombre, correo, oficina, tope de carga, disponibilidad)
- Catálogo de canales de entrada
- Catálogo de ubicación geográfica (provincia, municipio, sector/paraje)
- Catálogo de uso del inmueble
- Configuración de workflow: estados y transiciones válidas
- Control de acceso RBAC
- Bitácora administrativa de cambios de configuración
- Técnicos deshabilitados mantienen historial pero no reciben nuevas asignaciones

### Requisitos técnicos adicionales
- Accesibilidad WCAG (navegadores modernos, escritorio y móvil)
- Seguridad: autenticación institucional, RBAC, aislamiento por unidad de negocio
- Arquitectura preparada para analítica futura en Power BI

---

## 3. Entregables

### Tecnológicos
- Documento de análisis funcional y alcance detallado validado
- Diseño de arquitectura y modelo de datos
- Aplicación web interna implementada (Power Apps)
- Workflows y automatizaciones configuradas (Power Automate)
- Configuración de seguridad por roles y permisos
- Reportes y dashboard operativos funcionales
- Manual de usuario
- Manual de administración o técnico
- Capacitación a usuarios clave (administradores y supervisores)

### Operativos (consultoría)
- Documento de modelo operativo del proceso
- Diagramas de procesos
- Matriz RACI
- Documento de políticas y SLA
- Instructivos de trabajo por rol
- Documento de indicadores (KPIs)
- Material de capacitación

### Soporte
- **1 año de soporte post-implementación** (incidencias y ajustes menores)

---

## 4. Cronograma contractual

| Fase | Duración |
|------|----------|
| Levantamiento | 1 semana |
| Diseño | 1 semana |
| Desarrollo | 6 semanas |
| Pruebas | 1 semana |
| Certificación | 1 semana |
| Implementación | 1 semana |
| Capacitación | 1 semana |
| **Total** | **12 semanas / máx. 90 días calendario** |

### Fechas clave del proceso de licitación

| Evento | Fecha |
|--------|-------|
| Publicación del aviso | 06/07/2026 |
| Presentación oferta económica | **10/07/2026** |
| Apertura oferta económica | 10/07/2026 |
| Adjudicación | 21/07/2026 |
| Orden de servicio | 27/07/2026 |

---

## 5. Requisitos del oferente

| Requisito | Detalle |
|-----------|---------|
| Experiencia mínima | 2 años en Power Platform |
| Proyectos | Al menos 10 implementaciones en Power Platform |
| Referencias | Mínimo 5 implementaciones similares documentadas |
| Relación Microsoft | Acreditar relación técnico-comercial con Microsoft |
| Evaluación técnica | Metodología **Cumple / No cumple** (un incumplimiento = descalificación) |
| Evaluación económica | **Menor precio** gana |
| Disponibilidad | Inicio en máximo 5 días calendario tras orden de servicio |
| Garantía fiel cumplimiento | 4% del monto adjudicado (1% si es MIPYME) |

### Lo que provee la institución
- Licencias Microsoft 365 E3 activas para todos los usuarios
- Acceso a SharePoint, Teams, Power Automate y Power Apps (E3)
- Definición de roles y responsables
- Definición de nomenclatura para solicitudes y casos
- Sesiones con el área funcional

---

## 6. Estimación de esfuerzo

| Fase / Módulo | Horas estimadas | Complejidad |
|---------------|-----------------|-------------|
| Levantamiento + análisis funcional | 50–70 h | Media |
| Diseño arquitectura + modelo de datos | 50–70 h | Alta |
| Consultoría operativa (RACI, KPIs, diagramas, SLA) | 60–80 h | Media |
| Módulo 1: Captura de solicitudes | 60–80 h | Media |
| Módulo 2: Gestión de casos + workflow + bitácora | 100–140 h | **Alta** |
| Módulo 3: Asignación regional (manual + automática) | 80–100 h | **Alta** |
| Módulo 4: Expediente digital (SharePoint) | 60–80 h | Media-Alta |
| Módulo 5: Dashboard + reportes + Excel | 80–100 h | Media-Alta |
| Módulo 6: Administración + catálogos + RBAC | 80–100 h | Alta |
| Power Automate (notificaciones, SLA, asignación) | 60–80 h | Media |
| Seguridad / roles / permisos por oficina | 40–60 h | Alta |
| Pruebas + UAT + certificación | 80–100 h | Media |
| Manuales + capacitación | 40–60 h | Baja |
| Gestión de proyecto (PM) | 120–160 h | — |
| Soporte 1 año (incidencias + ajustes menores) | 200–300 h | Continuo |
| **TOTAL proyecto + soporte** | **1,100 – 1,500 h** | — |

### Tiempo calendario por escenario

| Escenario | Equipo | Duración |
|-----------|--------|----------|
| Mínimo viable | 2 consultores Power Platform senior | 12–14 semanas |
| Realista | 1 arquitecto + 2 devs + 1 analista (parcial) | 14–18 semanas |
| Plazo del pliego | — | **12 semanas** (ajustado, requiere equipo experimentado) |

---

## 7. Costo estimado (mercado República Dominicana)

### Tarifas orientativas por hora

| Perfil | RD$/hora | USD/hora |
|--------|----------|----------|
| Consultor Power Platform senior | RD$2,000 – 3,500 | $33 – $58 |
| Desarrollador Power Platform mid | RD$1,200 – 2,000 | $20 – $33 |
| Analista funcional | RD$1,000 – 1,800 | $17 – $30 |
| PM (parcial) | RD$1,500 – 2,500 | $25 – $42 |

### Costo total del proyecto

| Escenario | Horas | RD$ | USD |
|-----------|-------|-----|-----|
| Oferta agresiva (competir por precio) | ~1,100 h | RD$1,200,000 – 1,800,000 | $20,000 – $30,000 |
| Oferta realista (equipo calificado) | ~1,300 h | RD$1,800,000 – 2,800,000 | $30,000 – $47,000 |
| Consultora establecida | ~1,500 h | RD$2,800,000 – 4,500,000 | $47,000 – $75,000 |

### Equipo típico

```
1 × Arquitecto Power Platform (liderazgo técnico)
2 × Desarrolladores Power Platform
1 × Analista funcional (50% dedicación)
1 × PM (25% dedicación)
```

Costo mensual del equipo: **RD$350,000 – 600,000/mes** (~$5,800 – $10,000 USD/mes).

### Recomendación de precio para ofertar

| Concepto | Monto sugerido |
|----------|---------------|
| Implementación (12 semanas) | RD$1,400,000 – 2,000,000 |
| Soporte 1 año (incluido) | RD$400,000 – 600,000 |
| **Total oferta competitiva** | **RD$1,800,000 – 2,600,000** |
| En USD | **$30,000 – $43,000** |

> Por debajo de **RD$1,200,000** (~$20,000 USD) el proyecto es económicamente inviable con equipo calificado y soporte de 1 año incluido.

---

## 8. Costo estimado en tokens (IA / Cursor)

Power Platform es principalmente configuración visual. La IA ayuda más en documentación, diseño lógico y análisis que en escribir código.

| Actividad con IA | Tokens estimados |
|------------------|------------------|
| Análisis del pliego + diseño funcional | 400K – 600K |
| Documentación (manuales, arquitectura, RACI) | 500K – 800K |
| Diseño de flujos Power Automate | 300K – 500K |
| Escenarios de prueba + casos UAT | 200K – 300K |
| Iteraciones / correcciones | 500K – 1M |
| **Total aproximado** | **2M – 3.5M tokens** |

| Modelo / uso | Costo estimado |
|--------------|----------------|
| Uso moderado (Composer, GPT-4o) | $50 – $150 USD |
| Uso intensivo (Max Mode, iteraciones largas) | $150 – $400 USD |
| Con Cursor Pro/Ultra (suscripción) | Ya incluido en plan |

**Conclusión:** el costo de IA es marginal (~0.5–2% del costo total del proyecto).

---

## 9. Riesgos e implicaciones

### A favor del oferente
- La institución ya tiene Microsoft 365 E3 (licencias cubiertas)
- Power Platform reduce tiempo vs. desarrollo custom
- Entregables bien definidos
- Alcance acotado a CRM institucional

### Riesgos críticos

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Adjudicación al menor precio | Presión para subcotizar | Cotizar RD$1.5M–2M mínimo viable |
| Requisito: 2 años + 10 proyectos PP | Barrera de entrada | Necesitas 5 referencias documentadas |
| Bitácora inmutable | No es nativo en PP | Customización en Dataverse + plugins |
| Asignación automática por carga | Lógica compleja | Algoritmo custom en Power Automate |
| Soporte 1 año incluido | Costo oculto alto | Reservar 200–300 h en el precio |
| "Ajustes menores" sin definir | Scope creep | Definir en propuesta qué es ajuste menor |
| Plazo 90 días | Ajustado | Depende de colaboración institucional |
| Archivos DWG | SharePoint no previsualiza bien | Aclarar en propuesta técnica |
| WCAG accesibilidad | Power Apps Canvas limitado | Model Driven es mejor opción |

### Dependencias de la institución
- Definición de roles y responsables
- Nomenclatura de solicitudes/casos
- Sesiones con área funcional
- Catálogos base (oficinas, tipos de evento, canales)

---

## 10. Análisis: sin experiencia en Power Platform

### El problema no es solo aprender la plataforma

| Requisito del pliego | ¿Cumplible sin experiencia PP? |
|----------------------|-------------------------------|
| Mínimo 2 años de experiencia | **No** |
| Al menos 10 proyectos en Power Platform | **No** |
| 5 referencias de implementaciones similares | **No** |
| Relación técnico-comercial con Microsoft | Probablemente **No** |
| Evaluación Cumple / No cumple | Riesgo **alto** de descalificación |

### Grado de dificultad por capas

| Capa | Dificultad | Nota |
|------|------------|------|
| Curva de aprendizaje general | **Media (6/10)** | Aprendible en 2–4 meses |
| Este proyecto en particular | **Alta (8/10)** | Reglas de negocio complejas |
| Sin experiencia + 90 días | **Muy alta (9/10)** | Plazo y requisitos incompatibles |

### Dificultad por componente Power Platform

| Componente | Dificultad | Notas |
|------------|------------|-------|
| Power Apps (formularios, vistas) | Media | Visual, pero permisos complejos |
| Dataverse (tablas, relaciones) | Media | Similar a diseñar BD |
| Power Automate (flujos) | Media-Alta | Se complica con lógica condicional |
| SharePoint (documentos) | Media | Versionamiento nativo ayuda |
| Entra ID / RBAC | Alta | Ecosistema Microsoft |
| Reportes / dashboard | Media | Vistas nativas |
| Power BI (futuro) | Media | Otra herramienta |

### Funcionalidades más difíciles del pliego

| Funcionalidad | Dificultad | Por qué |
|---------------|------------|---------|
| Bitácora inmutable | **Muy alta** | No es nativo en Power Platform |
| Asignación automática por carga/región | Alta | Algoritmo custom con edge cases |
| Workflow configurable (estados editables) | Alta | Motor de reglas parametrizable |
| RBAC por oficina regional | Alta | Permisos granulares |
| SLA dinámico por tipo de evento | Media-Alta | Cálculos y alertas automáticas |
| Formularios y catálogos básicos | Baja-Media | Nativo de la plataforma |
| Notificaciones por correo | Baja-Media | Power Automate estándar |
| Exportación Excel | Baja | Funcionalidad nativa |

### Impacto de no tener experiencia

| Escenario | Horas extra | Tiempo extra | Costo extra |
|-----------|-------------|--------------|-------------|
| 1 dev aprendiendo solo | +500–800 h | +8–14 semanas | +RD$600K–1.2M |
| Equipo con 1 experto externo + nosotros | +200–400 h | +4–6 semanas | +RD$300K–600K |
| Subcontratar a partner Microsoft | +15–25% margen | Sin retraso si partner entrega | Variable |

**Estimación realista sin experiencia:**

| Concepto | Valor |
|----------|-------|
| Tiempo total | **20–28 semanas** (vs. 12 del pliego) |
| Probabilidad de incumplir plazo | **Alta** |
| Probabilidad de descalificación técnica | **Muy alta** |
| Costo real interno | **RD$2.5M–4M+** (aprendizaje + retrabajo + soporte) |

### Qué es transferible desde desarrollo web (Next.js/PHP)

| Habilidad actual | ¿Transferible a PP? |
|------------------|---------------------|
| Lógica de UI (React/Next.js) | Conceptualmente sí, sintaxis no |
| Lógica de negocio (PHP/APIs) | Sí, a Power Automate |
| Diseño de base de datos | Sí, a Dataverse |
| Concepto de workflows/estados | Sí |
| Deploy (cPanel/Railway) | No — ecosistema Microsoft distinto |

**~30–40%** de conocimiento actual aplica conceptualmente. El **60–70% restante** es ecosistema Microsoft nuevo.

---

## 11. Comparación con stack actual (Acropolis)

| Aspecto | ONESVIE (Power Platform) | Stack actual (Next.js custom) |
|---------|---------------------------|-------------------------------|
| Tiempo estimado | 12–18 semanas | 6–12 meses para equivalente |
| Costo | RD$1.5M – 3M | RD$4M – 10M+ |
| Mantenimiento | Licencias M365 (ya las tienen) | Hosting + dev ongoing |
| Flexibilidad | Limitada al ecosistema MS | Total |
| Curva de aprendizaje | Baja (low-code) | Alta |
| Encaje con equipo actual | **Bajo** | **Alto** |

> El pliego exige explícitamente Power Platform. Una propuesta con Next.js sería **descalificada**.

---

## 12. Opciones y recomendación

### Opción A: No participar — **Recomendada**
- Riesgo de descalificación: muy alto
- Riesgo de incumplir plazo: muy alto
- Riesgo financiero (soporte 1 año): alto

### Opción B: Participar como consorcio / subcontratados
Buscar partner con 10+ proyectos PP, 5 referencias CRM, relación Microsoft.
- Nosotros: análisis funcional, documentación, capacitación, soporte local
- Partner: implementación técnica

### Opción C: Aprender Power Platform para futuros proyectos

| Fase | Tiempo | Inversión |
|------|--------|-----------|
| Certificación PL-900 (fundamentos) | 2–4 semanas | ~$0–100 USD |
| Certificación PL-200 (desarrollador) | 2–3 meses | ~$165 USD examen |
| Proyecto piloto interno (CRM simple) | 1–2 meses | Tiempo propio |
| Primer proyecto real pagado | 6+ meses después | — |

No alcanza para esta licitación (oferta 10/07/2026), pero sí para futuras oportunidades.

### Opción D: Proponer alternativa custom (Next.js)
Solo viable si el pliego no exigiera Power Platform. Aquí sí lo exige → **descalificación segura**.

---

## 13. Veredicto final

| Pregunta | Respuesta |
|----------|-----------|
| ¿Qué tan complicado es Power Platform en general? | **Medio** — aprendible en 2–4 meses |
| ¿Qué tan complicado es este proyecto sin experiencia? | **Muy alto (8–9/10)** |
| ¿Cuánto tiempo extra agrega no tener experiencia? | **+8 a 14 semanas** |
| ¿Cuánto costo extra agrega? | **+40–80%** del presupuesto base |
| ¿Vale la pena participar ahora? | **No**, salvo consorcio con experto |
| ¿Pueden aprender para el futuro? | **Sí**, en 3–6 meses con proyecto piloto |
| ¿Precio mínimo viable para ofertar? | **RD$1,800,000 – 2,600,000** |
| ¿Precio por debajo del cual es inviable? | **RD$1,200,000** (~$20,000 USD) |

---

## 14. Próximos pasos sugeridos

1. **Decisión go/no-go** — evaluar si buscar partner o no participar
2. **Si consorcio** — identificar partners Power Platform en RD con referencias CRM
3. **Si aprendizaje** — iniciar ruta PL-900 → PL-200 con proyecto piloto
4. **Si participan** — armar matriz de cumplimiento módulo por módulo para Sobre A
5. **Si participan** — desglosar precios para Sobre B con soporte 1 año incluido

---

*Documento generado para uso interno. Basado en análisis del pliego ONESVIE-DAF-CM-2026-0011.*
