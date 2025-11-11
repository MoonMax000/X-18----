import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { X, Lock, CreditCard, Loader2 } from "lucide-react";
import { customBackendAPI } from "@/services/api/custom-backend";

// Initialize Stripe (you'll need to add your publishable key to env)
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
}: Omit<PaymentModalProps, "isOpen" | "authorName">) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Create PaymentIntent on mount
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const endpoint = type === "unlock" 
          ? "/api/payments/create-post-payment-intent"
          : "/api/payments/create-subscription-intent";
        
        const payload = type === "unlock"
          ? { postId, amount }
          : { authorId, amount, plan };
        
        const response = await customBackendAPI.post(endpoint, payload);
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error("Failed to create payment intent:", error);
        setErrorMessage("Failed to initialize payment. Please try again.");
      }
    };

    createPaymentIntent();
  }, [type, amount, postId, authorId, plan]);

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

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#A06AFF]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Payment Element - Stripe's universal payment UI */}
      <div className="rounded-xl border border-[#2F3336] bg-[#0A0D12] p-4">
        <PaymentElement 
          options={{
            layout: "tabs",
            defaultValues: {
              billingDetails: {
                // Pre-fill if you have user data
              }
            },
            appearance: {
              theme: "night",
              variables: {
                colorPrimary: "#A06AFF",
                colorBackground: "#0A0D12",
                colorSurface: "#1B1F27",
                colorText: "#FFFFFF",
                colorDanger: "#FF6B6B",
                fontFamily: "system-ui, -apple-system, sans-serif",
                spacingUnit: "4px",
                borderRadius: "12px",
              },
              rules: {
                ".Tab": {
                  borderRadius: "10px",
                  border: "1px solid #2F3336",
                },
                ".Tab:hover": {
                  border: "1px solid #A06AFF",
                },
                ".Tab--selected": {
                  borderColor: "#A06AFF",
                  backgroundColor: "#A06AFF10",
                },
                ".Input": {
                  borderRadius: "8px",
                  border: "1px solid #2F3336",
                },
                ".Input:focus": {
                  borderColor: "#A06AFF",
                  boxShadow: "0 0 0 1px #A06AFF",
                },
              },
            },
          }}
        />
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

        {/* Content with Stripe Elements provider */}
        <div className="p-5">
          <Elements 
            stripe={stripePromise}
            options={{
              clientSecret: "temp", // Will be replaced by PaymentForm
              appearance: {
                theme: "night",
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
            />
          </Elements>
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

// Export both the modal and a hook to use it
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
