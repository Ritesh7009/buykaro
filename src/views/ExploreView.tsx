import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, RotateCcw, Filter, X } from 'lucide-react';
import { Product, Category, Condition } from '../types';
import { ShiftCard } from '../components/ui/ShiftCard';
import { Combobox } from '../components/ui/Combobox';
import { ButtonGroup } from '../components/ui/ButtonGroup';
import { AutoScaleInput } from '../components/ui/AutoScaleInput';
import { SidePanel } from '../components/ui/SidePanel';
import { TextEffect } from '../components/ui/TextEffect';
import { calculateDiscount } from '../utils/analysis';
import { formatINR } from '../utils/format';

interface ExploreViewProps {
  products: Product[];
  onViewProduct: (product: Product) => void;
  compareList: string[];
  onToggleCompare: (product: Product) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'discount_desc';

const CATEGORIES: Array<Category | 'All'> = [
  'All',
  'Textbooks & Books',
  'Laptops & Computing',
  'Bicycles & Mobility',
  'Audio & Gadgets',
  'Dorm Essentials',
];

const CONDITIONS: Array<Condition | 'All'> = ['All', 'Like New', 'Excellent', 'Good', 'Fair'];

export const ExploreView: React.FC<ExploreViewProps> = ({
  products,
  onViewProduct,
  compareList,
  onToggleCompare,
  searchQuery,
  onSearchChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCondition, setSelectedCondition] = useState<Condition | 'All'>('All');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Maximum price in catalog
  const maxPriceInCatalog = useMemo(() => {
    if (products.length === 0) return 50000;
    return Math.max(...products.map((p) => p.currentPrice));
  }, [products]);

  const [maxBudget, setMaxBudget] = useState<number>(() => {
    return Math.max(50000, maxPriceInCatalog);
  });

  // Keep maxBudget updated if new items are added
  React.useEffect(() => {
    if (maxPriceInCatalog > maxBudget) {
      setMaxBudget(maxPriceInCatalog);
    }
  }, [maxPriceInCatalog]);

  const [sortBy, setSortBy] = useState<string>('newest');

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = product.title.toLowerCase().includes(q);
          const matchCategory = product.category.toLowerCase().includes(q);
          const matchDesc = product.description.toLowerCase().includes(q);
          const matchLocation = product.campusLocation.toLowerCase().includes(q);
          if (!matchTitle && !matchCategory && !matchDesc && !matchLocation) return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && product.category !== selectedCategory) {
          return false;
        }

        // Condition filter
        if (selectedCondition !== 'All' && product.condition !== selectedCondition) {
          return false;
        }

        // Budget filter in INR
        if (product.currentPrice > maxBudget) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price_asc':
            return a.currentPrice - b.currentPrice;
          case 'price_desc':
            return b.currentPrice - a.currentPrice;
          case 'discount_desc': {
            const discA = calculateDiscount(a.currentPrice, a.originalPrice);
            const discB = calculateDiscount(b.currentPrice, b.originalPrice);
            return discB - discA;
          }
          case 'newest':
          default:
            return new Date(b.listedDate).getTime() - new Date(a.listedDate).getTime();
        }
      });
  }, [products, searchQuery, selectedCategory, selectedCondition, maxBudget, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedCondition('All');
    setMaxBudget(maxPriceInCatalog);
    setSortBy('newest');
    onSearchChange('');
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedCondition !== 'All' ||
    maxBudget < maxPriceInCatalog ||
    searchQuery.trim().length > 0;

  // Category counts for Combobox
  const categoryOptions = CATEGORIES.map((cat) => ({
    value: cat,
    label: cat === 'All' ? 'All Categories' : cat,
    count: cat === 'All' ? products.length : products.filter((p) => p.category === cat).length,
  }));

  const sortItems = [
    { id: 'newest', label: 'Newest' },
    { id: 'price_asc', label: 'Price: Low' },
    { id: 'price_desc', label: 'Price: High' },
    { id: 'discount_desc', label: 'Discount %' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header with Editorial Typography */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-2 border-b border-[#E8E5DD]">
        <div>
          <h2 className="font-serif-title italic text-2xl sm:text-3xl text-[#202321] tracking-tight">
            Good finds. Better prices.
          </h2>
          <p className="text-xs sm:text-sm text-[#777A75] mt-0.5">
            Discover second-hand campus gear with transparent pricing, verified age, and physical condition.
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(true)}
          className="md:hidden inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold bg-white border border-[#E8E5DD] rounded-lg text-[#202321] shadow-xs"
        >
          <Filter className="w-3.5 h-3.5 text-[#4058D6]" />
          <span>Filters {hasActiveFilters ? '• Active' : ''}</span>
        </button>
      </div>

      {/* Filter and Control Bar (Open, Restrained Editorial Layout) */}
      <div className="bg-white border border-[#E8E5DD] rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
        {/* Top Row: Search + Budget Input + Sort */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#777A75] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title, brand, or location..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E8E5DD] rounded-lg text-[#202321] placeholder:text-[#777A75] focus:outline-none focus:border-[#4058D6] focus:bg-white transition-all"
            />
          </div>

          {/* Budget Filter with AutoScaleInput & Slider */}
          <div className="md:col-span-4 flex items-center gap-3 bg-[#FAF8F5] px-3.5 py-1.5 rounded-lg border border-[#E8E5DD]">
            <div className="shrink-0 text-xs font-medium text-[#777A75]">
              Max Budget:
            </div>
            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min="500"
                max={maxPriceInCatalog}
                step="500"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full accent-[#4058D6] cursor-pointer"
              />
              <span className="text-xs font-semibold text-[#202321] tabular-nums shrink-0 min-w-16 text-right font-mono">
                {formatINR(maxBudget)}
              </span>
            </div>
          </div>

          {/* Sorting with ButtonGroup */}
          <div className="md:col-span-3 flex justify-end">
            <ButtonGroup
              items={sortItems}
              value={sortBy}
              onChange={setSortBy}
              size="sm"
            />
          </div>
        </div>

        {/* Bottom Row: Combobox for Category + Condition selector + Active tags */}
        <div className="pt-3 border-t border-[#E8E5DD] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs text-[#777A75] font-medium hidden sm:inline">Category:</span>
            {/* Watermelon UI Combobox */}
            <Combobox
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="Filter Category"
              searchPlaceholder="Search categories..."
              className="w-48 sm:w-56"
            />

            {/* Condition selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#777A75] font-medium hidden sm:inline">Condition:</span>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value as Condition | 'All')}
                className="py-1.5 px-3 text-xs bg-[#FAF8F5] border border-[#E8E5DD] rounded-lg text-[#202321] focus:outline-none focus:border-[#4058D6]"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond === 'All' ? 'All Conditions' : cond}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset button if active filters */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs text-[#777A75] hover:text-[#E78369] px-2.5 py-1.5 rounded-lg border border-[#E8E5DD] hover:bg-[#FDF5F3] transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#737A75]">
        <span>
          Showing <strong className="text-[#202521] font-semibold">{filteredProducts.length}</strong> of{' '}
          {products.length} products
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          {maxBudget < maxPriceInCatalog && ` under ${formatINR(maxBudget)}`}
        </span>

        {compareList.length > 0 && (
          <span className="text-[#315C48] font-medium">
            {compareList.length} {compareList.length === 1 ? 'item' : 'items'} in comparison drawer
          </span>
        )}
      </div>

      {/* Product Grid - 4 Columns on XL, 3 on LG, 2 on SM with Cult UI ShiftCard */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredProducts.map((product) => (
            <ShiftCard
              key={product.id}
              product={product}
              onViewDetails={onViewProduct}
              isCompared={compareList.includes(product.id)}
              onToggleCompare={onToggleCompare}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-[#E7EAE6] rounded-xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#F8F9F7] text-[#737A75] flex items-center justify-center mx-auto border border-[#E7EAE6]">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-[#202521]">
            No listings matched your active filters
          </h3>
          <p className="text-xs text-[#737A75] max-w-sm mx-auto leading-relaxed">
            Try adjusting your maximum INR budget or clearing keywords to view available student listings.
          </p>
          <div className="pt-2">
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#315C48] text-white hover:bg-[#27493A] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filters & Show All</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Filters SidePanel (Watermelon UI Sheet) */}
      <SidePanel
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title="Marketplace Filters"
        description="Filter listings by budget, category, and physical condition"
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={resetFilters}
              className="px-3.5 py-2 text-xs font-medium text-[#737A75] hover:text-[#202521]"
            >
              Reset
            </button>
            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="px-4 py-2 text-xs font-semibold bg-[#315C48] text-white rounded-lg hover:bg-[#27493A]"
            >
              Apply Filters ({filteredProducts.length} Results)
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#202521] uppercase tracking-wider block">
              Category
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full p-2.5 text-xs text-left rounded-lg border transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[#EBF2EE] text-[#315C48] border-[#315C48] font-semibold'
                      : 'bg-white text-[#202521] border-[#E7EAE6]'
                  }`}
                >
                  {cat === 'All' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#202521] uppercase tracking-wider block">
              Condition
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CONDITIONS.map((cond) => (
                <button
                  key={cond}
                  onClick={() => setSelectedCondition(cond)}
                  className={`p-2 text-xs text-center rounded-lg border transition-colors ${
                    selectedCondition === cond
                      ? 'bg-[#EBF2EE] text-[#315C48] border-[#315C48] font-semibold'
                      : 'bg-white text-[#202521] border-[#E7EAE6]'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#202521] uppercase tracking-wider">
                Max Budget
              </span>
              <span className="font-semibold text-[#315C48] tabular-nums">
                {formatINR(maxBudget)}
              </span>
            </div>
            <input
              type="range"
              min="500"
              max={maxPriceInCatalog}
              step="500"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-full accent-[#315C48]"
            />
          </div>
        </div>
      </SidePanel>
    </div>
  );
};
