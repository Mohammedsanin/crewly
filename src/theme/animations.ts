import { Variants, Transition } from 'framer-motion';

// Page Route Transitions
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1], // ease-out curve
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.15,
      ease: [0.7, 0, 0.84, 0], // ease-in curve
    },
  },
};

// KPI Cards Staggered Container & Items
export const kpiContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

export const kpiCardVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Modal Entrance
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.15 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.12, delay: 0.05 },
  },
};

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 8,
    transition: {
      duration: 0.15,
      ease: [0.7, 0, 0.84, 0],
    },
  },
};

// Kanban Card Variants
export const kanbanCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.15 },
  },
};

// Credential Reveal Card Entrance
export const credentialCardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 25,
    },
  },
};

// Toast Notifications
export const toastVariants: Variants = {
  initial: { opacity: 0, x: 50, scale: 0.95 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    x: 30,
    scale: 0.95,
    transition: { duration: 0.15, ease: [0.7, 0, 0.84, 0] },
  },
};

// Checkmark Pulse Micro-animation
export const checkmarkPulseVariants: Variants = {
  initial: { scale: 0.6, opacity: 0 },
  animate: {
    scale: [0.6, 1.25, 1],
    opacity: 1,
    transition: { duration: 0.3, times: [0, 0.6, 1] },
  },
};
