"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useInViewReveal } from '@/lib/motion';

export default function ProductShowcase({ title, description, products }) {
  const { ref, controls } = useInViewReveal();

  const fadeUpVariant = {
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: 'easeOut' }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.14
      }
    }
  };

  return (
    <section className="py-24 bg-slate-950/60">
      <div className="mx-auto w-full px-6 max-w-[1400px]">
        <motion.div
          initial="initial"
          animate={controls}
          variants={fadeUpVariant}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-4xl md:text-6xl tracking-tight text-foreground mb-4">
            {title}
          </h2>
          {description && (
            <p className="font-body text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </motion.div>

        <motion.div
          ref={ref}
          initial="initial"
          animate={controls}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-center"
        >
          {products.map((product, index) => (
            <motion.div key={product.name || index} variants={fadeUpVariant}>
              <Card className="relative bg-black/30 border border-white/10 backdrop-blur overflow-hidden group hover:border-white/20 transition-all duration-500">
                
                <div className="aspect-[4/3] overflow-hidden bg-slate-900/50">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-heading text-xl md:text-2xl text-foreground mb-2">
                      {product.name}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground">
                      {product.tagline}
                    </p>
                  </div>

                  {product.cta && (
                    <Button
                      variant="outline"
                      className="w-full border-white/10 hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_40px_rgba(56,189,248,0.25)] transition-all duration-300"
                    >
                      {product.cta}
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
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
        name: {
          type: 'text',
          label: '产品名称'
        },
        tagline: {
          type: 'text',
          label: '产品标语'
        },
        image: {
          type: 'text',
          label: '产品图片'
        },
        cta: {
          type: 'text',
          label: 'CTA文案'
        }
      }
    }
  },
  defaultProps: {
    title: '全场景AI视觉解决方案',
    description: '从工业相机到算法引擎，为制造业提供端到端智能检测能力',
    products: [
      {
        name: '灵眸Pro工业相机',
        tagline: '2000万像素 | 120fps高速采集',
        image: 'https://images.unsplash.com/photo-1606166325683-7e92e3f6c0e8?w=800&h=600&fit=crop',
        cta: '了解详情'
      },
      {
        name: '智检AI算法引擎',
        tagline: '深度学习 | 自适应训练',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
        cta: '技术白皮书'
      },
      {
        name: '云端检测平台',
        tagline: '实时监控 | 数据可视化',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
        cta: '申请试用'
      }
    ]
  }
};
