import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TextMorphProps {
  children: string;
  className?: string;
}

export const TextMorph: React.FC<TextMorphProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`relative inline-block overflow-hidden ${className}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={children}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};
