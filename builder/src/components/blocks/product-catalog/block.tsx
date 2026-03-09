"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GradientText } from '@/components/magic/gradient-text';
import { motion } from 'framer-motion';
import { useInViewReveal } from '@/lib/motion';
import { ArrowRight, Cpu, Layers, ScanLine } from 'lucide-react';

const themeClassMap = {
  container: 'mx-auto w-full px-6 max-w-[1280px]',
  sectionPadding: 'py-24',
  heading: 'font-heading text-4xl md:text-6xl tracking-tight text-foreground',
  body: 'font-body text-base md:text-lg text-muted-foreground',
  card: 'bg-black/30 border border-white/10 backdrop-blur',
  glow: 'shadow-[0_0_40px_rgba(56,189,248,0.25)]'
};

const motionPresets = {
  fadeUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: 'easeOut' }
  },
  stagger: {
    initial: {},
    animate: { transition: { staggerChildren: 0.12 } }
  }
};

const iconMap = {
  'camera': Cpu,
  'platform': Layers,
  'system': ScanLine
};

export default function ProductCatalog({ title, description, products, cta }) {
  const { ref, controls } = useInViewReveal();

  return (
    <section className={`${themeClassMap.sectionPadding} bg-slate-950/60`}>
      <div className={themeClassMap.container}>
        <motion.div
          ref={ref}
          initial={motionPresets.stagger.initial}
          animate={controls}
          variants={motionPresets.stagger}
          className="space-y-16"
        >
          <motion.div variants={motionPresets.fadeUp} className="text-center space-y-4">
            <h2 className={themeClassMap.heading}>
              <GradientText>{title}</GradientText>
            </h2>
            {description && (
              <p className={`${themeClassMap.body} max-w-2xl mx-auto`}>
                {description}
              </p>
            )}
          </motion.div>

          <motion.div
            variants={motionPresets.stagger}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {products.map((product, index) => {
              const IconComponent = iconMap[product.iconKey] || Cpu;
              return (
                <motion.div key={product.name} variants={motionPresets.fadeUp}>
                  <Card className={`${themeClassMap.card} relative overflow-hidden group hover:${themeClassMap.glow} transition-all duration-500 h-full`}>
                    <div className="p-8 space-y-6">
                      <div className="aspect-video relative rounded-lg overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <h3 className="text-xl font-heading font-semibold text-foreground">
                            {product.name}
                          </h3>
                        </div>
                        <p className={themeClassMap.body}>
                          {product.desc}
                        </p>
                      </div>

                      {product.specs && product.specs.length > 0 && (
                        <div className="pt-4 border-t border-white/10 space-y-2">
                          {product.specs.map((spec) => (
                            <div key={spec} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="w-1 h-1 rounded-full bg-accent" />
                              <span>{spec}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <Button
                        variant="link"
                        className="group/btn p-0 h-auto text-accent hover:text-accent/80"
                      >
                        了解详情
                        <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {cta && (
            <motion.div variants={motionPresets.fadeUp} className="text-center">
              <Button
                size="lg"
                className={`${themeClassMap.glow} bg-primary hover:bg-primary/90 text-primary-foreground font-medium`}
              >
                {cta.label}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          )}
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
    products: {
      type: 'array',
      label: '产品列表',
      arrayFields: {
        name: { type: 'text', label: '产品名称' },
        desc: { type: 'textarea', label: '产品描述' },
        image: { type: 'text', label: '产品图片' },
        iconKey: {
          type: 'select',
          label: '图标',
          options: [
            { label: '相机', value: 'camera' },
            { label: '平台', value: 'platform' },
            { label: '系统', value: 'system' }
          ]
        },
        specs: {
          type: 'array',
          label: '规格特性',
          arrayFields: {
            spec: { type: 'text' }
          }
        }
      },
      defaultItemProps: {
        name: '产品名称',
        desc: '产品描述',
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
        iconKey: 'camera',
        specs: []
      }
    },
    cta: {
      type: 'object',
      label: '行动号召',
      objectFields: {
        label: { type: 'text', label: '按钮文字' },
        href: { type: 'text', label: '链接地址' }
      }
    }
  },
  defaultProps: {
    title: '全场景AI视觉解决方案',
    description: '从边缘智能到云端算法，为工业质检提供端到端视觉智能',
    products: [
      {
        name: '工业智能相机',
        desc: '高速成像+边缘计算，实时缺陷检测',
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
        iconKey: 'camera',
        specs: ['200fps高速采集', '边缘AI推理', 'IP67防护']
      },
      {
        name: '缺陷识别平台',
        desc: '深度学习算法引擎，毫秒级精准判定',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
        iconKey: 'platform',
        specs: ['99.8%识别率', '自适应学习', '多场景模型']
      },
      {
        name: '视觉检测系统',
        desc: '全流程质量管控，数据闭环追溯',
        image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80',
        iconKey: 'system',
        specs: ['全链路追溯', '云端协同', 'MES对接']
      }
    ],
    cta: {
      label: '查看全部产品',
      href: '/products'
    }
  }
};
