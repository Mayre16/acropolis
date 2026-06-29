"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getToken } from "@/lib/auth-storage";
import type { CmsEditMessage } from "@/lib/edit-bridge";
import {
  previewCivisUrl,
  previewPrincipalUrl,
  previewTiendaUrl,
} from "@/lib/preview-urls";

type VisualCmsPageEditorProps = {
  title: string;
  path: string;
  query?: string;
  hint: React.ReactNode;
  site?: "acropolis" | "civis" | "editorial";
  previewOnly?: boolean;
  /** Dentro del panel del editor (con pestañas Guardar/Publicar visibles). */
  embedded?: boolean;
};

export function VisualCmsPageEditor({
  title,
  path,
  query = "cmsEdit=1",
  hint,
  site = "acropolis",
  previewOnly = false,
  embedded = false,
}: VisualCmsPageEditorProps) {
  const siteUrl =
    site === "civis"
      ? previewCivisUrl()
      : site === "editorial"
        ? previewTiendaUrl()
        : previewPrincipalUrl();
  const previewOrigin = useMemo(() => {
    try {
      return new URL(siteUrl).origin;
    } catch {
      return siteUrl;
    }
  }, [siteUrl]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState(`Cargando ${title}…`);
  const [ready, setReady] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeSrc = `${siteUrl}${path}?${query}`;

  useEffect(() => {
    setIframeLoaded(false);
    setReady(false);
  }, [iframeSrc]);

  const sendInit = useCallback(() => {
    const token = getToken();
    const win = iframeRef.current?.contentWindow;
    if (!token || !win || win === window || !iframeLoaded) return;
    win.postMessage(
      { type: "cms-edit-init", token, site } satisfies CmsEditMessage,
      previewOrigin,
    );
  }, [site, previewOrigin, iframeLoaded]);

  useEffect(() => {
    function onMessage(ev: MessageEvent<CmsEditMessage>) {
      if (ev.origin !== previewOrigin) return;
      const msg = ev.data;
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "cms-ready") {
        setReady(true);
        setStatus("Listo — clic en una tarjeta para editar.");
      }
      if (msg.type === "cms-request-init") sendInit();
      if (msg.type === "cms-status") setStatus(msg.text);
      if (msg.type === "cms-dirty") setDirty(msg.dirty);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sendInit, previewOrigin]);

  useEffect(() => {
    if (!iframeLoaded) return;
    sendInit();
    const timers = [250, 750, 1500, 3000].map((ms) =>
      window.setTimeout(() => sendInit(), ms),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [sendInit, iframeLoaded, iframeSrc]);

  function postToIframe(message: CmsEditMessage) {
    const win = iframeRef.current?.contentWindow;
    if (!win || win === window || !iframeLoaded) return;
    win.postMessage(message, previewOrigin);
  }

  return (
    <div
      className={
        embedded
          ? "flex h-full min-h-[420px] flex-col overflow-hidden bg-white"
          : "flex h-screen min-h-0 flex-col overflow-hidden bg-white"
      }
    >
      {!embedded ? (
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200/80 bg-white/95 px-3 py-1.5 backdrop-blur-sm">
        <Link
          href="/dashboard/"
          className="text-xs font-semibold text-brand-teal hover:underline"
        >
          ← Cambiar sección
        </Link>
        <div className="flex items-center gap-2">
          {dirty ? (
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-amber-500"
              title="Cambios sin guardar"
            />
          ) : null}
          <span className="sr-only">{status}</span>
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            className="rounded-md px-2 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50"
            title="Ayuda de edición"
          >
            ?
          </button>
          {!previewOnly ? (
            <>
              <button
                type="button"
                disabled={!ready}
                onClick={() => postToIframe({ type: "cms-save" })}
                className="rounded-md bg-brand-teal px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-800 disabled:opacity-50"
              >
                Guardar
              </button>
              <button
                type="button"
                disabled={!ready}
                onClick={() => postToIframe({ type: "cms-publish" })}
                className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-50"
              >
                Publicar
              </button>
            </>
          ) : (
            <span className="text-xs font-medium text-slate-500">
              {embedded
                ? "Vista previa — edita en las pestañas «Contenido» arriba"
                : "Vista previa — edita en las pestañas de formulario y usa Guardar arriba"}
            </span>
          )}
        </div>
      </div>
      ) : embedded && previewOnly ? (
        <p className="shrink-0 border-b border-slate-100 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
          Vista previa en vivo. Los formularios de edición están en las pestañas{" "}
          <strong>Contenido (editar aquí)</strong> del editor.
        </p>
      ) : null}

      {showHint ? (
        <p className="shrink-0 border-b border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          {hint}
        </p>
      ) : null}

      <iframe
        ref={iframeRef}
        title={`${title} — edición visual`}
        src={iframeSrc}
        className="min-h-0 flex-1 w-full border-0"
        onLoad={() => setIframeLoaded(true)}
      />
    </div>
  );
}

export function VisualFilosofiaEditor() {
  return (
    <VisualCmsPageEditor
      title="Filosofía"
      path="/filosofia"
      hint={
        <>
          Puedes editar: <strong>encabezado</strong>, <strong>programa de estudios</strong>,{" "}
          <strong>curso introductorio</strong>, <strong>temario</strong>,{" "}
          <strong>cursos avanzados</strong>, <strong>¿Es para ti?</strong>,{" "}
          <strong>inscripción</strong>, <strong>badge del diplomado</strong>,{" "}
          <strong>próximas sesiones</strong>. Las actividades del carrusel del home se
          editan en la página de inicio.
          Pulsa <strong>Guardar</strong> al terminar.
        </>
      }
    />
  );
}

export function VisualContenidoEditor() {
  return (
    <VisualCmsPageEditor
      title="Contenido digital"
      path="/contenido/"
      hint={
        <>
          Hub de <strong>contenido digital</strong>: acceso a artículos, eventos, agenda,
          Revista Esfinge, biblioteca y librería. Para editar actividades concretas usa
          las pestañas <strong>Agenda</strong>, <strong>Artículos</strong>,{" "}
          <strong>Eventos</strong> o las páginas de actividades (Inicio, Cursos, Cultura,
          Voluntariado).
        </>
      }
    />
  );
}

export function VisualAgendaEditor() {
  return (
    <VisualCmsPageEditor
      title="Agenda"
      path="/agenda/"
      hint={
        <>
          Vista de la página <strong>/agenda</strong>. Botón{" "}
          <strong>✎ Editar encabezado</strong> en el hero (textos y carrusel de
          fotos). Las actividades del listado se editan en{" "}
          <strong>Inicio</strong>, <strong>Cursos</strong>, <strong>Cultura</strong>,{" "}
          <strong>Voluntariado</strong>, <strong>Eventos</strong> y{" "}
          <strong>Esfera</strong>.
        </>
      }
    />
  );
}

export function VisualArticulosEditor() {
  return (
    <VisualCmsPageEditor
      title="Artículos"
      path="/articulos"
      hint={
        <>
          Botón <strong>✎ Editar encabezado</strong> en el hero.{" "}
          <strong>Artículo en el sitio</strong> — páginas propias abajo.{" "}
          <strong>Enlace externo</strong> — «Nuestra voz fuera de la sede» o pestaña{" "}
          <strong>Voz fuera de la sede</strong>.
        </>
      }
    />
  );
}

export function VisualMediosEditor() {
  return (
    <VisualCmsPageEditor
      title="Voz fuera de la sede"
      path="/articulos"
      query="cmsEdit=medios"
      hint={
        <>
          Apariciones en medios externos: <strong>enlace</strong>,{" "}
          <strong>descripción breve</strong> y <strong>foto</strong>. La tarjeta
          abre el medio fuera del sitio. Pulsa <strong>Guardar borrador</strong> al
          terminar.
        </>
      }
    />
  );
}

export function VisualEventosEditor() {
  return (
    <VisualCmsPageEditor
      title="Eventos"
      path="/eventos"
      hint={
        <>
          Botón <strong>✎ Editar encabezado</strong> en el hero. Se muestran{" "}
          <strong>todos los eventos del sitio</strong> (código + CMS). Clic en una tarjeta
          para editar crónica y fotos.
        </>
      }
    />
  );
}

export function VisualViajesLocalesEditor() {
  return (
    <VisualCmsPageEditor
      title="Viajes locales"
      path="/cultura/viajes/locales"
      hint={
        <>
          Botón <strong>✎ Editar encabezado</strong> en el hero. Destinos fijos (Tres Ojos,
          Pomier…): asigna <strong>próxima fecha</strong>, cambia la <strong>foto</strong> o el{" "}
          <strong>enlace</strong>.
        </>
      }
    />
  );
}

export function VisualViajesInternacionalesEditor() {
  return (
    <VisualCmsPageEditor
      title="Viajes internacionales"
      path="/cultura/viajes/internacionales"
      hint={
        <>
          Botón <strong>✎ Editar encabezado</strong> en el hero. Expedición fija (Egipto,
          Machu Picchu…): actualiza <strong>próxima fecha</strong>, <strong>foto</strong> y{" "}
          <strong>enlace</strong>.
        </>
      }
    />
  );
}

export function VisualDiplomadoEditor() {
  return (
    <VisualCmsPageEditor
      title="Diplomado"
      path="/diplomado"
      hint={
        <>
          Edita con los botones <strong>✎</strong> en la página o las pestañas arriba:{" "}
          <strong>Texto hero</strong>, <strong>Badge y fechas</strong>,{" "}
          <strong>Inscripción y precios</strong> («¿Quieres unirte a esta aventura?»),{" "}
          <strong>Otras sesiones</strong> (carrusel). Pulsa{" "}
          <strong>Guardar borrador</strong> y luego <strong>Publicar</strong>.
        </>
      }
    />
  );
}

export function VisualCulturaEditor() {
  return (
    <VisualCmsPageEditor
      title="Cultura"
      path="/cultura"
      hint={
        <>
          Botón <strong>✎</strong> en el hero, en cada <strong>taller</strong>, en{" "}
          <strong>Eventos</strong> (añadir evento, fecha y sede por tarjeta), en{" "}
          <strong>Círculo de Amigos</strong> y en la agenda de{" "}
          <strong>Próximas actividades</strong>. Pulsa <strong>Guardar borrador</strong> al
          terminar.
        </>
      }
    />
  );
}

export function VisualSedesEditor() {
  return (
    <VisualCmsPageEditor
      title="Dónde estamos"
      path="/donde-estamos/"
      hint={
        <>
          Edita nombres, direcciones y contacto de cada sede o centro cultural en{" "}
          <strong>Dónde estamos</strong>. Usa <strong>Añadir sede</strong> o{" "}
          <strong>Añadir punto cultural</strong> para espacios nuevos. El bloque{" "}
          <strong>¿Necesitas más información?</strong> y el <strong>pie de página</strong>{" "}
          tienen lápiz propio. Los cambios se ven también en Esfera y Voluntariado.
        </>
      }
    />
  );
}

export function VisualHomeEditor() {
  return (
    <VisualCmsPageEditor
      title="Inicio"
      path="/"
      hint={
        <>
          Botón <strong>✎ Editar encabezado</strong> en el hero.{" "}
          <strong>Cambiar foto de fondo</strong> para la imagen del landing. Baja al{" "}
          <strong>carrusel de próximas actividades</strong> — botón <strong>Editar</strong> o{" "}
          <strong>Añadir al carrusel</strong>. Más abajo,           <strong>Fotos de nuestras actividades</strong>:
          lápiz en cada foto. También puedes editar <strong>Qué es NA</strong>, los{" "}
          <strong>tres pilares</strong> (filosofía, cultura, voluntariado), la banda{" "}
          <strong>Filosofía para Vivir</strong> y el bloque{" "}
          <strong>Círculo de Amigos</strong> (✎ en la sección). También el bloque{" "}
          <strong>Esfera</strong> (✎): mismo contenido que en la pestaña Esfera.
        </>
      }
    />
  );
}

export function VisualVoluntariadoEditor() {
  return (
    <VisualCmsPageEditor
      title="Voluntariado"
      path="/voluntariado"
      hint={
        <>
          <strong>Hero</strong>: ✎ Editar encabezado. <strong>Qué hacemos</strong>: ✎
          Editar sección y cada tarjeta. <strong>Próximas actividades</strong>: textos,
          añadir actividad y ✎ por tarjeta. <strong>Esfera</strong>,{" "}
          <strong>Todos somos voluntarios</strong> (donación) y{" "}
          <strong>Quiero ser voluntario/a</strong>: ✎ Editar sección.{" "}
          <strong>Actividades recientes</strong>: textos, añadir actividad, ✎ por
          tarjeta (más de 4 → carrusel). En <strong>Colabora junto a nosotros</strong>: ✎ sección y pestañas Donar /
          Voluntario / Alianzas.
        </>
      }
    />
  );
}

export function VisualCursosEditor() {
  return (
    <VisualCmsPageEditor
      title="Cursos"
      path="/cursos"
      hint={
        <>
          Botón <strong>✎ Editar encabezado</strong> en el hero. Edita{" "}
          <strong>próximas convocatorias</strong>, el catálogo de cursos, la sección{" "}
          <strong>Círculo de Amigos</strong> (✎ en el bloque) y, en{" "}
          <strong>Alquiler de salones</strong>, ✎ en textos o en cada salón.
          Las sedes y centros culturales se editan en la pestaña{" "}
          <strong>Dónde estamos</strong>.
        </>
      }
    />
  );
}

export function VisualCivisHomeEditor() {
  return (
    <VisualCmsPageEditor
      site="civis"
      title="Civis — Inicio"
      path="/"
      hint={
        <>
          En el recuadro de fotos del hero, pulsa{" "}
          <strong>Editar carrusel</strong> para añadir, quitar o cambiar las imágenes de fondo.
          Usa <strong>✎ Editar encabezado</strong> para los textos. En{" "}
          <strong>Nuestros principios</strong>, ✎ para título, tarjetas y enlace a quiénes somos.
          En <strong>Actividades recientes</strong>, ✎ en cada tarjeta o{" "}
          <strong>Añadir al carrusel</strong>. También puedes editar la oferta y los entrenadores.
          Pulsa <strong>Guardar</strong> al terminar.
        </>
      }
    />
  );
}

export function VisualCivisTalleresEditor() {
  return (
    <VisualCmsPageEditor
      site="civis"
      title="Civis — Talleres y oferta"
      path="/talleres"
      hint={
        <>
          Edita la <strong>oferta formativa</strong> completa (texto, foto y temas de cada
          línea) y las <strong>próximas actividades</strong> con el botón{" "}
          <strong>✎</strong> en cada tarjeta (fecha de inicio, hora y sede).
        </>
      }
    />
  );
}

export function VisualCivisSalonesEditor() {
  return (
    <VisualCmsPageEditor
      site="civis"
      title="Civis — Salones"
      path="/salones/"
      query="cmsEdit=1"
      hint={
        <>
          Pulsa <strong>Editar textos</strong> en el encabezado o en el catálogo. Clic en{" "}
          <strong>✎</strong> en cada tarjeta de salón (foto, nombre, sede, resumen,
          capacidades). Los datos del salón se comparten con Acrópolis; los textos de
          página son solo de Civis. <strong>Guardar</strong> al terminar.
        </>
      }
    />
  );
}

export function VisualCivisQuienesSomosEditor() {
  return (
    <VisualCmsPageEditor
      site="civis"
      title="Civis — Quiénes somos / Equipo"
      path="/quienes-somos"
      query="cmsEdit=1"
      hint={
        <>
          Pestaña <strong>Civis</strong>: ✎ en el texto, propósito, imagen lateral y metodología.
          Pestaña <strong>Qué es Nueva Acrópolis</strong>: ✎ en imagen, textos, principios y enlace a acropolis.org.do.
          En <strong>Nuestros clientes</strong>: ✎ en la sección o en cada tarjeta.
          En <strong>Equipo</strong>: ✎ en entrenadores; <strong>+ Añadir entrenador</strong> desde la sección.
          En <strong>Oferta formativa</strong> (inicio o Talleres): ✎ en cada línea o <strong>+ Añadir taller</strong>.
        </>
      }
    />
  );
}

export function VisualQuienesSomosEditor() {
  return (
    <VisualCmsPageEditor
      title="Quiénes somos"
      path="/quienes-somos"
      hint={
        <>
          Botón <strong>✎ Editar encabezado</strong> en el hero y{" "}
          <strong>Carrusel de fotos</strong>. Edita los textos de{" "}
          <strong>Qué es NA</strong>, la sección de <strong>presidencia</strong>{" "}
          (cada persona con foto) y la <strong>dirección nacional</strong>.
        </>
      }
    />
  );
}

export function VisualRelacionesEditor() {
  return (
    <VisualCmsPageEditor
      title="Relaciones institucionales"
      path="/relaciones-institucionales"
      hint={
        <>
          Botón <strong>✎ Editar encabezado</strong> en el hero. Edita la{" "}
          <strong>introducción</strong>, las <strong>cifras</strong>, cada{" "}
          <strong>área de colaboración</strong>, el bloque de{" "}
          <strong>República Dominicana</strong> y el <strong>llamado a la acción</strong>.
        </>
      }
    />
  );
}

export function VisualEsferaEditor() {
  return (
    <VisualCmsPageEditor
      title="Esfera"
      path="/esfera"
      hint={
        <>
          Botón <strong>✎ Editar encabezado</strong> en el hero: logo Esfera
          (color y blanco), textos y <strong>carrusel de fotos</strong>. El bloque{" "}
          <strong>Esfera en el inicio</strong> se edita con ✎ en la página{" "}
          <strong>Inicio</strong> (mismos datos aquí en el CMS). En{" "}
          <strong>Quiénes somos / Qué hacemos</strong>:{" "}
          <strong>Editar sección</strong> para títulos; ✎ en cada pestaña para
          texto y foto; ✎ en cada tarjeta para título y descripción. En{" "}
          <strong>Estándares Esfera</strong>: <strong>Editar textos</strong> para
          títulos y párrafos; lápiz en el cuadro lateral para portada del manual y
          pies de foto (el logo también se edita desde el encabezado). En la sección de{" "}
          <strong>estándares</strong>, las tres tarjetas de principios: ✎ en cada
          una para texto y foto; <strong>Añadir tarjeta</strong> para crear nuevas.
          En <strong>Modalidades disponibles</strong>: <strong>Editar sección</strong>{" "}
          o ✎ en cada taller para texto, foto y temas; <strong>Añadir taller</strong>{" "}
          para crear nuevos. En{" "}
          <strong>Actividades y próximos entrenamientos</strong>: ✎ en cada
          tarjeta para cambiar título, fecha, texto y foto;{" "}
          <strong>Añadir entrenamiento</strong> para crear nuevos. En cada
          entrenamiento puedes indicar <strong>fecha de inicio</strong>,{" "}
          <strong>hora</strong> y <strong>ubicación</strong>. En{" "}
          <strong>Colabora junto a nosotros</strong>: <strong>Editar sección</strong>{" "}
          o ✎ en cada pestaña. En <strong>Hemos trabajado con</strong> y{" "}
          <strong>Líneas complementarias de formación</strong>: ✎ en cada tarjeta.
          En <strong>Perfil de los participantes</strong>: <strong>Editar sección</strong>{" "}
          para textos; ✎ en cada tarjeta para foto, sector y lista de perfiles.
          En <strong>Por qué invertir en esta formación</strong>:{" "}
          <strong>Editar sección</strong> para textos y cita; ✎ en cada tarjeta.
          En <strong>Impacto</strong>: <strong>Editar impacto</strong> para textos;
          ✎ en cada cifra para cambiar números; <strong>Añadir foto</strong> y ✎ en
          el carrusel de <strong>Momentos de los talleres</strong>.
          En <strong>Contacto</strong>: lápiz para editar sede.
        </>
      }
    />
  );
}

export function VisualEditorialHomeEditor() {
  return (
    <VisualCmsPageEditor
      site="editorial"
      title="Librería — Inicio"
      path="/"
      hint={
        <>
          ✎ en el <strong>texto de bienvenida</strong>, en cada{" "}
          <strong>tarjeta del catálogo</strong> y en las{" "}
          <strong>fotos del carrusel</strong>. Los libros impresos en venta vienen
          del catálogo en línea; aquí editas textos, imágenes y enlaces de la tienda.
        </>
      }
    />
  );
}

export function VisualEditorialLibrosEditor() {
  return (
    <VisualCmsPageEditor
      site="editorial"
      title="Librería — Libros impresos"
      path="/libros/"
      hint={
        <>
          ✎ en los <strong>filtros y categorías</strong> de la sección. El listado de
          libros y precios viene del catálogo; aquí editas etiquetas y textos de la
          página.
        </>
      }
    />
  );
}

export function VisualEditorialDigitalesEditor() {
  return (
    <VisualCmsPageEditor
      site="editorial"
      title="Librería — Libros digitales"
      path="/libros/digitales/"
      hint={
        <>
          ✎ en cada <strong>grupo</strong> y en cada <strong>libro digital</strong>{" "}
          (título, autor, enlace de descarga, portada).
        </>
      }
    />
  );
}

export function VisualEditorialRevistasEditor() {
  return (
    <VisualCmsPageEditor
      site="editorial"
      title="Librería — Revistas"
      path="/revistas/"
      hint={
        <>
          ✎ en cada <strong>tarjeta de revista</strong>: título, descripción, imagen,
          enlace y textos del botón.
        </>
      }
    />
  );
}

export function VisualEditorialRegalosEditor() {
  return (
    <VisualCmsPageEditor
      site="editorial"
      title="Librería — Regalos"
      path="/regalos/"
      hint={
        <>
          ✎ en cada <strong>regalo</strong>: título, descripción, cita, fotos y
          precio. También puedes editar las <strong>categorías</strong> de la sección.
        </>
      }
    />
  );
}

export function VisualEditorialDondeEditor() {
  return (
    <VisualCmsPageEditor
      site="editorial"
      title="Librería — Dónde estamos"
      path="/donde-estamos/"
      hint={
        <>
          ✎ en la banda de <strong>visítanos</strong>, la foto de la librería y cada{" "}
          <strong>sede</strong> (dirección, horario, nota).
        </>
      }
    />
  );
}

export function VisualEditorialQuienesSomosEditor() {
  return (
    <VisualCmsPageEditor
      site="editorial"
      title="Librería — Quiénes somos"
      path="/conoce-nueva-acropolis/"
      hint={
        <>
          ✎ en el bloque de <strong>Editorial Logos</strong> y en{" "}
          <strong>Qué es Nueva Acrópolis</strong> (textos, imagen y botón).
        </>
      }
    />
  );
}

