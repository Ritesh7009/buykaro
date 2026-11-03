import React from 'react';
import { Scale, MapPin, Calendar, Clock, Check, TrendingDown, ArrowRight, Info } from 'lucide-react';
import { Product } from '../types';
import { CategoryPlaceholder } from './CategoryPlaceholder';
import { analyzePrice, calculateDiscount } from '../utils/analysis';
import { formatINR, formatAge } from '../utils/format';
import { SidePanel } from './ui/SidePanel';
import { VercelTooltip } from './ui/VercelTooltip';

interface ProductDetailModalProps {
  product: Product | null;
  allProducts: Product[];
  onClose: () => void;
  isCompared: boolean;
  onToggleCompare: (product: Product) => void;
  onOpenRecommendations: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  allProducts,
  onClose,
  isCompared,
  onToggleCompare,
  onOpenRecommendations,
}) => {
  if (!product) return null;

  const analysis = analyzePrice(product, allProducts);
  const discount = calculateDiscount(product.currentPrice, product.originalPrice);

  return (
    <SidePanel
      isOpen={Boolean(product)}
      onClose={onClose}
      title={product.title}
      description={`${product.category} · Condition: ${product.condition} · ${product.isSampleData ? 'Demo Dataset' : 'User Entry'}`}
      maxWidth="max-w-xl"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onToggleCompare(product)}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              isCompared
                ? 'bg-[#EEF1FC] border-[#4058D6] text-[#4058D6]'
                : 'bg-white border-[#E8E5DD] text-[#202321] hover:border-[#4058D6]'
            }`}
          >
            {isCompared ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Selected for Comparison</span>
              </>
            ) : (
              <>
                <Scale className="w-3.5 h-3.5" />
                <span>Add to Side-by-Side Compare</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenRecommendations();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-[#4058D6] text-white hover:bg-[#3146B8] transition-colors shadow-xs"
          >
            <span>View Recommendation Score</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Placeholder Graphic & Pricing */}
        <div className="space-y-4">
          <CategoryPlaceholder
            category={product.category}
            className="w-full h-28 sm:h-36"
            size="md"
          />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#777A75]">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#4058D6]" />
              <span>{product.campusLocation}</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatAge(product.ageYears)}</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Listed {product.listedDate}</span>
            </div>
          </div>

          {/* Price Banner */}
          <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#E8E5DD] flex items-baseline justify-between shadow-xs">
            <div>
              <span className="text-xs text-[#777A75] block mb-0.5">Listed Price</span>
              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl sm:text-3xl font-semibold text-[#202321] tabular-nums font-mono">
                  {formatINR(product.currentPrice)}
                </span>
                <span className="text-sm text-[#777A75] line-through tabular-nums font-mono">
                  {formatINR(product.originalPrice)}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#315C48] bg-[#EBF2EE] px-2.5 py-1 rounded-md border border-[#315C48]/20">
                <TrendingDown className="w-3.5 h-3.5" />
                Save {formatINR(product.originalPrice - product.currentPrice)} ({discount}%)
              </span>
            </div>
          </div>
        </div>

        {/* Price Intelligence Diagnostics */}
        <div className="border border-[#E7EAE6] rounded-lg p-4 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#202521] uppercase tracking-wider block">
                Price Intelligence Assessment
              </span>
              <span className="text-[11px] text-[#737A75]">
                Calculated from {analysis.comparableCount} available listing(s) in {product.category}
              </span>
            </div>

            <span
              className={`text-xs font-medium px-2 py-0.5 rounded ${
                analysis.flag === 'below_market'
                  ? 'bg-[#EBF2EE] text-[#315C48]'
                  : analysis.flag === 'above_median'
                  ? 'bg-[#FDF8EE] text-[#C28B35]'
                  : 'bg-[#F4F6F3] text-[#737A75]'
              }`}
            >
              {analysis.flagLabel}
            </span>
          </div>

          <p className="text-xs text-[#202521] leading-relaxed">
            {analysis.explanation}
          </p>

          {/* Visual price position bar */}
          {analysis.hasSufficientData ? (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] text-[#737A75] tabular-nums">
                <span>Min: {formatINR(analysis.categoryMin)}</span>
                <span className="font-medium text-[#202521]">Dataset Median: {formatINR(analysis.categoryMedian)}</span>
                <span>Max: {formatINR(analysis.categoryMax)}</span>
              </div>
              <div className="relative h-2 w-full bg-[#E7EAE6] rounded-full overflow-hidden">
                {analysis.categoryMax > analysis.categoryMin && (
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-[#737A75] z-10 -translate-x-1/2"
                    style={{
                      left: `${
                        ((analysis.categoryMedian - analysis.categoryMin) /
                          (analysis.categoryMax - analysis.categoryMin || 1)) *
                        100
                      }%`,
                    }}
                    title={`Median: ${formatINR(analysis.categoryMedian)}`}
                  />
                )}
                <div
                  className="absolute top-0 bottom-0 bg-[#315C48] rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        8,
                        ((product.currentPrice - analysis.categoryMin) /
                          (analysis.categoryMax - analysis.categoryMin || 1)) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>
              <div className="text-[11px] text-[#737A75]">
                {analysis.deviationPercentage < 0
                  ? `${Math.abs(analysis.deviationPercentage)}% below dataset median (threshold: ±${analysis.thresholdPercentage}%)`
                  : analysis.deviationPercentage > 0
                  ? `${analysis.deviationPercentage}% above dataset median (threshold: ±${analysis.thresholdPercentage}%)`
                  : 'Priced exactly at dataset median'}
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-[#FAFBF9] rounded text-[11px] text-[#737A75] border border-[#E7EAE6]">
              Statistical anomaly detection requires a minimum of 3 comparable listings in this category. Currently {analysis.comparableCount} available.
            </div>
          )}
        </div>

        {/* Product Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-[#737A75] uppercase tracking-wider">
            Product Description & Inclusions
          </h3>
          <p className="text-sm text-[#202521] leading-relaxed bg-[#F8F9F7] p-3.5 rounded-lg border border-[#E7EAE6]">
            {product.description}
          </p>
        </div>

        {/* Investigation Disclaimer */}
        <div className="flex items-start gap-2.5 p-3 bg-[#FAF1E0]/50 border border-[#C28B35]/25 rounded-lg text-xs text-[#737A75]">
          <Info className="w-4 h-4 text-[#C28B35] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Price flags are indicators for further investigation, not proof of fraud or pricing errors. Inspect all equipment in person before purchasing.
          </p>
        </div>
      </div>
    </SidePanel>
  );
};
