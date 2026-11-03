import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { NavTab } from './components/Sidebar';
import { ProductDetailModal } from './components/ProductDetailModal';
import { OverviewView } from './views/OverviewView';
import { ExploreView } from './views/ExploreView';
import { RecommendationsView } from './views/RecommendationsView';
import { PriceIntelligenceView } from './views/PriceIntelligenceView';
import { CompareView } from './views/CompareView';
import { ManageListingsView } from './views/ManageListingsView';
import { INITIAL_PRODUCTS } from './data/initialProducts';
import { Product, RecommendationPreference } from './types';
import { ToastProvider } from './components/ui/Sonner';

const STORAGE_KEY_PRODUCTS = 'campuscart_listings_inr_v2';
const STORAGE_KEY_COMPARE = 'campuscart_compare_inr_v2';
const STORAGE_KEY_BUDGET = 'campuscart_budget_inr_v2';

export default function App() {
  // 1. Products Catalog State (persisted in localStorage)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Check if data is in INR and has ageYears
          if (typeof parsed[0].ageYears === 'number') {
            return parsed;
          }
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_PRODUCTS;
  });

  // Save to localStorage when products change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch {
      // Storage error safeguard
    }
  }, [products]);

  // 2. Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 3. Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');

  // 4. Budget & Recommendation Preference (Default ₹15,000)
  const [userBudget, setUserBudget] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BUDGET);
      if (saved) {
        const val = Number(saved);
        if (val > 100) return val;
      }
    } catch {
      // fallback
    }
    return 15000;
  });

  const [recommendationPreference, setRecommendationPreference] =
    useState<RecommendationPreference>('value');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BUDGET, userBudget.toString());
    } catch {
      // ignore
    }
  }, [userBudget]);

  // 5. Compare List (Array of product IDs)
  const [compareList, setCompareList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMPARE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return ['prod-1', 'prod-9']; // Pre-populate 2 items for immediate demonstration
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COMPARE, JSON.stringify(compareList));
    } catch {
      // ignore
    }
  }, [compareList]);

  // 6. Selected Product Details Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Compare Handlers
  const handleToggleCompare = (product: Product) => {
    setCompareList((prev) => {
      if (prev.includes(product.id)) {
        return prev.filter((id) => id !== product.id);
      } else {
        if (prev.length >= 4) {
          return [...prev.slice(1), product.id];
        }
        return [...prev, product.id];
      }
    });
  };

  const handleRemoveFromCompare = (productId: string) => {
    setCompareList((prev) => prev.filter((id) => id !== productId));
  };

  const handleAddToCompare = (productId: string) => {
    if (!compareList.includes(productId) && compareList.length < 4) {
      setCompareList((prev) => [...prev, productId]);
    }
  };

  const handleClearCompare = () => {
    setCompareList([]);
  };

  // Manage Listings Handlers
  const handleAddProduct = (newProductData: Omit<Product, 'id' | 'listedDate'>) => {
    const newProduct: Product = {
      ...newProductData,
      id: `prod-user-${Date.now()}`,
      listedDate: new Date().toISOString().split('T')[0],
      isUserListing: true,
      isSampleData: false,
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (selectedProduct && selectedProduct.id === updated.id) {
      setSelectedProduct(updated);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCompareList((prev) => prev.filter((id) => id !== productId));
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(null);
    }
  };

  const handleResetToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setCompareList(['prod-1', 'prod-9']);
    setUserBudget(15000);
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    localStorage.removeItem(STORAGE_KEY_COMPARE);
    localStorage.removeItem(STORAGE_KEY_BUDGET);
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F6F4EF] text-[#202321] flex flex-col">
        {/* Navigation Dock (Top Header on Desktop, Bottom Dock on Mobile) */}
        <Navigation
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          compareCount={compareList.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenAddModal={() => {
            setCurrentTab('manage');
            setIsAddModalOpen(true);
          }}
        />

        {/* Main App Content Viewport */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          {currentTab === 'overview' && (
            <OverviewView
              products={products}
              onSelectTab={setCurrentTab}
              onViewProduct={setSelectedProduct}
              compareList={compareList}
              onToggleCompare={handleToggleCompare}
              userBudget={userBudget}
            />
          )}

          {currentTab === 'explore' && (
            <ExploreView
              products={products}
              onViewProduct={setSelectedProduct}
              compareList={compareList}
              onToggleCompare={handleToggleCompare}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {currentTab === 'recommendations' && (
            <RecommendationsView
              products={products}
              budget={userBudget}
              onBudgetChange={setUserBudget}
              preference={recommendationPreference}
              onPreferenceChange={setRecommendationPreference}
              onViewProduct={setSelectedProduct}
              compareList={compareList}
              onToggleCompare={handleToggleCompare}
            />
          )}

          {currentTab === 'price_intelligence' && (
            <PriceIntelligenceView
              products={products}
              onViewProduct={setSelectedProduct}
              compareList={compareList}
              onToggleCompare={handleToggleCompare}
            />
          )}

          {currentTab === 'compare' && (
            <CompareView
              products={products}
              compareList={compareList}
              onRemoveFromCompare={handleRemoveFromCompare}
              onAddToCompare={handleAddToCompare}
              onClearCompare={handleClearCompare}
              onViewProduct={setSelectedProduct}
              userBudget={userBudget}
            />
          )}

          {currentTab === 'manage' && (
            <ManageListingsView
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onResetToDefaults={handleResetToDefaults}
              onViewProduct={setSelectedProduct}
              isExternalAddOpen={isAddModalOpen}
              onCloseExternalAdd={() => setIsAddModalOpen(false)}
            />
          )}
        </main>

        {/* Quiet, Minimal Campus Editorial Footer */}
        <footer className="border-t border-[#E8E5DD] bg-[#FAF8F5] py-8 px-4 sm:px-8 mt-12 text-center sm:text-left">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#777A75]">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-serif-title italic text-base text-[#202321]">CampusCart</span>
              <span className="text-[#B9C9B4]">/</span>
              <span className="font-medium text-[#202321]">Student Exchange</span>
              <span className="text-[#B9C9B4]">/</span>
              <span>Transparent Price Analysis &amp; Explainable Recommendations</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span>Demo Dataset (INR · Age in Years)</span>
              <span>·</span>
              <button
                onClick={handleResetToDefaults}
                className="hover:underline text-[#4058D6] font-medium"
              >
                Reset Demo Data
              </button>
            </div>
          </div>
        </footer>

        {/* Product Detail Modal */}
        <ProductDetailModal
          product={selectedProduct}
          allProducts={products}
          onClose={() => setSelectedProduct(null)}
          isCompared={selectedProduct ? compareList.includes(selectedProduct.id) : false}
          onToggleCompare={handleToggleCompare}
          onOpenRecommendations={() => {
            setSelectedProduct(null);
            setCurrentTab('recommendations');
          }}
        />
      </div>
    </ToastProvider>
  );
}
