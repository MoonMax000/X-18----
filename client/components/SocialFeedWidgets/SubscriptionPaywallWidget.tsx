import { FC, useState } from 'react';
import { Lock, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStripePayment } from '@/hooks/useStripePayment';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

interface SubscriptionPaywallWidgetProps {
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  subscriptionPrice: number;
  discountedPrice?: number;
  discountPercentage?: number;
  discountDays?: number;
}

const SubscriptionPaywallWidget: FC<SubscriptionPaywallWidgetProps> = ({
  authorId,
  authorName,
  authorAvatar,
  subscriptionPrice,
  discountedPrice = 3,
  discountPercentage = 90,
  discountDays = 30,
}) => {
  const navigate = useNavigate();
  const { paymentMethods, isLoading: loadingCards } = usePaymentMethods();
  const { initiatePayment, isProcessing } = useStripePayment();
  const [showCardPrompt, setShowCardPrompt] = useState(false);

  const hasCard = paymentMethods && paymentMethods.length > 0;

  const handleSubscribe = async () => {
    if (!hasCard) {
      setShowCardPrompt(true);
      return;
    }

    try {
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
        window.location.reload();
      }
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  const handleAddCard = () => {
    navigate('/settings?tab=profile&profileTab=billing');
  };

  return (
    <div className="bg-[#0a0a0a] border border-[#2a2d35] rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        {authorAvatar && (
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-12 h-12 rounded-full border-2 border-[#A06AFF]"
          />
        )}
        <div className="flex-1">
          <h3 className="text-white font-bold text-base">{authorName}</h3>
          <p className="text-gray-400 text-xs">Закрытый профиль</p>
        </div>
        <Lock className="w-5 h-5 text-[#A06AFF]" />
      </div>

      {/* Discount Badge */}
      {discountPercentage && (
        <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-xl p-3 text-center">
          <p className="text-white font-bold text-sm">
            🔥 {discountPercentage}% СКИДКА
          </p>
          <p className="text-white text-xs">
            {discountDays} дней за ${discountedPrice}
          </p>
        </div>
      )}

      {/* Pricing */}
      <div className="text-center py-3">
        <div className="flex items-baseline justify-center gap-2 mb-1">
          <span className="text-4xl font-bold text-white">${discountedPrice}</span>
          <span className="text-sm text-gray-400">/ {discountDays}д</span>
        </div>
        <p className="text-xs text-gray-500 line-through">
          ${subscriptionPrice}/месяц
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={handleSubscribe}
        disabled={isProcessing || loadingCards}
        className="w-full py-3 bg-gradient-to-r from-[#A06AFF] to-purple-600 hover:from-[#B084FF] hover:to-purple-700 text-white text-sm font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loadingCards ? 'Загрузка...' : isProcessing ? 'Обработка...' : 'ПОДПИСАТЬСЯ'}
      </button>

      {/* Card Prompt Modal */}
      {showCardPrompt && !hasCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="bg-[#181a20] border border-[#2a2d35] rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-4">
              <div className="inline-flex p-3 bg-[#A06AFF]/20 rounded-full mb-3">
                <CreditCard className="w-6 h-6 text-[#A06AFF]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Добавьте карту
              </h3>
              <p className="text-sm text-gray-400">
                Для подписки нужна привязанная карта
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={handleAddCard}
                className="w-full py-2 bg-gradient-to-r from-[#A06AFF] to-purple-600 text-white text-sm rounded-lg font-semibold hover:from-[#B084FF] hover:to-purple-700 transition-all"
              >
                Добавить карту
              </button>
              <button
                onClick={() => setShowCardPrompt(false)}
                className="w-full py-2 bg-[#0a0a0a] border border-[#2a2d35] text-white text-sm rounded-lg hover:bg-[#181a20] transition-all"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPaywallWidget;
