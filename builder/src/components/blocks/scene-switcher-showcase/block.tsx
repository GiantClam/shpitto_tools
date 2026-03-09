"use client";

import React from 'react';
import { SceneSwitcher } from '@/components/magic/scene-switcher';
import { motion } from 'framer-motion';
import { useInViewReveal } from '@/lib/motion';

export default function SceneSwitcherShowcase({ title, subtitle, scenes }) {
  const { ref, controls } = useInViewReveal();

  const formattedScenes = scenes.map((scene) => ({
    id: scene.id || scene.label.toLowerCase().replace(/\s+/g, '-'),
    title: scene.label,
    description: scene.description,
    image: scene.image,
    eyebrow: scene.eyebrow
  }));

  return (
    <section className="py-24 bg-slate-950/60">
      <div className="mx-auto w-full px-6 max-w-[1400px]">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={controls}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-6xl tracking-tight text-foreground mb-6">
            {title}
          </h2>
          {subtitle && (
            <p className="font-body text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={controls}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        >
          <SceneSwitcher items={formattedScenes} variant="tabs" />
        </motion.div>
      </div>
    </section>
  );
}

export const config = {
  fields: {
    title: {
      type: 'text',
      label: 'Section Title'
    },
    subtitle: {
      type: 'textarea',
      label: 'Subtitle'
    },
    scenes: {
      type: 'array',
      label: 'Scenes',
      arrayFields: {
        id: {
          type: 'text',
          label: 'ID'
        },
        label: {
          type: 'text',
          label: 'Scene Label'
        },
        image: {
          type: 'text',
          label: 'Image URL'
        },
        description: {
          type: 'textarea',
          label: 'Description'
        },
        eyebrow: {
          type: 'text',
          label: 'Eyebrow Text'
        }
      },
      defaultItemProps: {
        id: '',
        label: 'New Scene',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=800&fit=crop',
        description: 'Scene description',
        eyebrow: ''
      }
    }
  },
  defaultProps: {
    title: '覆盖全行业质检场景',
    subtitle: '从3C电子到新能源制造，灵创AI视觉系统已服务200+行业头部企业',
    scenes: [
      {
        id: '3c-electronics',
        label: '3C电子',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=800&fit=crop&q=80',
        description: 'PCB焊点检测、屏幕缺陷识别、外观划痕检测',
        eyebrow: '精密检测'
      },
      {
        id: 'automotive',
        label: '汽车制造',
        image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&h=800&fit=crop&q=80',
        description: '车身漆面检测、零部件尺寸测量、焊缝质量检测',
        eyebrow: '工业级精度'
      },
      {
        id: 'new-energy',
        label: '新能源',
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&h=800&fit=crop&q=80',
        description: '电池极片缺陷、光伏组件EL检测、锂电涂布检测',
        eyebrow: '高速在线'
      },
      {
        id: 'pharma-packaging',
        label: '医药包装',
        image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=1200&h=800&fit=crop&q=80',
        description: '药品外观检测、包装完整性检查、标签OCR识别',
        eyebrow: '合规追溯'
      }
    ]
  }
};