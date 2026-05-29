import React, { useState } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { productService } from '../../services/endpoints';
import toast from 'react-hot-toast';

interface ProductEditModalProps {
  product: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ProductEditModal({ product, onClose, onSuccess }: ProductEditModalProps) {
  const [formData, setFormData] = useState({
    name_uz: product.name_uz,
    price: Number(product.price),
    quantity: Number(product.quantity || 0),
    status: product.status,
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await productService.update(product.id, formData);
      toast.success('Mahsulot yangilandi');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-bold text-dark-900">Mahsulotni tahrirlash</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FiX className="w-5 h-5 text-dark-400" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-dark-500 mb-1">Mahsulot nomi</label>
            <input 
              type="text" 
              value={formData.name_uz} 
              onChange={(e) => setFormData({...formData, name_uz: e.target.value})}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-dark-500 mb-1">Narxi (so'm)</label>
              <input 
                type="number" 
                value={formData.price} 
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-500 mb-1">Soni (stock)</label>
              <input 
                type="number" 
                value={formData.quantity} 
                onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-dark-500 mb-1">Holati</label>
            <select 
              value={formData.status} 
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            >
              <option value="active">Faol (Sotuvda)</option>
              <option value="inactive">Nofaol (Yashirilgan)</option>
              <option value="archived">Arxivlangan</option>
            </select>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white font-bold rounded-2xl shadow-lg shadow-primary-200 hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <FiSave className="w-5 h-5" />
                Saqlash
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
