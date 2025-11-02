import { FC, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useNotificationPreferences, NotificationPreferences } from "@/hooks/useNotificationPreferences";
import { Loader2, Check, Bell, Mail, DollarSign, Shield, Users } from "lucide-react";

const Checkbox: FC<{ 
  checked: boolean; 
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => (
  <button
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={cn(
      "relative inline-flex h-[18px] w-[18px] items-center justify-center rounded-[3px] transition-colors",
      checked ? "bg-primary" : "border border-[#2E2744] bg-transparent",
      disabled && "opacity-50 cursor-not-allowed"
    )}
    aria-checked={checked}
    role="checkbox"
  >
    {checked && (
      <svg
        className="absolute"
        width="12"
        height="8"
        viewBox="0 0 12 8"
        fill="none"
      >
        <path
          d="M1 2.5L5 6.5L10.5 1"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </button>
);

type NotificationItem = {
  key: keyof NotificationPreferences;
  label: string;
  description?: string;
};

type NotificationSection = {
  title: string;
  icon: any;
  items: NotificationItem[];
};

const NotificationsSettings: FC = () => {
  const { preferences, isLoading, updatePreferences } = useNotificationPreferences();
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set());
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set());

  const handleToggle = async (key: string, currentValue: boolean) => {
    setSavingKeys(prev => new Set(prev).add(key));
    
    try {
      await updatePreferences({ [key]: !currentValue } as any);
      
      // Show saved indicator
      setSavedKeys(prev => new Set(prev).add(key));
      setTimeout(() => {
        setSavedKeys(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to update preference:', err);
    } finally {
      setSavingKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  const sections: NotificationSection[] = [
    {
      title: "Social Network",
      icon: Users,
      items: [
        { key: 'new_followers', label: 'New followers', description: 'When someone follows you' },
        { key: 'mentions', label: 'Mentions', description: 'When someone mentions you in a post or comment' },
        { key: 'replies', label: 'Replies', description: 'When someone replies to your post' },
        { key: 'likes', label: 'Likes', description: 'When someone likes your post' },
        { key: 'reposts', label: 'Reposts', description: 'When someone reposts your content' },
      ],
    },
    {
      title: "Content Updates",
      icon: Bell,
      items: [
        { key: 'new_posts_from_following', label: 'New posts from people you follow', description: 'Get notified about new content from accounts you follow' },
        { key: 'post_recommendations', label: 'Post recommendations', description: 'Personalized content suggestions based on your interests' },
      ],
    },
    {
      title: "Financial",
      icon: DollarSign,
      items: [
        { key: 'payment_received', label: 'Payment received', description: 'When you receive a payment' },
        { key: 'subscription_renewal', label: 'Subscription renewal', description: 'Reminders before your subscription renews' },
        { key: 'payout_completed', label: 'Payout completed', description: 'When your payout is processed' },
      ],
    },
    {
      title: "Security & Account",
      icon: Shield,
      items: [
        { key: 'security_alerts', label: 'Security alerts', description: 'Suspicious login attempts and security warnings' },
        { key: 'account_updates', label: 'Account updates', description: 'Changes to your account settings' },
        { key: 'product_updates', label: 'Product updates', description: 'New features and platform updates' },
      ],
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-gray-400">Loading notification preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[1059px] flex-col items-center gap-6">
      {/* Email Notifications Toggle */}
      <section className="w-full">
        <div className="flex w-full flex-col gap-4 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 sm:p-6 backdrop-blur-[50px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-lg font-bold text-white">Email Notifications</h3>
                <p className="text-sm text-gray-400">Receive notifications via email</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {savingKeys.has('email_notifications_enabled') && (
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              )}
              {savedKeys.has('email_notifications_enabled') && (
                <Check className="w-4 h-4 text-green-500" />
              )}
              <Checkbox
                checked={preferences?.email_notifications_enabled ?? false}
                onChange={() => handleToggle('email_notifications_enabled', preferences?.email_notifications_enabled ?? false)}
                disabled={savingKeys.has('email_notifications_enabled')}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Notification Categories */}
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <section key={section.title} className="w-full">
            <div className="flex w-full flex-col gap-6 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 sm:p-6 backdrop-blur-[50px]">
              <div className="flex items-center gap-3">
                <Icon className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold text-white sm:text-2xl">{section.title}</h2>
              </div>
              
              <div className="flex flex-col gap-4">
                {section.items.map((item) => {
                  const value = Boolean(preferences?.[item.key] ?? false);
                  const isSaving = savingKeys.has(item.key);
                  const isSaved = savedKeys.has(item.key);
                  
                  return (
                    <div
                      key={item.key}
                      className="flex items-center justify-between gap-4 p-3 rounded-lg border border-[#181B22] bg-[rgba(11,14,17,0.5)] backdrop-blur-[50px]"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white md:text-[15px]">
                          {item.label}
                        </p>
                        {item.description && (
                          <p className="text-xs text-gray-400 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {isSaving && (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        )}
                        {isSaved && (
                          <Check className="w-4 h-4 text-green-500" />
                        )}
                        <Checkbox
                          checked={value}
                          onChange={() => handleToggle(item.key, value)}
                          disabled={isSaving}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      {/* Info about auto-save */}
      <div className="w-full p-3 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-xs text-primary text-center">
          💡 Changes are saved automatically
        </p>
      </div>
    </div>
  );
};

export default NotificationsSettings;
