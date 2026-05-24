import { Link } from 'react-router-dom';

interface CategoryCardProps {
  category: any;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      to={`/category/${category.slug}`}
      className="flex flex-col items-center gap-2 group min-w-[80px]"
    >
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-sm">
        {category.icon || '📦'}
      </div>
      <span className="text-xs text-dark-600 text-center font-medium line-clamp-2">
        {category.name_uz}
      </span>
    </Link>
  );
}
