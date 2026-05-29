import React from 'react';

interface StoreHeaderProps {
  seller: any;
}

export default function StoreHeader({ seller }: StoreHeaderProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100 mb-6">
      {/* Banner */}
      <div className="h-32 w-full bg-gradient-to-r from-primary-500 to-primary-600 relative">
        {seller.store_banner && (
          <img 
            src={seller.store_banner} 
            alt="Store Banner" 
            className="w-full h-full object-cover opacity-80" 
          />
        )}
      </div>

      {/* Profile Section */}
      <div className="px-5 pb-6">
        <div className="relative flex items-end gap-4 -mt-12 mb-4">
          <div className="w-24 h-24 rounded-2xl border-4 border-white bg-white shadow-md overflow-hidden">
            {seller.store_logo ? (
              <img src={seller.store_logo} alt={seller.store_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary-100 flex items-center justify-center text-3xl">
                🏪
              </div>
            )}
          </div>
          <div className="pb-2">
            <h1 className="text-xl font-bold text-dark-900">{seller.store_name}</h1>
            <div className="flex items-center gap-2 text-xs text-dark-500">
              <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded-full font-medium">
                {seller.total_products} mahsulot
              </span>
              {seller.is_verified && (
                <span className="flex items-center gap-1 text-blue-600 font-semibold">
                  <span className="text-blue-500">✓</span> Tasdiqlangan
                </span>
              )}
            </div>
          </div>
        </div>
        
        {seller.store_description && (
          <p className="text-sm text-dark-600 leading-relaxed line-clamp-3">
            {seller.store_description}
          </p>
        )}
      </div>
    </div>
  );
}
