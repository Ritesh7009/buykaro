import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, CheckCircle2, AlertCircle, TrendingDown, Scale } from 'lucide-react';
import { NavTab } from './Sidebar';

export interface NotificationItem {
  id: string;
  type: 'price_drop' | 'flag' | 'budget';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface TopNavProps {
  currentTab: NavTab;
  onOpenMobileMenu: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectTab: (tab: NavTab) => void;
  compareCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentTab,
  onOpenMobileMenu,
  searchQuery,
  onSearchChange,
  onSelectTab,
  compareCount,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n-1',
      type: 'price_drop',
      title: 'Price Anomaly: Casio fx-991CW',
      message: 'Calculator is priced at ₹850, which is 55% below original retail (₹1,895).',
      time: '15m ago',
      read: false,
    },
    {
      id: 'n-2',
      type: 'flag',
      title: 'Dataset Median Anomaly',
      message: 'MacBook Air M1 is listed at ₹48,000, 31% above the Laptops dataset median of ₹35,000.',
      time: '1h ago',
      read: false,
    },
    {
      id: 'n-3',
      type: 'budget',
      title: 'Recommendation Engine',
      message: 'Student listings under ₹5,000 found across Textbooks, Cycles, and Audio.',
      time: '3h ago',
      read: true,
    },
  ]);

  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getPageTitle = (tab: NavTab): { title: string; subtitle: string } => {
    switch (tab) {
      case 'overview':
        return {
          title: 'CampusCart Overview',
          subtitle: 'Student Marketplace & Price Intelligence',
        };
      case 'explore':
        return {
          title: 'Explore Marketplace',
          subtitle: 'Search and filter second-hand university listings',
        };
      case 'recommendations':
        return {
          title: 'Smart Recommendations',
          subtitle: 'Explainable, budget-aligned purchasing algorithms',
        };
      case 'price_intelligence':
        return {
          title: 'Price Intelligence',
          subtitle: 'Category median benchmarks & fair pricing analysis',
        };
      case 'compare':
        return {
          title: 'Compare Products',
          subtitle: 'Side-by-side metric evaluation & value rankings',
        };
      case 'manage':
        return {
          title: 'Manage Listings',
          subtitle: 'Post, edit, and audit second-hand campus items',
        };
    }
  };

  const { title } = getPageTitle(currentTab);

  return (
    <header className="sticky top-0 z-20 bg-[#FFFFFF] border-b border-[#E7EAE6] h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger + Page Breadcrumb/Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-[#737A75] hover:text-[#202521] rounded-lg hover:bg-[#F8F9F7]"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[#737A75] hidden sm:inline">
            CampusCart
          </span>
          <span className="text-xs text-[#E7EAE6] hidden sm:inline">/</span>
          <h1 className="text-base sm:text-lg font-semibold text-[#202521] tracking-tight truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Center & Right: Search, Compare Quick Jump, Notifications */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Quick Search */}
        <div className="relative w-44 sm:w-64">
          <Search className="w-4 h-4 text-[#737A75] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (currentTab !== 'explore' && e.target.value.trim().length > 0) {
                onSelectTab('explore');
              }
            }}
            placeholder="Search listings..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-[#F8F9F7] border border-[#E7EAE6] rounded-lg text-[#202521] placeholder:text-[#737A75] focus:outline-none focus:border-[#315C48] focus:bg-white transition-all"
          />
        </div>

        {/* Quick Compare Indicator if items active */}
        {compareCount > 0 && (
          <button
            onClick={() => onSelectTab('compare')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EBF2EE] text-[#315C48] hover:bg-[#DEE8E2] transition-colors"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Compare ({compareCount})</span>
          </button>
        )}

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-[#737A75] hover:text-[#202521] rounded-lg hover:bg-[#F8F9F7] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C28B35]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#FFFFFF] border border-[#E7EAE6] rounded-xl shadow-lg shadow-black/5 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E7EAE6] bg-[#F8F9F7]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#202521]">
                    Price & Dataset Alerts
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-[#315C48] text-white">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] text-[#315C48] hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-[#E7EAE6] max-h-80 overflow-y-auto">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 text-left transition-colors ${
                      item.read ? 'bg-white' : 'bg-[#FDFBF7]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        {item.type === 'price_drop' ? (
                          <TrendingDown className="w-3.5 h-3.5 text-[#315C48] shrink-0" />
                        ) : item.type === 'flag' ? (
                          <AlertCircle className="w-3.5 h-3.5 text-[#C28B35] shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#315C48] shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-[#202521]">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#737A75] shrink-0 tabular-nums">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-xs text-[#737A75] leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-2.5 border-t border-[#E7EAE6] bg-[#F8F9F7] text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    onSelectTab('price_intelligence');
                  }}
                  className="text-xs font-medium text-[#315C48] hover:underline"
                >
                  View Price Intelligence
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
