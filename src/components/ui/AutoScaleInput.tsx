import React, { useRef, useEffect } from 'react';

interface AutoScaleInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  className?: string;
}

export const AutoScaleInput: React.FC<AutoScaleInputProps> = ({
  value,
  onChange,
  min = 100,
  max = 150000,
  step = 500,
  prefix = '₹',
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Compute scale based on digit count
  const strVal = value ? value.toString() : '';
  const charCount = strVal.length;

  const getFontSize = () => {
    if (charCount <= 4) return 'text-xl sm:text-2xl';
    if (charCount <= 6) return 'text-lg sm:text-xl';
    return 'text-base sm:text-lg';
  };

  return (
    <div
      className={`relative inline-flex items-center bg-[#F8F9F7] border border-[#E7EAE6] focus-within:border-[#315C48] focus-within:bg-white rounded-lg px-3 py-2 transition-all ${className}`}
    >
      {prefix && (
        <span className="text-[#737A75] font-semibold mr-1.5 select-none text-base sm:text-lg">
          {prefix}
        </span>
      )}
      <input
        ref={inputRef}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value || ''}
        onChange={(e) => {
          const val = Number(e.target.value);
          onChange(isNaN(val) ? 0 : val);
        }}
        className={`bg-transparent font-semibold text-[#202521] focus:outline-none tabular-nums w-full ${getFontSize()}`}
        placeholder="0"
      />
    </div>
  );
};
