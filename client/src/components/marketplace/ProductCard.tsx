import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useAppStore } from '../../store/appStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, cart, telegramId, toggleFavorite, isFavorite } = useAppStore();
  const primaryImage = product.images?.[0]?.url || '/placeholder.svg';
  const isInCart = cart.some((i) => i.product_id === product.id);
  const favorited = isFavorite(product.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id, product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

    toast.success('Savatchaga qo\'shildi');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="card group animate-fade-in"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={primaryImage}
          alt={product.name_uz}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {product.discount_percent > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            -{product.discount_percent}%
          </span>
        )}

        {product.is_premium && (
          <span className="absolute top-2 left-2 mt-8 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            VIP
          </span>
        )}

        {/* Heart / Favorite */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
            favorited
              ? 'bg-red-500 text-white scale-110'
              : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white'
          }`}
        >
          <FiHeart className={`w-4 h-4 transition-all ${favorited ? 'fill-current' : ''}`} />
        </button>

        <button
          onClick={handleAddToCart}
          className="absolute bottom-2 right-2 w-9 h-9 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-50 transition-colors"
        >
          <FiShoppingCart className={`w-4 h-4 ${isInCart ? 'text-primary-600' : 'text-dark-600'}`} />
        </button>
      </div>

      <div className="p-3">
        <h3 className="text-sm font-medium text-dark-900 line-clamp-2 mb-1 min-h-[2.5rem]">
          {product.name_uz}
        </h3>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-base font-bold text-primary-600">
            {formatPrice(Number(product.price))}
          </span>
          {product.old_price && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(Number(product.old_price))}
            </span>
          )}
        </div>

        {product.seller && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">
              {product.seller.store_name}
            </span>
            {product.seller.is_verified && (
              <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
