"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getToken } from "@/lib/auth-storage";
import type { CmsEditMessage } from "@/lib/edit-bridge";
import {
  previewCirculodeamigosUrl,
  previewCivisUrl,
  previewPrincipalUrl,
  previewTiendaUrl,
} from "@/lib/preview-urls";

type VisualCmsPageEditorProps = {
  title: string;
  path: string;
  query?: string;
  hint: React.ReactNode;
  site?: "acropolis" | "civis" | "editorial" | "circulodeamigos";
  previewOnly?: boolean;
  /** Dentro del panel del editor (con pestaÃ±as Guardar/Publicar visibles). */
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
        : site === "circulodeamigos"
          ? previewCirculodeamigosUrl()
          : previewPrincipalUrl();
  const previewOrigin = useMemo(() => {
    try {
      return new URL(siteUrl).origin;
    } catch {
      return siteUrl;
    }
  }, [siteUrl]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState(`Cargando ${title}â¦`);
  const [ready, setReady] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [loadGeneration, setLoadGeneration] = useState(0);
  const iframeSrc = `${siteUrl}${path}?${query}`;

  useEffect(() => {
    setIframeLoaded(false);
    setReady(false);
    setStatus(`Cargando ${title}â¦`);
  }, [iframeSrc, title]);

  const handleIframeLoad = useCallback(() => {
    setIframeLoaded(true);
    setLoadGeneration((n) => n + 1);
  }, []);

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
        setStatus("Listo â clic en una tarjeta para editar.");
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
    setReady(false);
    setStatus(`Conectando con ${title}â¦`);
    sendInit();
    const timers = [100, 250, 500, 1000, 2000, 4000].map((ms) =>
      window.setTimeout(() => sendInit(), ms),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [sendInit, iframeLoaded, loadGeneration, title]);

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
          â Cambiar secciÃ³n
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
            title="Ayuda de ediciÃ³n"
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
                ? "Vista previa â edita en las pestaÃ±as Â«ContenidoÂ» arriba"
                : "Vista previa â edita en las pestaÃ±as de formulario y usa Guardar arriba"}
            </span>
          )}
        </div>
      </div>
      ) : embedded && previewOnly ? (
        <p className="shrink-0 border-b border-slate-100 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
          Vista previa en vivo. Los formularios de ediciÃ³n estÃ¡n en las pestaÃ±as{" "}
          <strong>Contenido (editar aquÃ­)</strong> del editor.
        </p>
      ) : null}

      {showHint ? (
        <p className="shrink-0 border-b border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          {hint}
        </p>
      ) : null}

      <div className="relative min-h-0 flex-1">
        {!ready ? (
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-slate-100"
            aria-hidden
          >
            <div className="h-full w-1/3 animate-pulse bg-brand-teal/70" />
          </div>
        ) : null}
        <iframe
          ref={iframeRef}
          title={`${title} â ediciÃ³n visual`}
          src={iframeSrc}
          className="h-full w-full border-0"
          onLoad={handleIframeLoad}
        />
      </div>
    </div>
  );
}

export function VisualFilosofiaEditor() {
  return (
    <VisualCmsPageEditor
      title="FilosofÃ­a"
      path="/filosofia"
      hint={
        <>
          Puedes editar: <strong>encabezado</strong>, <strong>programa de estudios</strong>,{" "}
          <strong>curso introductorio</strong>, <strong>temario</strong>,{" "}
          <strong>cursos avanzados</strong>, <strong>Â¿Es para ti?</strong>,{" "}
          <strong>inscripciÃ³n</strong>, <strong>badge del diplomado</strong>,{" "}
          <strong>prÃ³ximas sesiones</strong>. Las actividades del carrusel del home se
          editan en la pÃ¡gina de inicio.
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
          Hub de <strong>contenido digital</strong>: acceso al blog, eventos, agenda,
          Revista Esfinge, biblioteca y librerÃ­a. Para editar actividades concretas usa
          las pestaÃ±as <strong>Agenda</strong>, <strong>Blog</strong>,{" "}
          <strong>Eventos</strong> o las pÃ¡ginas de actividades (Inicio, Cursos, Cultura,
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
          Vista de la pÃ¡gina <strong>/agenda</strong>. BotÃ³n{" "}
          <strong>â Editar encabezado</strong> en el hero (textos y carrusel de
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
      title="Blog"
      path="/articulos"
      hint={
        <>
          BotÃ³n <strong>â Editar encabezado</strong> en el hero.{" "}
          <strong>Entrada del blog</strong> â pÃ¡ginas propias abajo.{" "}
          <strong>Enlace externo</strong> â Â«Nuestra voz fuera de la sedeÂ» o pestaÃ±a{" "}
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
          <strong>descripciÃ³n breve</strong> y <strong>foto</strong>. La tarjeta
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
          BotÃ³n <strong>â Editar encabezado</strong> en el hero. Se muestran{" "}
          <strong>todos los eventos del sitio</strong> (cÃ³digo + CMS). Clic en una tarjeta
          para editar crÃ³nica y fotos.
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
          BotÃ³n <strong>â Editar encabezado</strong> en el hero. Destinos fijos (Tres Ojos,
          Pomierâ¦): asigna <strong>prÃ³xima fecha</strong>, cambia la <strong>foto</strong> o el{" "}
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
          BotÃ³n <strong>â Editar encabezado</strong> en el hero. ExpediciÃ³n fija (Egipto,
          Machu Picchuâ¦): actualiza <strong>prÃ³xima fecha</strong>, <strong>foto</strong> y{" "}
          <strong>enlace</strong>.
        </>
      }
    />
  );
}

/** @deprecated Usar VisualCirculoHomeEditor (sitio circulodeamigos). */
export function VisualCirculoAmigosEditor() {
  return <VisualCirculoHomeEditor />;
}

export function VisualCirculoHomeEditor() {
  return (
    <VisualCmsPageEditor
      site="circulodeamigos"
      title="Círculo de Amigos — Inicio"
      path="/"
      hint={
        <>
          Botón <strong>✎ Editar encabezado</strong> en el hero (textos y foto
          lateral). En <strong>¿Qué es?</strong>, <strong>pilares</strong>,{" "}
          <strong>beneficios</strong> y <strong>pasos</strong>: ✎ en la sección o
          en cada tarjeta (texto e imagen). También puedes editar{" "}
          <strong>lo que recibirás</strong>, <strong>lo que esperamos</strong> y
          el <strong>llamado final</strong> con el correo de contacto.
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
          Edita con los botones <strong>â</strong> en la pÃ¡gina o las pestaÃ±as arriba:{" "}
          <strong>Texto hero</strong>, <strong>Badge y fechas</strong>,{" "}
          <strong>InscripciÃ³n y precios</strong> (Â«Â¿Quieres unirte a esta aventura?Â»),{" "}
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
          BotÃ³n <strong>â</strong> en el hero, en cada <strong>taller</strong>, en{" "}
          <strong>Eventos</strong> (aÃ±adir evento, fecha y sede por tarjeta), en{" "}
          <strong>CÃ­rculo de Amigos</strong> y en la agenda de{" "}
          <strong>PrÃ³ximas actividades</strong>. Pulsa <strong>Guardar borrador</strong> al
          terminar.
        </>
      }
    />
  );
}

export function VisualSedesEditor() {
  return (
    <VisualCmsPageEditor
      title="DÃ³nde estamos"
      path="/donde-estamos/"
      hint={
        <>
          Edita nombres, direcciones y contacto de cada sede o centro cultural en{" "}
          <strong>DÃ³nde estamos</strong>. Usa <strong>AÃ±adir sede</strong> o{" "}
          <strong>AÃ±adir punto cultural</strong> para espacios nuevos. El bloque{" "}
          <strong>Â¿Necesitas mÃ¡s informaciÃ³n?</strong> y el <strong>pie de pÃ¡gina</strong>{" "}
          tienen lÃ¡piz propio. Los cambios se ven tambiÃ©n en Esfera y Voluntariado.
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
          BotÃ³n <strong>â Editar encabezado</strong> en el hero.{" "}
          <strong>Cambiar foto de fondo</strong> para la imagen del landing. Baja al{" "}
          <strong>carrusel de prÃ³ximas actividades</strong> â botÃ³n <strong>Editar</strong> o{" "}
          <strong>AÃ±adir al carrusel</strong>. MÃ¡s abajo,           <strong>Fotos de nuestras actividades</strong>:
          lÃ¡piz en cada foto. TambiÃ©n puedes editar <strong>QuÃ© es NA</strong>, los{" "}
          <strong>tres pilares</strong> (filosofÃ­a, cultura, voluntariado), la banda{" "}
          <strong>FilosofÃ­a para Vivir</strong> y el bloque{" "}
          <strong>CÃ­rculo de Amigos</strong> (â en la secciÃ³n). TambiÃ©n el bloque{" "}
          <strong>Esfera</strong> (â): mismo contenido que en la pestaÃ±a Esfera.
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
          <strong>Hero</strong>: â Editar encabezado. <strong>QuÃ© hacemos</strong>: â
          Editar secciÃ³n y cada tarjeta. <strong>PrÃ³ximas actividades</strong>: textos,
          aÃ±adir actividad y â por tarjeta. <strong>Esfera</strong>,{" "}
          <strong>Todos somos voluntarios</strong> (donaciÃ³n) y{" "}
          <strong>Quiero ser voluntario/a</strong>: â Editar secciÃ³n.{" "}
          <strong>Actividades recientes</strong>: textos, aÃ±adir actividad, â por
          tarjeta (mÃ¡s de 4 â carrusel). En <strong>Colabora junto a nosotros</strong>: â secciÃ³n y pestaÃ±as Donar /
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
          BotÃ³n <strong>â Editar encabezado</strong> en el hero. Edita{" "}
          <strong>prÃ³ximas convocatorias</strong>, el catÃ¡logo de cursos, la secciÃ³n{" "}
          <strong>CÃ­rculo de Amigos</strong> (â en el bloque) y, en{" "}
          <strong>Alquiler de salones</strong>, â en textos o en cada salÃ³n.
          Las sedes y centros culturales se editan en la pestaÃ±a{" "}
          <strong>DÃ³nde estamos</strong>.
        </>
      }
    />
  );
}

export function VisualCivisHomeEditor() {
  return (
    <VisualCmsPageEditor
      site="civis"
      title="Civis â Inicio"
      path="/"
      hint={
        <>
          En el recuadro de fotos del hero, pulsa{" "}
          <strong>Editar carrusel</strong> para aÃ±adir, quitar o cambiar las imÃ¡genes de fondo.
          Usa <strong>â Editar encabezado</strong> para los textos. En{" "}
          <strong>Nuestros principios</strong>, â para tÃ­tulo, tarjetas y enlace a quiÃ©nes somos.
          En <strong>Actividades recientes</strong>, â en cada tarjeta o{" "}
          <strong>AÃ±adir al carrusel</strong>. TambiÃ©n puedes editar la oferta y los entrenadores.
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
      title="Civis â Talleres y oferta"
      path="/talleres"
      hint={
        <>
          Edita la <strong>oferta formativa</strong> completa (texto, foto y temas de cada
          lÃ­nea) y las <strong>prÃ³ximas actividades</strong> con el botÃ³n{" "}
          <strong>â</strong> en cada tarjeta (fecha de inicio, hora y sede).
        </>
      }
    />
  );
}

export function VisualCivisSalonesEditor() {
  return (
    <VisualCmsPageEditor
      site="civis"
      title="Civis â Salones"
      path="/salones/"
      query="cmsEdit=1"
      hint={
        <>
          Pulsa <strong>Editar textos</strong> en el encabezado o en el catÃ¡logo. Clic en{" "}
          <strong>â</strong> en cada tarjeta de salÃ³n (foto, nombre, sede, resumen,
          capacidades). Los datos del salÃ³n se comparten con AcrÃ³polis; los textos de
          pÃ¡gina son solo de Civis. <strong>Guardar</strong> al terminar.
        </>
      }
    />
  );
}

export function VisualCivisQuienesSomosEditor() {
  return (
    <VisualCmsPageEditor
      site="civis"
      title="Civis â QuiÃ©nes somos / Equipo"
      path="/quienes-somos"
      query="cmsEdit=1"
      hint={
        <>
          PestaÃ±a <strong>Civis</strong>: â en el texto, propÃ³sito, imagen lateral y metodologÃ­a.
          PestaÃ±a <strong>QuÃ© es Nueva AcrÃ³polis</strong>: â en imagen, textos, principios y enlace a acropolis.org.do.
          En <strong>Nuestros clientes</strong>: â en la secciÃ³n o en cada tarjeta.
          En <strong>Equipo</strong>: â en entrenadores; <strong>+ AÃ±adir entrenador</strong> desde la secciÃ³n.
          En <strong>Oferta formativa</strong> (inicio o Talleres): â en cada lÃ­nea o <strong>+ AÃ±adir taller</strong>.
        </>
      }
    />
  );
}

export function VisualQuienesSomosEditor() {
  return (
    <VisualCmsPageEditor
      title="QuiÃ©nes somos"
      path="/quienes-somos"
      hint={
        <>
          BotÃ³n <strong>â Editar encabezado</strong> en el hero y{" "}
          <strong>Carrusel de fotos</strong>. Edita los textos de{" "}
          <strong>QuÃ© es NA</strong>, la secciÃ³n de <strong>presidencia</strong>{" "}
          (cada persona con foto) y la <strong>direcciÃ³n nacional</strong>.
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
          BotÃ³n <strong>â Editar encabezado</strong> en el hero. Edita la{" "}
          <strong>introducciÃ³n</strong>, las <strong>cifras</strong>, cada{" "}
          <strong>Ã¡rea de colaboraciÃ³n</strong>, el bloque de{" "}
          <strong>RepÃºblica Dominicana</strong> y el <strong>llamado a la acciÃ³n</strong>.
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
          BotÃ³n <strong>â Editar encabezado</strong> en el hero: logo Esfera
          (color y blanco), textos y <strong>carrusel de fotos</strong>. El bloque{" "}
          <strong>Esfera en el inicio</strong> se edita con â en la pÃ¡gina{" "}
          <strong>Inicio</strong> (mismos datos aquÃ­ en el CMS). En{" "}
          <strong>QuiÃ©nes somos / QuÃ© hacemos</strong>:{" "}
          <strong>Editar secciÃ³n</strong> para tÃ­tulos; â en cada pestaÃ±a para
          texto y foto; â en cada tarjeta para tÃ­tulo y descripciÃ³n. En{" "}
          <strong>EstÃ¡ndares Esfera</strong>: <strong>Editar textos</strong> para
          tÃ­tulos y pÃ¡rrafos; lÃ¡piz en el cuadro lateral para portada del manual y
          pies de foto (el logo tambiÃ©n se edita desde el encabezado). En la secciÃ³n de{" "}
          <strong>estÃ¡ndares</strong>, las tres tarjetas de principios: â en cada
          una para texto y foto; <strong>AÃ±adir tarjeta</strong> para crear nuevas.
          En <strong>Modalidades disponibles</strong>: <strong>Editar secciÃ³n</strong>{" "}
          o â en cada taller para texto, foto y temas; <strong>AÃ±adir taller</strong>{" "}
          para crear nuevos. El botÃ³n de <strong>descarga del brochure</strong> tiene
          â para cambiar el PDF; tambiÃ©n puedes subir una nueva versiÃ³n en{" "}
          <strong>Archivos</strong> del panel de sitios. En{" "}
          <strong>Actividades y prÃ³ximos entrenamientos</strong>: â en cada
          tarjeta para cambiar tÃ­tulo, fecha, texto y foto;{" "}
          <strong>AÃ±adir entrenamiento</strong> para crear nuevos. En cada
          entrenamiento puedes indicar <strong>fecha de inicio</strong>,{" "}
          <strong>hora</strong> y <strong>ubicaciÃ³n</strong>. En{" "}
          <strong>Colabora junto a nosotros</strong>: <strong>Editar secciÃ³n</strong>{" "}
          o â en cada pestaÃ±a. En <strong>Hemos trabajado con</strong> y{" "}
          <strong>LÃ­neas complementarias de formaciÃ³n</strong>: â en cada tarjeta.
          En <strong>Perfil de los participantes</strong>: <strong>Editar secciÃ³n</strong>{" "}
          para textos; â en cada tarjeta para foto, sector y lista de perfiles.
          En <strong>Por quÃ© invertir en esta formaciÃ³n</strong>:{" "}
          <strong>Editar secciÃ³n</strong> para textos y cita; â en cada tarjeta.
          En <strong>Impacto</strong>: <strong>Editar impacto</strong> para textos;
          â en cada cifra para cambiar nÃºmeros; <strong>AÃ±adir foto</strong> y â en
          el carrusel de <strong>Momentos de los talleres</strong>.
          En <strong>Contacto</strong>: lÃ¡piz para editar sede.
        </>
      }
    />
  );
}

export function VisualEditorialHomeEditor() {
  return (
    <VisualCmsPageEditor
      site="editorial"
      title="LibrerÃ­a â Inicio"
      path="/"
      hint={
        <>
          â en el <strong>texto de bienvenida</strong>, en cada{" "}
          <strong>tarjeta del catÃ¡logo</strong> y en las{" "}
          <strong>fotos del carrusel</strong>. Los libros impresos en venta vienen
          del catÃ¡logo en lÃ­nea; aquÃ­ editas textos, imÃ¡genes y enlaces de la tienda.
        </>
      }
    />
  );
}

export function VisualEditorialLibrosEditor() {
  return (
    <VisualCmsPageEditor
      site="editorial"
      title="LibrerÃ­a â Libros impresos"
      path="/libros/"
      hint={
        <>
          â en los <strong>filtros y categorÃ­as</strong> de la secciÃ³n. El listado de
          libros y precios viene del catÃ¡logo; aquÃ­ editas etiquetas y textos de la
          pÃ¡gina.
        </>
      }
    />
  );
}

export function VisualEditorialDigitalesEditor() {
  return (
    <VisualCmsPageEditor
      site="editorial"
      title="LibrerÃ­a â Libros digitales"
      path="/libros/digitales/"
      hint={
        <>
          â en cada <strong>grupo</strong> y en cada <strong>libro digital</strong>{" "}
          (tÃ­tulo, autor, enlace de descarga, portada).
        </>
      }
    />
  );
}

export function VisualEditorialRevistasEditor() {
  return (
    <VisualCmsPageEditor
      site="editorial"
      title="LibrerÃ­a â Revistas"
      path="/revistas/"
      hint={
        <>
          â en cada <strong>tarjeta de revista</strong>: tÃ­tulo, descripciÃ³n, imagen,
          enlace y textos del botÃ³n.
        </>
      }
    />
  );
}

export function VisualEditorialRegalosEditor() {
  return (
    <VisualCmsPageEditor
      site="editorial"
      title="LibrerÃ­a â Regalos"
      path="/regalos/"
      hint={
        <>
          â en cada <strong>regalo</strong>: tÃ­tulo, descripciÃ³n, cita, fotos y
          precio. TambiÃ©n puedes editar las <strong>categorÃ­as</strong> de la secciÃ³n.
        </>
      }
    />
  );
}

export function VisualEditorialDondeEditor() {
  return (
    <VisualCmsPageEditor
      site="editorial"
      title="LibrerÃ­a â DÃ³nde estamos"
      path="/donde-estamos/"
      hint={
        <>
          â en la banda de <strong>visÃ­tanos</strong>, la foto de la librerÃ­a y cada{" "}
          <strong>sede</strong> (direcciÃ³n, horario, nota).
        </>
      }
    />
  );
}

export function VisualEditorialQuienesSomosEditor() {
  return (
    <VisualCmsPageEditor
      site="editorial"
      title="LibrerÃ­a â QuiÃ©nes somos"
      path="/conoce-nueva-acropolis/"
      hint={
        <>
          â en el bloque de <strong>Editorial Logos</strong> y en{" "}
          <strong>QuÃ© es Nueva AcrÃ³polis</strong> (textos, imagen y botÃ³n).
        </>
      }
    />
  );
}

