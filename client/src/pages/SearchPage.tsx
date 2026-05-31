import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/endpoints';
import { useAppStore } from '../store/appStore';
import ProductCard from '../components/marketplace/ProductCard';
import { FiArrowLeft, FiSearch, FiShoppingCart } from 'react-icons/fi';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { goBack } from '../utils/navigation';

export default function SearchPage() {
  const navigate = useNavigate();
  const cartCount = useAppStore((s) => s.cartCount);
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [input, setInput] = useState(query);
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(input);
      if (input) {
        setSearchParams({ q: input });
      } else {
        setSearchParams({});
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [input]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return { data: [] };
      const res = await productService.search(debouncedQuery);
      return res;
    },
    enabled: debouncedQuery.length > 0,
  });

  const products = searchResults?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 h-14 px-4">
          <button onClick={() => goBack(navigate, '/')} className="p-1 -ml-1">
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Mahsulot qidirish..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>
          <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-xl">
            <FiShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-accent-500 text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="container-app py-4">
        {!debouncedQuery && (
          <div className="text-center py-12">
            <FiSearch className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-dark-500">Mahsulot nomini kiriting</p>
          </div>
        )}

        {debouncedQuery && isLoading && (
          <ProductGridSkeleton count={4} />
        )}

        {debouncedQuery && !isLoading && products.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl">🔍</span>
            <p className="text-dark-500 mt-3">"{debouncedQuery}" bo'yicha hech narsa topilmadi</p>
          </div>
        )}

        {products.length > 0 && (
          <div>
            <p className="text-sm text-dark-400 mb-4">{searchResults?.total || 0} ta natija topildi</p>
            <div className="grid grid-cols-2 gap-3">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
