import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { FiSend, FiTrash2, FiUser } from 'react-icons/fi';
import { reviewService } from '../../services/endpoints';
import { useAppStore } from '../../store/appStore';
import toast from 'react-hot-toast';
import StarRating from './StarRating';

interface ReviewsProps {
  productId: string;
  productSlug: string;
  avgRating?: number;
  ratingCount?: number;
}

export default function Reviews({ productId, productSlug, avgRating = 0, ratingCount = 0 }: ReviewsProps) {
  const storeTelegramId = useAppStore((s) => s.telegramId);
  const userTelegramId = useAppStore((s) => s.user?.telegram_id);
  const urlParams = new URLSearchParams(window.location.search);
  const urlUserId = urlParams.get('user');
  const storedId = (() => {
    try {
      const raw = localStorage.getItem('kattaqurgon-cart');
      if (raw) {
        const parsed = JSON.parse(raw);
        const id = parsed?.state?.telegramId || parsed?.telegramId;
        return id || null;
      }
    } catch (e) {}
    return null;
  })();
  const telegramId = storeTelegramId || userTelegramId || (urlUserId ? parseInt(urlUserId) : null) || storedId;
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewService.getByProduct(productId),
    enabled: !!productId,
  });

  const { data: myReview } = useQuery({
    queryKey: ['my-review', productId, telegramId],
    queryFn: () => reviewService.getMyReview(productId, telegramId!),
    enabled: !!productId && !!telegramId,
  });

  const createMutation = useMutation({
    mutationFn: () => reviewService.create({
      telegram_id: telegramId!,
      product_id: productId,
      rating,
      comment: comment.trim() || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['my-review', productId] });
      setShowForm(false);
      setComment('');
      toast.success('Izohingiz qabul qilindi!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Xatolik yuz berdi');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => reviewService.delete(reviewId, telegramId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['my-review', productId] });
      toast.success("Izoh o'chirildi");
    },
    onError: () => toast.error('Xatolik yuz berdi'),
  });

  const reviews = reviewsData?.data || [];
  const hasExistingReview = !!myReview?.data;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-5">
      {/* Header with average rating */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-dark-900 text-lg">Izohlar va Reyting</h3>
        <div className="flex items-center gap-2">
          <StarRating rating={Math.round(avgRating)} size="sm" />
          <span className="text-sm font-medium text-dark-600">
            {avgRating > 0 ? avgRating.toFixed(1) : '—'} ({ratingCount})
          </span>
        </div>
      </div>

      {/* Write review button */}
      {!hasExistingReview && (
        <div>
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 border-2 border-dashed border-primary-300 rounded-2xl text-primary-600 font-medium text-sm hover:bg-primary-50 transition-colors"
            >
              Izoh qoldirish ✍️
            </button>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-4 space-y-4 border border-gray-100">
              <p className="text-sm font-semibold text-dark-700">Mahsulotni baholang:</p>
              <StarRating rating={rating} onChange={setRating} interactive size="lg" />

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Izohingizni yozing (ixtiyoriy)..."
                className="input-field min-h-[80px] resize-none text-sm"
                rows={3}
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-dark-500"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || rating === 0}
                  className="flex-1 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {createMutation.isPending ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (
                    <FiSend className="w-4 h-4" />
                  )}
                  Yuborish
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Existing user review */}
      {hasExistingReview && myReview.data && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-dark-700">Sizning bahoyingiz</p>
            <button
              onClick={() => deleteMutation.mutate(myReview.data.id)}
              className="text-red-400 hover:text-red-600 transition-colors p-1"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
          <StarRating rating={myReview.data.rating} size="md" />
          {myReview.data.comment && (
            <p className="text-sm text-dark-600 mt-2">{myReview.data.comment}</p>
          )}
        </div>
      )}

      {/* Reviews list */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div key={review.id} className="bg-white border border-gray-100 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <FiUser className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-dark-900">
                      {review.user?.first_name || 'Foydalanuvchi'}
                    </p>
                    <span className="text-[10px] text-dark-400">{formatDate(review.created_at)}</span>
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                  {review.comment && (
                    <p className="text-sm text-dark-600 mt-2 leading-relaxed">{review.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-dark-400 text-sm">Hozircha izohlar yo'q. Birinchi bo'lib izoh qoldiring!</p>
        </div>
      )}
    </div>
  );
}
