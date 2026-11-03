import React from 'react';
import { ShiftCard } from './ui/ShiftCard';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  isCompared?: boolean;
  onToggleCompare?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = (props) => {
  return <ShiftCard {...props} />;
};
