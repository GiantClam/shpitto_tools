export interface MagicComponentConfig {
  name: string;
  displayName: string;
  category: 'animation' | 'effect' | 'interactive' | 'layout';
  description: string;
  importPath: string;
  props?: Record<string, { type: string; required?: boolean; default?: string; description?: string }>;
  animationFeatures?: string[];
  exampleUsage?: string;
}

export const MAGIC_UI_COMPONENTS: MagicComponentConfig[] = [
  {
    name: 'AnimatedBeam',
    displayName: 'Animated Beam',
    category: 'animation',
    description: 'Animated beam effect connecting multiple items',
    importPath: '@/components/magic/animated-beam',
    animationFeatures: ['stagger', 'fade', 'scale'],
  },
  {
    name: 'BentoCard',
    displayName: 'Bento Card',
    category: 'layout',
    description: 'Modern card component for Bento Grid layouts',
    importPath: '@/components/magic/bento-grid',
    props: {
      name: { type: 'string', required: true },
      description: { type: 'string' },
      className: { type: 'string' },
      icon: { type: 'ReactNode' },
    },
  },
  {
    name: 'BentoGrid',
    displayName: 'Bento Grid',
    category: 'layout',
    description: 'Responsive grid layout for Bento cards',
    importPath: '@/components/magic/bento-grid',
    props: {
      className: { type: 'string' },
    },
  },
  {
    name: 'BorderBeam',
    displayName: 'Border Beam',
    category: 'effect',
    description: 'Animated border with beam effect',
    importPath: '@/components/magic/border-beam',
    props: {
      className: { type: 'string' },
      size: { type: 'number', default: '50' },
    },
    animationFeatures: ['shimmer', 'glow'],
  },
  {
    name: 'Carousel',
    displayName: 'Carousel',
    category: 'interactive',
    description: 'Interactive carousel/slider component',
    importPath: '@/components/magic/carousel',
    props: {
      items: { type: 'array', required: true },
      autoPlay: { type: 'boolean', default: 'false' },
    },
    animationFeatures: ['slide', 'fade'],
  },
  {
    name: 'ComparisonSlider',
    displayName: 'Comparison Slider',
    category: 'interactive',
    description: 'Before/after comparison with slider',
    importPath: '@/components/magic/comparison-slider',
    props: {
      beforeSrc: { type: 'string', required: true },
      afterSrc: { type: 'string', required: true },
      beforeAlt: { type: 'string' },
      afterAlt: { type: 'string' },
      className: { type: 'string' },
    },
  },
  {
    name: 'GlowCard',
    displayName: 'Glow Card',
    category: 'effect',
    description: 'Card with glowing effect on hover',
    importPath: '@/components/magic/glow-card',
    animationFeatures: ['glow', 'hover'],
  },
  {
    name: 'GradientText',
    displayName: 'Gradient Text',
    category: 'effect',
    description: 'Text with animated gradient effect',
    importPath: '@/components/magic/gradient-text',
    props: {
      children: { type: 'ReactNode', required: true },
      className: { type: 'string' },
      gradient: { type: 'string' },
    },
    animationFeatures: ['gradient-shift', 'shine'],
  },
  {
    name: 'Magnifier',
    displayName: 'Magnifier',
    category: 'interactive',
    description: 'Image magnifier effect on hover',
    importPath: '@/components/magic/magnifier',
    animationFeatures: ['zoom', 'pan'],
  },
  {
    name: 'Marquee',
    displayName: 'Marquee',
    category: 'animation',
    description: 'Infinite scrolling text/image marquee',
    importPath: '@/components/magic/marquee',
    props: {
      children: { type: 'ReactNode', required: true },
      className: { type: 'string' },
      reverse: { type: 'boolean' },
    },
    animationFeatures: ['scroll', 'infinite'],
  },
  {
    name: 'NumberTicker',
    displayName: 'Number Ticker',
    category: 'animation',
    description: 'Animated number counter with ticker effect',
    importPath: '@/components/magic/number-ticker',
    props: {
      value: { type: 'number', required: true },
      className: { type: 'string' },
      duration: { type: 'number', default: '2000' },
    },
    animationFeatures: ['count-up', 'ease-out'],
  },
  {
    name: 'Particles',
    displayName: 'Particles',
    category: 'effect',
    description: 'Interactive particle background',
    importPath: '@/components/magic/particles',
    props: {
      className: { type: 'string' },
      particleCount: { type: 'number', default: '100' },
    },
    animationFeatures: ['float', 'interactive'],
  },
  {
    name: 'SceneSwitcher',
    displayName: 'Scene Switcher',
    category: 'interactive',
    description: 'Tab-based scene switching component',
    importPath: '@/components/magic/scene-switcher',
    props: {
      items: { type: 'array', required: true },
      variant: { type: 'string', default: 'auto' },
    },
    animationFeatures: ['fade', 'slide'],
  },
  {
    name: 'TextReveal',
    displayName: 'Text Reveal',
    category: 'animation',
    description: 'Animated text reveal on scroll',
    importPath: '@/components/magic/text-reveal',
    props: {
      text: { type: 'string', required: true },
      className: { type: 'string' },
    },
    animationFeatures: ['reveal', 'stagger', 'fade'],
  },
];

export const MAGIC_UI_BY_CATEGORY = MAGIC_UI_COMPONENTS.reduce((acc, comp) => {
  if (!acc[comp.category]) {
    acc[comp.category] = [];
  }
  acc[comp.category].push(comp);
  return acc;
}, {} as Record<string, MagicComponentConfig[]>);

export const ANIMATION_PATTERNS = {
  entrance: [
    'fade-in',
    'fade-in-up',
    'fade-in-down',
    'slide-in-left',
    'slide-in-right',
    'scale-in',
    'blur-in',
  ],
  exit: [
    'fade-out',
    'fade-out-down',
    'slide-out-left',
    'scale-out',
  ],
  continuous: [
    'float',
    'pulse',
    'bounce',
    'spin',
    'shimmer',
    'glow',
  ],
  interaction: [
    'hover-grow',
    'hover-shrink',
    'hover-glow',
    'click-bounce',
  ],
};

export const MOTION_LIBRARY_CONFIG = {
  framerMotion: {
    name: 'Framer Motion',
    importPath: 'framer-motion',
    hooks: ['useMotionValue', 'useAnimation', 'useInView', 'AnimatePresence'],
    animations: ['fade', 'slide', 'scale', 'rotate', 'layout'],
  },
  tailwindMotion: {
    name: 'Tailwind CSS Motion',
    importPath: '@neondatabase/radix-motion',
    utilities: ['animate-fade-in', 'animate-slide-up', 'animate-scale-in'],
  },
};

export function getMagicComponent(name: string): MagicComponentConfig | undefined {
  return MAGIC_UI_COMPONENTS.find(c => c.name === name);
}

export function getMagicComponentsByCategory(category: string): MagicComponentConfig[] {
  return MAGIC_UI_BY_CATEGORY[category] || [];
}

export function getAnimationVariants(pattern: string[]): string {
  return `
  variants: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }
  `;
}

export const MAGIC_UI_SYSTEM_PROMPT = `You have access to Magic UI components for animations and effects.

Available Magic UI Components:
${MAGIC_UI_COMPONENTS.map(c => `- ${c.displayName} (${c.name}): ${c.description}`).join('\n')}

Animation Categories:
- entrance: fade-in, slide-in, scale-in
- exit: fade-out, slide-out
- continuous: float, pulse, shimmer, glow
- interaction: hover effects, click animations

Use Magic UI components to enhance visual appeal while maintaining design system consistency.
Use Framer Motion for custom animations when Magic UI doesn't have a suitable component.
`;
