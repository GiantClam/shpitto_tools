"use client";

import React, { createContext, useContext, useMemo } from "react";

export type MotionMode = "off" | "subtle" | "showcase";

const MotionContext = createContext<MotionMode>("subtle");

const PEN_AUTO_MOTION_RESET = `
[style*="pen-track-slide-x-subtle"],
[style*="pen-track-slide-x-showcase"],
[style*="pen-card-float"] {
  animation: none !important;
}

.pen-track-slide {
  animation: none !important;
  will-change: auto !important;
}
`;

export function MotionProvider({
  mode,
  children,
}: {
  mode: MotionMode;
  children: React.ReactNode;
}) {
  const value = useMemo(() => mode, [mode]);
  return (
    <MotionContext.Provider value={value}>
      <style dangerouslySetInnerHTML={{ __html: PEN_AUTO_MOTION_RESET }} />
      {children}
    </MotionContext.Provider>
  );
}

export function useMotionMode() {
  return useContext(MotionContext);
}
