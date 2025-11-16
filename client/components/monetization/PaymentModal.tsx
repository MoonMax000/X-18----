import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { X, Lock, CreditCard, Loader2, ChevronDown, Plus } from "lucide-react";
import { usePaymentMethods, PaymentMethod } from "@/hooks/usePaymentMethods";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "unlock" | "subscribe";
  amount: number;
  postId?: string;
  authorId?: string;
  authorName?: string;
  plan?: "monthly" | "yearly";
  onSuccess?: () => void;
}

// Payment form component that uses Stripe Elements
function PaymentForm({
  type,
  amount,
  postId,
  authorId,
  plan,
  onSuccess,
  onClose,
  clientSecret,
}: Omit<PaymentModalProps, "isOpen" | "authorName"> & { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    // Confirm payment with Stripe
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL is optional when staying in the modal
        // If using 3D Secure, Stripe will handle the authentication popup
      },
      redirect: "if_required", // Don't redirect for simple card payments
    });

    if (error) {
      // Payment failed
      if (error.type === "card_error" || error.type === "validation_error") {
        setErrorMessage(error.message || "Payment failed");
      } else {
        setErrorMessage("An unexpected error occurred");
      }
      setLoading(false);
    } else {
      // Payment succeeded
      setErrorMessage(null);
      if (onSuccess) {
        onSuccess();
      }
      // Wait a bit before closing to show success
      setTimeout(() => {
        onClose();
      }, 1000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Payment Element - Stripe's universal payment UI */}
      <div className="rounded-xl border border-[#2F3336] bg-[#0A0D12] p-4">
        <PaymentElement />
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
          <p className="text-sm text-red-400">{errorMessage}</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full rounded-xl bg-gradient-to-r from-[#A06AFF] to-[#482090] py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(160,106,255,0.5)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            Pay ${amount}
          </>
        )}
      </button>

      {/* Security notice */}
      <div className="flex items-center gap-2 justify-center text-xs text-[#808283]">
        <Lock className="h-3 w-3" />
        <span>Secured by Stripe</span>
      </div>
    </form>
  );
}

// Main modal component
export function PaymentModal({
  isOpen,
  onClose,
  type,
  amount,
  postId,
  authorId,
  authorName = "Author",
  plan = "monthly",
  onSuccess,
}: PaymentModalProps) {
  const [mounted, setMounted] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Payment methods management
  const { paymentMethods, loading: loadingMethods } = usePaymentMethods();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"select-card" | "add-card">("select-card");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setClientSecret(null);
      setError(null);
      setSelectedPaymentMethod(null);
      setPaymentMode("select-card");
      setProcessing(false);
      return;
    }

    // Determine initial mode based on saved cards
    if (paymentMethods.length > 0) {
      setPaymentMode("select-card");
      // Auto-select default card if exists
      const defaultCard = paymentMethods.find(pm => pm.isDefault);
      if (defaultCard) {
        setSelectedPaymentMethod(defaultCard.id);
      }
    } else {
      setPaymentMode("add-card");
    }
  }, [isOpen, paymentMethods]);

  // Create PaymentIntent only when adding new card
  useEffect(() => {
    if (!isOpen || paymentMode !== "add-card") {
      return;
    }

    const createPaymentIntent = async () => {
      try {
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api';
        const endpoint = type === "unlock" 
          ? "/payments/create-post-payment-intent"
          : "/payments/create-subscription-intent";
        
        const fullUrl = `${baseUrl}${endpoint}`;
        
        const payload = {
          post_id: postId,
          type: type === "unlock" ? "unlock" : "subscribe"
        };
        
        const response = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment intent');
        }

        const data = await response.json();
        const clientSecretValue = data.client_secret || data.clientSecret;
        
        if (clientSecretValue) {
          setClientSecret(clientSecretValue);
        } else {
          throw new Error('No client secret in response');
        }
      } catch (error) {
        console.error("[PaymentModal] Failed to create payment intent:", error);
        setError("Failed to initialize payment. Please try again.");
      }
    };

    createPaymentIntent();
  }, [isOpen, paymentMode, type, postId]);

  // Handle payment with saved card
  const handlePayWithSavedCard = async () => {
    if (!selectedPaymentMethod || !postId) return;

    setProcessing(true);
    setError(null);

    try {
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api';
      const response = await fetch(`${baseUrl}/payments/charge-saved-card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          payment_method_id: selectedPaymentMethod,
          post_id: postId,
          type: type === "unlock" ? "unlock" : "subscribe"
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      // Check payment status
      if (data.status === "succeeded") {
        // Payment succeeded
        if (onSuccess) {
          onSuccess();
        }
        setTimeout(() => {
          onClose();
        }, 1000);
      } else if (data.status === "requires_action") {
        // 3D Secure or other authentication required
        setError("Payment requires additional authentication. Please use a different card or add it as a new payment method.");
      } else {
        throw new Error("Payment failed");
      }
    } catch (err: any) {
      console.error("Payment with saved card error:", err);
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const selectedCard = paymentMethods.find(pm => pm.id === selectedPaymentMethod);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] rounded-2xl border border-[#181B22] bg-black shadow-2xl backdrop-blur-[100px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#181B22] px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {type === "unlock" ? "Unlock Post" : `Subscribe to ${authorName}`}
            </h2>
            <p className="text-sm text-[#808283] mt-0.5">
              {type === "unlock" 
                ? `One-time payment of $${amount}`
                : `$${amount}/month for unlimited access`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-[#808283] transition-all hover:bg-[#2F3336] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {loadingMethods ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#A06AFF]" />
            </div>
          ) : paymentMode === "select-card" && paymentMethods.length > 0 ? (
            /* Saved Card Selection Mode */
            <div className="space-y-4">
              {/* Payment method selector */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Payment Method
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full rounded-xl border border-[#2F3336] bg-[#0A0D12] px-4 py-3 text-left flex items-center justify-between hover:border-[#A06AFF] transition-colors"
                  >
                    {selectedCard && selectedCard.cardBrand && selectedCard.cardLast4 ? (
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-[#A06AFF]" />
                        <div>
                          <div className="text-sm font-medium text-white">
                            {(selectedCard.cardBrand || 'CARD').toUpperCase()} •••• {selectedCard.cardLast4}
                          </div>
                          <div className="text-xs text-[#808283]">
                            Expires {selectedCard.cardExpMonth}/{selectedCard.cardExpYear}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-[#808283]">Select payment method</span>
                    )}
                    <ChevronDown className={`h-4 w-4 text-[#808283] transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown */}
                  {showDropdown && (
                    <div className="absolute z-10 w-full mt-2 rounded-xl border border-[#2F3336] bg-[#0A0D12] shadow-2xl overflow-hidden">
                      {paymentMethods.map((pm) => (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => {
                            setSelectedPaymentMethod(pm.id);
                            setShowDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#1B1F27] transition-colors border-b border-[#2F3336] last:border-b-0"
                        >
                          <CreditCard className="h-5 w-5 text-[#A06AFF]" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">
                              {(pm.cardBrand || 'CARD').toUpperCase()} •••• {pm.cardLast4}
                              {pm.isDefault && (
                                <span className="ml-2 text-xs text-[#2EBD85]">(Default)</span>
                              )}
                            </div>
                            <div className="text-xs text-[#808283]">
                              Expires {pm.cardExpMonth}/{pm.cardExpYear}
                            </div>
                          </div>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentMode("add-card");
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-[#1B1F27] transition-colors text-[#A06AFF]"
                      >
                        <Plus className="h-5 w-5" />
                        <span className="text-sm font-medium">Add New Card</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Confirmation message */}
              <div className="rounded-lg bg-[#A06AFF]/10 border border-[#A06AFF]/20 p-4">
                <p className="text-sm text-white text-center">
                  С вас будет списано <span className="font-semibold">${amount}</span>
                </p>
              </div>

              {/* Error message */}
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-[#2F3336] py-3 text-sm font-semibold text-white hover:bg-[#2F3336] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePayWithSavedCard}
                  disabled={!selectedPaymentMethod || processing}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#A06AFF] to-[#482090] py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(160,106,255,0.5)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Pay
                    </>
                  )}
                </button>
              </div>

              {/* Security notice */}
              <div className="flex items-center gap-2 justify-center text-xs text-[#808283]">
                <Lock className="h-3 w-3" />
                <span>Secured by Stripe</span>
              </div>
            </div>
          ) : (
            /* Add New Card Mode */
            <>
              {paymentMethods.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPaymentMode("select-card")}
                  className="mb-4 text-sm text-[#A06AFF] hover:text-[#B17FFF] flex items-center gap-2"
                >
                  ← Back to saved cards
                </button>
              )}
              {error ? (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                  <p className="text-sm text-red-400">{error}</p>
                  <button
                    onClick={() => {
                      setError(null);
                      setClientSecret(null);
                    }}
                    className="mt-3 text-sm text-red-400 hover:text-red-300 underline"
                  >
                    Try again
                  </button>
                </div>
              ) : !clientSecret ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#A06AFF]" />
                </div>
              ) : (
                <Elements 
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "night",
                      variables: {
                        colorPrimary: "#A06AFF",
                        colorBackground: "#0A0D12",
                        colorText: "#FFFFFF",
                        colorDanger: "#FF6B6B",
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        spacingUnit: "4px",
                        borderRadius: "12px",
                      },
                    },
                  }}
                >
                  <PaymentForm
                    type={type}
                    amount={amount}
                    postId={postId}
                    authorId={authorId}
                    plan={plan}
                    onSuccess={onSuccess}
                    onClose={onClose}
                    clientSecret={clientSecret}
                  />
                </Elements>
              )}
            </>
          )}
        </div>

        {/* Benefits section */}
        {type === "subscribe" && (
          <div className="border-t border-[#181B22] px-5 py-4">
            <h3 className="text-xs font-semibold text-white mb-2">Subscription benefits:</h3>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2 text-xs text-[#808283]">
                <div className="h-1.5 w-1.5 rounded-full bg-[#2EBD85]" />
                Access to all premium posts
              </li>
              <li className="flex items-center gap-2 text-xs text-[#808283]">
                <div className="h-1.5 w-1.5 rounded-full bg-[#2EBD85]" />
                Early access to new content
              </li>
              <li className="flex items-center gap-2 text-xs text-[#808283]">
                <div className="h-1.5 w-1.5 rounded-full bg-[#2EBD85]" />
                Exclusive subscriber-only posts
              </li>
              <li className="flex items-center gap-2 text-xs text-[#808283]">
                <div className="h-1.5 w-1.5 rounded-full bg-[#2EBD85]" />
                Cancel anytime
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// Export hook to use the modal
export function usePaymentModal() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: "unlock" | "subscribe";
    amount: number;
    postId?: string;
    authorId?: string;
    authorName?: string;
  }>({
    isOpen: false,
    type: "unlock",
    amount: 0,
  });

  const openPaymentModal = (options: Omit<typeof modalState, "isOpen">) => {
    setModalState({ ...options, isOpen: true });
  };

  const closePaymentModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return {
    modalState,
    openPaymentModal,
    closePaymentModal,
  };
}
