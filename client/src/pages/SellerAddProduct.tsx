import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { sellerService, categoryService, productService, authService } from '../services/endpoints';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiUpload, FiX } from 'react-icons/fi';

export default function SellerAddProduct() {
  const navigate = useNavigate();
  const { telegramId: storeTelegramId } = useAppStore();

  const params = new URLSearchParams(window.location.search);
  const urlTelegramId = params.get('user');
  const telegramId = storeTelegramId || (urlTelegramId ? parseInt(urlTelegramId) : null);

  const [form, setForm] = useState({
    name_uz: '',
    description_uz: '',
    price: '',
    old_price: '',
    quantity: '1',
    unit: 'dona',
    category_id: '',
    is_negotiable: false,
    tags: '',
    images: [] as string[],
  });
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories-flat'],
    queryFn: async () => {
      const res = await categoryService.getFlat();
      return res.data;
    },
  });

  const goBack = () => {
    navigate('/seller');
  };

  if (!telegramId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-app py-8 text-center">
          <span className="text-4xl">⚠️</span>
          <p className="text-dark-500 mt-3">Telegram orqali kiring</p>
          <a href="https://t.me/kattaqurgon_bozori_bot" target="_blank" rel="noopener noreferrer" className="btn-primary mt-4 inline-block">
            Botga o'tish
          </a>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name_uz || !form.price) {
      toast.error('Nomi va narxi majburiy');
      return;
    }

    if (form.images.length === 0) {
      toast.error(`Kamida bitta rasm yuklash majburiy! Iltimos, "Rasm yuklash" tugmasini bosing.`);
      return;
    }

    setSubmitting(true);

    try {
      const productData = {
        name_uz: form.name_uz,
        description_uz: form.description_uz,
        price: parseFloat(form.price),
        old_price: form.old_price ? parseFloat(form.old_price) : undefined,
        quantity: parseInt(form.quantity),
        unit: form.unit,
        category_id: form.category_id || undefined,
        is_negotiable: form.is_negotiable,
        tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()) : [],
        images: form.images.length > 0 ? form.images.map((url, i) => ({ url, is_primary: i === 0 })) : undefined,
      };

      const json = await productService.create(productData);

      if (json.success) {
        toast.success('Mahsulot qo\'shildi!');
        setTimeout(() => {
          navigate('/seller/products', { replace: true });
        }, 1500);
      } else {
        toast.error(json.error || 'Xatolik yuz berdi');
      }
    } catch (error: any) {
      toast.error('Xatolik: Serverga bog\'lanib bo\'lmadi');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const addImage = () => {
    if (imageUrl && !form.images.includes(imageUrl)) {
      setForm({ ...form, images: [...form.images, imageUrl] });
      setImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Rasm hajmi 5MB dan oshmasligi kerak');
      return;
    }

    // Token yo'q bo'lsa, avval olishga harakat qil
    let token = useAppStore.getState().token;
    if (!token) {
      const params = new URLSearchParams(window.location.search);
      const urlUserId = params.get('user');
      const storeId = useAppStore.getState().telegramId;
      const telegramId = storeId || (urlUserId ? parseInt(urlUserId) : null);
      if (telegramId) {
        try {
          const res = await authService.initById(telegramId);
          if (res.success && res.data?.token) {
            useAppStore.getState().setToken(res.data.token);
            token = res.data.token;
          }
        } catch (e) {
          console.error('Token refresh failed:', e);
        }
      }
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const base64data = reader.result as string;
        const json = await productService.uploadImage(base64data);
        if (json.success && json.data?.url) {
          setForm((prev) => ({ ...prev, images: [...prev.images, json.data.url] }));
          toast.success('Rasm muvaffaqiyatli yuklandi!');
        } else {
          toast.error(json.error || 'Rasm yuklashda xatolik yuz berdi');
        }
      } catch (error: any) {
        console.error('Upload error:', error);
        const msg = error.response?.data?.error || error.message || 'Serverga ulanishda xatolik';
        toast.error(msg);
      } finally {
        setUploadingImage(false);
      }
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 h-12 px-4">
          <button onClick={goBack} className="p-1 -ml-1">
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold">Yangi mahsulot</h1>
        </div>
      </div>

      <div className="container-app py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Images */}
          <div className="card p-4">
            <label className="block text-sm font-medium text-dark-700 mb-2">
              Rasmlar <span className="text-red-500">*</span>
            </label>

            {/* File upload area */}
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
              />
              <div className={`
                border-2 border-dashed rounded-2xl p-6 text-center transition-all
                ${uploadingImage
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-dark-200 hover:border-primary-400 hover:bg-primary-50/50'
                }
              `}>
                {uploadingImage ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-primary-300 border-t-primary-600 animate-spin" />
                    <p className="text-sm font-medium text-primary-600">Yuklanmoqda...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center">
                      <FiUpload className="w-6 h-6 text-primary-600" />
                    </div>
                    <p className="text-sm font-semibold text-dark-700">Rasm yuklash</p>
                    <p className="text-xs text-dark-400">Kamera yoki galereyadan rasm tanlang</p>
                    <span className="text-[10px] text-dark-300">Max: 5MB, JPG/PNG/WebP</span>
                  </div>
                )}
              </div>
            </label>

            {/* Uploaded images preview */}
            {form.images.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
                {form.images.map((url, index) => (
                  <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border-2 border-primary-200 shadow-sm">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-0 inset-x-0 bg-primary-600 text-white text-[8px] font-bold text-center py-0.5">
                        Asosiy
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* URL paste option (secondary) */}
            <details className="mt-3 group">
              <summary className="text-xs text-dark-400 cursor-pointer hover:text-primary-600 transition-colors font-medium">
                Yoki rasm URL manzilini kiriting
              </summary>
              <div className="flex gap-2 mt-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/rasm.jpg"
                  className="input-field flex-1 text-sm"
                />
                <button type="button" onClick={addImage} className="btn-secondary text-sm px-4 flex items-center gap-1">
                  <FiUpload className="w-4 h-4" />
                  Qo'shish
                </button>
              </div>
            </details>
          </div>

          {/* Name */}
          <div className="card p-4">
            <label className="block text-sm font-medium text-dark-700 mb-2">
              Mahsulot nomi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name_uz}
              onChange={(e) => setForm({ ...form, name_uz: e.target.value })}
              placeholder="Mahsulot nomini kiriting"
              className="input-field"
              required
            />
          </div>

          {/* Description */}
          <div className="card p-4">
            <label className="block text-sm font-medium text-dark-700 mb-2">Tavsif</label>
            <textarea
              value={form.description_uz}
              onChange={(e) => setForm({ ...form, description_uz: e.target.value })}
              placeholder="Mahsulot haqida batafsil ma'lumot"
              className="input-field min-h-[100px] resize-none"
              rows={4}
            />
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4">
              <label className="block text-sm font-medium text-dark-700 mb-2">
                Narx <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0"
                className="input-field"
                min="0"
                required
              />
            </div>
            <div className="card p-4">
              <label className="block text-sm font-medium text-dark-700 mb-2">Eski narx</label>
              <input
                type="number"
                value={form.old_price}
                onChange={(e) => setForm({ ...form, old_price: e.target.value })}
                placeholder="0"
                className="input-field"
                min="0"
              />
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4">
              <label className="block text-sm font-medium text-dark-700 mb-2">Soni</label>
              <input
                type="number"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="input-field"
                min="0"
              />
            </div>
            <div className="card p-4">
              <label className="block text-sm font-medium text-dark-700 mb-2">Birlik</label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="input-field"
              >
                <option value="dona">dona</option>
                <option value="kg">kg</option>
                <option value="litr">litr</option>
                <option value="metr">metr</option>
                <option value="qop">qop</option>
                <option value="sumka">sumka</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="card p-4">
            <label className="block text-sm font-medium text-dark-700 mb-2">Kategoriya</label>
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="input-field"
            >
              <option value="">Kategoriyani tanlang</option>
              {(categoriesData || []).map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {'—'.repeat(cat.level)} {cat.icon} {cat.name_uz}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="card p-4">
            <label className="block text-sm font-medium text-dark-700 mb-2">Teglar (vergul bilan ajrating)</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="masalan: yangi, arzon, sifatli"
              className="input-field"
            />
          </div>

          {/* Negotiable */}
          <div className="card p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_negotiable}
                onChange={(e) => setForm({ ...form, is_negotiable: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <div>
                <span className="text-sm font-medium text-dark-700">Kelishilgan narx</span>
                <p className="text-xs text-dark-400">Xaridor bilan narxni kelishish mumkin</p>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? 'Saqlanmoqda...' : 'Mahsulotni qo\'shish'}
          </button>
        </form>
      </div>
    </div>
  );
}
