import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface KPIAnimatedCardProps {
  title: string;
  rawValue: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  change: string;
  isPositive: boolean;
  icon: LucideIcon;
  subtitle: string;
  onClick?: () => void;
  accentColor?: string;
  glowColor?: string;
}

export const KPIAnimatedCard: React.FC<KPIAnimatedCardProps> = ({
  title,
  rawValue,
  prefix = '',
  suffix = '',
  decimals = 0,
  change,
  isPositive,
  icon: Icon,
  subtitle,
  onClick,
  accentColor = '#6366f1',
  glowColor = 'rgba(99,102,241,0.15)',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const [hovered, setHovered] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 900;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(easedProgress * rawValue);
      if (progress < 1) {
        rafRef.current = window.requestAnimationFrame(step);
      } else {
        setDisplayValue(rawValue);
      }
    };
    rafRef.current = window.requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [rawValue]);

  const formattedValue =
    prefix +
    displayValue.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) +
    suffix;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 340, damping: 24 }}
      whileHover={{ y: -4, scale: 1.02 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      className={`relative overflow-hidden rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl p-5 flex flex-col justify-between shadow-lg ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        boxShadow: hovered
          ? `0 20px 40px -8px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.8), 0 0 32px -4px ${glowColor}`
          : `0 8px 24px -6px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.6)`,
        transition: 'box-shadow 0.35s ease',
      }}
    >
      {/* Animated gradient blob behind content */}
      <motion.div
        animate={{
          scale: hovered ? 1.3 : 1,
          opacity: hovered ? 0.25 : 0.1,
        }}
        transition={{ duration: 0.5 }}
        className="absolute -right-6 -top-6 w-28 h-28 rounded-full pointer-events-none blur-2xl"
        style={{ background: accentColor }}
      />

      {/* Shimmer scan line on hover */}
      <motion.div
        initial={{ x: '-100%', opacity: 0 }}
        animate={hovered ? { x: '200%', opacity: [0, 0.08, 0] } : { x: '-100%', opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white to-transparent skew-x-12 pointer-events-none"
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-tight max-w-[70%]">
            {title}
          </span>
          <motion.div
            animate={{ rotate: hovered ? 8 : 0, scale: hovered ? 1.1 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="p-2.5 rounded-2xl shrink-0"
            style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}
          >
            <Icon className="w-4 h-4" style={{ color: accentColor }} />
          </motion.div>
        </div>

        {/* Animated counting value */}
        <div className="text-3xl font-black text-slate-900 tracking-tight font-mono leading-none mb-1">
          {formattedValue}
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between mt-3 pt-3 border-t border-slate-100/80">
        <div className={`flex items-center gap-1 text-[11px] font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{change}</span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">{subtitle}</span>
      </div>

      {/* Bottom accent line */}
      <motion.div
        animate={{ scaleX: hovered ? 1 : 0.3, opacity: hovered ? 1 : 0.4 }}
        transition={{ duration: 0.4 }}
        className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-3xl origin-left"
        style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
      />
    </motion.div>
  );
};
