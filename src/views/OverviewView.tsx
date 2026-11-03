import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, TrendingDown, ArrowUpRight, ShieldCheck, Tag } from 'lucide-react';
import { Product } from '../types';
import { ShiftCard } from '../components/ui/ShiftCard';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { Magnetic } from '../components/ui/Magnetic';
import { NavTab } from '../components/Sidebar';
import { formatINR, formatAge } from '../utils/format';
import { calculateDiscount } from '../utils/analysis';

interface OverviewViewProps {
  products: Product[];
  onSelectTab: (tab: NavTab) => void;
  onViewProduct: (product: Product) => void;
  compareList: string[];
  onToggleCompare: (product: Product) => void;
  userBudget: number;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  products,
  onSelectTab,
  onViewProduct,
  compareList,
  onToggleCompare,
  userBudget,
}) => {
  const totalListings = products.length;
  const uniqueCategories = Array.from(new Set(products.map((p) => p.category))).length;
  const budgetMatches = products.filter((p) => p.currentPrice <= userBudget).length;

  const totalDiscount = products.reduce(
    (sum, p) => sum + calculateDiscount(p.currentPrice, p.originalPrice),
    0
  );
  const avgDiscount = totalListings > 0 ? Math.round(totalDiscount / totalListings) : 0;

  // Lead featured product (highest discount in catalog)
  const featuredProduct = [...products].sort((a, b) => {
    const discA = calculateDiscount(a.currentPrice, a.originalPrice);
    const discB = calculateDiscount(b.currentPrice, b.originalPrice);
    return discB - discA;
  })[0];

  // Recently added listings
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.listedDate).getTime() - new Date(a.listedDate).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-12 pb-8">
      {/* Editorial Hero Section */}
      <section className="pt-4 sm:pt-8 pb-4 border-b border-[#E8E5DD]">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#ECEBFA] text-[#4058D6] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CampusCart 2026 Student Marketplace</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[#202321] leading-[1.08] font-serif-title italic">
            Find the right thing.{' '}
            <span className="not-italic font-sans font-bold text-[#202321]">
              Pay the right price.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#777A75] max-w-2xl leading-relaxed">
            A smarter way to discover pre-owned products around your campus. Unbiased price intelligence, transparent depreciation calculations, and student-to-student exchanges.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Magnetic strength={0.2}>
              <button
                onClick={() => onSelectTab('explore')}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold bg-[#4058D6] text-white hover:bg-[#3146B8] transition-all shadow-sm active:scale-95"
              >
                <span>Browse Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Magnetic>

            <button
              onClick={() => onSelectTab('recommendations')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-[#202321] bg-white border border-[#E8E5DD] hover:bg-[#FAF8F5] transition-colors"
            >
              <span>Test Budget Algorithm</span>
              <ArrowUpRight className="w-4 h-4 text-[#777A75]" />
            </button>
          </div>
        </div>
      </section>

      {/* Horizontal Editorial Statistics Row (No repetitive boxed cards!) */}
      <section className="py-2">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E8E5DD] border-y border-[#E8E5DD] py-6">
          {/* Stat 1 */}
          <div className="px-4 sm:px-6 py-2 sm:py-0 space-y-1">
            <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-[#777A75]">
              Active Listings
            </span>
            <div className="text-3xl sm:text-4xl font-bold text-[#202321] tabular-nums tracking-tight">
              <AnimatedNumber value={totalListings} />
            </div>
            <p className="text-xs text-[#777A75]">Available student equipment</p>
          </div>

          {/* Stat 2 */}
          <div className="px-4 sm:px-6 py-2 sm:py-0 space-y-1">
            <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-[#777A75]">
              Campus Categories
            </span>
            <div className="text-3xl sm:text-4xl font-bold text-[#202321] tabular-nums tracking-tight">
              <AnimatedNumber value={uniqueCategories} />
            </div>
            <p className="text-xs text-[#777A75]">Books, Tech, Cycles, Audio & Dorm</p>
          </div>

          {/* Stat 3 */}
          <div className="px-4 sm:px-6 py-2 sm:py-0 space-y-1">
            <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-[#777A75]">
              Budget Matches
            </span>
            <div className="text-3xl sm:text-4xl font-bold text-[#4058D6] tabular-nums tracking-tight">
              <AnimatedNumber value={budgetMatches} />
            </div>
            <p className="text-xs text-[#777A75]">Under your {formatINR(userBudget)} budget</p>
          </div>

          {/* Stat 4 */}
          <div className="px-4 sm:px-6 py-2 sm:py-0 space-y-1">
            <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-[#777A75]">
              Average Savings
            </span>
            <div className="text-3xl sm:text-4xl font-bold text-[#E78369] tabular-nums tracking-tight">
              <AnimatedNumber value={avgDiscount} />%
            </div>
            <p className="text-xs text-[#777A75]">Markdown off original retail MSRP</p>
          </div>
        </div>
      </section>

      {/* Featured Spotlight & Value Showcase (Asymmetric Layout) */}
      {featuredProduct && (
        <section className="space-y-4">
          <div className="flex items-baseline justify-between border-b border-[#E8E5DD] pb-3">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#777A75] font-semibold block">
                Editor's Highlight
              </span>
              <h2 className="text-2xl font-serif-title italic font-normal text-[#202321]">
                Deepest Markdown in Catalog
              </h2>
            </div>
            <button
              onClick={() => onSelectTab('explore')}
              className="text-xs font-semibold text-[#4058D6] hover:underline inline-flex items-center gap-1"
            >
              <span>Explore all {products.length} listings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white border border-[#E8E5DD] rounded-2xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-xs">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#FDF1EE] text-[#E78369] border border-[#FADCD5]">
                  {calculateDiscount(featuredProduct.currentPrice, featuredProduct.originalPrice)}% Below MSRP
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#FAF8F5] text-[#777A75] border border-[#E8E5DD]">
                  {featuredProduct.category}
                </span>
                <span className="text-xs text-[#777A75]">
                  Listed {featuredProduct.listedDate}
                </span>
              </div>

              <h3
                onClick={() => onViewProduct(featuredProduct)}
                className="text-2xl sm:text-3xl font-bold text-[#202321] tracking-tight hover:text-[#4058D6] cursor-pointer transition-colors leading-snug"
              >
                {featuredProduct.title}
              </h3>

              <p className="text-sm text-[#777A75] leading-relaxed line-clamp-3">
                {featuredProduct.description}
              </p>

              <div className="flex flex-wrap items-baseline gap-4 pt-2">
                <div>
                  <span className="text-3xl font-bold text-[#202321] tabular-nums">
                    {formatINR(featuredProduct.currentPrice)}
                  </span>
                  <span className="ml-2.5 text-sm text-[#777A75] line-through tabular-nums">
                    {formatINR(featuredProduct.originalPrice)}
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#3E6335] bg-[#F0F5EE] px-2.5 py-1 rounded-md border border-[#DDE8D9]">
                  Save {formatINR(featuredProduct.originalPrice - featuredProduct.currentPrice)}
                </span>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => onViewProduct(featuredProduct)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#4058D6] text-white hover:bg-[#3146B8] transition-colors"
                >
                  Inspect Listing
                </button>
                <button
                  onClick={() => onToggleCompare(featuredProduct)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors ${
                    compareList.includes(featuredProduct.id)
                      ? 'bg-[#EEF1FC] text-[#4058D6] border-[#4058D6]'
                      : 'bg-white text-[#202321] border-[#E8E5DD] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {compareList.includes(featuredProduct.id) ? 'Selected for Compare' : 'Add to Compare'}
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#FAF8F5] border border-[#E8E5DD] rounded-xl p-6 space-y-4">
              <div className="space-y-1 border-b border-[#E8E5DD] pb-3">
                <span className="text-[11px] font-mono uppercase text-[#777A75] font-semibold">
                  Equipment Health
                </span>
                <div className="flex items-center justify-between text-xs text-[#202321]">
                  <span>Physical Rating:</span>
                  <strong className="font-semibold">{featuredProduct.condition}</strong>
                </div>
                <div className="flex items-center justify-between text-xs text-[#202321]">
                  <span>Age:</span>
                  <strong className="font-semibold tabular-nums">{formatAge(featuredProduct.ageYears)}</strong>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase text-[#777A75] font-semibold block">
                  Campus Pickup Spot
                </span>
                <p className="text-xs text-[#202321] bg-white p-2.5 rounded-lg border border-[#E8E5DD]">
                  {featuredProduct.campusLocation}
                </p>
              </div>

              <div className="flex items-start gap-2 pt-1 text-[11px] text-[#777A75]">
                <ShieldCheck className="w-4 h-4 text-[#4058D6] shrink-0 mt-0.5" />
                <p>Public exchange recommended at dining halls, library lobby, or student centers.</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recently Added Section (Open 4-column Grid) */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-[#E8E5DD] pb-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#777A75] font-semibold block">
              Recent Campus Arrivals
            </span>
            <h2 className="text-2xl font-serif-title italic font-normal text-[#202321]">
              Freshly Listed by Students
            </h2>
          </div>
          <button
            onClick={() => onSelectTab('explore')}
            className="text-xs font-semibold text-[#4058D6] hover:underline"
          >
            View all ({products.length})
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recentProducts.map((product) => (
            <ShiftCard
              key={product.id}
              product={product}
              onViewDetails={onViewProduct}
              isCompared={compareList.includes(product.id)}
              onToggleCompare={onToggleCompare}
            />
          ))}
        </div>
      </section>

      {/* Editorial Bottom Two-Column Split: Recommendation & Price Intelligence Brief */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#E8E5DD]">
        <div className="space-y-3 p-6 bg-white border border-[#E8E5DD] rounded-2xl">
          <div className="w-8 h-8 rounded-lg bg-[#ECEBFA] text-[#4058D6] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-xl font-serif-title italic text-[#202321]">
            Explainable Recommendation Engine
          </h3>
          <p className="text-xs text-[#777A75] leading-relaxed">
            Specify your semester budget to evaluate products using calibrated weights across Retail Savings (50%), Condition (30%), and Age Depreciation (20%).
          </p>
          <button
            onClick={() => onSelectTab('recommendations')}
            className="text-xs font-semibold text-[#4058D6] hover:underline inline-flex items-center gap-1 pt-1"
          >
            <span>Run budget recommendation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3 p-6 bg-white border border-[#E8E5DD] rounded-2xl">
          <div className="w-8 h-8 rounded-lg bg-[#FDF1EE] text-[#E78369] flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
          <h3 className="text-xl font-serif-title italic text-[#202321]">
            Transparent Price Intelligence
          </h3>
          <p className="text-xs text-[#777A75] leading-relaxed">
            Compare student listings against rolling category medians. Detect true bargains and price anomalies with a documented ±25% threshold across qualified categories.
          </p>
          <button
            onClick={() => onSelectTab('price_intelligence')}
            className="text-xs font-semibold text-[#E78369] hover:underline inline-flex items-center gap-1 pt-1"
          >
            <span>Inspect category medians</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>
    </div>
  );
};
