import React from 'react';
import { BookOpen, Laptop, Bike, Headphones, Armchair, Package } from 'lucide-react';
import { Category } from '../types';

interface CategoryPlaceholderProps {
  category: Category;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CategoryPlaceholder: React.FC<CategoryPlaceholderProps> = ({
  category,
  className = '',
  size = 'md',
}) => {
  const getTheme = () => {
    switch (category) {
      case 'Textbooks & Books':
        return {
          bg: 'bg-[#F2EFF8]',
          border: 'border-[#E5DFEF]',
          text: 'text-[#584882]',
          tag: 'BOOK',
          icon: <BookOpen className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} strokeWidth={1.5} />,
        };
      case 'Laptops & Computing':
        return {
          bg: 'bg-[#EDF2FA]',
          border: 'border-[#DAE3F5]',
          text: 'text-[#4058D6]',
          tag: 'COMPUTING',
          icon: <Laptop className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} strokeWidth={1.5} />,
        };
      case 'Bicycles & Mobility':
        return {
          bg: 'bg-[#F0F5EE]',
          border: 'border-[#DDE8D9]',
          text: 'text-[#3E6335]',
          tag: 'MOBILITY',
          icon: <Bike className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} strokeWidth={1.5} />,
        };
      case 'Audio & Gadgets':
        return {
          bg: 'bg-[#F9F3EE]',
          border: 'border-[#F2E5D9]',
          text: 'text-[#A05C2E]',
          tag: 'AUDIO',
          icon: <Headphones className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} strokeWidth={1.5} />,
        };
      case 'Dorm Essentials':
        return {
          bg: 'bg-[#F6F4ED]',
          border: 'border-[#E9E4D3]',
          text: 'text-[#696147]',
          tag: 'DORM',
          icon: <Armchair className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} strokeWidth={1.5} />,
        };
      default:
        return {
          bg: 'bg-[#F4F2EC]',
          border: 'border-[#E8E5DD]',
          text: 'text-[#777A75]',
          tag: 'CAMPUS',
          icon: <Package className="w-5 h-5" strokeWidth={1.5} />,
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-lg border transition-colors select-none ${theme.bg} ${theme.border} ${className}`}
    >
      <div className="flex items-center gap-2">
        <div className={theme.text}>{theme.icon}</div>
        <span className="text-[11px] font-semibold tracking-wide text-[#202321] truncate">
          {category}
        </span>
      </div>

      <span className="text-[9px] font-mono tracking-widest uppercase font-semibold opacity-60 text-[#777A75]">
        {theme.tag}
      </span>
    </div>
  );
};
