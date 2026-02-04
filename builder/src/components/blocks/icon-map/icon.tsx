"use client";

import React from "react";
import {
  Zap,
  Shield,
  TrendingUp,
  Sparkles,
  Rocket,
  Cpu,
  Globe,
  Lock,
  Clock,
  CheckCircle2,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap,
  shield: Shield,
  trendingUp: TrendingUp,
  sparkles: Sparkles,
  rocket: Rocket,
  cpu: Cpu,
  globe: Globe,
  lock: Lock,
  clock: Clock,
  check: CheckCircle2,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = ICONS[name] ?? Sparkles;
  return <Cmp className={className} />;
}
