import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productService, categoryService } from '../services/endpoints';
import { useAppStore } from '../store/appStore';
import { authService } from '../services/endpoints';
import Header from '../components/ui/Header';
import BannerCarousel from '../components/marketplace/BannerCarousel';
import CategoryCard from '../components/marketplace/CategoryCard';
import ProductCard from '../components/marketplace/ProductCard';
import SectionHeader from '../components/ui/SectionHeader';
import { BannerSkeleton, CategorySkeleton, ProductGridSkeleton } from '../components/ui/Skeleton';

export default function HomePage() {
  const { telegramId, setUser, setSeller, setIsSeller, setIsAdmin } = useAppStore();

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
      const res = await categoryService.getFeatured();
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
          <BannerCarousel />
        )}

        {/* Categories */}
        <section>
          <SectionHeader title="Kategoriyalar" link="/categories" />
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <CategorySkeleton key={i} />)
              : (categoriesData || []).map((cat: any) => (
                  <CategoryCard key={cat.id} category={cat} />
                ))
            }
          </div>
        </section>

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
    </div>
  );
}
