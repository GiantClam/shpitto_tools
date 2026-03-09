"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { NumberTicker } from '@/components/magic/number-ticker';
import { useInViewReveal } from '@/lib/motion';

export default function StatsSection({ stats }) {
  const { ref, controls } = useInViewReveal();

  return (
    <section className="py-24 bg-slate-950/60">
      <div className="mx-auto w-full px-6 max-w-[1280px]">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={controls}
          transition={{ staggerChildren: 0.12 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={`stat-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: index * 0.12 }}
            >
              <Card className="bg-black/30 border border-white/10 backdrop-blur p-8 text-center hover:shadow-[0_0_40px_rgba(56,189,248,0.25)] transition-shadow duration-300">
                <div className="font-heading text-4xl md:text-5xl tracking-tight text-foreground mb-2">
                  {stat.value.match(/\d+/) ? (
                    <>
                      <NumberTicker value={parseInt(stat.value.match(/\d+/)[0])} />
                      {stat.value.replace(/\d+/, '')}
                    </>
                  ) : (
                    stat.value
                  )}
                </div>
                <div className="font-body text-base text-muted-foreground">
                  {stat.label}
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
    stats: {
      type: 'array',
      label: 'Stats',
      arrayFields: {
        value: { type: 'text', label: 'Value' },
        label: { type: 'text', label: 'Label' }
      }
    }
  },
  defaultProps: {
    stats: [
      { value: '500+', label: '企业客户' },
      { value: '99.8%', label: '检测精度' },
      { value: '3ms', label: '响应速度' },
      { value: '24/7', label: '全天候运行' }
    ]
  }
};