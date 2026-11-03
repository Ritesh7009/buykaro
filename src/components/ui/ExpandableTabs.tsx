import React from 'react';
import { motion } from 'motion/react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface ExpandableTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  layoutId?: string;
  className?: string;
}

export const ExpandableTabs: React.FC<ExpandableTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  layoutId = 'expandable-tab-indicator',
  className = '',
}) => {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center p-1 bg-[#F4F6F3] rounded-lg border border-[#E7EAE6] ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315C48] ${
              isActive ? 'text-[#315C48]' : 'text-[#737A75] hover:text-[#202521]'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
                className="absolute inset-0 bg-white rounded-md shadow-xs border border-[#E7EAE6]"
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                    isActive
                      ? 'bg-[#EBF2EE] text-[#315C48]'
                      : 'bg-[#E7EAE6] text-[#737A75]'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};
