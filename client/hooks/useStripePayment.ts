import { useState } from 'react';
import { usePaymentMethods } from './usePaymentMethods';

interface PaymentIntent {
  amount: number;
  description: string;
  metadata?: Record<string, string>;
}

interface PaymentResult {
  success: boolean;
  error?: string;
  paymentIntentId?: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api';

export function useStripePayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { paymentMethods } = usePaymentMethods();

  const fetchAPI = async (endpoint: string, options?: RequestInit) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  };

  const initiatePayment = async (intent: PaymentIntent): Promise<PaymentResult> => {
    setIsProcessing(true);
    setError(null);

    try {
      // Get default payment method
      const defaultCard = paymentMethods.find(pm => pm.isDefault) || paymentMethods[0];
      
      if (!defaultCard) {
        throw new Error('No payment method available');
      }

      // Charge saved card
      const data = await fetchAPI('/payments/charge-saved-card', {
        method: 'POST',
        body: JSON.stringify({
          payment_method_id: defaultCard.id,
          amount: Math.round(intent.amount * 100), // Convert to cents
          description: intent.description,
          metadata: intent.metadata,
        }),
      });

      if (data.success || data.paymentIntentId) {
        return {
          success: true,
          paymentIntentId: data.paymentIntentId,
        };
      } else {
        throw new Error(data.error || 'Payment failed');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Payment failed';
      setError(errorMessage);
      console.error('[useStripePayment] Payment error:', err);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    initiatePayment,
    isProcessing,
    error,
  };
}
