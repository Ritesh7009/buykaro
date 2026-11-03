import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';

interface AnimatedNumberProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
  duration?: number;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  format,
  className = '',
  duration = 0.4,
}) => {
  const spring = useSpring(value, {
    stiffness: 120,
    damping: 18,
    mass: 0.6,
  });

  const [displayValue, setDisplayValue] = useState<string>(() =>
    format ? format(value) : Math.round(value).toString()
  );

  const prevValueRef = useRef(value);

  useEffect(() => {
    // Only animate if value actually changed
    if (prevValueRef.current !== value) {
      spring.set(value);
      prevValueRef.current = value;
    }
  }, [value, spring]);

  useEffect(() => {
    return spring.on('change', (latest) => {
      if (format) {
        setDisplayValue(format(latest));
      } else {
        setDisplayValue(Math.round(latest).toLocaleString('en-IN'));
      }
    });
  }, [spring, format]);

  return (
    <span className={`tabular-nums inline-block font-inherit ${className}`}>
      {displayValue}
    </span>
  );
};
