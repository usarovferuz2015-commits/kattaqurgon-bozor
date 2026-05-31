import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoryService, productService } from '../services/endpoints';
import ProductCard from '../components/marketplace/ProductCard';
import { FiArrowLeft, FiChevronRight, FiShoppingCart } from 'react-icons/fi';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { useAppStore } from '../store/appStore';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const cartCount = useAppStore((s) => s.cartCount);

  const { data: categoryData, isLoading: catLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      const res = await categoryService.getBySlug(slug!);
      return res.data;
    },
    enabled: !!slug,
  });

  const { data: allCategories } = useQuery({
    queryKey: ['categories-flat'],
    queryFn: async () => {
      const res = await categoryService.getFlat();
      return res.data;
    },
  });

  const { data: productsData, isLoading: prodLoading } = useQuery({
    queryKey: ['category-products', categoryData?.id],
    queryFn: async () => {
      const res = await productService.getByCategory(categoryData.id);
      return res;
    },
    enabled: !!categoryData?.id,
  });

  const isLoading = catLoading || prodLoading;
  const category = categoryData;
  const products = productsData?.data || [];

  // Build breadcrumb chain from parent_id
  const breadcrumb: { name: string; slug: string }[] = [];
  if (category && allCategories) {
    let current = category;
    while (current) {
      breadcrumb.unshift({ name: current.name_uz, slug: current.slug });
      if (current.parent_id) {
        const parent = allCategories.find((c: any) => c.id === current.parent_id);
        current = parent;
      } else {
        break;
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between h-12 px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1 -ml-1">
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-dark-900">
              {category?.name_uz || 'Kategoriya'}
            </h1>
          </div>
          <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-xl">
            <FiShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-accent-500 text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
        </div>
        {/* Breadcrumb */}
        {breadcrumb.length > 1 && (
          <div className="flex items-center gap-1 px-4 pb-2 text-xs text-dark-400 overflow-x-auto no-scrollbar">
            {breadcrumb.map((item, idx) => (
              <span key={item.slug} className="flex items-center gap-1 whitespace-nowrap">
                {idx > 0 && <FiChevronRight className="w-3 h-3" />}
                {idx === breadcrumb.length - 1 ? (
                  <span className="text-dark-600 font-medium">{item.name}</span>
                ) : (
                  <Link to={`/category/${item.slug}`} className="hover:text-primary-600 transition-colors">
                    {item.name}
                  </Link>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="container-app py-4">
        {/* Subcategories */}
        {category?.children?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-dark-500 mb-3">Kichik kategoriyalar</h3>
            <div className="flex flex-wrap gap-2">
              {category.children.map((child: any) => (
                <Link
                  key={child.id}
                  to={`/category/${child.slug}`}
                  className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm font-medium hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  {child.icon} {child.name_uz}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        <div>
          <h3 className="text-sm font-medium text-dark-500 mb-3">
            Mahsulotlar ({productsData?.total || 0})
          </h3>
          {isLoading ? (
            <ProductGridSkeleton count={6} />
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl">📦</span>
              <p className="text-dark-500 mt-3">Bu kategoriyada mahsulot yo'q</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
