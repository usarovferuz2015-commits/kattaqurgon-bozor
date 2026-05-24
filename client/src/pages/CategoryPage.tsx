import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoryService, productService } from '../services/endpoints';
import ProductCard from '../components/marketplace/ProductCard';
import { FiArrowLeft } from 'react-icons/fi';
import { ProductGridSkeleton } from '../components/ui/Skeleton';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: categoryData, isLoading: catLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      const res = await categoryService.getBySlug(slug!);
      return res.data;
    },
    enabled: !!slug,
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

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3 h-12 px-4">
          <Link to="/" className="p-1 -ml-1">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-bold text-dark-900">
            {category?.name_uz || 'Kategoriya'}
          </h1>
        </div>
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
