import { Link } from 'react-router-dom';
import { FiArrowLeft, FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { useAppStore } from '../store/appStore';
import toast from 'react-hot-toast';

export default function FavoritesPage() {
  const { favoriteProducts, toggleFavorite, addToCart, cart } = useAppStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  const handleRemove = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(productId);
    toast.success("Sevimlilardan o'chirildi");
  };

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    const primaryImage = product.images?.[0]?.url || '/placeholder.svg';
    addToCart({
      id: product.id,
      product_id: product.id,
      name: product.name_uz,
      price: Number(product.price),
      image: primaryImage,
      quantity: 1,
      seller_id: product.seller_id,
      seller_name: product.seller?.store_name || '',
      slug: product.slug,
    });
    toast.success("Savatchaga qo'shildi");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="flex items-center gap-3 h-12 px-4">
          <Link to="/" className="p-1 -ml-1">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold">Sevimlilar</h1>
          {favoriteProducts.length > 0 && (
            <span className="ml-auto text-xs font-medium bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
              {favoriteProducts.length} ta
            </span>
          )}
        </div>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FiHeart className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-dark-700 text-lg font-semibold">Sevimlilar bo'sh</p>
          <p className="text-dark-400 text-sm mt-1 text-center">
            Mahsulot kartochkasidagi yurakcha tugmasini bosib,<br />sevimli mahsulotlaringizni saqlang
          </p>
          <Link to="/" className="btn-primary mt-6 inline-flex items-center gap-2">
            Katalogga o'tish
          </Link>
        </div>
      ) : (
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            {favoriteProducts.map((product: any) => {
              const primaryImage = product.images?.[0]?.url || '/placeholder.svg';
              const isInCart = cart.some((i) => i.product_id === product.id);

              return (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  className="card group animate-fade-in overflow-hidden"
                >
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={primaryImage}
                      alt={product.name_uz}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Discount badge */}
                    {product.discount_percent > 0 && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                        -{product.discount_percent}%
                      </span>
                    )}

                    {/* Remove from favorites */}
                    <button
                      onClick={(e) => handleRemove(e, product.id)}
                      className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                    >
                      <FiTrash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>

                  <div className="p-2.5">
                    <h3 className="text-xs font-medium text-dark-900 line-clamp-2 mb-1 min-h-[2rem]">
                      {product.name_uz}
                    </h3>
                    <div className="flex items-baseline gap-1.5 mb-1.5">
                      <span className="text-sm font-bold text-primary-600">
                        {formatPrice(Number(product.price))}
                      </span>
                      {product.old_price && (
                        <span className="text-[10px] text-gray-400 line-through">
                          {formatPrice(Number(product.old_price))}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className={`w-full py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                        isInCart
                          ? 'bg-primary-50 text-primary-600'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      <FiShoppingCart className="w-3 h-3" />
                      {isInCart ? 'Savatda' : "Savatga"}
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
