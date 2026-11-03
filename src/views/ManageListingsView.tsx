import React, { useState } from 'react';
import { Plus, Edit2, Trash2, RotateCcw, AlertCircle, ShoppingBag, Eye } from 'lucide-react';
import { Product, Category, Condition } from '../types';
import { calculateDiscount, getCategoryMedian, getCategoryStats } from '../utils/analysis';
import { formatINR, formatAge } from '../utils/format';
import { DataTable, Column } from '../components/ui/DataTable';
import { SidePanel } from '../components/ui/SidePanel';
import { Dialog } from '../components/ui/Dialog';
import { useToast } from '../components/ui/Sonner';
import { TextEffect } from '../components/ui/TextEffect';

interface ManageListingsViewProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id' | 'listedDate'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onResetToDefaults: () => void;
  onViewProduct: (product: Product) => void;
  isExternalAddOpen?: boolean;
  onCloseExternalAdd?: () => void;
}

const CATEGORIES: Category[] = [
  'Textbooks & Books',
  'Laptops & Computing',
  'Bicycles & Mobility',
  'Audio & Gadgets',
  'Dorm Essentials',
];

const CONDITIONS: Condition[] = ['Like New', 'Excellent', 'Good', 'Fair'];

export const ManageListingsView: React.FC<ManageListingsViewProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetToDefaults,
  onViewProduct,
  isExternalAddOpen,
  onCloseExternalAdd,
}) => {
  const { toast } = useToast();

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Sync with external add action (e.g. from top nav Post button)
  React.useEffect(() => {
    if (isExternalAddOpen) {
      handleStartAdd();
      if (onCloseExternalAdd) {
        onCloseExternalAdd();
      }
    }
  }, [isExternalAddOpen]);

  // Delete dialog state
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);

  // Form State (Prices in INR, Age in Years)
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Textbooks & Books');
  const [currentPrice, setCurrentPrice] = useState<number | ''>('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [ageYears, setAgeYears] = useState<number | ''>('');
  const [condition, setCondition] = useState<Condition>('Good');
  const [description, setDescription] = useState('');
  const [campusLocation, setCampusLocation] = useState('Central Campus Library');
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setCategory('Textbooks & Books');
    setCurrentPrice('');
    setOriginalPrice('');
    setAgeYears('');
    setCondition('Good');
    setDescription('');
    setCampusLocation('Central Campus Library');
    setEditingProduct(null);
    setFormError(null);
  };

  const handleStartAdd = () => {
    resetForm();
    setIsPanelOpen(true);
  };

  const handleStartEdit = (product: Product) => {
    setEditingProduct(product);
    setTitle(product.title);
    setCategory(product.category);
    setCurrentPrice(product.currentPrice);
    setOriginalPrice(product.originalPrice);
    setAgeYears(product.ageYears);
    setCondition(product.condition);
    setDescription(product.description);
    setCampusLocation(product.campusLocation);
    setFormError(null);
    setIsPanelOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setFormError('Please enter a descriptive product title.');
      return;
    }
    if (typeof currentPrice !== 'number' || currentPrice <= 0) {
      setFormError('Please enter a valid price in INR greater than ₹0.');
      return;
    }
    if (typeof originalPrice !== 'number' || originalPrice < currentPrice) {
      setFormError('Original retail price must be at least equal to or higher than current listing price.');
      return;
    }
    if (typeof ageYears !== 'number' || ageYears < 0) {
      setFormError('Please enter product age in years (e.g. 0.5, 1, 2).');
      return;
    }

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        title: title.trim(),
        category,
        currentPrice,
        originalPrice,
        ageYears,
        condition,
        description: description.trim() || 'Student pre-owned item in working order.',
        campusLocation: campusLocation.trim() || 'Campus Center',
      });
      toast({
        title: 'Listing Updated',
        description: `"${title}" has been updated in the catalog.`,
        type: 'success',
      });
    } else {
      onAddProduct({
        title: title.trim(),
        category,
        currentPrice,
        originalPrice,
        ageYears,
        condition,
        description: description.trim() || 'Student pre-owned item in working order.',
        campusLocation: campusLocation.trim() || 'Campus Center',
        isUserListing: true,
        isSampleData: false,
      });
      toast({
        title: 'New Listing Published',
        description: `"${title}" is now available in the active dataset.`,
        type: 'success',
      });
    }

    setIsPanelOpen(false);
    resetForm();
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      onDeleteProduct(itemToDelete.id);
      toast({
        title: 'Listing Removed',
        description: `"${itemToDelete.title}" was removed from the marketplace.`,
        type: 'info',
      });
      setItemToDelete(null);
    }
  };

  // Preview calculations
  const previewDiscount =
    typeof currentPrice === 'number' && typeof originalPrice === 'number'
      ? calculateDiscount(currentPrice, originalPrice)
      : 0;

  const currentMedian = getCategoryMedian(category, products);
  const categorySummary = getCategoryStats(category, products);

  // DataTable columns
  const columns: Column<Product>[] = [
    {
      key: 'title',
      header: 'Product Title',
      sortable: true,
      sortValue: (p) => p.title,
      render: (p) => (
        <button
          onClick={() => onViewProduct(p)}
          className="font-medium text-[#202521] hover:text-[#315C48] text-left hover:underline line-clamp-1"
        >
          {p.title}
        </button>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      sortValue: (p) => p.category,
      render: (p) => <span className="text-[#737A75]">{p.category}</span>,
    },
    {
      key: 'origin',
      header: 'Origin',
      render: (p) => (
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded ${
            p.isSampleData ? 'bg-[#F4F6F3] text-[#737A75]' : 'bg-[#EBF2EE] text-[#315C48]'
          }`}
        >
          {p.isSampleData ? 'Demo Dataset' : 'User Entry'}
        </span>
      ),
    },
    {
      key: 'currentPrice',
      header: 'Listed Price',
      sortable: true,
      sortValue: (p) => p.currentPrice,
      render: (p) => (
        <span className="font-semibold text-[#202521] tabular-nums">
          {formatINR(p.currentPrice)}
        </span>
      ),
    },
    {
      key: 'originalPrice',
      header: 'Retail MSRP',
      sortable: true,
      sortValue: (p) => p.originalPrice,
      render: (p) => (
        <span className="text-[#737A75] line-through tabular-nums">
          {formatINR(p.originalPrice)}
        </span>
      ),
    },
    {
      key: 'ageYears',
      header: 'Age',
      sortable: true,
      sortValue: (p) => p.ageYears,
      render: (p) => <span className="text-[#737A75] tabular-nums">{formatAge(p.ageYears)}</span>,
    },
    {
      key: 'condition',
      header: 'Condition',
      sortable: true,
      sortValue: (p) => p.condition,
      render: (p) => <span className="font-medium text-[#202521]">{p.condition}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onViewProduct(p)}
            className="p-1.5 text-[#737A75] hover:text-[#315C48] hover:bg-[#EBF2EE] rounded transition-colors"
            title="Inspect"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleStartEdit(p)}
            className="p-1.5 text-[#737A75] hover:text-[#315C48] hover:bg-[#EBF2EE] rounded transition-colors"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setItemToDelete({ id: p.id, title: p.title })}
            className="p-1.5 text-[#737A75] hover:text-[#B85C5C] hover:bg-[#FDF2F2] rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-2 border-b border-[#E8E5DD]">
        <div>
          <h2 className="font-serif-title italic text-2xl sm:text-3xl text-[#202321] tracking-tight">
            Your campus inventory.
          </h2>
          <p className="text-xs sm:text-sm text-[#777A75] mt-1 leading-relaxed">
            Post, audit, or retire second-hand listings. All modifications recalculate category medians, dispersion statistics, and recommendation scores immediately.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onResetToDefaults();
              toast({
                title: 'Catalog Reset',
                description: 'Reset marketplace data to baseline sample demonstration records.',
                type: 'info',
              });
            }}
            className="px-3.5 py-1.5 text-xs font-medium text-[#777A75] hover:text-[#202321] bg-white border border-[#E8E5DD] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            title="Restore baseline sample listings"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={handleStartAdd}
            className="px-4 py-1.5 text-xs font-semibold bg-[#4058D6] text-white rounded-lg hover:bg-[#3146B8] transition-colors flex items-center gap-1.5 shrink-0 shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post New Listing</span>
          </button>
        </div>
      </div>

      {/* Watermelon UI DataTable */}
      <DataTable<Product>
        data={products}
        columns={columns}
        keyExtractor={(p) => p.id}
        defaultSortKey="title"
        defaultSortDirection="asc"
        emptyState="No marketplace listings found. Click 'Add New Listing' to create one."
      />

      {/* Cult UI Side Panel (Slide Drawer for Add/Edit) */}
      <SidePanel
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          resetForm();
        }}
        title={editingProduct ? 'Edit Existing Listing' : 'Post a New Campus Listing'}
        description="Specify product details accurately in INR to maintain transparent pricing benchmarks."
        maxWidth="max-w-lg"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsPanelOpen(false);
                resetForm();
              }}
              className="px-4 py-2 text-xs font-medium text-[#737A75] hover:text-[#202521]"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="listing-form"
              className="px-5 py-2 text-xs font-semibold bg-[#315C48] text-white rounded-lg hover:bg-[#27493A] transition-colors"
            >
              {editingProduct ? 'Save Changes' : 'Publish Listing'}
            </button>
          </div>
        }
      >
        <form id="listing-form" onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-[#FDF2F2] border border-[#B85C5C]/30 rounded-lg text-xs text-[#B85C5C] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Product Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#202521]">
              Product Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Casio fx-991CW Scientific Calculator"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8F9F7] border border-[#E7EAE6] rounded-lg text-[#202521] focus:outline-none focus:border-[#315C48] focus:bg-white"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#202521]">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8F9F7] border border-[#E7EAE6] rounded-lg text-[#202521] focus:outline-none focus:border-[#315C48]"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Pricing & Age in Years */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#202521]">
                Current Price (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                step="1"
                value={currentPrice}
                onChange={(e) =>
                  setCurrentPrice(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="e.g. 850"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8F9F7] border border-[#E7EAE6] rounded-lg text-[#202521] focus:outline-none focus:border-[#315C48] tabular-nums"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#202521]">
                Original Retail (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                step="1"
                value={originalPrice}
                onChange={(e) =>
                  setOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="e.g. 1895"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8F9F7] border border-[#E7EAE6] rounded-lg text-[#202521] focus:outline-none focus:border-[#315C48] tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#202521]">
                Age in Years *
              </label>
              <input
                type="number"
                required
                min="0"
                max="15"
                step="0.1"
                value={ageYears}
                onChange={(e) =>
                  setAgeYears(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="e.g. 1.2"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8F9F7] border border-[#E7EAE6] rounded-lg text-[#202521] focus:outline-none focus:border-[#315C48] tabular-nums"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#202521]">
                Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as Condition)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8F9F7] border border-[#E7EAE6] rounded-lg text-[#202521] focus:outline-none focus:border-[#315C48]"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Campus Location */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#202521]">
              Campus Pickup Spot
            </label>
            <input
              type="text"
              value={campusLocation}
              onChange={(e) => setCampusLocation(e.target.value)}
              placeholder="e.g. Science Library, Student Activity Centre"
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8F9F7] border border-[#E7EAE6] rounded-lg text-[#202521] focus:outline-none focus:border-[#315C48]"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#202521]">
              Description & Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Clean condition, includes power adapter, lightly used."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-[#F8F9F7] border border-[#E7EAE6] rounded-lg text-[#202521] focus:outline-none focus:border-[#315C48] resize-none"
            />
          </div>

          {/* Live Pricing Diagnostics Preview */}
          {typeof currentPrice === 'number' && typeof originalPrice === 'number' && (
            <div className="p-3 bg-[#FAFBF9] border border-[#E7EAE6] rounded-lg space-y-1.5 text-xs text-[#737A75]">
              <div className="flex items-center justify-between">
                <span>Calculated Markdown:</span>
                <strong className="text-[#315C48] font-semibold">{previewDiscount}% off MSRP</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Category Median ({category}):</span>
                <strong className="text-[#202521] font-semibold">{formatINR(currentMedian)}</strong>
              </div>
              <div className="text-[11px]">
                {currentPrice < currentMedian
                  ? `${Math.round(((currentMedian - currentPrice) / (currentMedian || 1)) * 100)}% below dataset median`
                  : `${Math.round(((currentPrice - currentMedian) / (currentMedian || 1)) * 100)}% above dataset median`}
              </div>
            </div>
          )}
        </form>
      </SidePanel>

      {/* Watermelon UI Dialog for Delete Confirmation */}
      <Dialog
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Remove Listing?"
        description={`Are you sure you want to delete "${itemToDelete?.title}" from the marketplace? This will immediately recalculate category medians and recommendation rankings.`}
        confirmLabel="Delete Listing"
        cancelLabel="Keep Listing"
        isDestructive={true}
      />
    </div>
  );
};
