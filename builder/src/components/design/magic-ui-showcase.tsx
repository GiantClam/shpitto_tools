'use client';

import { MAGIC_UI_COMPONENTS, type MagicComponentConfig } from '@/lib/agent/magic-ui-registry';

export interface MagicUIShowcaseProps {
  onSelect?: (component: MagicComponentConfig) => void;
  selectedCategory?: string;
}

export function MagicUIShowcase({ onSelect, selectedCategory }: MagicUIShowcaseProps) {
  const categories = ['animation', 'effect', 'interactive', 'layout'] as const;
  const filtered = selectedCategory
    ? MAGIC_UI_COMPONENTS.filter(c => c.category === selectedCategory)
    : MAGIC_UI_COMPONENTS;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onSelect?.({ name: cat } as MagicComponentConfig)}
            className={`px-3 py-1 text-sm rounded-full capitalize ${
              selectedCategory === cat
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(comp => (
          <div
            key={comp.name}
            className="p-4 border rounded-lg hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
            onClick={() => onSelect?.(comp)}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-sm">{comp.name}</span>
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full capitalize">
                {comp.category}
              </span>
            </div>
            <p className="text-gray-600 text-xs mb-2">{comp.description}</p>
            {comp.animationFeatures && (
              <div className="flex gap-1 flex-wrap">
                {comp.animationFeatures.map(f => (
                  <span key={f} className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded">
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export interface AnimationPickerProps {
  value?: string[];
  onChange?: (animations: string[]) => void;
}

export function AnimationPicker({ value = [], onChange }: AnimationPickerProps) {
  const entranceAnimations = [
    { id: 'fade-in', label: 'Fade In', class: 'animate-fade-in' },
    { id: 'fade-in-up', label: 'Fade In Up', class: 'animate-fade-in-up' },
    { id: 'slide-in-left', label: 'Slide In Left', class: 'animate-slide-in-left' },
    { id: 'slide-in-right', label: 'Slide In Right', class: 'animate-slide-in-right' },
    { id: 'scale-in', label: 'Scale In', class: 'animate-scale-in' },
  ];

  const continuousAnimations = [
    { id: 'float', label: 'Float', class: 'animate-float' },
    { id: 'pulse', label: 'Pulse', class: 'animate-pulse' },
    { id: 'shimmer', label: 'Shimmer', class: 'animate-shimmer' },
    { id: 'glow', label: 'Glow', class: 'animate-glow' },
  ];

  const toggle = (id: string) => {
    const next = value.includes(id) ? value.filter(v => v !== id) : [...value, id];
    onChange?.(next);
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2">Entrance Animations</h4>
        <div className="flex gap-2 flex-wrap">
          {entranceAnimations.map(anim => (
            <button
              key={anim.id}
              onClick={() => toggle(anim.id)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                value.includes(anim.id)
                  ? 'bg-blue-100 border-blue-400 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              {anim.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Continuous Animations</h4>
        <div className="flex gap-2 flex-wrap">
          {continuousAnimations.map(anim => (
            <button
              key={anim.id}
              onClick={() => toggle(anim.id)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                value.includes(anim.id)
                  ? 'bg-purple-100 border-purple-400 text-purple-700'
                  : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              {anim.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export const ANIMATION_CLASSES = {
  entrance: {
    'fade-in': 'animate-fade-in',
    'fade-in-up': 'animate-fade-in-up',
    'fade-in-down': 'animate-fade-in-down',
    'slide-in-left': 'animate-slide-in-left',
    'slide-in-right': 'animate-slide-in-right',
    'scale-in': 'animate-scale-in',
    'blur-in': 'animate-blur-in',
  },
  continuous: {
    'float': 'animate-float',
    'pulse': 'animate-pulse',
    'bounce': 'animate-bounce',
    'spin': 'animate-spin',
    'shimmer': 'animate-shimmer',
    'glow': 'animate-glow',
  },
  interaction: {
    'hover-grow': 'hover:scale-105 transition-transform',
    'hover-shrink': 'hover:scale-95 transition-transform',
    'hover-glow': 'hover:shadow-lg transition-shadow',
    'click-bounce': 'active:scale-95 transition-transform',
  },
};
