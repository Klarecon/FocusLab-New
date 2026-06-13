"use client";

import { useReducedMotion, motion, type Variants } from "framer-motion";

interface AnimatedEmojiProps {
  emoji: string;
  animation:
    | "pop"
    | "shake"
    | "pulse"
    | "bounce"
    | "spin"
    | "flicker"
    | "float"
    | "explode";
  size?: "sm" | "md" | "lg" | "xl";
  delay?: number;
  className?: string;
}

const sizeMap: Record<NonNullable<AnimatedEmojiProps["size"]>, string> = {
  sm: "1.2rem",
  md: "1.8rem",
  lg: "2.5rem",
  xl: "3.5rem",
};

const animationVariants: Record<AnimatedEmojiProps["animation"], Variants> = {
  pop: {
    initial: { scale: 0, opacity: 0 },
    animate: {
      scale: [0, 1.25, 1],
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.34, 1.56, 0.64, 1],
        times: [0, 0.6, 1],
      },
    },
  },

  shake: {
    initial: { rotate: 0 },
    animate: {
      rotate: [0, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  },

  pulse: {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.15, 1],
      transition: {
        duration: 1.2,
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
  },

  bounce: {
    initial: { y: 0 },
    animate: {
      y: [0, -16, 0],
      transition: {
        duration: 0.6,
        ease: [0.34, 1.56, 0.64, 1],
        repeat: Infinity,
        repeatDelay: 0.4,
      },
    },
  },

  spin: {
    initial: { rotate: 0 },
    animate: {
      rotate: 360,
      transition: {
        duration: 0.8,
        ease: "easeInOut",
      },
    },
  },

  flicker: {
    initial: { opacity: 1 },
    animate: {
      opacity: [1, 0.4, 1, 0.6, 1],
      transition: {
        duration: 0.8,
        ease: "linear",
        repeat: Infinity,
        repeatDelay: 0.5,
      },
    },
  },

  float: {
    initial: { y: 0 },
    animate: {
      y: [-8, 8, -8],
      transition: {
        duration: 3,
        ease: "easeInOut",
        repeat: Infinity,
      },
    },
  },

  explode: {
    initial: { scale: 0, rotate: 0, opacity: 0 },
    animate: {
      scale: [0, 1.5, 1],
      rotate: [0, 180, 360],
      opacity: [0, 1, 1],
      transition: {
        duration: 0.7,
        ease: [0.34, 1.56, 0.64, 1],
        times: [0, 0.5, 1],
      },
    },
  },
};

export default function AnimatedEmoji({
  emoji,
  animation,
  size = "md",
  delay = 0,
  className = "",
}: AnimatedEmojiProps) {
  const variants = animationVariants[animation];
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.span
      role="img"
      aria-hidden="true"
      className={`inline-flex items-center justify-center select-none ${className}`}
      style={{ fontSize: sizeMap[size], lineHeight: 1 }}
      variants={prefersReducedMotion ? undefined : variants}
      initial={prefersReducedMotion ? undefined : "initial"}
      animate={prefersReducedMotion ? undefined : "animate"}
      transition={prefersReducedMotion ? undefined : { delay }}
    >
      {emoji}
    </motion.span>
  );
}
