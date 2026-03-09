"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import { NumberTicker } from '@/components/magic/number-ticker';
import { useInViewReveal } from '@/lib/motion';
import { motion } from 'framer-motion';

interface Stat {
  value: string;
  label: string;
}

interface StatsSectionProps {
  stats: Stat[];
}

const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  const { ref, controls } = useInViewReveal();

  const extractNumber = (value: string) => {
    const match = value.match(/([0-9.]+)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const extractSuffix = (value: string) => {
    return value.replace(/[0-9.]+/, '');
  };

  return (
    <section className="py-24 bg-slate-950/60">
      <div className="mx-auto w-full px-6 max-w-[1400px]">
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={controls}
          transition={{ staggerChildren: 0.14 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-center"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={`stat-${index}-${stat.label}`}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.14 }}
            >
              <Card className="bg-black/30 border border-white/10 backdrop-blur p-8 text-center hover:shadow-[0_0_40px_rgba(56,189,248,0.25)] transition-shadow duration-500">
                <div className="font-heading text-4xl md:text-5xl tracking-tight text-foreground mb-3">
                  <NumberTicker value={extractNumber(stat.value)} />
                  <span>{extractSuffix(stat.value)}</span>
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
};

export default StatsSection;

export const config = {
  fields: {
    stats: {
      type: 'array',
      arrayFields: {
        value: { type: 'text', label: '数值' },
        label: { type: 'text', label: '标签' }
      },
      label: '统计数据',
      defaultItemProps: {
        value: '99.8%',
        label: '检测精准率'
      }
    }
  },
  defaultProps: {
    stats: [
      { value: '99.8%', label: '检测精准率' },
      { value: '3ms', label: '单次检测耗时' },
      { value: '500+', label: '企业客户' },
      { value: '2000万+', label: '日检测量' }
    ]
  }
};
