"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ComparisonSlider } from '@/components/magic/comparison-slider';
import { Badge } from '@/components/ui/badge';
import { useInViewReveal } from '@/lib/motion';

export default function ComparisonSection({
  title,
  description,
  beforeImage,
  afterImage,
  beforeLabel,
  afterLabel,
  beforeBadge,
  afterBadge
}) {
  const { ref, controls } = useInViewReveal();

  return (
    <section className="py-24 bg-slate-950/60">
      <div className="mx-auto w-full px-6 max-w-[1400px]">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 32 }}
          animate={controls}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="grid grid-cols-1 gap-4 items-start"
        >
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-6xl tracking-tight text-foreground mb-4">
              {title}
            </h2>
            {description && (
              <p className="font-body text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>

          <div className="relative w-full max-w-4xl mx-auto">
            <ComparisonSlider
              beforeSrc={beforeImage}
              afterSrc={afterImage}
              beforeAlt={beforeLabel}
              afterAlt={afterLabel}
              className="rounded-lg overflow-hidden border border-white/10"
            />
            
            <Badge
              variant="secondary"
              className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white border-white/20 font-medium"
            >
              {beforeBadge}
            </Badge>
            
            <Badge
              variant="default"
              className="absolute top-4 right-4 bg-primary/90 backdrop-blur text-white border-primary/30 font-medium shadow-[0_0_20px_rgba(56,189,248,0.4)]"
            >
              {afterBadge}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 max-w-4xl mx-auto">
            <div className="bg-black/30 backdrop-blur border border-white/10 rounded-md p-6">
              <h3 className="font-heading text-xl text-foreground mb-2">{beforeLabel}</h3>
              <ul className="space-y-2 font-body text-sm text-muted-foreground">
                <li>• 效率低，易疲劳</li>
                <li>• 主观判断，标准不一</li>
                <li>• 无法处理高速产线</li>
              </ul>
            </div>
            
            <div className="bg-black/30 backdrop-blur border border-white/10 rounded-md p-6 shadow-[0_0_40px_rgba(56,189,248,0.25)]">
              <h3 className="font-heading text-xl text-foreground mb-2">{afterLabel}</h3>
              <ul className="space-y-2 font-body text-sm text-muted-foreground">
                <li>• 毫秒级响应，24/7运行</li>
                <li>• 统一标准，精度99.8%</li>
                <li>• 适配高速产线</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export const config = {
  fields: {
    title: {
      type: 'text',
      label: '标题'
    },
    description: {
      type: 'textarea',
      label: '描述'
    },
    beforeImage: {
      type: 'text',
      label: '左侧图片URL'
    },
    afterImage: {
      type: 'text',
      label: '右侧图片URL'
    },
    beforeLabel: {
      type: 'text',
      label: '左侧标签'
    },
    afterLabel: {
      type: 'text',
      label: '右侧标签'
    },
    beforeBadge: {
      type: 'text',
      label: '左侧徽章'
    },
    afterBadge: {
      type: 'text',
      label: '右侧徽章'
    }
  },
  defaultProps: {
    title: 'AI检测 vs 传统人工',
    description: '对比传统人工检测与AI视觉检测系统，体验智能化带来的质的飞跃',
    beforeImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
    afterImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop',
    beforeLabel: '人工检测',
    afterLabel: '灵创AI检测',
    beforeBadge: '传统方式',
    afterBadge: 'AI驱动'
  }
};