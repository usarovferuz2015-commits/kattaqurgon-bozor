import { FiStar } from 'react-icons/fi';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
}

export default function StarRating({
  rating,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
}: StarRatingProps) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const textMap = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const handleClick = (star: number) => {
    if (interactive && onChange) {
      // Toggle: if clicking the same star again, deselect (allow 0)
      onChange(star === rating ? 0 : star);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= rating;

        return (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(starValue)}
            disabled={!interactive}
            className={`
              transition-all duration-200
              ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
              ${filled ? 'text-amber-400' : 'text-gray-300'}
            `}
          >
            <FiStar
              className={`${sizeMap[size]} ${filled ? 'fill-current' : ''} transition-colors`}
            />
          </button>
        );
      })}
      {showValue && (
        <span className={`ml-2 font-bold text-dark-700 ${textMap[size]}`}>
          {rating > 0 ? rating.toFixed(1) : '—'}
        </span>
      )}
    </div>
  );
}
