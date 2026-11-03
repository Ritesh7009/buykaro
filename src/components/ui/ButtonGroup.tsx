import React from 'react';

export interface ButtonGroupItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface ButtonGroupProps {
  items: ButtonGroupItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  items,
  value,
  onChange,
  className = '',
  size = 'sm',
}) => {
  const py = size === 'sm' ? 'py-1.5' : 'py-2';
  const px = size === 'sm' ? 'px-2.5 sm:px-3' : 'px-3.5';

  return (
    <div
      role="group"
      className={`inline-flex rounded-lg border border-[#E7EAE6] bg-[#F8F9F7] p-0.5 ${className}`}
    >
      {items.map((item, index) => {
        const isSelected = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`${py} ${px} text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315C48] ${
              isSelected
                ? 'bg-white text-[#202521] shadow-xs font-semibold'
                : 'text-[#737A75] hover:text-[#202521]'
            }`}
          >
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
