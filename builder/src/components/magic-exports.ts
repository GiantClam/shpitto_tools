import { BentoCard, BentoGrid } from "@/components/magic/bento-grid";
import { AnimatedBeam } from "@/components/magic/animated-beam";
import { BorderBeam } from "@/components/magic/border-beam";
import { ComparisonSlider } from "@/components/magic/comparison-slider";
import { Carousel } from "@/components/magic/carousel";
import { SceneSwitcher } from "@/components/magic/scene-switcher";
import { GlowCard } from "@/components/magic/glow-card";
import { GradientText } from "@/components/magic/gradient-text";
import { Magnifier } from "@/components/magic/magnifier";
import { Marquee } from "@/components/magic/marquee";
import { NumberTicker } from "@/components/magic/number-ticker";
import { Particles } from "@/components/magic/particles";
import { TextReveal } from "@/components/magic/text-reveal";

export {
  AnimatedBeam,
  BentoCard,
  BentoGrid,
  BorderBeam,
  Carousel,
  ComparisonSlider,
  SceneSwitcher,
  GlowCard,
  GradientText,
  Magnifier,
  Marquee,
  NumberTicker,
  Particles,
  TextReveal,
};

export const magicImportMap = {
  "@/components/magic/animated-beam": { AnimatedBeam, default: AnimatedBeam },
  "@/components/magic/bento-grid": { BentoCard, BentoGrid },
  "@/components/magic/border-beam": { BorderBeam, default: BorderBeam },
  "@/components/magic/carousel": { Carousel, default: Carousel },
  "@/components/magic/comparison-slider": { ComparisonSlider, default: ComparisonSlider },
  "@/components/magic/scene-switcher": { SceneSwitcher, default: SceneSwitcher },
  "@/components/magic/glow-card": { GlowCard, default: GlowCard },
  "@/components/magic/gradient-text": { GradientText, default: GradientText },
  "@/components/magic/magnifier": { Magnifier, default: Magnifier },
  "@/components/magic/marquee": { Marquee, default: Marquee },
  "@/components/magic/number-ticker": { NumberTicker, default: NumberTicker },
  "@/components/magic/particles": { Particles, default: Particles },
  "@/components/magic/text-reveal": { TextReveal, default: TextReveal },
};
