import React, { useState } from 'react';
import { AlertCircle, TrendingDown, Info, ArrowUpRight, Scale } from 'lucide-react';
import { Product, Category } from '../types';
import { getCategoryStats, analyzePrice, DEVIATION_THRESHOLD_PERCENT, MIN_COMPARABLE_LISTINGS_FOR_ANOMALY } from '../utils/analysis';
import { formatINR, formatAge } from '../utils/format';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { VercelTooltip } from '../components/ui/VercelTooltip';
import { DataTable, Column } from '../components/ui/DataTable';

interface PriceIntelligenceViewProps {
  products: Product[];
  onViewProduct: (product: Product) => void;
  compareList: string[];
  onToggleCompare: (product: Product) => void;
}

const CATEGORIES: Category[] = [
  'Textbooks & Books',
  'Laptops & Computing',
  'Bicycles & Mobility',
  'Audio & Gadgets',
  'Dorm Essentials',
];

export const PriceIntelligenceView: React.FC<PriceIntelligenceViewProps> = ({
  products,
  onViewProduct,
  compareList,
  onToggleCompare,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('Laptops & Computing');

  // Compute category statistics from actual active listings
  const categoryStats = CATEGORIES.map((cat) => getCategoryStats(cat, products));
  const activeStats = categoryStats.find((s) => s.category === selectedCategory) || categoryStats[0];

  // Get flagged listings
  const flaggedListings = products
    .map((p) => ({
      product: p,
      analysis: analyzePrice(p, products),
    }))
    .filter(
      (item) =>
        item.analysis.hasSufficientData &&
        (item.analysis.flag === 'below_market' || item.analysis.flag === 'above_median')
    );

  const categoryProducts = products.filter((p) => p.category === selectedCategory);

  // DataTable Columns for Category Listings
  const tableColumns: Column<Product>[] = [
    {
      key: 'title',
      header: 'Product Title',
      sortable: true,
      sortValue: (p) => p.title,
      render: (p) => (
        <button
          onClick={() => onViewProduct(p)}
          className="font-medium text-[#202321] hover:text-[#4058D6] text-left hover:underline line-clamp-1"
        >
          {p.title}
        </button>
      ),
    },
    {
      key: 'condition',
      header: 'Condition',
      sortable: true,
      sortValue: (p) => p.condition,
      render: (p) => <span className="text-[#777A75]">{p.condition}</span>,
    },
    {
      key: 'ageYears',
      header: 'Age',
      sortable: true,
      sortValue: (p) => p.ageYears,
      render: (p) => <span className="text-[#777A75] tabular-nums font-mono">{formatAge(p.ageYears)}</span>,
    },
    {
      key: 'currentPrice',
      header: 'Listed Price',
      sortable: true,
      sortValue: (p) => p.currentPrice,
      render: (p) => (
        <span className="font-semibold text-[#202321] tabular-nums font-mono">
          {formatINR(p.currentPrice)}
        </span>
      ),
    },
    {
      key: 'originalPrice',
      header: 'Original Retail',
      sortable: true,
      sortValue: (p) => p.originalPrice,
      render: (p) => (
        <span className="text-[#777A75] line-through tabular-nums font-mono">
          {formatINR(p.originalPrice)}
        </span>
      ),
    },
    {
      key: 'discount',
      header: 'Discount %',
      sortable: true,
      sortValue: (p) => analyzePrice(p, products).discountPercentage,
      render: (p) => {
        const analysis = analyzePrice(p, products);
        return (
          <span className="font-semibold text-[#315C48] tabular-nums">
            -{analysis.discountPercentage}%
          </span>
        );
      },
    },
    {
      key: 'deviation',
      header: 'vs Dataset Median',
      sortable: true,
      sortValue: (p) => analyzePrice(p, products).deviationPercentage,
      render: (p) => {
        const analysis = analyzePrice(p, products);
        if (!analysis.hasSufficientData) {
          return <span className="text-[#777A75] text-[11px]">N &lt; 3</span>;
        }
        return (
          <VercelTooltip content={`Calculated from ${analysis.comparableCount} comparable items in ${p.category}. Median is ${formatINR(analysis.categoryMedian)}.`}>
            <span
              className={`tabular-nums font-semibold cursor-help font-mono ${
                analysis.deviationPercentage < 0
                  ? 'text-[#315C48]'
                  : analysis.deviationPercentage > 0
                  ? 'text-[#E78369]'
                  : 'text-[#777A75]'
              }`}
            >
              {analysis.deviationPercentage > 0 ? `+${analysis.deviationPercentage}%` : `${analysis.deviationPercentage}%`}
            </span>
          </VercelTooltip>
        );
      },
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      render: (p) => (
        <button
          onClick={() => onViewProduct(p)}
          className="text-[#4058D6] hover:underline font-semibold text-xs"
        >
          Inspect
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title & Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-2 border-b border-[#E8E5DD]">
        <div>
          <h2 className="font-serif-title italic text-2xl sm:text-3xl text-[#202321] tracking-tight">
            Know what it's worth.
          </h2>
          <p className="text-xs sm:text-sm text-[#777A75] mt-1 leading-relaxed">
            Campus benchmark medians, dispersion spread, and statistical price deviation detection calculated strictly from active listings.
          </p>
        </div>

        <span className="text-xs text-[#777A75] font-mono shrink-0">
          Threshold: ±{DEVIATION_THRESHOLD_PERCENT}% (Min N ≥ {MIN_COMPARABLE_LISTINGS_FOR_ANOMALY})
        </span>
      </div>

      {/* Prominently Visible Investigation Notice */}
      <div className="flex items-start gap-3 p-4 bg-[#FAF5EE] border border-[#E8E5DD] rounded-xl text-xs text-[#202321]">
        <Info className="w-4 h-4 text-[#C28B35] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-[#202321]">
            Investigation Notice &amp; Methodology:
          </p>
          <p className="text-[#777A75] leading-relaxed">
            Price deviations are statistical indicators for further investigation, not proof of fraud or seller misbehavior. Premium items may include warranties, accessories, or top-spec memory; lower prices often reflect cosmetic wear or an urgent end-of-semester move.
          </p>
        </div>
      </div>

      {/* Category Median Benchmarks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#777A75]">
            Dataset Category Median Benchmarks
          </h3>
          <span className="text-xs text-[#777A75]">
            Calculated from {products.length} current listings
          </span>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-[#E8E5DD] rounded-xl shadow-xs">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const stats = categoryStats.find((s) => s.category === cat);
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all text-left flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#4058D6] text-white shadow-xs'
                    : 'text-[#202321] hover:bg-[#FAF8F5]'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[11px] tabular-nums font-mono ${isSelected ? 'text-white/80' : 'text-[#777A75]'}`}>
                  {stats && stats.count > 0 ? `${formatINR(stats.medianPrice)} (${stats.count})` : '0 listings'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Horizontal Benchmark Ticker (Separated by Vertical Hairline Dividers) */}
        <div className="bg-white border border-[#E8E5DD] rounded-xl p-5 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-[#E8E5DD]">
            {/* Metric 1 */}
            <div className="px-2 sm:px-4 py-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#777A75] block">
                Dataset Median
              </span>
              <span className="text-2xl font-serif-title italic text-[#202321] font-normal block mt-1 tabular-nums">
                {formatINR(activeStats.medianPrice)}
              </span>
              <span className="text-[11px] text-[#777A75] mt-1 block">
                Based on {activeStats.count} comparable items
              </span>
            </div>

            {/* Metric 2 */}
            <div className="px-2 sm:px-4 py-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#777A75] block">
                Price Dispersion
              </span>
              <span className="text-xl font-mono text-[#202321] font-semibold block mt-1 tabular-nums">
                {formatINR(activeStats.minPrice)} – {formatINR(activeStats.maxPrice)}
              </span>
              <span className="text-[11px] text-[#777A75] mt-1 block">
                Lowest to highest active listing
              </span>
            </div>

            {/* Metric 3 */}
            <div className="px-2 sm:px-4 py-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#777A75] block">
                Average Markdown
              </span>
              <span className="text-2xl font-serif-title italic text-[#315C48] font-normal block mt-1 tabular-nums">
                <AnimatedNumber value={activeStats.avgDiscount} />%
              </span>
              <span className="text-[11px] text-[#777A75] mt-1 block">
                Off manufacturer original MSRP
              </span>
            </div>

            {/* Metric 4 */}
            <div className="px-2 sm:px-4 py-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#777A75] block">
                Anomaly Flags
              </span>
              <span className={`text-2xl font-serif-title italic font-normal block mt-1 tabular-nums ${activeStats.flaggedCount > 0 ? 'text-[#E78369]' : 'text-[#202321]'}`}>
                <AnimatedNumber value={activeStats.hasSufficientData ? activeStats.flaggedCount : 0} />
              </span>
              <span className="text-[11px] text-[#777A75] mt-1 block">
                {activeStats.hasSufficientData
                  ? `Deviations > ±${DEVIATION_THRESHOLD_PERCENT}%`
                  : `Need ≥ ${MIN_COMPARABLE_LISTINGS_FOR_ANOMALY} items (have ${activeStats.count})`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Flagged Statistical Deviations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-[#202321]">
              Flagged Statistical Deviations
            </h3>
            <p className="text-xs text-[#777A75]">
              Listings in categories with ≥ {MIN_COMPARABLE_LISTINGS_FOR_ANOMALY} listings deviating by more than ±{DEVIATION_THRESHOLD_PERCENT}% from the category median
            </p>
          </div>
          <span className="text-xs text-[#777A75] tabular-nums font-mono">
            {flaggedListings.length} flags across eligible categories
          </span>
        </div>

        {flaggedListings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {flaggedListings.map(({ product, analysis }) => {
              const isBelow = analysis.flag === 'below_market';
              return (
                <div
                  key={product.id}
                  className="bg-white border border-[#E8E5DD] rounded-xl p-5 space-y-4 flex flex-col justify-between shadow-xs hover:border-[#4058D6]/30 transition-colors"
                >
                  <div className="space-y-2.5">
                    {/* Category & Status Indicator */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-[#777A75]">
                        {product.category} · {product.condition} · {formatAge(product.ageYears)}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded ${
                          isBelow
                            ? 'bg-[#EBF2EE] text-[#315C48]'
                            : 'bg-[#FDF2F0] text-[#E78369]'
                        }`}
                      >
                        {isBelow ? (
                          <TrendingDown className="w-3.5 h-3.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5" />
                        )}
                        <span>{analysis.flagLabel}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h4
                      onClick={() => onViewProduct(product)}
                      className="text-base font-semibold text-[#202321] hover:text-[#4058D6] cursor-pointer transition-colors leading-snug"
                    >
                      {product.title}
                    </h4>

                    {/* Price & Discount comparison */}
                    <div className="flex items-baseline justify-between pt-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-[#202321] tabular-nums font-mono">
                          {formatINR(product.currentPrice)}
                        </span>
                        <span className="text-xs text-[#777A75] line-through tabular-nums font-mono">
                          {formatINR(product.originalPrice)}
                        </span>
                      </div>

                      <span className="text-xs font-semibold text-[#315C48] tabular-nums">
                        {analysis.discountPercentage}% off retail
                      </span>
                    </div>

                    {/* Visual Comparison Range Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-[11px] text-[#777A75] tabular-nums font-mono">
                        <span>Min: {formatINR(analysis.categoryMin)}</span>
                        <span className="font-semibold text-[#202321]">
                          Median: {formatINR(analysis.categoryMedian)} ({analysis.comparableCount} items)
                        </span>
                        <span>Max: {formatINR(analysis.categoryMax)}</span>
                      </div>

                      <div className="relative h-2 w-full bg-[#E8E5DD] rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 bottom-0 w-1 bg-[#202321] z-10 -translate-x-1/2"
                          style={{
                            left: `${
                              ((analysis.categoryMedian - analysis.categoryMin) /
                                (analysis.categoryMax - analysis.categoryMin || 1)) *
                              100
                            }%`,
                          }}
                        />
                        <div
                          className={`absolute top-0 bottom-0 rounded-full ${
                            isBelow ? 'bg-[#315C48]' : 'bg-[#E78369]'
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                10,
                                ((product.currentPrice - analysis.categoryMin) /
                                  (analysis.categoryMax - analysis.categoryMin || 1)) *
                                  100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Short Explanation */}
                    <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E8E5DD] text-xs text-[#202321] leading-relaxed">
                      <p>{analysis.explanation}</p>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-[#E8E5DD]">
                    <button
                      onClick={() => onViewProduct(product)}
                      className="flex-1 py-1.5 px-3 text-xs font-medium bg-[#FAF8F5] hover:bg-[#EEF1FC] hover:text-[#4058D6] text-[#202321] border border-[#E8E5DD] rounded-lg transition-colors text-center inline-flex items-center justify-center gap-1"
                    >
                      <span>Inspect Listing</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onToggleCompare(product)}
                      className={`py-1.5 px-3 text-xs font-medium border rounded-lg transition-colors flex items-center gap-1 ${
                        compareList.includes(product.id)
                          ? 'bg-[#EEF1FC] text-[#4058D6] border-[#4058D6]'
                          : 'bg-white text-[#777A75] border-[#E8E5DD] hover:text-[#202321]'
                      }`}
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>{compareList.includes(product.id) ? 'Comparing' : 'Compare'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-[#E8E5DD] rounded-xl p-8 text-center text-xs text-[#737A75]">
            No listings currently exceed the ±{DEVIATION_THRESHOLD_PERCENT}% deviation threshold in categories with at least {MIN_COMPARABLE_LISTINGS_FOR_ANOMALY} comparable listings.
          </div>
        )}
      </div>

      {/* DataTable for Category Listings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#202321]">
              Category Price Records Table
            </h3>
            <p className="text-xs text-[#737A75]">
              Full dataset breakdown of {selectedCategory} listings sorted by title, price, discount, or median deviation
            </p>
          </div>
          <span className="text-xs text-[#777A75] tabular-nums font-mono">
            {categoryProducts.length} items
          </span>
        </div>

        <DataTable<Product>
          data={categoryProducts}
          columns={tableColumns}
          keyExtractor={(p) => p.id}
          defaultSortKey="currentPrice"
          defaultSortDirection="asc"
        />
      </div>
    </div>
  );
};
