"use client";

import React from "react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/cn";

export type AtomicButtonProps = {
  id: string;
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "link";
  emphasis?: "normal" | "high";
};

export function AtomicButtonBlock({
  id,
  label,
  href,
  variant = "primary",
  emphasis = "normal",
}: AtomicButtonProps) {
  return (
    <div data-block="AtomicButton" data-block-id={id}>
      <Button
        asChild
        variant={
          variant === "secondary" ? "secondary" : variant === "link" ? "link" : "default"
        }
        className={cn(emphasis === "high" && variant !== "link" ? "btn-glow" : "")}
      >
        <a href={href}>{label}</a>
      </Button>
    </div>
  );
}
