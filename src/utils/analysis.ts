import {
  Product,
  Category,
  PriceAnalysis,
  RecommendationScore,
  RecommendationPreference,
  CategorySummary,
} from '../types';
import { formatINR, formatAge } from './format';

export const DEVIATION_THRESHOLD_PERCENT = 25; // Clearly documented anomaly threshold (±25%)
export const MIN_COMPARABLE_LISTINGS_FOR_ANOMALY = 3; // Minimum sample size required

export function calculateDiscount(currentPrice: number, originalPrice: number): number {
  if (originalPrice <= 0) return 0;
  const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
  return Math.max(0, Math.round(discount));
}

export function getCategoryMedian(category: Category, products: Product[]): number {
  const categoryProducts = products.filter((p) => p.category === category);
  if (categoryProducts.length === 0) return 0;

  const prices = categoryProducts.map((p) => p.currentPrice).sort((a, b) => a - b);
  const mid = Math.floor(prices.length / 2);

  if (prices.length % 2 === 0) {
    return Math.round((prices[mid - 1] + prices[mid]) / 2);
  }
  return prices[mid];
}

export function getCategoryStats(category: Category, products: Product[]): CategorySummary {
  const categoryProducts = products.filter((p) => p.category === category);
  const count = categoryProducts.length;
  const hasSufficientData = count >= MIN_COMPARABLE_LISTINGS_FOR_ANOMALY;

  if (count === 0) {
    return {
      category,
      count: 0,
      medianPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      avgDiscount: 0,
      flaggedCount: 0,
      hasSufficientData: false,
    };
  }

  const prices = categoryProducts.map((p) => p.currentPrice).sort((a, b) => a - b);
  const minPrice = prices[0];
  const maxPrice = prices[prices.length - 1];
  const medianPrice = getCategoryMedian(category, products);

  const totalDiscount = categoryProducts.reduce(
    (sum, p) => sum + calculateDiscount(p.currentPrice, p.originalPrice),
    0
  );
  const avgDiscount = Math.round(totalDiscount / count);

  const flaggedCount = hasSufficientData
    ? categoryProducts.filter((p) => {
        const analysis = analyzePrice(p, products);
        return analysis.flag === 'below_market' || analysis.flag === 'above_median';
      }).length
    : 0;

  return {
    category,
    count,
    medianPrice,
    minPrice,
    maxPrice,
    avgDiscount,
    flaggedCount,
    hasSufficientData,
  };
}

export function analyzePrice(product: Product, allProducts: Product[]): PriceAnalysis {
  const discountPercentage = calculateDiscount(product.currentPrice, product.originalPrice);
  const savingsRupees = Math.max(0, product.originalPrice - product.currentPrice);
  const categoryProducts = allProducts.filter((p) => p.category === product.category);
  const comparableCount = categoryProducts.length;
  const hasSufficientData = comparableCount >= MIN_COMPARABLE_LISTINGS_FOR_ANOMALY;

  const prices = categoryProducts.map((p) => p.currentPrice).sort((a, b) => a - b);
  const categoryMin = prices.length ? prices[0] : product.currentPrice;
  const categoryMax = prices.length ? prices[prices.length - 1] : product.currentPrice;
  const categoryMedian = getCategoryMedian(product.category, allProducts);

  let deviationPercentage = 0;
  if (categoryMedian > 0) {
    deviationPercentage = Math.round(((product.currentPrice - categoryMedian) / categoryMedian) * 100);
  }

  // Anomaly Detection Rule:
  // Only perform anomaly detection when a category has at least 3 comparable listings in the dataset
  if (!hasSufficientData) {
    return {
      discountPercentage,
      savingsRupees,
      categoryMedian,
      categoryMin,
      categoryMax,
      deviationPercentage,
      comparableCount,
      hasSufficientData: false,
      thresholdPercentage: DEVIATION_THRESHOLD_PERCENT,
      flag: 'insufficient_data',
      flagLabel: 'Insufficient Sample Size',
      explanation: `Only ${comparableCount} listing(s) available in ${product.category}. At least ${MIN_COMPARABLE_LISTINGS_FOR_ANOMALY} comparable listings are required before statistical anomaly flags can be calculated.`,
    };
  }

  let flag: 'below_market' | 'above_median' | 'fair_market' = 'fair_market';
  let flagLabel = 'Within Category Normal Range';
  let explanation = `Priced within ±${DEVIATION_THRESHOLD_PERCENT}% of the dataset median (${formatINR(categoryMedian)}) across ${comparableCount} comparable listings.`;

  if (deviationPercentage <= -DEVIATION_THRESHOLD_PERCENT || discountPercentage >= 65) {
    flag = 'below_market';
    flagLabel = `Priced Below Dataset Median (> ${DEVIATION_THRESHOLD_PERCENT}%)`;
    if (deviationPercentage <= -DEVIATION_THRESHOLD_PERCENT) {
      explanation = `Listed ${Math.abs(deviationPercentage)}% below the dataset median of ${formatINR(categoryMedian)} (based on ${comparableCount} listings). Indicator for further review—check wear, battery health, or accessories.`;
    } else {
      explanation = `Deep ${discountPercentage}% markdown from original retail price (${formatINR(product.originalPrice)}). Significant student savings, verify physical condition.`;
    }
  } else if (deviationPercentage >= DEVIATION_THRESHOLD_PERCENT) {
    flag = 'above_median';
    flagLabel = `Priced Above Dataset Median (> ${DEVIATION_THRESHOLD_PERCENT}%)`;
    explanation = `Listed ${deviationPercentage}% above the dataset median of ${formatINR(categoryMedian)} (based on ${comparableCount} listings). Likely reflects higher specifications or bundled accessories.`;
  }

  return {
    discountPercentage,
    savingsRupees,
    categoryMedian,
    categoryMin,
    categoryMax,
    deviationPercentage,
    comparableCount,
    hasSufficientData: true,
    thresholdPercentage: DEVIATION_THRESHOLD_PERCENT,
    flag,
    flagLabel,
    explanation,
  };
}

/**
 * Recommendation Scoring Algorithm:
 * Evaluates three primary factors: Price, Age (in years), Condition.
 * All factors normalized to 0-100 scale.
 */
export function calculateRecommendationScore(
  product: Product,
  budget: number,
  preference: RecommendationPreference
): RecommendationScore {
  // Budget constraint: Strictly excluded if exceeding buyer budget
  if (product.currentPrice > budget) {
    const diff = product.currentPrice - budget;
    return {
      totalScore: 0,
      priceScore: 0,
      conditionScore: 0,
      ageScore: 0,
      budgetFitPercentage: 0,
      eligible: false,
      exclusionReason: `Exceeds your budget by ${formatINR(diff)}`,
      rationale: `Excluded because price (${formatINR(product.currentPrice)}) exceeds your ${formatINR(budget)} limit.`,
    };
  }

  // 1. Price Factor: Combines retail discount and affordability within budget
  const discountPct = calculateDiscount(product.currentPrice, product.originalPrice);
  const budgetHeadroom = budget > 0 ? (budget - product.currentPrice) / budget : 0;
  const budgetFitPercentage = Math.round(budgetHeadroom * 100);
  const affordabilityScore = Math.max(0, Math.min(100, Math.round(budgetHeadroom * 100)));
  const priceScore = Math.max(0, Math.min(100, Math.round(0.6 * discountPct + 0.4 * affordabilityScore)));

  // 2. Condition Factor:
  // Like New = 100, Excellent = 80, Good = 60, Fair = 40
  const conditionScoreMap: Record<string, number> = {
    'Like New': 100,
    'Excellent': 80,
    'Good': 60,
    'Fair': 40,
  };
  const conditionScore = conditionScoreMap[product.condition] ?? 50;

  // 3. Age Factor (in years, max lifecycle baseline = 5.0 years):
  // 0 yr = 100, 1 yr = 80, 2 yr = 60, 3 yr = 40, 4 yr = 20, 5+ yr = 10
  const ageScore = Math.max(10, Math.min(100, Math.round(Math.max(0, 1 - (product.ageYears / 5.0)) * 100)));

  let totalScore = 0;
  let rationale = '';

  if (preference === 'value') {
    // Formula: 50% Price + 30% Condition + 20% Age
    totalScore = Math.round(0.50 * priceScore + 0.30 * conditionScore + 0.20 * ageScore);
    rationale = `Recommended under Best Value: saves ${discountPct}% off retail, leaves ${formatINR(budget - product.currentPrice)} in student budget headroom, with ${product.condition} condition rating.`;
  } else {
    // Formula: 50% Condition + 35% Age + 15% Price
    totalScore = Math.round(0.50 * conditionScore + 0.35 * ageScore + 0.15 * priceScore);
    rationale = `Recommended under Best Condition: high condition rating (${product.condition}), low usage age (${formatAge(product.ageYears)}), while remaining within your ${formatINR(budget)} limit.`;
  }

  // Clamp 0 to 100
  totalScore = Math.max(1, Math.min(100, totalScore));

  return {
    totalScore,
    priceScore,
    conditionScore,
    ageScore,
    budgetFitPercentage,
    eligible: true,
    rationale,
  };
}

export function getRecommendations(
  products: Product[],
  budget: number,
  preference: RecommendationPreference
) {
  const evaluated = products.map((product) => ({
    product,
    score: calculateRecommendationScore(product, budget, preference),
  }));

  // Sort eligible items by:
  // 1. Total score descending
  // 2. Lower price ascending (tie-breaker)
  // 3. Lower age ascending (tie-breaker)
  const eligible = evaluated
    .filter((item) => item.score.eligible)
    .sort((a, b) => {
      if (b.score.totalScore !== a.score.totalScore) {
        return b.score.totalScore - a.score.totalScore;
      }
      if (a.product.currentPrice !== b.product.currentPrice) {
        return a.product.currentPrice - b.product.currentPrice;
      }
      return a.product.ageYears - b.product.ageYears;
    });

  const excluded = evaluated
    .filter((item) => !item.score.eligible)
    .sort((a, b) => a.product.currentPrice - b.product.currentPrice);

  return {
    topThree: eligible.slice(0, 3),
    allEligible: eligible,
    excluded,
  };
}
