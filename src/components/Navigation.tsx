import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Sparkles,
  TrendingDown,
  Scale,
  ListPlus,
  Search,
  Bell,
  CheckCircle2,
  AlertCircle,
  Home,
  Plus,
} from 'lucide-react';
import { NavTab } from './Sidebar';

export interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  compareCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  compareCount,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
}) => {
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 'n-1',
      type: 'price_drop',
      title: 'Price Anomaly Alert',
      message: 'Casio fx-991CW is listed at ₹850 (55% markdown).',
      time: '12m ago',
      read: false,
    },
    {
      id: 'n-2',
      type: 'flag',
      title: 'Dataset Median Shift',
      message: 'MacBook Air M1 at ₹48,000 deviates +31% from category median.',
      time: '1h ago',
      read: false,
    },
    {
      id: 'n-3',
      type: 'budget',
      title: 'Recommendation Engine',
      message: '7 student items found under your current semester budget.',
      time: '3h ago',
      read: true,
    },
  ]);

  const notifRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showSearchInput && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchInput]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Overview', icon: <Home className="w-4 h-4" /> },
    { id: 'explore', label: 'Marketplace', icon: <Compass className="w-4 h-4" /> },
    { id: 'recommendations', label: 'Recommendations', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'price_intelligence', label: 'Price Intelligence', icon: <TrendingDown className="w-4 h-4" /> },
    { id: 'compare', label: 'Compare', icon: <Scale className="w-4 h-4" /> },
    { id: 'manage', label: 'Inventory', icon: <ListPlus className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Top Desktop & Tablet Navigation */}
      <header className="sticky top-0 z-40 w-full bg-[#F6F4EF]/90 backdrop-blur-md border-b border-[#E8E5DD] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('overview')}
              className="flex items-center gap-2.5 text-left group focus-visible:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-[#4058D6] text-white flex items-center justify-center font-bold text-sm shadow-xs transition-transform group-hover:scale-105">
                C
              </div>
              <div>
                <span className="font-serif-title italic text-xl tracking-tight text-[#202321] font-normal leading-none block">
                  CampusCart
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-[#777A75] leading-none block mt-0.5">
                  Student Exchange
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links with Understated Active Indicator */}
          <nav className="hidden md:flex items-center gap-1 bg-[#ECE9E1]/60 p-1 rounded-xl border border-[#E8E5DD]/70">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4058D6] ${
                    isActive
                      ? 'text-[#202321]'
                      : 'text-[#777A75] hover:text-[#202321]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-indicator"
                      transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                      className="absolute inset-0 bg-white rounded-lg shadow-xs border border-[#E8E5DD]"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <span className={isActive ? 'text-[#4058D6]' : 'text-[#777A75]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    {item.id === 'compare' && compareCount > 0 && (
                      <span className="text-[10px] bg-[#4058D6] text-white px-1.5 py-0.2 rounded-full tabular-nums">
                        {compareCount}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Utility Controls: Search, Notifications, Compare Badge, Sell Item CTA */}
          <div className="flex items-center gap-2.5">
            {/* Search Input (Expands smoothly on desktop) */}
            <div className="relative">
              <AnimatePresence>
                {showSearchInput ? (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative flex items-center"
                  >
                    <Search className="w-3.5 h-3.5 text-[#777A75] absolute left-2.5 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        onSearchChange(e.target.value);
                        if (currentTab !== 'explore' && e.target.value.trim().length > 0) {
                          onSelectTab('explore');
                        }
                      }}
                      onBlur={() => {
                        if (!searchQuery) setShowSearchInput(false);
                      }}
                      placeholder="Search listings..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E8E5DD] rounded-lg text-[#202321] focus:outline-none focus:border-[#4058D6] shadow-xs"
                    />
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setShowSearchInput(true)}
                    className="p-2 text-[#777A75] hover:text-[#202321] hover:bg-white rounded-lg border border-transparent hover:border-[#E8E5DD] transition-all"
                    title="Search listings"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications Popover */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-[#777A75] hover:text-[#202321] hover:bg-white rounded-lg border border-transparent hover:border-[#E8E5DD] transition-all"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E78369]" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E8E5DD] rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8E5DD] bg-[#FAF8F5]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#202321]">
                        Marketplace Intelligence
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-[#4058D6] text-white">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
                        className="text-[11px] text-[#4058D6] hover:underline font-medium"
                      >
                        Mark read
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-[#E8E5DD] max-h-72 overflow-y-auto">
                    {notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3.5 text-left text-xs transition-colors ${
                          item.read ? 'bg-white' : 'bg-[#FAF8F5]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-1.5 font-semibold text-[#202321]">
                            {item.type === 'price_drop' ? (
                              <TrendingDown className="w-3.5 h-3.5 text-[#4058D6]" />
                            ) : item.type === 'flag' ? (
                              <AlertCircle className="w-3.5 h-3.5 text-[#E78369]" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#315C48]" />
                            )}
                            <span>{item.title}</span>
                          </div>
                          <span className="text-[10px] text-[#777A75] tabular-nums">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-[#777A75] leading-relaxed">{item.message}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 border-t border-[#E8E5DD] bg-[#FAF8F5] text-center">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        onSelectTab('price_intelligence');
                      }}
                      className="text-xs font-medium text-[#4058D6] hover:underline"
                    >
                      View Price Intelligence Terminal
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Compare Quick Pill (if items active) */}
            {compareCount > 0 && (
              <button
                onClick={() => onSelectTab('compare')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EEF1FC] text-[#4058D6] hover:bg-[#E3E8FA] border border-[#4058D6]/20 transition-colors"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Compare ({compareCount})</span>
              </button>
            )}

            {/* Post Item Action CTA (Cobalt Button) */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#4058D6] text-white hover:bg-[#3146B8] shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Post Listing</span>
              <span className="sm:hidden">Post</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F6F4EF]/95 backdrop-blur-md border-t border-[#E8E5DD] px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-[#4058D6] font-semibold' : 'text-[#777A75]'
              }`}
            >
              <span className="relative">
                {item.icon}
                {item.id === 'compare' && compareCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-[#4058D6] text-white text-[9px] flex items-center justify-center font-bold">
                    {compareCount}
                  </span>
                )}
              </span>
              <span className="mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
