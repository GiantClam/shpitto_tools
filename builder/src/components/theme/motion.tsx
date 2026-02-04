"use client";

import React, { createContext, useContext, useMemo } from "react";

export type MotionMode = "off" | "subtle" | "showcase";

const MotionContext = createContext<MotionMode>("subtle");

export function MotionProvider({
  mode,
  children,
}: {
  mode: MotionMode;
  children: React.ReactNode;
}) {
  const value = useMemo(() => mode, [mode]);
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}

export function useMotionMode() {
  return useContext(MotionContext);
}
