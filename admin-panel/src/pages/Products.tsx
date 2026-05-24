import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

interface ProductsProps {
  adminId: number;
}

export default function Products({ adminId }: ProductsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data } = await api.get('/products/homepage');
      return data.data;
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mahsulotlar</h1>
          <p className="text-dark-500 text-sm mt-1">Barcha mahsulotlarni ko'ring</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-square skeleton rounded-lg mb-3" />
              <div className="h-4 skeleton w-3/4 mb-2" />
              <div className="h-3 skeleton w-1/2" />
            </div>
          ))
        ) : data?.premium?.length > 0 ? (
          data.premium.map((product: any) => (
            <div key={product.id} className="card">
              <div className="aspect-square bg-dark-100 rounded-lg overflow-hidden mb-3">
                <img
                  src={product.images?.[0]?.url || '/placeholder.svg'}
                  alt={product.name_uz}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-medium text-sm line-clamp-2">{product.name_uz}</h3>
              <p className="text-lg font-bold text-primary-600 mt-1">
                {Number(product.price).toLocaleString()} so'm
              </p>
              <div className="flex items-center justify-between mt-2 text-xs text-dark-400">
                <span>{product.views_count} ko'rish</span>
                <span className={product.status === 'active' ? 'badge-green' : 'badge-red'}>
                  {product.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-dark-400">Mahsulotlar mavjud emas</p>
          </div>
        )}
      </div>
    </div>
  );
}
