import React, { useRef } from 'react';
import { motion, useSpring } from 'motion/react';

interface MagneticProps {
  children: React.ReactElement<{ className?: string; style?: React.CSSProperties }>;
  strength?: number;
}

export const Magnetic: React.FC<MagneticProps> = ({
  children,
  strength = 0.18,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const x = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });
  const y = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    // Small subtle shift (clamped to max 5px)
    const deltaX = Math.max(-6, Math.min(6, (clientX - centerX) * strength));
    const deltaY = Math.max(-6, Math.min(6, (clientY - centerY) * strength));

    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
};
