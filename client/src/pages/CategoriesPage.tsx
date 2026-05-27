import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../services/endpoints';
import { FiArrowLeft, FiGrid } from 'react-icons/fi';

export default function CategoriesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['all-categories'],
    queryFn: async () => {
      const res = await categoryService.getAll();
      return res.data;
    },
  });

  const categories = data || [];

  // Group by level for visual hierarchy
  const mainCategories = categories.filter((c: any) => c.level === 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="flex items-center gap-3 h-12 px-4">
          <Link to="/" className="p-1 -ml-1">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-dark-900">Katalog</h1>
          <span className="ml-auto text-xs text-dark-400">{categories.length} ta kategoriya</span>
        </div>
      </div>

      <div className="container-app py-4 space-y-6">
        {isLoading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-10 w-32 bg-dark-100 rounded-full animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FiGrid className="w-8 h-8 text-dark-300" />
            </div>
            <p className="text-dark-500 text-lg font-medium">Kategoriyalar mavjud emas</p>
          </div>
        ) : (
          <>
            {/* All categories as pills */}
            <div className="flex flex-wrap gap-2.5">
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white border border-dark-100 shadow-sm text-sm font-medium text-dark-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 hover:shadow-md active:scale-95 transition-all no-underline"
                >
                  <span className="text-xl">{cat.icon || '📁'}</span>
                  <span>{cat.name_uz}</span>
                  {cat.product_count > 0 && (
                    <span className="text-[10px] text-dark-400 ml-0.5">({cat.product_count})</span>
                  )}
                </Link>
              ))}
            </div>

            {/* Grouped by main categories */}
            {mainCategories.length > 1 && (
              <div className="space-y-6 pt-4 border-t border-gray-100">
                <p className="text-xs font-semibold text-dark-400 uppercase tracking-wider">Bo'limlar bo'yicha</p>
                {mainCategories.map((main: any) => (
                  <div key={main.id}>
                    <Link
                      to={`/category/${main.slug}`}
                      className="flex items-center gap-2 mb-3 no-underline"
                    >
                      <span className="text-2xl">{main.icon || '📁'}</span>
                      <div>
                        <p className="font-bold text-dark-900">{main.name_uz}</p>
                        {main.product_count > 0 && (
                          <p className="text-xs text-dark-400">{main.product_count} ta mahsulot</p>
                        )}
                      </div>
                    </Link>
                    {main.children?.length > 0 && (
                      <div className="flex flex-wrap gap-2 ml-10">
                        {main.children.map((child: any) => (
                          <Link
                            key={child.id}
                            to={`/category/${child.slug}`}
                            className="px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-medium text-dark-600 hover:bg-primary-50 hover:text-primary-700 transition-colors no-underline"
                          >
                            {child.icon} {child.name_uz}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
