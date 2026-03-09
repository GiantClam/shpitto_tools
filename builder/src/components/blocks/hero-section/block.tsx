"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { TextReveal } from '@/components/magic/text-reveal';
import { Particles } from '@/components/magic/particles';
import { motion } from 'framer-motion';
import { useParallaxY } from '@/lib/motion';

export default function HeroSection({
  headline,
  subheadline,
  ctaPrimary,
  ctaSecondary,
  ctaPrimaryHref,
  ctaSecondaryHref,
  imageUrl,
  imageAlt
}) {
  const { ref: parallaxRef, y } = useParallaxY({ intensity: 0.18, clamp: 90 });

  return (
    <section className="py-24 relative bg-gradient-to-br from-slate-900 via-slate-950 to-black overflow-hidden">
      <Particles className="absolute inset-0" color="#38bdf8" />
      
      <div className="mx-auto w-full px-6 max-w-[1280px] relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-8 items-center">
          <motion.div
            className="lg:col-span-6 xl:col-span-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <TextReveal className="font-heading text-[56px] md:text-[88px] lg:text-[112px] leading-[0.9] tracking-[-0.02em] tracking-tight text-foreground mb-6">
              {headline}
            </TextReveal>
            
            <p className="font-body text-base md:text-lg text-muted-foreground mb-8 max-w-xl">
              {subheadline}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="py-4 px-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_40px_rgba(56,189,248,0.25)] transition-all duration-300"
              >
                <a href={ctaPrimaryHref}>{ctaPrimary}</a>
              </Button>
              
              <Button
                asChild
                variant="outline"
                size="lg"
                className="py-4 px-8 border-white/10 text-foreground hover:bg-white/5"
              >
                <a href={ctaSecondaryHref}>{ctaSecondary}</a>
              </Button>
            </div>
          </motion.div>
          
          <motion.div
            ref={parallaxRef}
            className="lg:col-span-6 xl:col-span-6"
            style={{ y }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
          >
            <div className="relative rounded-lg overflow-hidden bg-black/30 border border-white/10 backdrop-blur">
              <img
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export const config = {
  fields: {
    headline: {
      type: 'text',
      label: '主标题'
    },
    subheadline: {
      type: 'textarea',
      label: '副标题'
    },
    ctaPrimary: {
      type: 'text',
      label: '主按钮文案'
    },
    ctaSecondary: {
      type: 'text',
      label: '次按钮文案'
    },
    ctaPrimaryHref: {
      type: 'text',
      label: '主按钮链接'
    },
    ctaSecondaryHref: {
      type: 'text',
      label: '次按钮链接'
    },
    imageUrl: {
      type: 'text',
      label: '产品图片 URL'
    },
    imageAlt: {
      type: 'text',
      label: '图片描述'
    }
  },
  defaultProps: {
    headline: 'AI视觉，重塑工业检测标准',
    subheadline: '毫秒级缺陷识别，99.8%精准率，让质量管控进入智能时代',
    ctaPrimary: '预约演示',
    ctaSecondary: '查看案例',
    ctaPrimaryHref: '/contact',
    ctaSecondaryHref: '/use-cases',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=800&fit=crop&q=80',
    imageAlt: '灵创智能AI视觉检测系统工业应用场景'
  }
};
