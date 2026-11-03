import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface ComboboxOption {
  value: string;
  label: string;
  count?: number;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium bg-[#F8F9F7] hover:bg-[#F2F4F1] border border-[#E7EAE6] rounded-lg text-[#202521] focus:outline-none focus:border-[#315C48] transition-colors"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[#737A75] shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-60 bg-white border border-[#E7EAE6] rounded-xl shadow-lg shadow-black/5 z-50 overflow-hidden">
          {/* Search bar inside combobox */}
          <div className="p-2 border-b border-[#E7EAE6] bg-[#F8F9F7]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#737A75] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-7 py-1 text-xs bg-white border border-[#E7EAE6] rounded-md text-[#202521] placeholder:text-[#737A75] focus:outline-none focus:border-[#315C48]"
                autoFocus
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#737A75] hover:text-[#202521]"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-56 overflow-y-auto py-1 divide-y divide-[#F8F9F7]">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                      isSelected
                        ? 'bg-[#EBF2EE] text-[#315C48] font-semibold'
                        : 'text-[#202521] hover:bg-[#F8F9F7]'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    <div className="flex items-center gap-1.5">
                      {opt.count !== undefined && (
                        <span className="text-[10px] text-[#737A75] tabular-nums">
                          ({opt.count})
                        </span>
                      )}
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#315C48]" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-[#737A75]">
                No matching options found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
