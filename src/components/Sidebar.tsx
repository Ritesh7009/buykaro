import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  TrendingDown,
  Scale,
  ListPlus,
  ShoppingBag,
  X,
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'explore'
  | 'recommendations'
  | 'price_intelligence'
  | 'compare'
  | 'manage';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  compareCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  compareCount,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" strokeWidth={1.8} />,
    },
    {
      id: 'explore',
      label: 'Explore Marketplace',
      icon: <Compass className="w-4 h-4 shrink-0" strokeWidth={1.8} />,
    },
    {
      id: 'recommendations',
      label: 'Smart Recommendations',
      icon: <Sparkles className="w-4 h-4 shrink-0" strokeWidth={1.8} />,
    },
    {
      id: 'price_intelligence',
      label: 'Price Intelligence',
      icon: <TrendingDown className="w-4 h-4 shrink-0" strokeWidth={1.8} />,
    },
    {
      id: 'compare',
      label: 'Compare Products',
      icon: <Scale className="w-4 h-4 shrink-0" strokeWidth={1.8} />,
      badge: compareCount > 0 ? compareCount : undefined,
    },
    {
      id: 'manage',
      label: 'Manage Listings',
      icon: <ListPlus className="w-4 h-4 shrink-0" strokeWidth={1.8} />,
    },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-[#FFFFFF] border-r border-[#E7EAE6] w-64 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-[#E7EAE6]">
        <button
          onClick={() => handleNavClick('overview')}
          className="flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-[#315C48] text-white flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4" strokeWidth={2} />
          </div>
          <div>
            <span className="block text-[15px] font-semibold text-[#202521] tracking-tight leading-none">
              CampusCart
            </span>
            <span className="block text-[11px] text-[#737A75] mt-1 leading-none">
              Student Marketplace
            </span>
          </div>
        </button>

        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-[#737A75] hover:text-[#202521] rounded-md hover:bg-[#F8F9F7]"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                isActive
                  ? 'bg-[#EBF2EE] text-[#315C48]'
                  : 'text-[#202521] hover:bg-[#F8F9F7] hover:text-[#202521]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-[#315C48]' : 'text-[#737A75]'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-[#315C48] text-white tabular-nums">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Dataset Attribution Footer */}
      <div className="p-4 border-t border-[#E7EAE6]">
        <div className="bg-[#F8F9F7] rounded-lg p-3 border border-[#E7EAE6]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-[#737A75] uppercase tracking-wider">
              Data Scope
            </span>
            <span className="text-[10px] font-medium text-[#737A75] bg-[#E7EAE6] px-1.5 py-0.5 rounded">
              Demo Sample
            </span>
          </div>
          <p className="text-xs text-[#737A75] leading-relaxed">
            Medians calculated directly from active listings in this dataset.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:block h-screen shrink-0 sticky top-0 z-30">
        {content}
      </aside>

      {/* Mobile drawer overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full">{content}</div>
        </div>
      )}
    </>
  );
};
