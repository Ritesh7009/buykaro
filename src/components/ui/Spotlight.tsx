import React, { useRef, useState } from 'react';

interface SpotlightProps {
  children: React.ReactNode;
  className?: string;
  size?: number;
}

export const Spotlight: React.FC<SpotlightProps> = ({
  children,
  className = '',
  size = 320,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setPosition(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Subtle radial spotlight overlay */}
      {position && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-10"
          style={{
            background: `radial-gradient(${size}px circle at ${position.x}px ${position.y}px, rgba(49, 92, 72, 0.07), transparent 80%)`,
          }}
        />
      )}
      {children}
    </div>
  );
};
