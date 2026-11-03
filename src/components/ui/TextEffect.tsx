import React from 'react';
import { motion } from 'motion/react';

interface TextEffectProps {
  children: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'span';
  delay?: number;
}

export const TextEffect: React.FC<TextEffectProps> = ({
  children,
  className = '',
  as = 'h2',
  delay = 0,
}) => {
  const Component = motion[as];

  return (
    <Component
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </Component>
  );
};
