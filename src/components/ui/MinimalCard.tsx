import React from 'react';
import { VercelTooltip } from './VercelTooltip';
import { Info } from 'lucide-react';

interface MinimalCardProps {
  label: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  tooltip?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export const MinimalCard: React.FC<MinimalCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  tooltip,
  trend,
  className = '',
}) => {
  return (
    <div
      className={`bg-white border border-[#E7EAE6] rounded-xl p-4 sm:p-5 flex items-start justify-between gap-3 transition-colors hover:border-[#D5DAD4] ${className}`}
    >
      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-xs text-[#737A75] font-medium">
          <span className="truncate">{label}</span>
          {tooltip && (
            <VercelTooltip content={tooltip}>
              <Info className="w-3.5 h-3.5 text-[#737A75] hover:text-[#202521] cursor-pointer" />
            </VercelTooltip>
          )}
        </div>

        <div className="text-2xl sm:text-3xl font-semibold text-[#202521] tabular-nums tracking-tight">
          {value}
        </div>

        {subtitle && (
          <div className="text-[12px] text-[#737A75] truncate">
            {subtitle}
          </div>
        )}

        {trend && (
          <div className="pt-0.5">
            <span
              className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                trend.isPositive
                  ? 'bg-[#EBF2EE] text-[#315C48]'
                  : 'bg-[#FDF2F2] text-[#B85C5C]'
              }`}
            >
              {trend.value}
            </span>
          </div>
        )}
      </div>

      {icon && (
        <div className="w-10 h-10 rounded-lg bg-[#F8F9F7] text-[#315C48] flex items-center justify-center shrink-0 border border-[#E7EAE6]">
          {icon}
        </div>
      )}
    </div>
  );
};
