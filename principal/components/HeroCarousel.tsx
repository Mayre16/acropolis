"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { HeroImage } from "@/lib/hero-images";

type Props = {
  images: HeroImage[];
  /** ms entre transiciones */
  intervalMs?: number;
  /** prioriza la primera imagen (LCP) */
  priorityFirst?: boolean;
  /** Punto de anclaje con object-cover (p. ej. mostrar más la parte superior). */
  objectPosition?: string;
  /** En panel lateral (no fondo absoluto de pantalla completa). */
  contained?: boolean;
};

/**
 * Carrusel de fondo para los headers: imágenes (y opcionalmente vídeo) en
 * crossfade detrás del contenido. El degradado de marca se aplica encima.
 */
export function HeroCarousel({
  images,
  intervalMs = 5500,
  priorityFirst = false,
  objectPosition = "50% 32%",
  contained = false,
}: Props) {
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [firstReady, setFirstReady] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const visibleImages = images.filter((img) => img.src?.trim());
  const n = visibleImages.length;
  const imagesSignature = visibleImages.map((img) => img.src).join("|");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduceMotion(
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
    );
  }, []);

  // Al sustituir el carrusel del CMS, reinicia en la primera foto nueva.
  useEffect(() => {
    setIndex(0);
    setFirstReady(false);
  }, [imagesSignature]);

  useEffect(() => {
    if (n <= 1 || reduceMotion) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % n), intervalMs);
    return () => clearInterval(t);
  }, [n, intervalMs, reduceMotion]);

  useEffect(() => {
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      if (i === index && !reduceMotion) {
        video.currentTime = 0;
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [index, reduceMotion]);

  if (n === 0) return null;

  return (
    <div
      className={
        contained
          ? "relative h-full w-full overflow-hidden"
          : "pointer-events-none absolute inset-0 overflow-hidden"
      }
      aria-hidden
    >
      {visibleImages.map((img, i) => {
        const isVideo = img.media === "video" && !reduceMotion;
        const key = `${img.media ?? "image"}-${img.src}`;
        const slideVisible = firstReady && i === index;

        return (
          <div
            key={key}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: slideVisible ? 1 : 0 }}
          >
            {isVideo ? (
              <video
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                src={img.src}
                poster={img.poster}
                muted
                playsInline
                loop
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition }}
                onLoadedData={() => {
                  if (i === 0) setFirstReady(true);
                }}
              />
            ) : (
              <Image
                src={img.poster && img.media === "video" ? img.poster : img.src}
                alt=""
                fill
                sizes={contained ? "(max-width: 1024px) 80vw, 22rem" : "100vw"}
                className="object-cover"
                style={{ objectPosition }}
                priority={priorityFirst && i === 0}
                unoptimized
                onLoad={() => {
                  if (i === 0) setFirstReady(true);
                }}
                onError={() => {
                  if (i === 0) setFirstReady(true);
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
