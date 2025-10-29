import { useState, useEffect } from 'react';
import { 
  Shield, 
  Smartphone, 
  Key, 
  Mail, 
  Phone,
  Trash2,
  AlertTriangle,
  Check,
  X,
  Loader2,
  Monitor,
  Globe,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSecuritySettings, useSessions } from '@/hooks/useSecurity';
import { formatDistanceToNow } from 'date-fns';

interface Session {
  id: string;
  device_type: string;
  browser: string;
  os: string;
  ip_address: string;
  last_active: string;
  created_at: string;
  is_current: boolean;
}

export default function ProfileSecuritySettings() {
  const { settings, isLoading: settingsLoading, updateSettings } = useSecuritySettings();
  const { sessions, isLoading: sessionsLoading, revokeSession } = useSessions();
  
  const [activeTab, setActiveTab] = useState<'sessions' | 'twofa' | 'backup' | 'password' | 'delete'>('sessions');
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [twoFACode, setTwoFACode] = useState(['', '', '', '', '', '']);
  const [backupEmail, setBackupEmail] = useState('');
  const [backupPhone, setBackupPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const tabs = [
    { id: 'sessions', label: 'Active Sessions', icon: Smartphone },
    { id: 'twofa', label: 'Two-Factor Auth', icon: Shield },
    { id: 'backup', label: 'Backup Contacts', icon: Mail },
    { id: 'password', label: 'Change Password', icon: Key },
    { id: 'delete', label: 'Delete Account', icon: Trash2 },
  ];

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Smartphone className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const handle2FAToggle = async (enabled: boolean) => {
    if (enabled) {
      setIs2FAModalOpen(true);
    } else {
      await updateSettings({ is_2fa_enabled: false });
    }
  };

  const handle2FACodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...twoFACode];
    newCode[index] = value;
    setTwoFACode(newCode);

    if (value && index < 5) {
      const nextInput = document.querySelector(`input[name="2fa-${index + 1}"]`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleBackupUpdate = async () => {
    await updateSettings({
      backup_email: backupEmail,
      backup_phone: backupPhone,
    });
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Call API to change password
    try {
      const response = await fetch('/api/auth/password/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (response.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        alert('Password changed successfully');
      } else {
        alert('Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('An error occurred');
    }
  };

  const handleAccountDeletion = async () => {
    if (deleteConfirmation !== 'DELETE') {
      alert('Please type DELETE to confirm');
      return;
    }

    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/auth/delete-account', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });

        if (response.ok) {
          alert('Account deletion request submitted. Your account will be deleted in 30 days.');
          // Logout user
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'sessions':
        return (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Active Sessions</h3>
              <p className="text-sm text-gray-400">
                These devices are currently logged in to your account. Revoke access if you don't recognize a device.
              </p>
            </div>

            {sessionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {sessions?.map((session: Session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "p-4 rounded-lg border bg-black/40",
                      session.is_current 
                        ? "border-primary/50 bg-primary/5" 
                        : "border-widget-border"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getDeviceIcon(session.device_type)}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">
                              {session.browser} on {session.os}
                            </span>
                            {session.is_current && (
                              <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {session.ip_address}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Active {formatDistanceToNow(new Date(session.last_active))} ago
                            </span>
                          </div>
                        </div>
                      </div>
                      {!session.is_current && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => revokeSession(session.id)}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'twofa':
        return (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-400">
                Add an extra layer of security to your account by requiring a verification code in addition to your password.
              </p>
            </div>

            <div className="p-4 rounded-lg border border-widget-border bg-black/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-white">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-400">
                      {settings?.is_2fa_enabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings?.is_2fa_enabled || false}
                  onCheckedChange={handle2FAToggle}
                />
              </div>
            </div>

            {settings?.is_2fa_enabled && (
              <div className="p-4 rounded-lg border border-widget-border bg-black/40 space-y-3">
                <p className="text-sm text-gray-400">Verification method:</p>
                <div className="flex gap-3">
                  <Button
                    variant={settings?.verification_method === 'email' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings({ verification_method: 'email' })}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    variant={settings?.verification_method === 'sms' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSettings({ verification_method: 'sms' })}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    SMS
                  </Button>
                </div>
              </div>
            )}
          </div>
        );

      case 'backup':
        return (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Backup Contacts</h3>
              <p className="text-sm text-gray-400">
                Add backup email and phone for account recovery in case you lose access to your primary contacts.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Backup Email
                </label>
                <Input
                  type="email"
                  value={backupEmail}
                  onChange={(e) => setBackupEmail(e.target.value)}
                  placeholder="backup@example.com"
                  className="bg-black/40 border-widget-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Backup Phone
                </label>
                <Input
                  type="tel"
                  value={backupPhone}
                  onChange={(e) => setBackupPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="bg-black/40 border-widget-border"
                />
              </div>

              <Button onClick={handleBackupUpdate} className="w-full">
                Update Backup Contacts
              </Button>
            </div>
          </div>
        );

      case 'password':
        return (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Change Password</h3>
              <p className="text-sm text-gray-400">
                Ensure your account stays secure by using a strong password.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-black/40 border-widget-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-black/40 border-widget-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-black/40 border-widget-border"
                />
              </div>

              <Button onClick={handlePasswordChange} className="w-full">
                Change Password
              </Button>
            </div>
          </div>
        );

      case 'delete':
        return (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Delete Account</h3>
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-200">
                    <p className="font-medium mb-1">This action is irreversible!</p>
                    <p>Your account will be permanently deleted after 30 days. You can cancel the deletion request within this period by logging back in.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type DELETE to confirm
                </label>
                <Input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type DELETE"
                  className="bg-black/40 border-widget-border"
                />
              </div>

              <Button 
                onClick={handleAccountDeletion} 
                variant="destructive"
                className="w-full"
                disabled={deleteConfirmation !== 'DELETE'}
              >
                Delete My Account
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[600px]">
      {/* Tabs Navigation */}
      <div className="flex gap-2 mb-6 border-b border-widget-border overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-400 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="max-w-2xl">
        {renderContent()}
      </div>

      {/* 2FA Modal */}
      {is2FAModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#0C1015] rounded-lg p-6 w-full max-w-md border border-widget-border">
            <h3 className="text-lg font-semibold text-white mb-4">Enable Two-Factor Authentication</h3>
            <p className="text-sm text-gray-400 mb-4">
              Enter the verification code sent to your {settings?.verification_method === 'sms' ? 'phone' : 'email'}
            </p>
            
            <div className="flex gap-2 justify-center mb-6">
              {twoFACode.map((digit, index) => (
                <input
                  key={index}
                  name={`2fa-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handle2FACodeChange(index, e.target.value)}
                  className="w-12 h-12 text-center text-lg font-semibold bg-black/40 border border-widget-border rounded-lg text-white focus:border-primary focus:outline-none"
                />
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIs2FAModalOpen(false);
                  setTwoFACode(['', '', '', '', '', '']);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  const code = twoFACode.join('');
                  await updateSettings({ is_2fa_enabled: true, verification_code: code });
                  setIs2FAModalOpen(false);
                  setTwoFACode(['', '', '', '', '', '']);
                }}
                className="flex-1"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
