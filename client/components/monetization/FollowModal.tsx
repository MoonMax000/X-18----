import React, { useState } from "react";
import { X, UserPlus, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface FollowModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorBio?: string;
  followersCount?: number;
}

export default function FollowModal({
  isOpen,
  onClose,
  authorId,
  authorName,
  authorAvatar,
  authorBio,
  followersCount,
}: FollowModalProps) {
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFollow = async () => {
    setStatus("processing");
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // TODO: Replace with actual API call
      // await api.followUser(authorId);
      
      setStatus("success");
      
      // Close modal after success and reload to show unlocked content
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setStatus("failed");
      setError("Failed to follow user. Please try again.");
    }
  };

  const handleClose = () => {
    if (status !== "processing") {
      setStatus("idle");
      setError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-widget-border bg-[#0B0E13] p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Follow to unlock</h2>
          <button
            onClick={handleClose}
            disabled={status === "processing"}
            className="rounded-full p-1 text-gray-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Messages */}
        {status === "success" && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-green-500/10 p-4 text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <div>
              <p className="font-semibold">Successfully followed! ✓</p>
              <p className="text-sm">You now have access to followers-only content.</p>
            </div>
          </div>
        )}

        {status === "failed" && error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/10 p-4 text-red-400">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Author Profile Card */}
        <div className="mb-6 rounded-xl border border-gray-700 bg-gradient-to-br from-white/5 to-white/[0.02] p-6">
          <div className="flex items-start gap-4">
            <img 
              src={authorAvatar} 
              alt={authorName} 
              className="h-16 w-16 rounded-full ring-2 ring-[#A06AFF]/30" 
            />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">{authorName}</h3>
              {authorBio && (
                <p className="mt-1 text-sm text-gray-400 line-clamp-2">{authorBio}</p>
              )}
              {followersCount !== undefined && (
                <p className="mt-2 text-xs text-gray-500">
                  {followersCount.toLocaleString()} followers
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-6 space-y-3">
          <p className="text-sm font-semibold text-white">What you'll get:</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-sm text-gray-300">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-400" />
              <span>Access to all followers-only posts</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-300">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-400" />
              <span>Exclusive insights and content</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-300">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-400" />
              <span>Updates about new publications</span>
            </li>
          </ul>
        </div>

        {/* Note */}
        <div className="mb-6 rounded-lg bg-blue-500/10 p-3 text-xs text-blue-300">
          <p className="font-semibold">100% Free</p>
          <p className="mt-1">Following is completely free. No payment required.</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={status === "processing"}
            className="flex-1 rounded-lg border border-gray-700 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleFollow}
            disabled={status === "processing" || status === "success"}
            className="group flex-1 rounded-lg bg-gradient-to-r from-[#1D9BF0] to-[#0EA5E9] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50"
          >
            {status === "processing" ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Following...
              </span>
            ) : status === "success" ? (
              "Followed ✓"
            ) : (
              <span className="flex items-center justify-center gap-2">
                <UserPlus className="h-4 w-4" />
                Follow {authorName}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
