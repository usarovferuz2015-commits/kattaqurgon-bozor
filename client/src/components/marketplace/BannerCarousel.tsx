import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

interface Banner {
  id: string;
  image_url: string;
  title_uz: string;
  subtitle_uz: string | null;
  link_type: string;
  link_value: string | null;
  button_text_uz: string;
  bg_color: string | null;
  text_color: string | null;
}

interface BannerCarouselProps {
  banners?: Banner[];
  autoPlayInterval?: number;
}

export default function BannerCarousel({
  banners: propBanners,
  autoPlayInterval = 4000,
}: BannerCarouselProps) {
  const defaultBanners: Banner[] = [
    {
      id: '1',
      image_url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80',
      title_uz: 'Kattaqo\'rg\'on Bozori',
      subtitle_uz: 'Eng yaxshi narxlarda xarid qiling',
      link_type: 'category',
      link_value: 'oziq-ovqat',
      button_text_uz: 'Batafsil',
      bg_color: '#16a34a',
      text_color: '#ffffff',
    },
    {
      id: '2',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
      title_uz: 'Yangi mahsulotlar',
      subtitle_uz: 'Har kuni yangi tovarlar',
      link_type: 'category',
      link_value: 'kiym-kechak',
      button_text_uz: 'Ko\'rish',
      bg_color: '#ea580c',
      text_color: '#ffffff',
    },
    {
      id: '3',
      image_url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80',
      title_uz: 'Premium sotuvchilar',
      subtitle_uz: 'Ishonchli va sifatli mahsulotlar',
      link_type: 'category',
      link_value: 'elektronika',
      button_text_uz: 'Batafsil',
      bg_color: '#1d4ed8',
      text_color: '#ffffff',
    },
  ];

  const banners = propBanners?.length ? propBanners : defaultBanners;
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const goTo = (index: number) => setCurrent(index);

  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const timer = setInterval(next, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isPaused, banners.length, autoPlayInterval, next]);

  const getLinkTo = (banner: Banner) => {
    if (banner.link_type === 'category' && banner.link_value) {
      return `/category/${banner.link_value}`;
    }
    if (banner.link_type === 'product' && banner.link_value) {
      return `/product/${banner.link_value}`;
    }
    return '/';
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl h-44"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {banners.map((banner, index) => (
        <Link
          key={banner.id}
          to={getLinkTo(banner)}
          className={`absolute inset-0 transition-all duration-500 ${
            index === current ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          style={{ backgroundColor: banner.bg_color || '#16a34a' }}
        >
          <img
            src={banner.image_url}
            alt={banner.title_uz}
            className="w-full h-full object-cover opacity-40"
            loading="lazy"
          />
          <div className="absolute inset-0 flex flex-col justify-center p-6">
            <h2
              className="text-2xl font-bold mb-1"
              style={{ color: banner.text_color || '#ffffff' }}
            >
              {banner.title_uz}
            </h2>
            {banner.subtitle_uz && (
              <p
                className="text-sm opacity-90 mb-3"
                style={{ color: banner.text_color || '#ffffff' }}
              >
                {banner.subtitle_uz}
              </p>
            )}
            <span className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white text-sm font-medium w-fit">
              {banner.button_text_uz} →
            </span>
          </div>
        </Link>
      ))}

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === current ? 'bg-white w-6' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
