import React, { useState } from 'react';
import { Plus, X, ArrowRight, RotateCcw, AlertCircle, Scale } from 'lucide-react';
import { Product } from '../types';
import { CategoryPlaceholder } from '../components/CategoryPlaceholder';
import { calculateDiscount, calculateRecommendationScore, analyzePrice } from '../utils/analysis';
import { formatINR, formatAge } from '../utils/format';
import { useToast } from '../components/ui/Sonner';

interface CompareViewProps {
  products: Product[];
  compareList: string[];
  onRemoveFromCompare: (productId: string) => void;
  onAddToCompare: (productId: string) => void;
  onClearCompare: () => void;
  onViewProduct: (product: Product) => void;
  userBudget: number;
}

export const CompareView: React.FC<CompareViewProps> = ({
  products,
  compareList,
  onRemoveFromCompare,
  onAddToCompare,
  onClearCompare,
  onViewProduct,
  userBudget,
}) => {
  const [selectedToAdd, setSelectedToAdd] = useState<string>('');
  const { toast } = useToast();

  const comparedProducts = products.filter((p) => compareList.includes(p.id));
  const availableToAdd = products.filter((p) => !compareList.includes(p.id));

  const handleAdd = () => {
    if (selectedToAdd && compareList.length < 4) {
      onAddToCompare(selectedToAdd);
      const addedProduct = products.find((p) => p.id === selectedToAdd);
      if (addedProduct) {
        toast({
          title: 'Product Added to Comparison',
          description: `"${addedProduct.title}" added (${compareList.length + 1}/4 items).`,
          type: 'success',
        });
      }
      setSelectedToAdd('');
    }
  };

  const handleRemove = (id: string, title: string) => {
    onRemoveFromCompare(id);
    toast({
      title: 'Removed from Comparison',
      description: `"${title}" was removed.`,
      type: 'info',
    });
  };

  // Quick preset shortcuts in INR
  const handleLoadSample = (type: 'tech' | 'books' | 'cycles') => {
    onClearCompare();
    if (type === 'tech') {
      const p1 = products.find((p) => p.title.includes('MacBook'));
      const p2 = products.find((p) => p.title.includes('iPad'));
      const p3 = products.find((p) => p.title.includes('Monitor'));
      [p1, p2, p3].forEach((p) => p && onAddToCompare(p.id));
    } else if (type === 'books') {
      const p1 = products.find((p) => p.title.includes('Calculus'));
      const p2 = products.find((p) => p.title.includes('Chemistry'));
      const p3 = products.find((p) => p.title.includes('Biology'));
      [p1, p2, p3].forEach((p) => p && onAddToCompare(p.id));
    } else {
      const p1 = products.find((p) => p.title.includes('Hero'));
      const p2 = products.find((p) => p.title.includes('Firefox'));
      const p3 = products.find((p) => p.title.includes('Hercules'));
      [p1, p2, p3].forEach((p) => p && onAddToCompare(p.id));
    }
    toast({
      title: 'Comparison Bundle Loaded',
      description: `Loaded preset ${type} comparison items.`,
      type: 'info',
    });
  };

  // Compute key comparison metrics to highlight relative domain advantages neutrally
  const minPrice = comparedProducts.length > 0 ? Math.min(...comparedProducts.map((p) => p.currentPrice)) : 0;
  const minAge = comparedProducts.length > 0 ? Math.min(...comparedProducts.map((p) => p.ageYears)) : 0;
  const maxDiscount = comparedProducts.length > 0
    ? Math.max(...comparedProducts.map((p) => calculateDiscount(p.currentPrice, p.originalPrice)))
    : 0;

  return (
    <div className="space-y-6">
      {/* Editorial Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-2 border-b border-[#E8E5DD]">
        <div>
          <h2 className="font-serif-title italic text-2xl sm:text-3xl text-[#202321] tracking-tight">
            Side by side. Zero guesswork.
          </h2>
          <p className="text-xs sm:text-sm text-[#777A75] mt-1 leading-relaxed">
            Neutral multi-metric evaluation across listed price, discount %, equipment age in years, physical condition, and algorithmic match scores.
          </p>
        </div>

        {compareList.length > 0 && (
          <button
            onClick={() => {
              onClearCompare();
              toast({
                title: 'Comparison Cleared',
                description: 'All comparison slots are now empty.',
                type: 'info',
              });
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#777A75] hover:text-[#E78369] bg-white border border-[#E8E5DD] rounded-lg transition-colors shrink-0 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Comparison ({compareList.length})</span>
          </button>
        )}
      </div>

      {/* Add Product To Compare Bar */}
      {compareList.length < 4 && (
        <div className="bg-white border border-[#E8E5DD] rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-[#777A75] w-full sm:w-auto">
            <Scale className="w-4 h-4 text-[#4058D6]" />
            <span className="font-semibold text-[#202321]">Compare Slots ({compareList.length}/4 max):</span>
            <span>Select an item from catalog to add</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedToAdd}
              onChange={(e) => setSelectedToAdd(e.target.value)}
              className="py-1.5 px-3 text-xs bg-[#FAF8F5] border border-[#E8E5DD] rounded-lg text-[#202321] focus:outline-none focus:border-[#4058D6] max-w-xs truncate"
            >
              <option value="">Select a listing...</option>
              {availableToAdd.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({formatINR(p.currentPrice)})
                </option>
              ))}
            </select>

            <button
              onClick={handleAdd}
              disabled={!selectedToAdd}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#4058D6] text-white rounded-lg hover:bg-[#3146B8] disabled:opacity-40 disabled:pointer-events-none transition-colors inline-flex items-center gap-1 shrink-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Compare</span>
            </button>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {comparedProducts.length > 0 ? (
        <div className="bg-white border border-[#E8E5DD] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E8E5DD]">
                  <th className="py-4 px-5 w-48 text-[#777A75] font-semibold text-xs uppercase tracking-wider">
                    Listing Comparison
                  </th>
                  {comparedProducts.map((p) => (
                    <th key={p.id} className="py-4 px-5 min-w-56 text-[#202321] align-top">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-[#777A75] font-medium">{p.category}</span>
                          <button
                            onClick={() => handleRemove(p.id, p.title)}
                            className="p-1 text-[#777A75] hover:text-[#E78369] hover:bg-[#FDF2F0] rounded transition-colors"
                            title="Remove from comparison"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <CategoryPlaceholder category={p.category} className="w-full h-16" size="sm" />

                        <h4
                          onClick={() => onViewProduct(p)}
                          className="text-sm font-semibold text-[#202321] line-clamp-2 hover:text-[#4058D6] cursor-pointer"
                        >
                          {p.title}
                        </h4>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E8E5DD]">
                {/* Row 1: Current Price & Budget Fit Warning */}
                <tr className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-5 font-semibold text-[#777A75]">
                    Listed Price
                    <span className="block text-[10px] text-[#777A75] font-normal">
                      Current budget: {formatINR(userBudget)}
                    </span>
                  </td>
                  {comparedProducts.map((p) => {
                    const isLowest = comparedProducts.length > 1 && p.currentPrice === minPrice;
                    const isOverBudget = p.currentPrice > userBudget;
                    const overAmount = p.currentPrice - userBudget;

                    return (
                      <td key={p.id} className="py-3.5 px-5 align-top">
                        <div className="flex items-baseline gap-2">
                          <span className={`text-base font-bold tabular-nums font-mono ${isLowest ? 'text-[#315C48]' : 'text-[#202321]'}`}>
                            {formatINR(p.currentPrice)}
                          </span>
                          {isLowest && (
                            <span className="text-[10px] font-semibold text-[#315C48] bg-[#EBF2EE] px-1.5 py-0.5 rounded border border-[#315C48]/20">
                              Lowest Price
                            </span>
                          )}
                        </div>

                        {/* Explicit Budget Exceeded Notice */}
                        {isOverBudget ? (
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-[#E78369] font-medium">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Exceeds budget by {formatINR(overAmount)}</span>
                          </div>
                        ) : (
                          <div className="mt-1 text-[11px] text-[#777A75]">
                            Leaves {formatINR(userBudget - p.currentPrice)} headroom
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Row 2: Original Retail MSRP */}
                <tr className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-5 font-semibold text-[#777A75]">Original Retail MSRP</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="py-3.5 px-5 text-[#777A75] line-through tabular-nums font-mono">
                      {formatINR(p.originalPrice)}
                    </td>
                  ))}
                </tr>

                {/* Row 3: Price Reduction */}
                <tr className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-5 font-semibold text-[#777A75]">Price Reduction</td>
                  {comparedProducts.map((p) => {
                    const discount = calculateDiscount(p.currentPrice, p.originalPrice);
                    const saved = p.originalPrice - p.currentPrice;
                    const isMaxDiscount = comparedProducts.length > 1 && discount === maxDiscount;

                    return (
                      <td key={p.id} className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5 font-semibold text-[#315C48] tabular-nums font-mono">
                          <span>Save {formatINR(saved)} ({discount}%)</span>
                          {isMaxDiscount && (
                            <span className="text-[10px] font-semibold text-[#315C48] bg-[#EBF2EE] px-1.5 py-0.5 rounded border border-[#315C48]/20">
                              Highest Discount
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Row 4: Product Age in Years */}
                <tr className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-5 font-semibold text-[#777A75]">Product Age (Years)</td>
                  {comparedProducts.map((p) => {
                    const isYoungest = comparedProducts.length > 1 && p.ageYears === minAge;
                    return (
                      <td key={p.id} className="py-3.5 px-5 text-[#202321] tabular-nums font-mono">
                        <div className="flex items-center gap-1.5">
                          <span>{formatAge(p.ageYears)}</span>
                          {isYoungest && (
                            <span className="text-[10px] font-semibold text-[#315C48] bg-[#EBF2EE] px-1.5 py-0.5 rounded border border-[#315C48]/20">
                              Youngest
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Row 5: Condition */}
                <tr className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-5 font-semibold text-[#777A75]">Condition Rating</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="py-3.5 px-5">
                      <span className="font-semibold text-[#202321]">
                        {p.condition}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Row 6: Recommendation Scores */}
                <tr className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-5 font-semibold text-[#777A75]">
                    Recommendation Scores
                    <span className="block text-[10px] text-[#777A75] font-normal">
                      Under {formatINR(userBudget)} budget
                    </span>
                  </td>
                  {comparedProducts.map((p) => {
                    const valueScore = calculateRecommendationScore(p, userBudget, 'value');
                    const conditionScore = calculateRecommendationScore(p, userBudget, 'condition');

                    return (
                      <td key={p.id} className="py-3.5 px-5">
                        {valueScore.eligible ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[#777A75]">Best Value:</span>
                              <span className="font-bold text-[#4058D6] tabular-nums font-mono">
                                {valueScore.totalScore}/100
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[#777A75]">Best Condition:</span>
                              <span className="font-bold text-[#315C48] tabular-nums font-mono">
                                {conditionScore.totalScore}/100
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[#E78369] text-xs font-semibold">
                            Excluded (Over budget)
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Row 7: Price Intelligence Diagnostics */}
                <tr className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-5 font-semibold text-[#777A75]">Price Intelligence</td>
                  {comparedProducts.map((p) => {
                    const analysis = analyzePrice(p, products);
                    return (
                      <td key={p.id} className="py-3.5 px-5 text-[#202321]">
                        <div className="font-medium">{analysis.flagLabel}</div>
                        <div className="text-[11px] text-[#777A75] font-mono">
                          {analysis.hasSufficientData
                            ? `${analysis.deviationPercentage > 0 ? `+${analysis.deviationPercentage}%` : `${analysis.deviationPercentage}%`} vs median (${formatINR(analysis.categoryMedian)})`
                            : 'Sample size < 3 listings'}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Row 8: Campus Meetup Location */}
                <tr className="hover:bg-[#FAF8F5]">
                  <td className="py-3.5 px-5 font-semibold text-[#777A75]">Campus Location</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="py-3.5 px-5 text-[#777A75]">
                      {p.campusLocation}
                    </td>
                  ))}
                </tr>

                {/* Row 9: Actions */}
                <tr className="bg-[#FAF8F5]">
                  <td className="py-4 px-5 font-semibold text-[#777A75]">Actions</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="py-4 px-5">
                      <button
                        onClick={() => onViewProduct(p)}
                        className="w-full py-2 px-3 text-xs font-semibold bg-[#4058D6] text-white hover:bg-[#3146B8] rounded-lg transition-colors text-center inline-flex items-center justify-center gap-1 shadow-xs"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-[#E8E5DD] rounded-xl p-10 text-center space-y-4 shadow-xs">
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-semibold text-[#202321]">
              No products selected for comparison
            </h3>
            <p className="text-xs text-[#777A75] leading-relaxed">
              Add products using the compare button on any product card or choose a category bundle below:
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => handleLoadSample('tech')}
              className="px-3.5 py-2 text-xs font-semibold bg-[#FAF8F5] hover:bg-[#EEF1FC] text-[#4058D6] border border-[#E8E5DD] hover:border-[#4058D6] rounded-lg transition-colors"
            >
              Compare Laptops &amp; Computing
            </button>
            <button
              onClick={() => handleLoadSample('books')}
              className="px-3.5 py-2 text-xs font-semibold bg-[#FAF8F5] hover:bg-[#EEF1FC] text-[#4058D6] border border-[#E8E5DD] hover:border-[#4058D6] rounded-lg transition-colors"
            >
              Compare Course Textbooks
            </button>
            <button
              onClick={() => handleLoadSample('cycles')}
              className="px-3.5 py-2 text-xs font-semibold bg-[#FAF8F5] hover:bg-[#EEF1FC] text-[#4058D6] border border-[#E8E5DD] hover:border-[#4058D6] rounded-lg transition-colors"
            >
              Compare Commuter Bicycles
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
