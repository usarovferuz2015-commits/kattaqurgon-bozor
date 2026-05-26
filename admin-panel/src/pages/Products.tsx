import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import {
  FiSearch, FiShoppingBag, FiEye, FiEdit2, FiTrash2, FiStar,
  FiFolder, FiGrid, FiCheck, FiX, FiInfo, FiTag
} from 'react-icons/fi';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ProductsProps {
  adminId: number;
}

export default function Products({ adminId }: ProductsProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [featuredProduct, setFeaturedProduct] = useState<any>(null);

  // Form states for Edit Modal
  const [editForm, setEditForm] = useState({
    name_uz: '',
    price: 0,
    discount_percent: 0,
    status: 'active',
    description: '',
  });

  // Form states for Featured Placement Modal
  const [featuredForm, setFeaturedForm] = useState({
    section: 'recommended',
    sort_order: 0,
  });

  // Query to fetch homepage products and categories
  const { data: homepageData, isLoading: isHomepageLoading } = useQuery({
    queryKey: ['admin-homepage-data'],
    queryFn: async () => {
      const { data } = await api.get('/products/homepage');
      return data.data;
    },
  });

  // Query to fetch dynamic products based on filters
  const { data: filteredProductsData, isLoading: isFilteredLoading } = useQuery({
    queryKey: ['admin-filtered-products', selectedCategory, search],
    queryFn: async () => {
      const params: any = {};
      if (selectedCategory !== 'all') params.category_id = selectedCategory;
      if (search) params.search = search;
      
      const { data } = await api.get('/products', { params });
      return data.data || data; // Handle paginated response format
    },
  });

  // Query to fetch currently featured items to know their section associations
  const { data: featuredItems, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['admin-featured-items'],
    queryFn: async () => {
      const { data } = await api.get('/admin/featured', {
        headers: { 'X-Telegram-Id': adminId }
      });
      return data.data || [];
    },
  });

  // Mutation to update product details
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...formData }: any) => {
      const { data } = await api.put(`/products/${id}`, formData, {
        headers: { 'X-Telegram-Id': adminId }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-filtered-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-homepage-data'] });
      toast.success('Mahsulot muvaffaqiyatli yangilandi');
      setEditingProduct(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Xatolik yuz berdi'),
  });

  // Mutation to delete product
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/products/${id}`, {
        headers: { 'X-Telegram-Id': adminId }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-filtered-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-homepage-data'] });
      toast.success('Mahsulot muvaffaqiyatli o\'chirildi');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Xatolik yuz berdi'),
  });

  // Mutation to add product to featured section
  const addFeaturedMutation = useMutation({
    mutationFn: async (formData: any) => {
      const { data } = await api.post('/admin/featured', formData, {
        headers: { 'X-Telegram-Id': adminId }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-featured-items'] });
      queryClient.invalidateQueries({ queryKey: ['admin-homepage-data'] });
      toast.success('Mahsulot maxsus bo\'limga qo\'shildi');
      setFeaturedProduct(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Xatolik yuz berdi'),
  });

  // Mutation to remove product from featured section
  const removeFeaturedMutation = useMutation({
    mutationFn: async (featuredId: string) => {
      const { data } = await api.delete(`/admin/featured/${featuredId}`, {
        headers: { 'X-Telegram-Id': adminId }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-featured-items'] });
      queryClient.invalidateQueries({ queryKey: ['admin-homepage-data'] });
      toast.success('Mahsulot maxsus bo\'limdan olib tashlandi');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Xatolik yuz berdi'),
  });

  // Extract products list
  const getProductsList = () => {
    // If we have filtered products from our dynamic API query, use those
    if (filteredProductsData) {
      return Array.isArray(filteredProductsData) 
        ? filteredProductsData 
        : (filteredProductsData.data || []);
    }

    // Fallback: Combine all products from the homepage sections safely
    return [
      ...(homepageData?.featured || []),
      ...(homepageData?.top || []),
      ...(homepageData?.recommended || []),
      ...(homepageData?.most_viewed || []),
      ...(homepageData?.premium || []),
    ].filter((p: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.id === p.id) === i);
  };

  const productsList = getProductsList();

  const handleEditClick = (product: any) => {
    setEditingProduct(product);
    setEditForm({
      name_uz: product.name_uz || '',
      price: Number(product.price) || 0,
      discount_percent: Number(product.discount_percent) || 0,
      status: product.status || 'active',
      description: product.description || '',
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    updateProductMutation.mutate({
      id: editingProduct.id,
      ...editForm,
    });
  };

  const handleStatusToggle = (product: any) => {
    const nextStatus = product.status === 'active' ? 'archived' : 'active';
    updateProductMutation.mutate({
      id: product.id,
      status: nextStatus,
    });
  };

  const handleDeleteClick = (product: any) => {
    if (window.confirm(`"${product.name_uz}" mahsulotini o'chirib tashlashni xohlaysizmi? Bu amalni ortga qaytarib bo'lmaydi!`)) {
      deleteProductMutation.mutate(product.id);
    }
  };

  const handleFeaturedClick = (product: any) => {
    setFeaturedProduct(product);
    setFeaturedForm({
      section: 'recommended',
      sort_order: 0,
    });
  };

  const handleFeaturedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!featuredProduct) return;

    addFeaturedMutation.mutate({
      product_id: featuredProduct.id,
      section: featuredForm.section,
      sort_order: Number(featuredForm.sort_order),
    });
  };

  const categories = homepageData?.categories || [];
  const isLoading = isHomepageLoading || isFilteredLoading;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
            <FiShoppingBag className="text-primary-500" /> Mahsulotlar Katalogi
          </h1>
          <p className="text-sm text-dark-500 mt-1">Marketplace mahsulotlarini premium dizaynda ko'rish, tahrirlash va boshqarish</p>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dark-400" />
          <input
            type="text"
            placeholder="Mahsulot qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 pr-4 py-2.5 text-sm w-full sm:w-64 bg-white/70 backdrop-blur-sm border-dark-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 rounded-xl transition-all shadow-sm"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills (Catalog-style horizontal scrolling) */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-dark-500 uppercase tracking-wider">
          <FiGrid className="w-3.5 h-3.5" />
          <span>Kategoriyalar bo'yicha filter</span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2.5 pt-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 flex items-center gap-1.5 shadow-sm
              ${selectedCategory === 'all'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20'
                : 'bg-white hover:bg-dark-50 text-dark-700 border border-dark-100'
              }
            `}
          >
            🏪 Barchasi
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0 flex items-center gap-1.5 shadow-sm
                ${selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20'
                  : 'bg-white hover:bg-dark-50 text-dark-700 border border-dark-100'
                }
              `}
            >
              <span>{cat.icon || '📁'}</span>
              <span>{cat.name_uz}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card bg-white rounded-2xl p-4 shadow-sm border border-dark-100 animate-pulse space-y-3">
              <div className="aspect-square bg-dark-100 rounded-xl w-full" />
              <div className="h-4 bg-dark-100 rounded w-3/4" />
              <div className="h-4 bg-dark-100 rounded w-1/2" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-3 bg-dark-100 rounded w-1/3" />
                <div className="h-6 bg-dark-100 rounded-full w-12" />
              </div>
            </div>
          ))
        ) : productsList.length > 0 ? (
          productsList.map((product: any, idx: number) => {
            // Find which featured sections this product is associated with
            const productFeaturedRecords = (featuredItems || []).filter((f: any) => f.product_id === product.id);

            return (
              <div
                key={product.id}
                className="group relative bg-white rounded-2xl overflow-hidden border border-dark-100 hover:border-primary-200 hover:shadow-xl transition-all duration-300 flex flex-col justify-between animate-slide-up"
                style={{ animationDelay: `${idx * 25}ms` }}
              >
                {/* Image Section */}
                <div className="aspect-square bg-dark-50 relative overflow-hidden flex-shrink-0 select-none">
                  <img
                    src={product.images?.[0]?.url || '/placeholder.svg'}
                    alt={product.name_uz}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e: any) => { e.target.src = 'https://placehold.co/400?text=Kattaqo%27rg%27on+Bozori'; }}
                  />

                  {/* Overlays / Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                    {product.is_premium && (
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold tracking-wider uppercase px-2 py-1 rounded-lg shadow-md animate-pulse">
                        ⭐ VIP
                      </span>
                    )}
                    {product.discount_percent > 0 && (
                      <span className="bg-red-500 text-white text-[9px] font-bold tracking-wider px-2 py-1 rounded-lg shadow-md">
                        -{product.discount_percent}% Chegirma
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <button
                      onClick={() => handleStatusToggle(product)}
                      className={`text-[9px] font-semibold px-2 py-1 rounded-lg shadow-md border backdrop-blur-md transition-all
                        ${product.status === 'active'
                          ? 'bg-emerald-500/90 text-white border-emerald-400'
                          : 'bg-red-500/90 text-white border-red-400'
                        }
                      `}
                      title="Statusni almashtirish"
                    >
                      {product.status === 'active' ? 'Faol' : 'Arxiv'}
                    </button>
                  </div>

                  {/* Display active sections badging */}
                  {productFeaturedRecords.length > 0 && (
                    <div className="absolute bottom-2.5 left-2.5 flex flex-wrap gap-1">
                      {productFeaturedRecords.map((rec: any) => (
                        <span key={rec.id} className="bg-black/60 backdrop-blur-sm text-white text-[8px] font-medium px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-0.5">
                          📌 {rec.section === 'recommended' ? 'Tavsiya' : rec.section === 'top' ? 'TOP' : rec.section === 'most_viewed' ? 'Ko\'rilgan' : rec.section}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Edit/Hover actions overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3.5">
                    <button
                      onClick={() => handleEditClick(product)}
                      className="p-3 rounded-full bg-white text-dark-800 hover:bg-primary-500 hover:text-white shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110"
                      title="Mahsulotni tahrirlash"
                    >
                      <FiEdit2 className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => handleFeaturedClick(product)}
                      className="p-3 rounded-full bg-white text-dark-800 hover:bg-amber-500 hover:text-white shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110"
                      title="Maxsus bo'limlarga qo'shish"
                    >
                      <FiStar className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(product)}
                      className="p-3 rounded-full bg-white text-dark-800 hover:bg-red-500 hover:text-white shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110"
                      title="Mahsulotni o'chirish"
                    >
                      <FiTrash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm text-dark-800 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
                      {product.name_uz}
                    </h3>
                    <p className="text-[10px] text-dark-400 mt-1 truncate flex items-center gap-1 select-none">
                      {product.seller?.store_name ? `🏪 ${product.seller.store_name}` : '🏪 Sotuvchi mavjud emas'}
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-1.5 border-t border-dark-100">
                    <div className="flex items-end justify-between">
                      <div>
                        {product.discount_percent > 0 && (
                          <span className="text-xs text-dark-400 line-through">
                            {Number(product.price).toLocaleString()} so'm
                          </span>
                        )}
                        <p className="text-base font-bold text-primary-600 leading-none">
                          {Number(product.price - (product.price * (product.discount_percent / 100))).toLocaleString()} so'm
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-dark-400 select-none">
                        <FiEye className="w-3.5 h-3.5" />
                        <span>{product.views_count || 0}</span>
                      </div>
                    </div>

                    {/* Active Featured associations deletion controls */}
                    {productFeaturedRecords.length > 0 && (
                      <div className="bg-dark-50/50 p-1.5 rounded-lg border border-dark-100 text-[9px] space-y-1">
                        <p className="font-semibold text-dark-500 flex items-center gap-0.5"><FiInfo className="w-3" /> Maxsus bo'limlardan o'chirish:</p>
                        <div className="flex flex-wrap gap-1">
                          {productFeaturedRecords.map((rec: any) => (
                            <button
                              key={rec.id}
                              onClick={() => removeFeaturedMutation.mutate(rec.id)}
                              className="px-1.5 py-0.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded border border-red-200 transition-colors flex items-center gap-0.5"
                              title="Bo'limdan o'chirish"
                            >
                              {rec.section === 'recommended' ? 'Tavsiya' : rec.section === 'top' ? 'TOP' : rec.section === 'most_viewed' ? 'Ko\'rilgan' : rec.section}
                              <FiX className="w-2.5 h-2.5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full card bg-white border border-dark-100 p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-dark-50 flex items-center justify-center text-dark-300 mb-4">
              <FiShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-dark-800 text-lg">Mahsulotlar Topilmadi</h3>
            <p className="text-dark-500 text-sm mt-1 max-w-sm">
              {search 
                ? `"${search}" qidiruv so'rovi yoki tanlangan kategoriya bo'yicha hech qanday mahsulot topilmadi.` 
                : "Hozirda katalogda hech qanday mahsulot mavjud emas."
              }
            </p>
            {search || selectedCategory !== 'all' ? (
              <button
                onClick={() => { setSearch(''); setSelectedCategory('all'); }}
                className="btn-primary mt-4 py-2 px-4 text-xs font-semibold rounded-xl"
              >
                Filtrlarni tozalash
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingProduct(null)} />
          
          {/* Modal Container */}
          <div className="relative bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-dark-100 overflow-hidden animate-scale-in max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-dark-100 bg-dark-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                  <FiEdit2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-dark-900 text-base">Mahsulotni Tahrirlash</h3>
                  <p className="text-[10px] text-dark-400 mt-0.5">ID: {editingProduct.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-lg hover:bg-dark-100 text-dark-400 hover:text-dark-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider mb-1.5">Mahsulot Nomi *</label>
                <input 
                  type="text" 
                  value={editForm.name_uz} 
                  onChange={(e) => setFormState('name_uz', e.target.value)} 
                  className="input-field" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider mb-1.5">Narxi (so'm) *</label>
                  <input 
                    type="number" 
                    value={editForm.price} 
                    onChange={(e) => setFormState('price', Number(e.target.value))} 
                    className="input-field" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider mb-1.5">Chegirma foizi (%)</label>
                  <input 
                    type="number" 
                    value={editForm.discount_percent} 
                    onChange={(e) => setFormState('discount_percent', Number(e.target.value))} 
                    min="0" 
                    max="100" 
                    className="input-field" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider mb-1.5">Holati *</label>
                <select 
                  value={editForm.status} 
                  onChange={(e) => setFormState('status', e.target.value)} 
                  className="input-field"
                >
                  <option value="active">Faol (Sotuvda)</option>
                  <option value="archived">Arxiv (Sotuvdan olingan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider mb-1.5">Batafsil Tavsif</label>
                <textarea 
                  value={editForm.description} 
                  onChange={(e) => setFormState('description', e.target.value)} 
                  rows={4}
                  className="input-field"
                  placeholder="Mahsulot haqida ma'lumot kiriting..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-dark-100 justify-end">
                <button 
                  type="button" 
                  onClick={() => setEditingProduct(null)} 
                  className="btn-secondary px-5 py-2 text-sm"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  disabled={updateProductMutation.isPending}
                  className="btn-primary px-5 py-2 text-sm flex items-center gap-1.5"
                >
                  {updateProductMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      <span>Saqlanmoqda...</span>
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4" />
                      <span>Saqlash</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Featured Placements Modal */}
      {featuredProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFeaturedProduct(null)} />
          
          <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl border border-dark-100 overflow-hidden animate-scale-in flex flex-col">
            <div className="px-6 py-4 border-b border-dark-100 bg-dark-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <FiStar className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-dark-900 text-base">Bo'limlarga qo'shish</h3>
                  <p className="text-[10px] text-dark-400 mt-0.5">Ushbu mahsulotni maxsus katalog bo'limiga biriktirish</p>
                </div>
              </div>
              <button 
                onClick={() => setFeaturedProduct(null)}
                className="p-1.5 rounded-lg hover:bg-dark-100 text-dark-400 hover:text-dark-600 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFeaturedSubmit} className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-3 text-amber-800 text-xs">
                <FiInfo className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold mb-0.5">Mahsulot: {featuredProduct.name_uz}</p>
                  <p>Mahsulotni biriktirganingizdan so'ng xaridorlar mini-ilovasidagi tegishli bloklarda paydo bo'ladi.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider mb-1.5">Katalog Bo'limi *</label>
                <select 
                  value={featuredForm.section} 
                  onChange={(e) => setFeaturedForm({ ...featuredForm, section: e.target.value })} 
                  className="input-field"
                  required
                >
                  <option value="recommended">🔥 Tavsiya etilgan mahsulotlar</option>
                  <option value="top">🏆 TOP mahsulotlar</option>
                  <option value="most_viewed">👁 Ko'p ko'rilgan mahsulotlar</option>
                  <option value="premium">⭐ Premium (VIP) mahsulotlar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-500 uppercase tracking-wider mb-1.5">Saralash tartibi (sort order)</label>
                <input 
                  type="number" 
                  value={featuredForm.sort_order} 
                  onChange={(e) => setFeaturedForm({ ...featuredForm, sort_order: Number(e.target.value) })} 
                  className="input-field" 
                  min="0"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-dark-100 justify-end">
                <button 
                  type="button" 
                  onClick={() => setFeaturedProduct(null)} 
                  className="btn-secondary px-5 py-2 text-sm"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  disabled={addFeaturedMutation.isPending}
                  className="btn-primary px-5 py-2 text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-none shadow-md shadow-amber-500/20 text-white flex items-center gap-1.5"
                >
                  {addFeaturedMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      <span>Qo'shilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4" />
                      <span>Qo'shish</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Helper function to update state key value
  function setFormState(key: string, value: any) {
    setEditForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }
}
