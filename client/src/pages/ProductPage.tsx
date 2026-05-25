import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/endpoints';
import { useAppStore } from '../store/appStore';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiHeart, FiShare2, FiArrowLeft, FiMessageCircle, FiPhone } from 'react-icons/fi';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart, telegramId } = useAppStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [contacting, setContacting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const res = await productService.getBySlug(slug!);
      return res.data;
    },
    enabled: !!slug,
  });

  const product = data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white animate-pulse">
        <div className="aspect-square bg-gray-200" />
        <div className="p-4 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-dark-500 mb-4">Mahsulot topilmadi</p>
          <Link to="/" className="btn-primary">Bosh sahifaga qaytish</Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [{ url: '/placeholder.svg', is_primary: true }];
  const formatPrice = (price: number) => new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';

  const seller = product.seller as any;
  const sellerUsername = seller?.user?.username || seller?.username;
  const sellerTgLink = sellerUsername
    ? `https://t.me/${sellerUsername}`
    : null;

  const handleContactSeller = async () => {
    console.log("Contact button clicked. telegramId:", telegramId, "seller:", product.seller);
    if (contacting) return;

    const tg = (window as any)?.Telegram?.WebApp;

    // If seller has username, try opening direct chat first
    if (sellerTgLink && tg?.openTelegramLink) {
      console.log("Opening direct chat via tg.openTelegramLink:", sellerTgLink);
      tg.openTelegramLink(sellerTgLink);
      return;
    }

    // Otherwise send notification via bot
    if (!telegramId) {
      console.error("Missing telegramId");
      toast.error('Telegram profilingiz aniqlanmadi');
      return;
    }

    setContacting(true);
    try {
      console.log("Calling API contactSeller for slug:", product.slug);
      const res = await productService.contactSeller(product.slug, telegramId);
      console.log("API response:", res);
      
      if (res.success) {
        toast.success('Xabar sotuvchiga yuborildi!');

        // If the seller has a username, offer direct link as well
        if (res.username && tg?.openTelegramLink) {
          tg.openTelegramLink(`https://t.me/${res.username}`);
        } else if (res.username) {
          window.open(`https://t.me/${res.username}`, '_blank');
        }
      }
    } catch (err: any) {
      console.error("API error:", err);
      const msg = err?.response?.data?.error || err?.message || 'Xatolik yuz berdi';
      toast.error(msg);

      // Fallback: try opening link directly
      if (sellerTgLink) {
        if (tg?.openTelegramLink) {
          tg.openTelegramLink(sellerTgLink);
        } else {
          window.open(sellerTgLink, '_blank');
        }
      } else if (seller?.store_phone) {
        window.open(`tel:${seller.store_phone}`, '_blank');
      }
    } finally {
      setContacting(false);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      product_id: product.id,
      name: product.name_uz,
      price: Number(product.price),
      image: images[0]?.url || '/placeholder.svg',
      quantity,
      seller_id: product.seller_id,
      seller_name: product.seller?.store_name || '',
      slug: product.slug,
    });
    toast.success('Savatchaga qo\'shildi');
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: product.name_uz, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Havola nusxalandi');
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="flex items-center justify-between h-12 px-4">
          <Link to="/" className="p-1 -ml-1">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex gap-2">
            <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-xl">
              <FiShare2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="relative">
        <div className="aspect-square bg-gray-100">
          <img
            src={images[selectedImage]?.url}
            alt={product.name_uz}
            className="w-full h-full object-cover"
          />
        </div>

        {product.discount_percent > 0 && (
          <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl">
            -{product.discount_percent}%
          </span>
        )}

        {product.is_premium && (
          <span className="absolute top-4 right-4 bg-accent-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl">
            VIP
          </span>
        )}

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
            {images.map((img: any, index: number) => (
              <button
                key={img.id || index}
                onClick={() => setSelectedImage(index)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                  index === selectedImage ? 'border-primary-500' : 'border-transparent'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="px-4 py-4 space-y-4">
        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-primary-600">
            {formatPrice(Number(product.price))}
          </span>
          {product.old_price && (
            <span className="text-lg text-gray-400 line-through">
              {formatPrice(Number(product.old_price))}
            </span>
          )}
        </div>

        {product.is_negotiable && (
          <span className="inline-flex items-center px-3 py-1 bg-accent-100 text-accent-700 text-sm rounded-lg font-medium">
            Kelishilgan narx
          </span>
        )}

        {/* Title */}
        <h1 className="text-xl font-bold text-dark-900 leading-snug">
          {product.name_uz}
        </h1>

        {/* Seller */}
        <Link
          to={`/seller/${product.seller?.id}`}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-xl">
            🏪
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <span className="font-medium text-sm">{product.seller?.store_name}</span>
              {product.seller?.is_verified && (
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-xs text-dark-400">
              {sellerUsername ? `@${sellerUsername} · ` : ''}Sotuvchi
            </span>
          </div>
          <svg className="w-5 h-5 text-dark-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Quantity Selector */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-dark-600">Miqdor:</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-lg font-medium"
            >
              -
            </button>
            <span className="text-lg font-bold w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-lg font-medium"
            >
              +
            </button>
          </div>
          <span className="text-xs text-dark-400">{product.unit}</span>
        </div>

        {/* Description */}
        {product.description_uz && (
          <div>
            <h3 className="font-medium text-dark-900 mb-2">Tavsif</h3>
            <p className="text-sm text-dark-600 leading-relaxed whitespace-pre-line">
              {product.description_uz}
            </p>
          </div>
        )}

        {/* Tags */}
        {product.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-gray-100 text-dark-600 text-xs rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-xs text-dark-400">Holati</span>
            <p className="text-sm font-medium">{product.quantity > 0 ? 'Mavjud' : 'Tugagan'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <span className="text-xs text-dark-400">Ko'rilgan</span>
            <p className="text-sm font-medium">{product.views_count} marta</p>
          </div>
          {product.unit && (
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-xs text-dark-400">Birlik</span>
              <p className="text-sm font-medium">{product.unit}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
        <div className="max-w-lg mx-auto flex gap-3">
          <button
            onClick={handleAddToCart}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            <FiShoppingCart className="w-5 h-5" />
            Savatchaga qo'shish
          </button>
          <button
            onClick={() => {
              alert("Tugma bosildi!");
              handleContactSeller();
            }}
            style={{ zIndex: 9999, position: 'relative' }}
            className="flex-1 btn-secondary flex items-center justify-center gap-2 p-4 bg-gray-200 border border-gray-300 rounded-lg"
          >
            <FiMessageCircle className="w-5 h-5" />
            Yozish (Sinov)
          </button>
        </div>
      </div>
    </div>
  );
}
