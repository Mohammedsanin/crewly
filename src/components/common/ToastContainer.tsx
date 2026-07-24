import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, XCircle, X, Sparkles } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Toast } from '../../types';

const toastConfig = {
  success: {
    icon: CheckCircle2,
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    border: 'border-emerald-400/40',
    glow: 'shadow-emerald-500/20',
    progress: 'from-emerald-400 to-teal-400',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/15 ring-1 ring-emerald-500/30',
    accent: '#10b981',
    label: 'Success',
  },
  error: {
    icon: XCircle,
    gradient: 'from-rose-500/20 via-red-500/10 to-transparent',
    border: 'border-rose-400/40',
    glow: 'shadow-rose-500/20',
    progress: 'from-rose-400 to-pink-400',
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/15 ring-1 ring-rose-500/30',
    accent: '#f43f5e',
    label: 'Error',
  },
  warning: {
    icon: AlertTriangle,
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    border: 'border-amber-400/40',
    glow: 'shadow-amber-500/20',
    progress: 'from-amber-400 to-orange-400',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/15 ring-1 ring-amber-500/30',
    accent: '#f59e0b',
    label: 'Warning',
  },
  info: {
    icon: Info,
    gradient: 'from-indigo-500/20 via-violet-500/10 to-transparent',
    border: 'border-indigo-400/40',
    glow: 'shadow-indigo-500/20',
    progress: 'from-indigo-400 to-violet-400',
    iconColor: 'text-indigo-400',
    iconBg: 'bg-indigo-500/15 ring-1 ring-indigo-500/30',
    accent: '#6366f1',
    label: 'Info',
  },
};

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { removeToast } = useERP();
  const duration = toast.duration || 4500;
  const config = toastConfig[toast.type];
  const Icon = config.icon;
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (hovered) return;
    const timer = setTimeout(() => removeToast(toast.id), duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, removeToast, hovered]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.88, filter: 'blur(4px)' }}
      animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: 80, scale: 0.92, filter: 'blur(4px)' }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative overflow-hidden w-[22rem] rounded-2xl
        bg-slate-900/95 backdrop-blur-2xl
        border ${config.border}
        shadow-2xl ${config.glow}
        flex items-start gap-3.5
        p-4
        cursor-default
      `}
      style={{
        boxShadow: `0 20px 40px -10px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px -4px ${config.accent}33`,
      }}
    >
      {/* Left gradient accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
        style={{ background: `linear-gradient(180deg, ${config.accent}, transparent)` }}
      />

      {/* Subtle background gradient bloom */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} pointer-events-none`} />

      {/* Icon */}
      <div className={`relative mt-0.5 p-2 rounded-xl ${config.iconBg} shrink-0`}>
        <Icon className={`w-4 h-4 ${config.iconColor}`} strokeWidth={2.5} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 relative z-10">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`text-[9px] font-black uppercase tracking-widest ${config.iconColor} opacity-80`}>
            {config.label}
          </span>
        </div>
        <h4 className="text-sm font-bold text-slate-100 leading-snug">{toast.title}</h4>
        {toast.message && (
          <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">{toast.message}</p>
        )}
      </div>

      {/* Close Button */}
      <motion.button
        whileHover={{ scale: 1.15, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => removeToast(toast.id)}
        className="relative z-10 shrink-0 mt-0.5 p-1.5 rounded-xl text-slate-500 hover:text-slate-200 hover:bg-white/10 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </motion.button>

      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: hovered ? 0 : duration / 1000, ease: 'linear' }}
        className={`absolute bottom-0 left-0 right-0 h-[2px] origin-left bg-gradient-to-r ${config.progress} opacity-80`}
      />
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useERP();

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none">
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
