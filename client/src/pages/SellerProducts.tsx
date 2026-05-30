import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiEdit } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAppStore } from '../store/appStore';
import { productService, sellerService } from '../services/endpoints';
import ProductEditModal from '../components/seller/ProductEditModal';

export default function SellerProducts() {
  const navigate = useNavigate();
  const { token } = useAppStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const sellerRes = await sellerService.getMe();
      if (sellerRes.success && sellerRes.data) {
        const prodRes = await productService.getSellerProducts(sellerRes.data.id);
        setProducts(prodRes.data || []);
      } else {
        toast.error('Sotuvchi ma\'lumotlari topilmadi');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Mahsulotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" mahsulotini o'chirishni tasdiqlaysizmi?`)) return;
    try {
      await productService.delete(id);
      toast.success('Mahsulot o\'chirildi');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  const goBack = () => { navigate('/seller'); };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between h-12 px-4">
          <div className="flex items-center gap-3">
            <button onClick={goBack} className="p-1 -ml-1"><FiArrowLeft className="w-5 h-5" /></button>
            <h1 className="font-bold">Mahsulotlarim</h1>
          </div>
        </div>
      </div>

      <div className="container-app py-4 space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="card p-4 animate-pulse"><div className="flex gap-3"><div className="w-16 h-16 skeleton rounded-xl" /><div className="flex-1 space-y-2"><div className="h-4 skeleton w-3/4" /><div className="h-3 skeleton w-1/3" /></div></div></div>
          ))
        ) : products.length === 0 ? (
          <div className="text-center py-12">

            <span className="text-4xl">📦</span>
            <p className="text-dark-500 mt-3">Hali mahsulot qo'shmagansiz</p>
          </div>
        ) : (
          products.map((product: any) => (
            <div key={product.id} className="card p-3 flex gap-3">
              <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                <img src={product.images?.[0]?.url || '/placeholder.svg'} alt={product.name_uz} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-dark-900 line-clamp-1">{product.name_uz}</h3>
                <p className="text-sm font-bold text-primary-600 mt-1">{formatPrice(Number(product.price))}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {product.status === 'active' ? 'Faol' : 'Arxiv'}
                  </span>
                  <span className="text-xs text-dark-400">{product.views_count} ko'rish</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => setEditingProduct(product)} className="p-2 hover:bg-primary-50 rounded-lg text-dark-400 hover:text-primary-600 transition-colors"><FiEdit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(product.id, product.name_uz)} className="p-2 hover:bg-red-50 rounded-lg text-dark-400 hover:text-red-500 transition-colors"><FiTrash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {editingProduct && (
        <ProductEditModal 
          product={editingProduct} 
          onClose={() => setEditingProduct(null)} 
          onSuccess={fetchProducts} 
        />
      )}
    </div>
  );
}
