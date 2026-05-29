import React from 'react';

interface StoreFiltersProps {
  onSearch: (query: string) => void;
  onCategoryChange: (categoryId: string) => void;
  categories: any[];
  selectedCategory: string;
}

export default function StoreFilters({ onSearch, onCategoryChange, categories, selectedCategory }: StoreFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Search Input */}
      <div className="relative">
        <input 
          type="text" 
          placeholder="Do'kon ichidan qidirish..." 
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all shadow-sm"
          onChange={(e) => onSearch(e.target.value)}
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          🔍
        </span>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button 
          onClick={() => onCategoryChange('')}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
            selectedCategory === '' 
            ? 'bg-primary-600 text-white shadow-md shadow-primary-200' 
            : 'bg-white text-dark-600 border border-gray-200 hover:border-primary-300'
          }`}
        >
          Barchasi
        </button>
        {categories.map((cat: any) => (
          <button 
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              selectedCategory === cat.id 
              ? 'bg-primary-600 text-white shadow-md shadow-primary-200' 
              : 'bg-white text-dark-600 border border-gray-200 hover:border-primary-300'
            }`}
          >
            {cat.icon} {cat.name_uz}
          </button>
        ))}
      </div>
    </div>
  );
}
