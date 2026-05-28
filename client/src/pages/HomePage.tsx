import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService, categoryService } from '../services/endpoints';
import { useAppStore } from '../store/appStore';
import { authService } from '../services/endpoints';
import Header from '../components/ui/Header';
import BannerCarousel from '../components/marketplace/BannerCarousel';
import ProductCard from '../components/marketplace/ProductCard';
import SectionHeader from '../components/ui/SectionHeader';
import { BannerSkeleton, ProductGridSkeleton } from '../components/ui/Skeleton';
import { FiX, FiEye, FiCalendar, FiArrowRight } from 'react-icons/fi';

export default function HomePage() {
  const { telegramId, setUser, setSeller, setIsSeller, setIsAdmin } = useAppStore();
  const [selectedAd, setSelectedAd] = useState<any>(null);

  useEffect(() => {
    if (telegramId) {
      authService.init(telegramId).then((res) => {
        if (res.success) {
          setUser(res.data.user);
          setSeller(res.data.seller);
          setIsSeller(res.data.is_seller);
          setIsAdmin(res.data.is_admin);
        }
      }).catch(console.error);
    }
  }, [telegramId]);

  const { data: homepageData, isLoading: productsLoading } = useQuery({
    queryKey: ['homepage'],
    queryFn: async () => {
      const res = await productService.getHomepage();
      return res.data;
    },
    enabled: true,
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await categoryService.getAll();
      return res.data;
    },
  });

  const isLoading = productsLoading || categoriesLoading;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />

      <main className="container-app py-4 space-y-6">
        {/* Banner Carousel */}
        {isLoading ? (
          <BannerSkeleton />
        ) : (
          <BannerCarousel banners={homepageData?.banners} />
        )}

        {/* Kategoriya ikonkalari */}
        <section>
          {!isLoading && categoriesData?.length > 0 && (
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
              {(categoriesData || []).slice(0, 5).map((cat: any) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 no-underline group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-2xl group-hover:scale-110 group-hover:shadow-lg transition-all shadow-sm">
                    {cat.icon || '📁'}
                  </div>
                  <span className="text-[10px] text-dark-600 font-medium text-center leading-tight">
                    {cat.name_uz}
                  </span>
                </Link>
              ))}
              <Link
                to="/categories"
                className="flex flex-col items-center gap-1.5 flex-shrink-0 no-underline group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all">
                  <span>All</span>
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold text-center">
                  Barchasi
                </span>
              </Link>
            </div>
          )}
        </section>

        {/* Reklamalar / Stories */}
        {homepageData?.banners?.length > 0 && (
          <section>
            <SectionHeader title="⚡ Shoshiling!" />
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {homepageData.banners.map((ad: any, idx: number) => (
                <button
                  key={ad.id}
                  onClick={() => setSelectedAd(ad)}
                  className="flex-shrink-0 w-28 h-36 rounded-2xl overflow-hidden relative group animate-fade-in"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <img
                    src={ad.image_url}
                    alt={ad.title_uz}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <p className="text-white text-xs font-semibold leading-tight line-clamp-2">
                      {ad.title_uz}
                    </p>
                  </div>
                  {ad.subtitle_uz && (
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-0.5">
                      <span className="text-[9px] font-bold text-primary-700">YANGI</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Premium Products */}
        {homepageData?.premium?.length > 0 && (
          <section>
            <SectionHeader title="⭐ Premium mahsulotlar" />
            {isLoading ? (
              <ProductGridSkeleton count={4} />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {homepageData.premium.slice(0, 4).map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* TOP Products */}
        {homepageData?.top?.length > 0 && (
          <section>
            <SectionHeader title="🏆 TOP mahsulotlar" />
            {isLoading ? (
              <ProductGridSkeleton count={4} />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {homepageData.top.slice(0, 4).map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Recommended */}
        {homepageData?.recommended?.length > 0 && (
          <section>
            <SectionHeader title="🔥 Tavsiya etilgan" />
            {isLoading ? (
              <ProductGridSkeleton count={4} />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {homepageData.recommended.slice(0, 6).map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Most Viewed */}
        {homepageData?.most_viewed?.length > 0 && (
          <section>
            <SectionHeader title="👁 Eng ko'p ko'rilgan" />
            {isLoading ? (
              <ProductGridSkeleton count={4} />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {homepageData.most_viewed.slice(0, 4).map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* About */}
        <section className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏪</span>
            </div>
            <div>
              <h3 className="font-bold">Kattaqo'rg'on Bozori</h3>
              <p className="text-sm text-white/80">Rasmiy online platforma</p>
            </div>
          </div>
          <p className="text-sm text-white/90 leading-relaxed">
            Bu platforma orqali siz Kattaqo'rg'on bozoridagi barcha mahsulotlarni 
            online ko'rishingiz, sotuvchilar bilan bog'lanishingiz va eng yaxshi 
            narxlarda xarid qilishingiz mumkin.
          </p>
        </section>
      </main>

      {/* To'liq ekranli e'lon modali */}
      {selectedAd && (
        <div className="fixed inset-0 z-50 animate-fade-in">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-lg"
            onClick={() => setSelectedAd(null)}
          />

          {/* Content */}
          <div className="relative h-full flex flex-col animate-slide-up">
            {/* Image area */}
            <div className="relative flex-1 min-h-[50vh]">
              <img
                src={selectedAd.image_url}
                alt={selectedAd.title_uz}
                className="w-full h-full object-cover"
              />

              {/* Close button */}
              <button
                onClick={() => setSelectedAd(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>

              {/* Gradient overlay */}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            </div>

            {/* Info area */}
            <div className="bg-white rounded-t-3xl -mt-6 relative z-10 px-5 pt-6 pb-8 space-y-4">
              {/* Meta info */}
              <div className="flex items-center gap-3 text-xs text-dark-400">
                <span className="flex items-center gap-1">
                  <FiCalendar className="w-3.5 h-3.5" />
                  {new Date(selectedAd.created_at || selectedAd.updated_at).toLocaleDateString('uz-UZ', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </span>
                {selectedAd.impressions > 0 && (
                  <span className="flex items-center gap-1">
                    <FiEye className="w-3.5 h-3.5" />
                    {selectedAd.impressions} ko'rildi
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-dark-900 leading-tight">
                {selectedAd.title_uz}
              </h2>

              {/* Subtitle/Description */}
              {(selectedAd.subtitle_uz || selectedAd.description_uz) && (
                <p className="text-sm text-dark-600 leading-relaxed">
                  {selectedAd.subtitle_uz || selectedAd.description_uz}
                </p>
              )}

              {/* CTA Button */}
              {selectedAd.link_value && (
                <a
                  href={
                    selectedAd.link_type === 'category'
                      ? `/category/${selectedAd.link_value}`
                      : selectedAd.link_type === 'product'
                      ? `/product/${selectedAd.link_value}`
                      : selectedAd.link_type === 'seller'
                      ? `/seller/${selectedAd.link_value}`
                      : selectedAd.link_value
                  }
                  target={selectedAd.link_type === 'external' ? '_blank' : '_self'}
                  rel={selectedAd.link_type === 'external' ? 'noopener noreferrer' : ''}
                  className="w-full block text-center py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-2xl shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 transition-all active:scale-[0.98]"
                >
                  <span className="flex items-center justify-center gap-2">
                    {selectedAd.link_type === 'seller' ? '🏪 Do\'konga o\'tish' : selectedAd.button_text_uz || 'Batafsil'}
                    <FiArrowRight className="w-4 h-4" />
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
