"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Zap, Target, Shield, Code } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInViewReveal } from '@/lib/motion';

const iconMap = {
  zap: Zap,
  target: Target,
  shield: Shield,
  code: Code,
};

const FeaturesSection = ({ title, features }) => {
  const { ref, controls } = useInViewReveal();

  return (
    <section className="py-24 bg-slate-950/60">
      <div className="mx-auto w-full px-6 max-w-[1280px]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="font-heading text-4xl md:text-6xl tracking-tight text-foreground text-center mb-16"
        >
          {title}
        </motion.h2>
        <motion.div
          ref={ref}
          initial="initial"
          animate={controls}
          variants={{
            initial: {},
            animate: {
              transition: {
                staggerChildren: 0.12,
              },
            },
          }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-center"
        >
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || Zap;
            return (
              <motion.div
                key={index}
                variants={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              >
                <Card className="bg-black/30 border border-white/10 backdrop-blur p-8 h-full hover:shadow-[0_0_40px_rgba(56,189,248,0.25)] hover:-translate-y-1 transition-all duration-300 rounded-3xl">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <IconComponent className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-heading text-xl font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="font-body text-base text-muted-foreground">
                      {feature.desc}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export const config = {
  fields: {
    title: {
      type: 'text',
      label: 'Section Title',
    },
    features: {
      type: 'array',
      label: 'Features',
      arrayFields: {
        icon: {
          type: 'select',
          label: 'Icon',
          options: [
            { label: 'Zap', value: 'zap' },
            { label: 'Target', value: 'target' },
            { label: 'Shield', value: 'shield' },
            { label: 'Code', value: 'code' },
          ],
        },
        title: {
          type: 'text',
          label: 'Feature Title',
        },
        desc: {
          type: 'textarea',
          label: 'Feature Description',
        },
      },
    },
  },
  defaultProps: {
    title: '为什么选择灵创',
    features: [
      {
        icon: 'zap',
        title: '毫秒级响应',
        desc: '边缘计算架构，实时处理',
      },
      {
        icon: 'target',
        title: '超高精度',
        desc: '深度学习模型，持续优化',
      },
      {
        icon: 'shield',
        title: '工业级稳定',
        desc: '7×24小时不间断运行',
      },
      {
        icon: 'code',
        title: '灵活集成',
        desc: '标准API，快速对接产线',
      },
    ],
  },
};

export default FeaturesSection;