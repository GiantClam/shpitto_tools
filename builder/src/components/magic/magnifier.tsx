import React from "react";

import { cn } from "@/lib/cn";

type MagnifierProps = {
  src: string;
  alt?: string;
  zoom?: number;
  size?: number;
  className?: string;
  imageClassName?: string;
};

type LensState = {
  x: number;
  y: number;
  visible: boolean;
  width: number;
  height: number;
};

export function Magnifier({
  src,
  alt = "",
  zoom = 2,
  size = 160,
  className,
  imageClassName,
}: MagnifierProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [lens, setLens] = React.useState<LensState>({
    x: 0,
    y: 0,
    visible: false,
    width: 1,
    height: 1,
  });

  const updateLens = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.min(rect.width, Math.max(0, event.clientX - rect.left));
    const y = Math.min(rect.height, Math.max(0, event.clientY - rect.top));
    setLens({
      x,
      y,
      visible: true,
      width: rect.width,
      height: rect.height,
    });
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden rounded-3xl", className)}
      onMouseMove={updateLens}
      onMouseEnter={updateLens}
      onMouseLeave={() => setLens((prev) => ({ ...prev, visible: false }))}
    >
      <img src={src} alt={alt} className={cn("h-full w-full object-cover", imageClassName)} />
      {lens.visible ? (
        <div
          className="pointer-events-none absolute rounded-full border border-white/60 bg-black/10 shadow-lg backdrop-blur"
          style={{
            width: size,
            height: size,
            left: lens.x - size / 2,
            top: lens.y - size / 2,
            backgroundImage: `url(${src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${lens.width * zoom}px ${lens.height * zoom}px`,
            backgroundPosition: `${-lens.x * zoom + size / 2}px ${-lens.y * zoom + size / 2}px`,
          }}
        />
      ) : null}
    </div>
  );
}
