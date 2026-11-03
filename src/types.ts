export type Category =
  | 'Textbooks & Books'
  | 'Laptops & Computing'
  | 'Bicycles & Mobility'
  | 'Audio & Gadgets'
  | 'Dorm Essentials';

export type Condition = 'Like New' | 'Excellent' | 'Good' | 'Fair';

export interface Product {
  id: string;
  title: string;
  category: Category;
  currentPrice: number; // in INR (₹)
  originalPrice: number; // in INR (₹)
  ageYears: number; // in years (e.g., 0.5, 1, 1.5, 2)
  condition: Condition;
  description: string;
  campusLocation: string;
  listedDate: string;
  isUserListing?: boolean;
  isSampleData?: boolean;
}

export type RecommendationPreference = 'value' | 'condition';

export interface RecommendationScore {
  totalScore: number; // 0 - 100
  priceScore: number; // 0 - 100 (combination of discount and affordability)
  conditionScore: number; // 0 - 100
  ageScore: number; // 0 - 100
  budgetFitPercentage: number; // 0 - 100
  rationale: string;
  eligible: boolean;
  exclusionReason?: string;
}

export type PriceFlagType = 'below_market' | 'above_median' | 'fair_market' | 'insufficient_data';

export interface PriceAnalysis {
  discountPercentage: number;
  savingsRupees: number;
  categoryMedian: number;
  categoryMin: number;
  categoryMax: number;
  deviationPercentage: number;
  comparableCount: number;
  hasSufficientData: boolean; // requires at least 3 comparable listings in dataset
  thresholdPercentage: number; // 25% documented deviation threshold
  flag: PriceFlagType;
  flagLabel: string;
  explanation: string;
}

export interface CategorySummary {
  category: Category;
  count: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  avgDiscount: number;
  flaggedCount: number;
  hasSufficientData: boolean;
}
