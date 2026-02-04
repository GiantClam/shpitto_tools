import React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/cn";

type AnimatedBeamProps = {
  className?: string;
  intensity?: "soft" | "strong";
};

export function AnimatedBeam({ className, intensity = "soft" }: AnimatedBeamProps) {
  const gradient =
    intensity === "strong"
      ? "linear-gradient(90deg, transparent, rgba(59,130,246,0.5), rgba(236,72,153,0.45), transparent)"
      : "linear-gradient(90deg, transparent, rgba(59,130,246,0.3), rgba(236,72,153,0.25), transparent)";

  return (
    <div className={cn("relative h-1 w-full overflow-hidden rounded-full bg-border/60", className)}>
      <motion.div
        className="absolute inset-0"
        style={{ backgroundImage: gradient }}
        animate={{ x: ["-60%", "60%"] }}
        transition={{ duration: 2.4, ease: "linear", repeat: Infinity }}
      />
    </div>
  );
}
