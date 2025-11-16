import { FC, useState } from 'react';
import { Lock, Image, Video, Star, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStripePayment } from '@/hooks/useStripePayment';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

interface ProfilePaywallProps {
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  subscriptionPrice: number; // regular price
  discountedPrice?: number; // promotional price
  discountPercentage?: number; // e.g. 90 for 90% off
  discountDays?: number; // e.g. 30 days
  postsCount: number;
  photosCount: number;
  videosCount: number;
  premiumPostsCount: number;
  onSuccess?: () => void; // Callback after successful subscription
}

export const ProfilePaywall: FC<ProfilePaywallProps> = ({
  authorId,
  authorName,
  authorAvatar,
  subscriptionPrice,
  discountedPrice = 3,
  discountPercentage = 90,
  discountDays = 30,
  postsCount,
  photosCount,
  videosCount,
  premiumPostsCount,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const { paymentMethods, isLoading: loadingCards } = usePaymentMethods();
  const { initiatePayment, isProcessing } = useStripePayment();
  const [showCardPrompt, setShowCardPrompt] = useState(false);

  const hasCard = paymentMethods && paymentMethods.length > 0;

  const handleSubscribe = async () => {
    if (!hasCard) {
      // Show card prompt
      setShowCardPrompt(true);
      return;
    }

    try {
      // Use first saved card for subscription
      const result = await initiatePayment({
        amount: discountedPrice,
        description: `Subscription to ${authorName}`,
        metadata: {
          type: 'subscription',
          authorId,
          discounted: 'true',
        },
      });

      if (result.success) {
        // Call onSuccess callback to refetch profile data
        // This will update is_subscribed flag and hide paywall
        if (onSuccess) {
          onSuccess();
        } else {
          // Fallback to reload if no callback provided
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  const handleAddCard = () => {
    // Redirect to billing settings to add card
    navigate('/settings?tab=profile&profileTab=billing');
  };

  return (
    <div className="space-y-6">
      {/* Main Paywall Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a0f2e] via-[#0a0a0a] to-[#0a0a0a] border-2 border-[#A06AFF]/30 p-8">
        {/* Animated background gradients */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#A06AFF] rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Lock Icon */}
          <div className="inline-flex p-6 bg-gradient-to-br from-[#A06AFF]/20 to-purple-900/20 rounded-full border-2 border-[#A06AFF]/50 mb-6">
            <Lock className="w-12 h-12 text-[#A06AFF]" />
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white mb-3">
            ПОДПИСКА
          </h2>

          {/* Discount Banner */}
          {discountPercentage && (
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mb-4 animate-pulse">
              <Star className="w-5 h-5 fill-current text-white" />
              <span className="text-white font-bold text-lg">
                Ограниченное предложение - {discountPercentage}% скидка на {discountDays} дней!
              </span>
            </div>
          )}

          {/* Pricing */}
          <div className="mb-6">
            <div className="flex items-baseline justify-center gap-3 mb-2">
              <span className="text-6xl font-bold bg-gradient-to-r from-[#A06AFF] to-purple-500 bg-clip-text text-transparent">
                ${discountedPrice}
              </span>
              <span className="text-xl text-gray-400">TODAY ONLY!</span>
            </div>
            <p className="text-white text-lg mb-2">
              for {discountDays} days
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleSubscribe}
            disabled={isProcessing || loadingCards}
            className="w-full max-w-md mx-auto py-4 px-8 bg-gradient-to-r from-[#A06AFF] to-purple-600 hover:from-[#B084FF] hover:to-purple-700 text-white text-xl font-bold rounded-2xl transition-all duration-200 shadow-2xl shadow-[#A06AFF]/50 hover:shadow-[#A06AFF]/70 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingCards ? 'Loading...' : isProcessing ? 'Processing...' : `ПОДПИШИТЕСЬ - $${discountedPrice} на ${discountDays} дней`}
          </button>

          {/* Regular Price */}
          <p className="text-gray-400 text-sm mt-3">
            Обычная цена{' '}
            <span className="line-through">${subscriptionPrice}</span>
            {' '}/ месяц
          </p>

          {/* Card Prompt Modal */}
          {showCardPrompt && !hasCard && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
              <div className="bg-[#181a20] border border-[#2a2d35] rounded-2xl p-8 max-w-md w-full">
                <div className="text-center mb-6">
                  <div className="inline-flex p-4 bg-[#A06AFF]/20 rounded-full mb-4">
                    <CreditCard className="w-8 h-8 text-[#A06AFF]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Добавьте платежный метод
                  </h3>
                  <p className="text-gray-400">
                    Чтобы подписаться, сначала добавьте карту в настройках
                  </p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleAddCard}
                    className="w-full py-3 bg-gradient-to-r from-[#A06AFF] to-purple-600 text-white rounded-xl font-semibold hover:from-[#B084FF] hover:to-purple-700 transition-all"
                  >
                    Добавить карту
                  </button>
                  <button
                    onClick={() => setShowCardPrompt(false)}
                    className="w-full py-3 bg-[#0a0a0a] border border-[#2a2d35] text-white rounded-xl hover:bg-[#181a20] transition-all"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Preview Card */}
      <div className="bg-[#0a0a0a] border border-[#2a2d35] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">Контент автора</h3>
          <Lock className="w-5 h-5 text-[#A06AFF]" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Posts */}
          <div className="bg-[#181a20] rounded-xl p-4 text-center border border-[#2a2d35]">
            <div className="text-3xl font-bold text-white mb-1">{postsCount}</div>
            <div className="text-sm text-gray-400">Постов</div>
          </div>

          {/* Photos */}
          <div className="bg-[#181a20] rounded-xl p-4 text-center border border-[#2a2d35]">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Image className="w-4 h-4 text-[#A06AFF]" />
              <span className="text-3xl font-bold text-white">{photosCount}</span>
            </div>
            <div className="text-sm text-gray-400">Фото</div>
          </div>

          {/* Videos */}
          <div className="bg-[#181a20] rounded-xl p-4 text-center border border-[#2a2d35]">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Video className="w-4 h-4 text-[#A06AFF]" />
              <span className="text-3xl font-bold text-white">{videosCount}</span>
            </div>
            <div className="text-sm text-gray-400">Видео</div>
          </div>

          {/* Premium Posts */}
          <div className="bg-[#181a20] rounded-xl p-4 text-center border border-[#2a2d35]">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-3xl font-bold text-white">{premiumPostsCount}</span>
            </div>
            <div className="text-sm text-gray-400">Премиум</div>
          </div>
        </div>

        {/* Bottom CTA */}
        <button
          onClick={handleSubscribe}
          disabled={isProcessing || loadingCards}
          className="w-full mt-6 py-3 bg-gradient-to-r from-[#A06AFF] to-purple-600 hover:from-[#B084FF] hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ПОДПИШИТЕСЬ, ЧТОБЫ УВИДЕТЬ СООБЩЕНИЯ ПОЛЬЗОВАТЕЛЯ
        </button>
      </div>
    </div>
  );
};
