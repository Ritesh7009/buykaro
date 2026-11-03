import React from 'react';

interface ProgressiveBlurProps {
  position?: 'bottom' | 'top';
  className?: string;
  bgColor?: string;
}

export const ProgressiveBlur: React.FC<ProgressiveBlurProps> = ({
  position = 'bottom',
  className = '',
  bgColor = 'from-transparent to-white',
}) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute left-0 right-0 h-10 z-10 ${
        position === 'bottom'
          ? 'bottom-0 bg-gradient-to-b ' + bgColor
          : 'top-0 bg-gradient-to-t ' + bgColor
      } ${className}`}
    />
  );
};
