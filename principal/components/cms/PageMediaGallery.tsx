"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { PageMediaVideo } from "@/components/cms/PageMediaVideo";
import { accentCardShell } from "@/lib/brand-accents";
import type {
  CmsPageMediaCard,
  CmsPageMediaGalleryBlock,
} from "@/lib/cms/types";

function GallerySlide({
  item,
  layout,
  index,
  className = "",
  captionOnHover = false,
  hideCaption = false,
}: {
  item: CmsPageMediaCard;
  layout: "card" | "overlay";
  index: number;
  className?: string;
  captionOnHover?: boolean;
  /** Oculta pie en la imagen (p. ej. carrusel con texto al lado). */
  hideCaption?: boolean;
}) {
  const src = resolveCmsMediaUrl(item.src) ?? item.src;
  const poster = resolveCmsMediaUrl(item.poster) ?? item.poster;

  if (layout === "overlay") {
    return (
      <div
        className={`group relative aspect-[4/3] overflow-hidden rounded-2xl bg-na-heket/5 shadow-na-soft sm:aspect-[16/10] ${accentCardShell(index)} ${className}`}
      >
        {item.kind === "video" && src ? (
          <PageMediaVideo
            src={src}
            poster={poster}
            title={item.title || item.alt || "Video"}
            className="h-full w-full object-cover"
          />
        ) : src ? (
          <Image
            src={src}
            alt={item.alt || item.title || "Imagen"}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
        ) : null}
        {(item.caption || item.title) && !hideCaption ? (
          <span
            className={`pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-na-heketDark/85 to-transparent px-4 py-3 text-sm font-semibold text-white ${
              captionOnHover
                ? "opacity-0 transition group-hover:opacity-100"
                : ""
            }`}
          >
            {item.caption || item.title}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${accentCardShell(index)} ${className}`}>
      <div className="relative aspect-[4/3] bg-na-heket/5 sm:aspect-[16/10]">
        {item.kind === "video" && src ? (
          <PageMediaVideo
            src={src}
            poster={poster}
            title={item.title || item.alt || "Video"}
            className="h-full w-full object-cover"
          />
        ) : src ? (
          <Image
            src={src}
            alt={item.alt || item.title || "Imagen"}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
        ) : null}
      </div>
      {(item.title || item.caption) && !hideCaption && (
        <div className="space-y-1 p-4">
          {item.title ? (
            <h3 className="text-base font-bold text-na-heketDark">{item.title}</h3>
          ) : null}
          {item.caption ? (
            <p className="text-sm text-na-muted">{item.caption}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function GalleryMessage({
  title,
  text,
  variant = "default",
}: {
  title?: string;
  text?: string;
  /** `slide` = texto que cambia con cada foto del carrusel. */
  variant?: "default" | "slide";
}) {
  const hasTitle = Boolean(title?.trim());
  const hasText = Boolean(text?.trim());
  if (!hasTitle && !hasText) return null;

  const titleClass =
    variant === "slide"
      ? "text-balance text-xl font-black text-na-heketDark sm:text-2xl"
      : "text-balance text-2xl font-black text-na-heketDark sm:text-3xl";

  return (
    <div
      className={
        variant === "slide"
          ? "flex flex-col justify-center transition-opacity duration-300"
          : "flex flex-col justify-center"
      }
    >
      {hasTitle ? <h3 className={titleClass}>{title}</h3> : null}
      {hasText ? (
        <p
          className={`whitespace-pre-line text-sm leading-relaxed text-na-muted sm:text-base ${
            hasTitle ? "mt-3" : ""
          }`}
        >
          {text}
        </p>
      ) : null}
    </div>
  );
}

function GalleryCarouselMessage({
  fixedTitle,
  fixedText,
  slideTitle,
  slideText,
}: {
  fixedTitle?: string;
  fixedText?: string;
  slideTitle?: string;
  slideText?: string;
}) {
  const hasFixed = Boolean(fixedTitle?.trim() || fixedText?.trim());
  const hasSlide = Boolean(slideTitle?.trim() || slideText?.trim());
  if (!hasFixed && !hasSlide) return null;

  return (
    <div className="space-y-5">
      {hasFixed ? (
        <GalleryMessage title={fixedTitle} text={fixedText} variant="default" />
      ) : null}
      {hasSlide ? (
        <GalleryMessage
          key={`${slideTitle ?? ""}|${slideText ?? ""}`}
          title={slideTitle}
          text={slideText}
          variant="slide"
        />
      ) : null}
    </div>
  );
}

function GalleryCarousel({
  items,
  layout,
  startIndex,
  index,
  onIndexChange,
}: {
  items: CmsPageMediaCard[];
  layout: "card" | "overlay";
  startIndex: number;
  index: number;
  onIndexChange: (index: number) => void;
}) {
  const [reduceMotion, setReduceMotion] = useState(false);
  const n = items.length;

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReduceMotion(
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    );
  }, []);

  const goPrev = useCallback(() => {
    onIndexChange((index - 1 + n) % n);
  }, [index, n, onIndexChange]);

  const goNext = useCallback(() => {
    onIndexChange((index + 1) % n);
  }, [index, n, onIndexChange]);

  useEffect(() => {
    if (n <= 1 || reduceMotion) return;
    const t = setInterval(goNext, 7000);
    return () => clearInterval(t);
  }, [n, reduceMotion, goNext]);

  if (n === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-na-heket/20 bg-na-heket/5 px-4 py-10 text-center text-sm text-na-muted">
        Sin fotos en la galería.
      </p>
    );
  }

  const current = items[index];

  return (
    <div className="relative">
      <GallerySlide
        key={current.id}
        item={current}
        layout={layout}
        index={startIndex + index}
        hideCaption
      />

      {n > 1 ? (
        <>
          <div className="pointer-events-none absolute inset-y-0 -left-2 -right-2 flex items-center justify-between sm:-left-3 sm:-right-3">
            <button
              type="button"
              onClick={goPrev}
              className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-na-heket/15 bg-white/95 text-na-heket shadow-na-soft transition hover:bg-white"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-na-heket/15 bg-white/95 text-na-heket shadow-na-soft transition hover:bg-white"
              aria-label="Foto siguiente"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onIndexChange(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index
                    ? "w-7 bg-na-heket"
                    : "w-2 bg-na-heket/25 hover:bg-na-heket/45"
                }`}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function GalleryCarouselLayout({
  block,
  layout,
  startIndex,
}: {
  block: CmsPageMediaGalleryBlock;
  layout: "card" | "overlay";
  startIndex: number;
}) {
  const [slideIndex, setSlideIndex] = useState(0);
  const items = block.items;
  const safeIndex =
    items.length > 0 ? Math.min(slideIndex, items.length - 1) : 0;
  const currentItem = items[safeIndex];
  const messageOnLeft = (block.carouselSide ?? "left") === "left";
  const message = (
    <GalleryCarouselMessage
      fixedTitle={block.carouselTitle}
      fixedText={block.carouselText}
      slideTitle={currentItem?.title}
      slideText={currentItem?.caption}
    />
  );
  const carousel = (
    <GalleryCarousel
      items={items}
      layout={layout}
      startIndex={startIndex}
      index={safeIndex}
      onIndexChange={setSlideIndex}
    />
  );

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-10">
      {messageOnLeft ? (
        <>
          {message}
          {carousel}
        </>
      ) : (
        <>
          {carousel}
          {message}
        </>
      )}
    </div>
  );
}

export function PageMediaGallery({
  block,
  index = 0,
}: {
  block: CmsPageMediaGalleryBlock;
  index?: number;
}) {
  const layout = block.layout ?? "overlay";
  const display = block.display ?? "grid";

  if (display === "carousel") {
    return (
      <GalleryCarouselLayout
        block={block}
        layout={layout}
        startIndex={index}
      />
    );
  }

  const cols =
    block.columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <ul className={`grid grid-cols-2 gap-2 ${cols} sm:gap-3`}>
      {block.items.map((item, i) => (
        <li key={item.id}>
          <GallerySlide
            item={item}
            layout={layout}
            index={index + i}
            captionOnHover={layout === "overlay"}
            className={
              layout === "overlay"
                ? "rounded-lg sm:rounded-xl"
                : undefined
            }
          />
        </li>
      ))}
    </ul>
  );
}
