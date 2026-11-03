import React, { useState } from 'react';
import {
  TrendingDown,
  ShieldCheck,
  Award,
  ChevronDown,
  ChevronUp,
  Scale,
  Check,
  AlertTriangle,
  Info,
  ArrowRight,
} from 'lucide-react';
import { Product, RecommendationPreference } from '../types';
import { CategoryPlaceholder } from '../components/CategoryPlaceholder';
import { getRecommendations, calculateDiscount } from '../utils/analysis';
import { formatINR, formatAge } from '../utils/format';
import { ExpandableTabs } from '../components/ui/ExpandableTabs';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { VercelTooltip } from '../components/ui/VercelTooltip';
import { ExpandableCard } from '../components/ui/ExpandableCard';
import { TextMorph } from '../components/ui/TextMorph';
import { Spotlight } from '../components/ui/Spotlight';
import { AutoScaleInput } from '../components/ui/AutoScaleInput';

interface RecommendationsViewProps {
  products: Product[];
  budget: number;
  onBudgetChange: (budget: number) => void;
  preference: RecommendationPreference;
  onPreferenceChange: (pref: RecommendationPreference) => void;
  onViewProduct: (product: Product) => void;
  compareList: string[];
  onToggleCompare: (product: Product) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  products,
  budget,
  onBudgetChange,
  preference,
  onPreferenceChange,
  onViewProduct,
  compareList,
  onToggleCompare,
}) => {
  const [showAllEligible, setShowAllEligible] = useState(false);
  const [showExcluded, setShowExcluded] = useState(false);

  const { topThree, allEligible, excluded } = getRecommendations(
    products,
    budget,
    preference
  );

  const budgetPresets = [2000, 5000, 15000, 25000, 50000];

  const preferenceTabs = [
    {
      id: 'value',
      label: 'Best Value',
      icon: <TrendingDown className="w-3.5 h-3.5" />,
    },
    {
      id: 'condition',
      label: 'Best Condition',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
  ];

  const firstPick = topThree.length > 0 ? topThree[0] : null;
  const runnerUps = topThree.length > 1 ? topThree.slice(1) : [];

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-2 border-b border-[#E8E5DD]">
        <div>
          <h2 className="font-serif-title italic text-2xl sm:text-3xl text-[#202321] tracking-tight">
            Find the smarter buy.
          </h2>
          <p className="text-xs sm:text-sm text-[#777A75] mt-1 leading-relaxed">
            Algorithmic trade-off ranking based strictly on Price, Product Age, and Condition. Listings exceeding your budget are excluded.
          </p>
        </div>

        {/* Preference Selector */}
        <div className="shrink-0">
          <ExpandableTabs
            tabs={preferenceTabs}
            activeTab={preference}
            onChange={(id) => onPreferenceChange(id as RecommendationPreference)}
            layoutId="recommendation-preference-tab"
          />
        </div>
      </div>

      {/* Budget & Optimization Controls */}
      <div className="bg-white border border-[#E8E5DD] rounded-xl p-5 sm:p-6 space-y-5 shadow-xs">
        {/* Dynamic Mode Notification with TextMorph */}
        <div className="flex items-center gap-2 p-3 bg-[#FAF8F5] border border-[#E8E5DD] rounded-lg text-xs text-[#777A75]">
          <span className="font-semibold text-[#202321]">Active Optimization:</span>
          <TextMorph className="font-semibold text-[#4058D6]">
            {preference === 'value'
              ? 'Best Value Priority — 50% Price (Savings + Headroom) + 30% Condition + 20% Age'
              : 'Best Condition Priority — 50% Condition + 35% Age + 15% Price Factor'}
          </TextMorph>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Buyer Budget Input with Skiper AutoScaleInput */}
          <div className="md:col-span-8 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#202321] uppercase tracking-wider">
                Buyer Budget Limit (INR)
              </label>
              <span className="text-xs text-[#777A75]">
                {allEligible.length} of {products.length} catalog listings eligible
              </span>
            </div>

            <AutoScaleInput
              value={budget}
              onChange={(val) => onBudgetChange(Math.max(100, val))}
              min={500}
              max={150000}
              step={500}
              prefix="₹"
              className="w-full"
            />

            {/* Quick preset buttons */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-[#777A75] mr-1">Presets:</span>
              {budgetPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => onBudgetChange(preset)}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors tabular-nums font-mono ${
                    budget === preset
                      ? 'bg-[#4058D6] text-white border-[#4058D6]'
                      : 'bg-[#FAF8F5] text-[#202321] border-[#E8E5DD] hover:bg-[#EEF1FC] hover:text-[#4058D6]'
                  }`}
                >
                  {formatINR(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Counter Ticker */}
          <div className="md:col-span-4 flex items-center justify-around bg-[#FAF8F5] p-4 rounded-xl border border-[#E8E5DD]">
            <div className="text-center">
              <span className="text-[11px] text-[#777A75] block font-medium uppercase tracking-wider">
                Eligible
              </span>
              <span className="text-2xl font-serif-title italic text-[#202321] tabular-nums font-normal block mt-0.5">
                <AnimatedNumber value={allEligible.length} />
              </span>
              <span className="text-[10px] text-[#777A75] mt-0.5 block">Under limit</span>
            </div>

            <div className="w-px h-8 bg-[#E8E5DD]" />

            <div className="text-center">
              <span className="text-[11px] text-[#777A75] block font-medium uppercase tracking-wider">
                Over Budget
              </span>
              <span className="text-2xl font-serif-title italic text-[#E78369] tabular-nums font-normal block mt-0.5">
                <AnimatedNumber value={excluded.length} />
              </span>
              <span className="text-[10px] text-[#777A75] mt-0.5 block">Excluded</span>
            </div>
          </div>
        </div>

        {/* Scoring Formula & Weights Accordion */}
        <ExpandableCard
          title="Documented Recommendation Formula & Weights"
          subtitle="Click to inspect exact mathematical calculation and tie-breaking rules"
          badge={
            <span className="text-[10px] bg-[#EEF1FC] text-[#4058D6] font-semibold px-2 py-0.5 rounded">
              Auditable Formula
            </span>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#777A75]">
            <div className="space-y-1 bg-white p-3.5 rounded-lg border border-[#E8E5DD]">
              <span className="font-semibold text-[#202321] block">Price Factor (0–100)</span>
              <p className="leading-relaxed">
                60% Retail Markdown + 40% Budget Headroom. Rewards both steep discounts from original MSRP and cash conservation.
              </p>
            </div>

            <div className="space-y-1 bg-white p-3.5 rounded-lg border border-[#E8E5DD]">
              <span className="font-semibold text-[#202321] block">Condition Factor (0–100)</span>
              <p className="leading-relaxed">
                Like New: 100 pts · Excellent: 80 pts · Good: 60 pts · Fair: 40 pts. Based strictly on student physical audit.
              </p>
            </div>

            <div className="space-y-1 bg-white p-3.5 rounded-lg border border-[#E8E5DD]">
              <span className="font-semibold text-[#202321] block">Age Factor (0–100)</span>
              <p className="leading-relaxed">
                Normalized on a 5-year campus baseline: 100 - (Age in years / 5) * 100. Lower age yields higher utility score.
              </p>
            </div>
          </div>
        </ExpandableCard>
      </div>

      {/* Top Ranked Recommendations */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#4058D6]" />
            <h3 className="text-lg font-semibold text-[#202321]">
              Ranked Campus Recommendations
            </h3>
          </div>
          <span className="text-xs text-[#777A75]">
            Optimized for {preference === 'value' ? 'Best Value Priority' : 'Best Condition Priority'} under {formatINR(budget)}
          </span>
        </div>

        {firstPick ? (
          <div className="space-y-5">
            {/* RANK #1 HERO SPOTLIGHT */}
            <Spotlight className="rounded-2xl border border-[#4058D6]/30 bg-white p-6 sm:p-7 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left Area: Product Core Identity */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#4058D6] text-white">
                      Rank #1 Pick
                    </span>
                    <span className="text-xs font-medium text-[#777A75]">
                      {firstPick.product.category} · {formatAge(firstPick.product.ageYears)} · {firstPick.product.condition}
                    </span>
                  </div>

                  <div>
                    <h3
                      onClick={() => onViewProduct(firstPick.product)}
                      className="font-serif-title italic text-2xl sm:text-3xl text-[#202321] hover:text-[#4058D6] cursor-pointer transition-colors leading-tight"
                    >
                      {firstPick.product.title}
                    </h3>
                    <p className="text-xs text-[#777A75] mt-1.5 line-clamp-2 leading-relaxed">
                      {firstPick.product.description}
                    </p>
                  </div>

                  {/* Price & Savings */}
                  <div className="flex flex-wrap items-baseline gap-3 pt-1">
                    <span className="text-3xl font-semibold text-[#202321] font-mono tabular-nums">
                      {formatINR(firstPick.product.currentPrice)}
                    </span>
                    <span className="text-sm text-[#777A75] line-through font-mono tabular-nums">
                      {formatINR(firstPick.product.originalPrice)}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#FAF5EE] text-[#4058D6] border border-[#4058D6]/20 tabular-nums">
                      Save {calculateDiscount(firstPick.product.currentPrice, firstPick.product.originalPrice)}% vs retail
                    </span>
                    <span className="text-xs text-[#777A75]">
                      ({formatINR(budget - firstPick.product.currentPrice)} under your budget)
                    </span>
                  </div>

                  {/* Rationale Quote */}
                  <div className="bg-[#FAF8F5] p-3 rounded-lg border-l-3 border-[#4058D6] text-xs text-[#202321] italic leading-relaxed">
                    "{firstPick.score.rationale}"
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => onViewProduct(firstPick.product)}
                      className="px-5 py-2 rounded-lg text-xs font-semibold bg-[#4058D6] text-white hover:bg-[#3146B8] transition-colors flex items-center gap-2 shadow-xs"
                    >
                      <span>Inspect Listing Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onToggleCompare(firstPick.product)}
                      className={`px-3.5 py-2 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        compareList.includes(firstPick.product.id)
                          ? 'bg-[#EEF1FC] text-[#4058D6] border-[#4058D6]'
                          : 'bg-white text-[#777A75] border-[#E8E5DD] hover:text-[#202321]'
                      }`}
                    >
                      {compareList.includes(firstPick.product.id) ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>In Compare Drawer</span>
                        </>
                      ) : (
                        <>
                          <Scale className="w-3.5 h-3.5" />
                          <span>Add to Compare</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right Area: Factor Progress & Score Circle */}
                <div className="lg:col-span-5 bg-[#FAF8F5] p-5 rounded-xl border border-[#E8E5DD] space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E8E5DD] pb-3">
                    <div>
                      <span className="text-[10px] font-semibold text-[#777A75] uppercase tracking-wider block">
                        Algorithm Index Score
                      </span>
                      <span className="text-xs text-[#777A75]">Weighted total</span>
                    </div>
                    <div className="text-right">
                      <span className="font-serif-title italic text-3xl text-[#4058D6] font-normal tabular-nums">
                        <AnimatedNumber value={firstPick.score.totalScore} />
                      </span>
                      <span className="text-xs text-[#777A75]">/100</span>
                    </div>
                  </div>

                  {/* Factors Breakdown */}
                  <div className="space-y-3 text-xs">
                    {/* Price Factor */}
                    <div>
                      <div className="flex justify-between items-center text-[#777A75] mb-1">
                        <VercelTooltip content="Price factor combining retail markdown and budget headroom">
                          <span className="cursor-help flex items-center gap-1 font-medium text-[#202321]">
                            <span>Price Factor</span>
                            <Info className="w-3 h-3 text-[#777A75]" />
                          </span>
                        </VercelTooltip>
                        <span className="font-semibold text-[#202321] tabular-nums font-mono">
                          <AnimatedNumber value={firstPick.score.priceScore} />/100
                        </span>
                      </div>
                      <div className="w-full bg-[#E8E5DD] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#4058D6] h-full rounded-full transition-all duration-500" style={{ width: `${firstPick.score.priceScore}%` }} />
                      </div>
                    </div>

                    {/* Condition Factor */}
                    <div>
                      <div className="flex justify-between items-center text-[#777A75] mb-1">
                        <VercelTooltip content="Condition rating based on physical wear">
                          <span className="cursor-help flex items-center gap-1 font-medium text-[#202321]">
                            <span>Condition Factor ({firstPick.product.condition})</span>
                            <Info className="w-3 h-3 text-[#777A75]" />
                          </span>
                        </VercelTooltip>
                        <span className="font-semibold text-[#202321] tabular-nums font-mono">
                          <AnimatedNumber value={firstPick.score.conditionScore} />/100
                        </span>
                      </div>
                      <div className="w-full bg-[#E8E5DD] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#315C48] h-full rounded-full transition-all duration-500" style={{ width: `${firstPick.score.conditionScore}%` }} />
                      </div>
                    </div>

                    {/* Age Factor */}
                    <div>
                      <div className="flex justify-between items-center text-[#777A75] mb-1">
                        <VercelTooltip content="Age factor based on 5-year campus depreciation lifecycle">
                          <span className="cursor-help flex items-center gap-1 font-medium text-[#202321]">
                            <span>Age Factor ({formatAge(firstPick.product.ageYears)})</span>
                            <Info className="w-3 h-3 text-[#777A75]" />
                          </span>
                        </VercelTooltip>
                        <span className="font-semibold text-[#202321] tabular-nums font-mono">
                          <AnimatedNumber value={firstPick.score.ageScore} />/100
                        </span>
                      </div>
                      <div className="w-full bg-[#E8E5DD] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#C28B35] h-full rounded-full transition-all duration-500" style={{ width: `${firstPick.score.ageScore}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Spotlight>

            {/* RUNNER-UPS: RANK #2 & RANK #3 */}
            {runnerUps.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                {runnerUps.map((item, index) => {
                  const rankNumber = index + 2;
                  const { product, score } = item;
                  const discount = calculateDiscount(product.currentPrice, product.originalPrice);

                  return (
                    <div
                      key={product.id}
                      className="bg-white border border-[#E8E5DD] rounded-xl p-5 flex flex-col justify-between hover:border-[#4058D6]/40 transition-colors shadow-xs"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-[#E8E5DD]">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#FAF8F5] text-[#777A75] border border-[#E8E5DD]">
                              Rank #{rankNumber}
                            </span>
                            <span className="text-xs text-[#777A75]">{product.category}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold text-[#4058D6] tabular-nums">
                              Score: {score.totalScore}/100
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4
                            onClick={() => onViewProduct(product)}
                            className="text-base font-semibold text-[#202321] hover:text-[#4058D6] cursor-pointer line-clamp-1"
                          >
                            {product.title}
                          </h4>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-lg font-semibold text-[#202321] font-mono tabular-nums">
                              {formatINR(product.currentPrice)}
                            </span>
                            <span className="text-xs text-[#777A75] line-through font-mono tabular-nums">
                              {formatINR(product.originalPrice)}
                            </span>
                            <span className="text-xs text-[#315C48] font-medium">
                              Save {discount}%
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-[#777A75] line-clamp-2 italic bg-[#FAF8F5] p-2.5 rounded border border-[#E8E5DD]">
                          "{score.rationale}"
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4 mt-3 border-t border-[#E8E5DD]">
                        <button
                          onClick={() => onViewProduct(product)}
                          className="flex-1 py-1.5 text-xs font-semibold bg-[#FAF8F5] hover:bg-[#EEF1FC] text-[#202321] hover:text-[#4058D6] rounded-lg border border-[#E8E5DD] transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => onToggleCompare(product)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            compareList.includes(product.id)
                              ? 'bg-[#EEF1FC] text-[#4058D6] border-[#4058D6]'
                              : 'bg-white text-[#777A75] border-[#E8E5DD] hover:text-[#202321]'
                          }`}
                          title="Toggle comparison"
                        >
                          {compareList.includes(product.id) ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Scale className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Empty Recommendations within budget */
          <div className="bg-white border border-[#E8E5DD] rounded-xl p-10 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-[#C28B35] mx-auto" />
            <h4 className="text-base font-semibold text-[#202321]">
              No products found under {formatINR(budget)}
            </h4>
            <p className="text-xs text-[#777A75] max-w-md mx-auto leading-relaxed">
              No current listings fall at or below {formatINR(budget)}. In our dataset, textbooks and dorm appliances start from {formatINR(620)}.
            </p>
            <div className="pt-2">
              <button
                onClick={() => onBudgetChange(2000)}
                className="px-4 py-2 text-xs font-semibold bg-[#4058D6] text-white rounded-lg hover:bg-[#3146B8]"
              >
                Set Budget to {formatINR(2000)}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Additional Eligible Options Toggle */}
      {allEligible.length > 3 && (
        <div className="border border-[#E8E5DD] bg-white rounded-xl overflow-hidden shadow-xs">
          <button
            onClick={() => setShowAllEligible(!showAllEligible)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-[#FAF8F5] transition-colors"
          >
            <span className="text-xs font-semibold text-[#202321]">
              View {allEligible.length - 3} More Eligible Products Under {formatINR(budget)}
            </span>
            {showAllEligible ? <ChevronUp className="w-4 h-4 text-[#777A75]" /> : <ChevronDown className="w-4 h-4 text-[#777A75]" />}
          </button>

          {showAllEligible && (
            <div className="p-5 border-t border-[#E8E5DD] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allEligible.slice(3).map(({ product, score }) => (
                <div
                  key={product.id}
                  className="bg-[#FAF8F5] border border-[#E8E5DD] rounded-lg p-3.5 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#777A75] mb-1">
                      <span>{product.category} · {formatAge(product.ageYears)}</span>
                      <span className="font-semibold text-[#4058D6] tabular-nums">
                        Score: {score.totalScore}/100
                      </span>
                    </div>
                    <h5
                      onClick={() => onViewProduct(product)}
                      className="text-xs font-semibold text-[#202321] line-clamp-1 hover:underline cursor-pointer"
                    >
                      {product.title}
                    </h5>
                    <div className="text-xs text-[#202521] font-semibold mt-1 tabular-nums font-mono">
                      {formatINR(product.currentPrice)}{' '}
                      <span className="text-[11px] text-[#777A75] font-normal line-through">
                        {formatINR(product.originalPrice)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onViewProduct(product)}
                    className="w-full py-1.5 text-[11px] font-medium bg-white border border-[#E8E5DD] rounded hover:border-[#4058D6] text-[#202321]"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Excluded Section (Over Budget) */}
      <div className="border border-[#E8E5DD] bg-white rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#777A75] uppercase tracking-wider">
                Excluded Listings (Over Budget)
              </span>
              <span className="px-1.5 py-0.5 text-xs font-medium bg-[#FAF5EE] text-[#777A75] rounded tabular-nums border border-[#E8E5DD]">
                {excluded.length} items
              </span>
            </div>
            <p className="text-xs text-[#777A75] mt-0.5">
              These listings exceed your current {formatINR(budget)} limit and are mathematically excluded from recommendation eligibility.
            </p>
          </div>

          <button
            onClick={() => setShowExcluded(!showExcluded)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4058D6] hover:underline"
          >
            <span>{showExcluded ? 'Hide Excluded' : 'Inspect Excluded Items'}</span>
            {showExcluded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showExcluded && (
          <div className="divide-y divide-[#E8E5DD] border-t border-[#E8E5DD]">
            {excluded.map(({ product }) => {
              const overBy = product.currentPrice - budget;
              return (
                <div
                  key={product.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5] transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#777A75]">
                      <span>{product.category}</span>
                      <span>·</span>
                      <span>{product.condition}</span>
                      <span>·</span>
                      <span>{formatAge(product.ageYears)}</span>
                    </div>
                    <h5
                      onClick={() => onViewProduct(product)}
                      className="text-sm font-semibold text-[#202321] hover:underline cursor-pointer"
                    >
                      {product.title}
                    </h5>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-[#202321] tabular-nums font-mono">
                        {formatINR(product.currentPrice)}
                      </div>
                      <div className="text-[11px] text-[#E78369] font-medium tabular-nums">
                        +{formatINR(overBy)} above budget
                      </div>
                    </div>

                    <button
                      onClick={() => onBudgetChange(product.currentPrice)}
                      className="px-2.5 py-1.5 text-xs font-medium bg-white border border-[#E8E5DD] hover:border-[#4058D6] rounded-md text-[#202321] transition-colors shadow-xs"
                      title="Adjust budget to include this listing"
                    >
                      Adjust Budget to {formatINR(product.currentPrice)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
