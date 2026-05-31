import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { sellerService, productService, categoryService } from '../services/endpoints';
import { useAppStore } from '../store/appStore';
import StoreHeader from '../components/marketplace/StoreHeader';
import StoreFilters from '../components/marketplace/StoreFilters';
import StoreProductGrid from '../components/marketplace/StoreProductGrid';
import { FiArrowLeft, FiShoppingCart } from 'react-icons/fi';
import { goBack } from '../utils/navigation';

export default function SellerPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const cartCount = useAppStore((s) => s.cartCount);
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
      return res as { data: any[]; has_next: boolean; total: number; page: number; limit: number; total_pages: number; has_prev: boolean };
    },
    enabled: !!storeData?.id,
    placeholderData: keepPreviousData,
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="container-app py-4 space-y-6">
        {storeLoading ? (
          <div className="w-full h-64 bg-gray-200 animate-pulse rounded-3xl" />
        ) : storeData ? (
          <>
            {/* Navigation bar */}
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => goBack(navigate, '/')} className="p-2 -ml-2 hover:bg-gray-100 rounded-xl">
                <FiArrowLeft className="w-5 h-5" />
              </button>
              <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-xl">
                <FiShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-accent-500 text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
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
