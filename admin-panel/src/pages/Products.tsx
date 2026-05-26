import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { FiSearch, FiShoppingBag, FiEye } from 'react-icons/fi';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface ProductsProps {
  adminId: number;
}

export default function Products({ adminId }: ProductsProps) {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data } = await api.get('/products/homepage');
      return data.data;
    },
  });

  const allProducts = [
    ...(data?.featured || []),
    ...(data?.top || []),
    ...(data?.recommended || []),
    ...(data?.most_viewed || []),
    ...(data?.premium || []),
  ].filter((p: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.id === p.id) === i);

  const filtered = allProducts.filter((p: any) =>
    !search || p.name_uz?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Mahsulotlar</h1>
          <p className="text-sm text-dark-500 mt-1">Barcha mahsulotlarni ko'ring va boshqaring</p>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Mahsulot qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2 text-sm w-56"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square skeleton rounded-xl mb-3" />
              <div className="skeleton h-4 w-3/4 mb-2" />
              <div className="skeleton h-3 w-1/2 mb-2" />
              <div className="skeleton h-3 w-1/3" />
            </div>
          ))
        ) : filtered.length > 0 ? (
          filtered.map((product: any, idx: number) => (
            <div key={product.id} className="card card-hover animate-slide-up" style={{ animationDelay: `${idx * 30}ms` }}>
              <Link to={`/product/${product.slug}`}>
                <div className="aspect-square bg-dark-100 rounded-xl overflow-hidden mb-3 relative group">
                  <img
                    src={product.images?.[0]?.url || '/placeholder.svg'}
                    alt={product.name_uz}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.is_premium && (
                    <span className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                      VIP
                    </span>
                  )}
                  {product.discount_percent > 0 && (
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                      -{product.discount_percent}%
                    </span>
                  )}
                </div>
              </Link>
              <h3 className="font-medium text-sm text-dark-900 line-clamp-2">{product.name_uz}</h3>
              <p className="text-lg font-bold text-primary-600 mt-1">
                {Number(product.price).toLocaleString()} so'm
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5 text-xs text-dark-400">
                  <FiEye className="w-3.5 h-3.5" />
                  <span>{product.views_count} ko'rish</span>
                </div>
                <span className={product.status === 'active' ? 'badge-green text-[10px]' : 'badge-red text-[10px]'}>
                  {product.status === 'active' ? 'Faol' : 'Arxiv'}
                </span>
              </div>
              {product.seller && (
                <p className="text-[10px] text-dark-400 mt-2 truncate">
                  🏪 {product.seller.store_name}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full card text-center py-12">
            <FiShoppingBag className="w-10 h-10 text-dark-300 mx-auto mb-3" />
            <p className="text-dark-400 text-sm">
              {search ? `"${search}" bo'yicha topilmadi` : 'Mahsulotlar mavjud emas'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
