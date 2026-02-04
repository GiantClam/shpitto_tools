import React from "react";

export function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-muted/40 blur-2xl" />
    </div>
  );
}
