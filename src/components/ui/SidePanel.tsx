import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { ProgressiveBlur } from './ProgressiveBlur';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-xl',
}) => {
  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/35 backdrop-blur-xs"
          />

          {/* Drawer Surface */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className={`relative z-10 w-full ${maxWidth} bg-white h-full shadow-2xl flex flex-col border-l border-[#E7EAE6] overflow-hidden`}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-[#E7EAE6] bg-[#F8F9F7] shrink-0">
              <div className="space-y-0.5 pr-6">
                <h2 className="text-base sm:text-lg font-semibold text-[#202521]">
                  {title}
                </h2>
                {description && (
                  <p className="text-xs text-[#737A75] leading-relaxed">
                    {description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-[#737A75] hover:text-[#202521] hover:bg-[#E7EAE6]/50 rounded-lg transition-colors"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body with Progressive Blur */}
            <div className="relative flex-1 overflow-y-auto p-5 sm:p-6">
              {children}
              <ProgressiveBlur position="bottom" />
            </div>

            {/* Optional Footer */}
            {footer && (
              <div className="p-4 border-t border-[#E7EAE6] bg-[#F8F9F7] shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
