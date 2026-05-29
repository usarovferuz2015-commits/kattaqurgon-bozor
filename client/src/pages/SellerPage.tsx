import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { sellerService, productService, categoryService } from '../services/endpoints';
import StoreHeader from '../components/marketplace/StoreHeader';
import StoreFilters from '../components/marketplace/StoreFilters';
import StoreProductGrid from '../components/marketplace/StoreProductGrid';

export default function SellerPage() {
  const { slug } = useParams<{ slug: string }>();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  // 1. Fetch Store Profile
  const { data: storeData, isLoading: storeLoading } = useQuery({
    queryKey: ['seller', slug],
    queryFn: async () => {
      const res = await sellerService.get(slug!);
      return res.data;
    },
    enabled: !!slug,
  });

  // 2. Fetch Categories for filters
  const { data: categoriesData } = useQuery({
    queryKey: ['categories-flat'],
    queryFn: async () => {
      const res = await categoryService.getFlat();
      return res.data;
    },
  });

  // 3. Fetch Seller's Products with filters
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['seller-products', storeData?.id, search, category, page],
    queryFn: async () => {
      const res = await productService.getSellerProducts(
        storeData!.id, 
        page, 
        search, 
        category
      );
      return res;
    },
    enabled: !!storeData?.id,
    keepPreviousData: true,
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="container-app py-4 space-y-6">
        {storeLoading ? (
          <div className="w-full h-64 bg-gray-200 animate-pulse rounded-3xl" />
        ) : storeData ? (
          <>
            <StoreHeader seller={storeData} />
            
            <StoreFilters 
              categories={categoriesData || []}
              selectedCategory={category}
              onSearch={(val) => {
                setSearch(val);
                setPage(1);
              }}
              onCategoryChange={(id) => {
                setCategory(id);
                setPage(1);
              }}
            />

            <StoreProductGrid 
              products={productsData?.data || []} 
              isLoading={productsLoading} 
            />

            {productsData?.has_next && (
              <div className="flex justify-center py-6">
                <button 
                  onClick={() => setPage(p => p + 1)}
                  className="px-6 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-dark-600 hover:bg-gray-50 transition-all shadow-sm"
                >
                  Yana yuklash
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🚫</div>
            <h2 className="text-xl font-bold">Do'kon topilmadi</h2>
            <p className="text-dark-500">Kechirasiz, so'ralgan do'kon mavjud emas.</p>
          </div>
        )}
      </main>
    </div>
  );
}
