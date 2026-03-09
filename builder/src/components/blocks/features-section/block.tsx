"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Brain, Zap, Shield, Layers, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInViewReveal } from '@/lib/motion';

const iconMap = {
  brain: Brain,
  zap: Zap,
  shield: Shield,
  layers: Layers,
  'trending-up': TrendingUp,
  users: Users,
};

const FeaturesSection = ({ title, features }) => {
  const { ref, controls } = useInViewReveal();

  return (
    <section className="py-24 bg-slate-950/60">
      <div className="mx-auto w-full px-6 max-w-[1400px]">
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="font-heading text-4xl md:text-6xl tracking-tight text-foreground text-center mb-16"
        >
          {title}
        </motion.h2>
        <motion.div
          ref={ref}
          initial={{}}
          animate={controls}
          transition={{ staggerChildren: 0.14 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-center"
        >
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || Brain;
            return (
              <motion.div
                key={`feature-${index}`}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <Card className="bg-black/30 border border-white/10 backdrop-blur p-8 h-full hover:shadow-[0_0_40px_rgba(56,189,248,0.25)] hover:-translate-y-1 transition-all duration-300 rounded-3xl">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <IconComponent className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-heading text-xl font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="font-body text-base text-muted-foreground leading-relaxed">
                      {feature.description}
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
            { label: 'Brain', value: 'brain' },
            { label: 'Zap', value: 'zap' },
            { label: 'Shield', value: 'shield' },
            { label: 'Layers', value: 'layers' },
            { label: 'Trending Up', value: 'trending-up' },
            { label: 'Users', value: 'users' },
          ],
        },
        title: {
          type: 'text',
          label: 'Feature Title',
        },
        description: {
          type: 'textarea',
          label: 'Feature Description',
        },
      },
      defaultItemProps: {
        icon: 'brain',
        title: 'Feature Title',
        description: 'Feature description',
      },
    },
  },
  defaultProps: {
    title: '为什么选择灵创智能',
    features: [
      {
        icon: 'brain',
        title: '深度学习算法',
        description: '自研卷积神经网络,支持小样本学习与迁移训练,适配多种缺陷类型',
      },
      {
        icon: 'zap',
        title: '毫秒级响应',
        description: '边缘计算架构,单帧处理<3ms,满足高速产线实时检测需求',
      },
      {
        icon: 'shield',
        title: '工业级可靠性',
        description: 'IP67防护等级,-20°C~60°C工作温度,7×24小时稳定运行',
      },
      {
        icon: 'layers',
        title: '灵活部署',
        description: '支持本地/云端/混合部署,无缝对接MES/ERP系统',
      },
      {
        icon: 'trending-up',
        title: '持续优化',
        description: '生产数据自动回流,模型持续迭代,检测精度随使用提升',
      },
      {
        icon: 'users',
        title: '专家服务',
        description: '10年视觉检测经验团队,提供定制化算法训练与现场调优',
      },
    ],
  },
};

export default FeaturesSection;