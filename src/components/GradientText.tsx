'use client';

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  variant?: 'primary' | 'accent' | 'success' | 'info';
  className?: string;
  animate?: boolean;
}

/**
 * 2026 Gradient Text Component
 *
 * Premium gradient text with optional animation
 *
 * @param variant - Color gradient variant
 * @param animate - Enable entrance animation
 * @param className - Additional CSS classes
 */
export default function GradientText({
  children,
  variant = 'primary',
  className = '',
  animate = true,
}: GradientTextProps) {
  const gradientClass = variant === 'primary' ? 'text-gradient' :
                        variant === 'accent' ? 'text-gradient-accent' :
                        variant === 'success' ? 'text-gradient-success' :
                        'text-gradient';

  const Component = animate ? motion.span : 'span';

  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      delay: 0.1,
    },
  } : {};

  return (
    <Component
      className={`${gradientClass} ${className}`}
      {...animationProps}
    >
      {children}
    </Component>
  );
}
