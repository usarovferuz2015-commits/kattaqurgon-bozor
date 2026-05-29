import React from 'react';
import ProductCard from './ProductCard';

interface StoreProductGridProps {
  products: any[];
  isLoading: boolean;
}

export default function StoreProductGrid({ products, isLoading }: StoreProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
        <div className="text-5xl">📦</div>
        <p className="text-dark-500 font-medium">Hozircha mahsulotlar topilmadi</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {products.map((product: any) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
