import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Scale, Check, MapPin, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { CategoryPlaceholder } from '../CategoryPlaceholder';
import { calculateDiscount } from '../../utils/analysis';
import { formatINR, formatAge } from '../../utils/format';

interface ShiftCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  isCompared?: boolean;
  onToggleCompare?: (product: Product) => void;
  className?: string;
  isFeatured?: boolean;
}

export const ShiftCard: React.FC<ShiftCardProps> = ({
  product,
  onViewDetails,
  isCompared = false,
  onToggleCompare,
  className = '',
  isFeatured = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const discount = calculateDiscount(product.currentPrice, product.originalPrice);

  const getConditionStyle = (cond: string) => {
    switch (cond) {
      case 'Like New':
        return 'text-[#3E6335] bg-[#F0F5EE] border-[#DDE8D9]';
      case 'Excellent':
        return 'text-[#4058D6] bg-[#EDF2FA] border-[#DAE3F5]';
      case 'Good':
        return 'text-[#696147] bg-[#F6F4ED] border-[#E9E4D3]';
      case 'Fair':
      default:
        return 'text-[#777A75] bg-[#F4F2EC] border-[#E8E5DD]';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={`group relative flex flex-col bg-white border border-[#E8E5DD] rounded-xl hover:border-[#4058D6]/40 transition-shadow duration-200 hover:shadow-md hover:shadow-black/3 overflow-hidden h-full ${
        isFeatured ? 'ring-1 ring-[#4058D6]/30' : ''
      } ${className}`}
    >
      {/* Category Placeholder Header with subtle zoom */}
      <div className="relative p-3 bg-[#FAF8F5] border-b border-[#E8E5DD] overflow-hidden">
        <div className="transition-transform duration-300 group-hover:scale-[1.02]">
          <CategoryPlaceholder
            category={product.category}
            className="w-full h-18"
            size="sm"
          />
        </div>

        {/* Top Floating Actions: Quick compare toggle & Featured badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
          {onToggleCompare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(product);
              }}
              title={isCompared ? 'Remove from comparison' : 'Add to comparison'}
              className={`p-1.5 rounded-lg border text-xs transition-all shadow-xs ${
                isCompared
                  ? 'bg-[#4058D6] text-white border-[#4058D6]'
                  : 'bg-white/95 backdrop-blur-xs text-[#777A75] border-[#E8E5DD] hover:text-[#202321] hover:border-[#4058D6]'
              }`}
            >
              {isCompared ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Unboxed Metadata: Condition Tag · Age in Years */}
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getConditionStyle(
                product.condition
              )}`}
            >
              {product.condition}
            </span>
            <span className="text-[#777A75] text-[11px] font-medium">
              {formatAge(product.ageYears)}
            </span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onViewDetails(product)}
            className="text-[14px] font-semibold text-[#202321] leading-snug line-clamp-2 hover:text-[#4058D6] cursor-pointer transition-colors"
          >
            {product.title}
          </h3>
        </div>

        {/* Pricing & Secondary Info */}
        <div className="pt-3 border-t border-[#E8E5DD] space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xl font-bold text-[#202321] tabular-nums tracking-tight">
                {formatINR(product.currentPrice)}
              </span>
              <span className="ml-2 text-xs text-[#777A75] line-through tabular-nums">
                {formatINR(product.originalPrice)}
              </span>
            </div>

            <span className="text-xs font-semibold text-[#4058D6] bg-[#EEF1FC] px-2 py-0.5 rounded-md tabular-nums">
              -{discount}%
            </span>
          </div>

          {/* Hover / Expand Detail Reveal */}
          <div className="flex items-center justify-between text-[11px] text-[#777A75] pt-0.5">
            <div className="flex items-center gap-1 truncate max-w-[170px]">
              <MapPin className="w-3 h-3 text-[#4058D6] shrink-0" />
              <span className="truncate">{product.campusLocation}</span>
            </div>

            <button
              type="button"
              onClick={() => onViewDetails(product)}
              className="font-semibold text-[#4058D6] hover:text-[#3146B8] inline-flex items-center gap-0.5 transition-colors"
            >
              <span>Inspect</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
