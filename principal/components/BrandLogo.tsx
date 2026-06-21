import type { CSSProperties } from "react";
import { cn } from "@/lib/utils/cn";
import {
  type BrandLockupId,
  type BrandLogoVariant,
  BRAND_LOCKUPS,
  BRAND_TOP_MARK,
  LOCKUPS_WITH_DESCRIPTOR,
  LOCKUP_DESCRIPTOR_LABELS,
} from "@/lib/brand-assets";
import { assetUrl } from "@/lib/asset-url";
import {
  BRAND_DESCRIPTOR_GAP_RATIO,
  BRAND_DESCRIPTOR_TEXT_RATIO,
  BRAND_CLEAR_SPACE_RATIO,
  BRAND_LOGO_HEIGHT_DEFAULT,
  BRAND_WORDMARK_OFFSET_RATIO,
  BRAND_WORDMARK_WIDTH_RATIO,
  brandDescriptorStyle,
  lockupClearSpaceVariant,
} from "@/lib/brand-clear-space";

type BrandLogoProps = {
  lockup?: BrandLockupId;
  variant?: BrandLogoVariant;
  tagline?: string;
  className?: string;
  taglineClassName?: string;
  /** Clases extra para el descriptor (oinadom, oina, etc.). */
  descriptorClassName?: string;
  /** Descriptor más grande (p. ej. hero de inicio). */
  descriptorProminence?: "default" | "hero";
  align?: "start" | "center";
  priority?: boolean;
  clearSpace?: boolean;
  maxWidthClass?: string;
  /** `hybrid` = nombre raster + descriptor HTML (legible). `raster` = lockup completo PNG. */
  render?: "auto" | "hybrid" | "raster";
};

function usesHybrid(
  lockup: BrandLockupId,
  render: BrandLogoProps["render"],
): boolean {
  if (render === "raster") return false;
  if (render === "hybrid") return true;
  return LOCKUPS_WITH_DESCRIPTOR.includes(
    lockup as (typeof LOCKUPS_WITH_DESCRIPTOR)[number],
  );
}

function markAspect(asset: { width: number; height: number }) {
  return asset.width / asset.height;
}

function hybridDescriptorFill(
  variant: BrandLogoVariant,
  prominence: "default" | "hero",
): string {
  if (variant === "white") {
    return prominence === "hero" ? "#ffffff" : "rgba(255, 255, 255, 0.85)";
  }
  return "#707070";
}

/** Descriptor oinadom — ancho = wordmark vía textLength (guía + PNG oficial). */
function OinadomDescriptor({
  label,
  variant,
  descriptorProminence,
  descriptorClassName,
  align,
}: {
  label: string;
  variant: BrandLogoVariant;
  descriptorProminence: "default" | "hero";
  descriptorClassName?: string;
  align: "start" | "center";
}) {
  const styles = brandDescriptorStyle("oinadom", descriptorProminence);

  return (
    <svg
      className={cn("block w-full overflow-visible", descriptorClassName)}
      viewBox="0 0 1000 120"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      style={{
        marginTop: styles.marginTop,
        height: `calc(${styles.fontSize} * 1.35)`,
      }}
    >
      <text
        x={align === "start" ? 0 : 500}
        y={82}
        textAnchor={align === "start" ? "start" : "middle"}
        fontFamily="var(--font-noto-sans), Noto Sans, sans-serif"
        fontWeight={700}
        fontSize={100}
        fill={hybridDescriptorFill(variant, descriptorProminence)}
        textLength={1000}
        lengthAdjust="spacingAndGlyphs"
      >
        {label}
      </text>
    </svg>
  );
}

export function BrandLogo({
  lockup = "na",
  variant = "color",
  tagline,
  className,
  taglineClassName,
  descriptorClassName,
  descriptorProminence = "default",
  align = "center",
  priority = false,
  clearSpace = false,
  maxWidthClass,
  render = "auto",
}: BrandLogoProps) {
  const hybrid = usesHybrid(lockup, render);
  const asset = hybrid ? BRAND_TOP_MARK : BRAND_LOCKUPS[lockup];
  const rawSrc = variant === "white" ? asset.webpWhite : asset.webp;
  const src = assetUrl(rawSrc);
  const aspect = markAspect(asset);
  const spaceRatio = BRAND_CLEAR_SPACE_RATIO[lockupClearSpaceVariant(lockup)];
  const showTagline =
    Boolean(tagline) &&
    !LOCKUPS_WITH_DESCRIPTOR.includes(
      lockup as (typeof LOCKUPS_WITH_DESCRIPTOR)[number],
    );
  const descriptorLabel = hybrid
    ? LOCKUP_DESCRIPTOR_LABELS[
        lockup as keyof typeof LOCKUP_DESCRIPTOR_LABELS
      ]
    : null;

  /** Mismo lockup híbrido que el hero (anagrama + país), escalado con `--brand-logo-h`. */
  const oinadomWordmarkFit = false;

  const rootClass = cn(
    "inline-flex max-w-full overflow-visible leading-none",
    hybrid || showTagline
      ? cn("flex-col", align === "start" ? "self-start" : "self-center")
      : align === "start"
        ? "items-start"
        : "items-center",
    !hybrid && !showTagline && align === "center" && "justify-center",
    `[--brand-logo-h:${BRAND_LOGO_HEIGHT_DEFAULT}]`,
    className,
  );

  const markStyle: CSSProperties =
    lockup === "na-solo"
      ? { height: "var(--brand-logo-h)", width: "auto" }
      : hybrid
        ? {
            height: "var(--brand-logo-h)",
            width: `calc(var(--brand-logo-h) * ${aspect})`,
          }
        : {
            height: "var(--brand-logo-h)",
            width: "auto",
          };

  const image = (
    <img
      src={src}
      alt={hybrid ? BRAND_LOCKUPS[lockup].alt : asset.alt}
      width={asset.width}
      height={asset.height}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : undefined}
      className={cn(
        "block max-w-full shrink-0 object-contain",
        lockup === "na-solo" ? "h-[var(--brand-logo-h)] w-auto" : "h-auto w-auto",
        hybrid ? "object-center" : align === "start" ? "object-left" : "object-center",
        maxWidthClass,
      )}
      style={markStyle}
    />
  );

  const logoBody = clearSpace ? (
    <span
      className="inline-flex overflow-visible"
      style={{ padding: `${spaceRatio}em` }}
    >
      {image}
    </span>
  ) : (
    image
  );

  const descriptorNode =
    hybrid && descriptorLabel ? (
      oinadomWordmarkFit ? (
        <OinadomDescriptor
          label={descriptorLabel}
          variant={variant}
          descriptorProminence={descriptorProminence}
          descriptorClassName={descriptorClassName}
          align={align}
        />
      ) : (
        <span
          className={cn(
            "block w-full max-w-full uppercase leading-none",
            variant === "white"
              ? descriptorProminence === "hero"
                ? "text-white"
                : "text-white/85"
              : "text-[#707070]",
            lockup === "oina" ||
              lockup === "oinadom" ||
              lockup === "trilogo" ||
              lockup === "escuela"
              ? "font-bold"
              : "font-black",
            hybrid ? "text-center" : align === "start" ? "text-left" : "text-center",
            lockup === "trilogo" ? "whitespace-normal sm:whitespace-nowrap" : "whitespace-nowrap",
            descriptorClassName,
          )}
          style={{
            ...brandDescriptorStyle(
              lockup as "oina" | "oinadom" | "escuela" | "trilogo",
              descriptorProminence,
            ),
            maxWidth: "100%",
            fontFamily: "var(--font-noto-sans), sans-serif",
            fontWeight:
              lockup === "oina" ||
              lockup === "trilogo" ||
              lockup === "escuela" ||
              (lockup === "oinadom" && descriptorProminence !== "hero")
                ? 700
                : 900,
          }}
        >
          {descriptorLabel}
        </span>
      )
    ) : null;

  if (showTagline) {
    return (
      <span className={rootClass}>
        {logoBody}
        <span
          className={cn(
            "font-bold uppercase leading-none",
            align === "start" ? "text-left" : "text-center",
            variant === "white" ? "text-white/75" : "text-na-muted",
            taglineClassName,
          )}
          style={{
            marginTop: `${BRAND_DESCRIPTOR_GAP_RATIO}em`,
            fontSize: `${BRAND_DESCRIPTOR_TEXT_RATIO}em`,
            letterSpacing: "0.14em",
          }}
        >
          {tagline}
        </span>
      </span>
    );
  }

  if (hybrid) {
    const oinadomWordmarkBand: CSSProperties | undefined = oinadomWordmarkFit
      ? {
          paddingLeft: `${BRAND_WORDMARK_OFFSET_RATIO * 100}%`,
          paddingRight: `${(1 - BRAND_WORDMARK_OFFSET_RATIO - BRAND_WORDMARK_WIDTH_RATIO) * 100}%`,
        }
      : undefined;

    return (
      <span className={rootClass}>
        <span
          className={cn(
            "inline-flex flex-col overflow-visible pt-0.5",
            align === "start" ? "items-start" : "items-center",
          )}
          style={{ width: markStyle.width }}
        >
          {logoBody}
          {oinadomWordmarkBand ? (
            <span className="block w-full" style={oinadomWordmarkBand}>
              {descriptorNode}
            </span>
          ) : (
            descriptorNode
          )}
        </span>
      </span>
    );
  }

  return <span className={rootClass}>{logoBody}</span>;
}
