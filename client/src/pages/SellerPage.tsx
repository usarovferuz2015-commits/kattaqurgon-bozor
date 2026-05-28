import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { sellerService, productService } from '../services/endpoints';
import ProductCard from '../components/marketplace/ProductCard';
import { FiArrowLeft, FiStar, FiPackage, FiShield } from 'react-icons/fi';
import { ProductGridSkeleton } from '../components/ui/Skeleton';

export default function SellerPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: sellerData, isLoading: sellerLoading } = useQuery({
    queryKey: ['seller', slug],
    queryFn: async () => {
      const res = await sellerService.get(slug!);
      return res.data;
    },
    enabled: !!slug,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['seller-products', sellerData?.id],
    queryFn: async () => {
      const res = await productService.getSellerProducts(sellerData.id);
      return res;
    },
    enabled: !!sellerData?.id,
  });

  const isLoading = sellerLoading || productsLoading;
  const seller = sellerData;
  const products = productsData?.data || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 animate-pulse">
        <div className="h-40 bg-gray-200" />
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-48 bg-gray-200 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-dark-500">Sotuvchi topilmadi</p>
        <Link to="/" className="btn-primary ml-4">Bosh sahifa</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="flex items-center h-12 px-4">
          <Link to="/" className="p-1 -ml-1">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-dark-900 ml-2 truncate">{seller.store_name}</h1>
        </div>
      </div>

      {/* Store Banner */}
      <div
        className="h-36 bg-gradient-to-br from-primary-600 to-primary-800 relative"
        style={seller.store_banner ? { backgroundImage: `url(${seller.store_banner})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Store Info */}
      <div className="px-4 -mt-10 relative z-10">
        <div className="flex items-end gap-4 mb-4">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center text-4xl flex-shrink-0 border-4 border-white">
            🏪
          </div>
          <div className="flex-1 pb-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xl font-bold text-dark-900">{seller.store_name}</h2>
              {seller.is_verified && (
                <FiShield className="w-5 h-5 text-blue-500" />
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-dark-500 mt-0.5">
              <span className="flex items-center gap-1">
                <FiStar className="w-3.5 h-3.5 text-amber-500" />
                {seller.rating || 0}
              </span>
              <span className="flex items-center gap-1">
                <FiPackage className="w-3.5 h-3.5" />
                {seller.total_products || 0} ta mahsulot
              </span>
            </div>
          </div>
        </div>

        {seller.store_description && (
          <p className="text-sm text-dark-600 leading-relaxed mb-4">{seller.store_description}</p>
        )}
      </div>

      {/* Products */}
      <div className="px-4">
        <h3 className="font-bold text-dark-900 mb-3">Mahsulotlar</h3>
        {products.length === 0 ? (
          <p className="text-dark-400 text-sm text-center py-8">Hali mahsulotlar yo'q</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
