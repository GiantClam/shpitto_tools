import type { CSSProperties } from "react";
import { cva } from "class-variance-authority";

export type BackgroundMedia = {
  kind: "image" | "video";
  src: string;
  poster?: string;
};

export type BaseBlockProps = {
  id: string;
  anchor?: string;
  paddingY?: "sm" | "md" | "lg";
  background?: "none" | "muted" | "gradient" | "image";
  backgroundGradient?: string;
  backgroundMedia?: BackgroundMedia;
  backgroundOverlay?: string;
  backgroundOverlayOpacity?: number;
  backgroundBlur?: number;
  align?: "left" | "center";
  maxWidth?: "lg" | "xl" | "2xl";
  emphasis?: "normal" | "high";
  headingFont?: string;
  bodyFont?: string;
  __v?: string | number;
};

export type LinkProps = { label: string; href: string; variant?: "primary" | "secondary" | "link" };

export const blockSectionClass = cva("w-full", {
  variants: {
    paddingY: { sm: "py-8", md: "py-12", lg: "py-20" },
    background: {
      none: "bg-background",
      muted: "bg-muted",
      gradient: "bg-gradient-to-b from-background to-muted",
      image: "bg-muted",
    },
  },
  defaultVariants: { paddingY: "lg", background: "none" },
});

export function maxWidthClass(value: "lg" | "xl" | "2xl") {
  if (value === "lg") return "max-w-4xl";
  if (value === "xl") return "max-w-5xl";
  return "max-w-6xl";
}

export function backgroundMediaStyle(
  background?: BaseBlockProps["background"],
  media?: BackgroundMedia
): CSSProperties | undefined {
  if (background !== "image" || media?.kind !== "image" || !media?.src) {
    return undefined;
  }
  return {
    backgroundImage: `url(${media.src})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };
}

export function backgroundGradientStyle(
  background?: BaseBlockProps["background"],
  gradient?: string
): CSSProperties | undefined {
  if (background !== "gradient" || !gradient) {
    return undefined;
  }
  return {
    backgroundImage: gradient,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
  };
}

export function backgroundVideoSource(
  background?: BaseBlockProps["background"],
  media?: BackgroundMedia
) {
  if (background !== "image" || media?.kind !== "video" || !media?.src) {
    return undefined;
  }
  return { src: media.src, poster: media.poster };
}

export function backgroundOverlayStyle(
  overlay?: string,
  opacity?: number,
  blur?: number
): CSSProperties | undefined {
  if (!overlay && !blur) {
    return undefined;
  }
  const clampedOpacity =
    typeof opacity === "number" && opacity >= 0 && opacity <= 1 ? opacity : 0.35;
  const color =
    overlay && overlay.includes("%")
      ? `hsl(${overlay} / ${clampedOpacity})`
      : overlay || `rgba(0,0,0,${clampedOpacity})`;
  return {
    backgroundColor: color,
    backdropFilter: blur ? `blur(${blur}px)` : undefined,
  };
}
