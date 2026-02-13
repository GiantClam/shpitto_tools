"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAnimation } from "framer-motion";

export type RevealPreset = "fadeUp" | "fadeIn" | "stagger";

export type RevealOptions = {
  preset?: RevealPreset;
  once?: boolean;
  rootMargin?: string;
  enabled?: boolean;
};

export type ParallaxOptions = {
  intensity?: number;
  clamp?: number;
  distance?: number;
  enabled?: boolean;
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useInViewReveal<T extends HTMLElement>(options: RevealOptions = {}) {
  const { preset = "fadeUp", once = true, rootMargin = "-10% 0px", enabled = true } = options;
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  const controls = useAnimation();
  const defaultReveal = useMemo(() => ({ opacity: 1, y: 0 }), []);

  useEffect(() => {
    if (!enabled || prefersReducedMotion()) {
      setVisible(true);
      controls.start("visible");
      controls.start("animate");
      controls.start(defaultReveal);
      return;
    }
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          controls.start("visible");
          controls.start("animate");
          controls.start(defaultReveal);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
          controls.start("hidden");
          controls.start("initial");
        }
      },
      { root: null, rootMargin, threshold: 0.15 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [enabled, once, rootMargin]);

  const className = useMemo(() => {
    if (!enabled || prefersReducedMotion()) return "";
    // Keep content visible before intersection to avoid blank sections in long screenshots.
    if (!visible) return "opacity-100 translate-y-0";
    if (preset === "fadeIn") return "opacity-100";
    if (preset === "stagger") return "opacity-100";
    return "opacity-100 translate-y-0";
  }, [enabled, preset, visible]);

  const style = useMemo(() => {
    if (!enabled || prefersReducedMotion()) return undefined;
    if (preset === "stagger") {
      return { transition: "opacity 600ms var(--ease-smooth), transform 600ms var(--ease-smooth)" } as const;
    }
    return { transition: "opacity 600ms var(--ease-smooth), transform 600ms var(--ease-smooth)" } as const;
  }, [enabled, preset]);

  const result = { ref, className, style, visible, controls } as const;
  (result as any)[Symbol.iterator] = function* () {
    yield ref;
    yield controls;
    yield className;
    yield style;
    yield visible;
  };
  return result;
}

export function useParallaxY(options: ParallaxOptions = {}) {
  const { intensity = 0.15, clamp = 80, distance, enabled = true } = options;
  const effectiveClamp = typeof distance === "number" ? distance : clamp;
  const ref = useRef<HTMLElement | null>(null);
  const frame = useRef<number | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return;
    const onScroll = () => {
      if (frame.current != null) return;
      frame.current = window.requestAnimationFrame(() => {
        const next = Math.max(
          -effectiveClamp,
          Math.min(effectiveClamp, window.scrollY * intensity)
        );
        setOffset(next);
        frame.current = null;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame.current != null) window.cancelAnimationFrame(frame.current);
    };
  }, [effectiveClamp, enabled, intensity]);

  const style = useMemo(() => {
    if (!enabled || prefersReducedMotion()) return undefined;
    return { transform: `translate3d(0, ${offset}px, 0)` } as const;
  }, [enabled, offset]);

  const result = { ref, style, offset, y: offset } as const;
  (result as any)[Symbol.iterator] = function* () {
    yield ref;
    yield offset;
    yield style;
    yield offset;
  };
  return result;
}
