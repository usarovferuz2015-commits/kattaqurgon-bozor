import { Link } from 'react-router-dom';
import { FiArrowLeft, FiHeart } from 'react-icons/fi';
import { useAppStore } from '../store/appStore';

export default function FavoritesPage() {
  const { telegramId } = useAppStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 h-12 px-4">
          <Link to="/" className="p-1 -ml-1">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold">Sevimlilar</h1>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-20">
        <FiHeart className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-dark-500 text-lg font-medium">Sevimlilar bo'sh</p>
        <p className="text-dark-400 text-sm mt-1">Sevimli mahsulotlaringizni saqlang</p>
        <Link to="/" className="btn-primary mt-6">Katalogga o'tish</Link>
      </div>
    </div>
  );
}
