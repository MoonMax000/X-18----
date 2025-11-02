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
  Calendar,
  Copy,
  Download,
  QrCode
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSecuritySettings, useSessions } from '@/hooks/useSecurity';
import { useTOTP } from '@/hooks/useTOTP';
import { useAccountManagement } from '@/hooks/useAccountManagement';
import { useProtectedOperations } from '@/hooks/useProtectedOperations';
import { useDebounce } from '@/hooks/useDebounce';
import { TOTPVerificationModal } from '@/components/auth/TOTPVerificationModal';
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
  const { 
    loading: totpLoading, 
    error: totpError,
    getTOTPStatus,
    generateTOTP,
    enableTOTP,
    disableTOTP,
    regenerateBackupCodes
  } = useTOTP();
  const {
    loading: accountLoading,
    error: accountError,
    getRecoveryInfo,
    deactivateAccount,
    restoreAccount
  } = useAccountManagement();
  const {
    changePassword,
    changeEmail,
    changePhone,
    isLoading: protectedOpsLoading,
    error: protectedOpsError,
    requiresTOTP,
    resetError: resetProtectedOpsError,
  } = useProtectedOperations();
  
  const [activeTab, setActiveTab] = useState<'account' | 'sessions' | 'twofa' | 'backup' | 'password' | 'delete'>('account');
  
  // User data
  const [userEmail, setUserEmail] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [loadingUserData, setLoadingUserData] = useState(true);
  
  // TOTP Verification Modal State
  const [totpModalOpen, setTotpModalOpen] = useState(false);
  const [pendingOperation, setPendingOperation] = useState<((code: string) => Promise<void>) | null>(null);
  const [operationType, setOperationType] = useState('');
  
  // Email Change Modal
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailChangeSuccess, setEmailChangeSuccess] = useState(false);
  
  // Phone Change Modal
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [phonePassword, setPhonePassword] = useState('');
  const [phoneChangeSuccess, setPhoneChangeSuccess] = useState(false);
  
  // TOTP States
  const [totpStatus, setTotpStatus] = useState<{ enabled: boolean; has_backup_codes: boolean } | null>(null);
  const [isSetupTOTPOpen, setIsSetupTOTPOpen] = useState(false);
  const [totpSetupData, setTotpSetupData] = useState<{
    secret: string;
    formatted_secret: string;
    qr_code: string;
    backup_codes: string[];
  } | null>(null);
  const [totpVerifyCode, setTotpVerifyCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isDisableTOTPOpen, setIsDisableTOTPOpen] = useState(false);
  const [disableTotpCode, setDisableTotpCode] = useState('');
  
  // Account States
  const [recoveryInfo, setRecoveryInfo] = useState<any>(null);
  const [backupEmail, setBackupEmail] = useState('');
  const [backupPhone, setBackupPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  // Auto-save states
  const [savingStatus, setSavingStatus] = useState<null | 'saving' | 'saved'>(null);
  const debouncedBackupEmail = useDebounce(backupEmail, 1000);
  const debouncedBackupPhone = useDebounce(backupPhone, 1000);
  
  // Password change success state
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);

  // Load user data and TOTP status
  useEffect(() => {
    loadUserData();
    loadTOTPStatus();
    loadRecoveryInfo();
  }, []);

  const loadUserData = async () => {
    setLoadingUserData(true);
    try {
      const { customBackendAPI } = await import('@/services/api/custom-backend');
      const user = await customBackendAPI.getMe();
      setUserEmail(user.email || '');
      setUserPhone(user.phone || '');
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoadingUserData(false);
    }
  };

  const loadTOTPStatus = async () => {
    const status = await getTOTPStatus();
    setTotpStatus(status);
  };

  const loadRecoveryInfo = async () => {
    const info = await getRecoveryInfo();
    setRecoveryInfo(info);
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: Mail },
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

  const handleSetupTOTP = async () => {
    const data = await generateTOTP();
    if (data) {
      setTotpSetupData(data);
      setIsSetupTOTPOpen(true);
    }
  };

  const handleEnableTOTP = async () => {
    if (totpVerifyCode.length !== 6) return;
    
    const success = await enableTOTP(totpVerifyCode);
    if (success) {
      setIsSetupTOTPOpen(false);
      setTotpVerifyCode('');
      setShowBackupCodes(true);
      await loadTOTPStatus();
    }
  };

  const handleDisableTOTP = async () => {
    if (disableTotpCode.length !== 6) return;
    
    const success = await disableTOTP(disableTotpCode);
    if (success) {
      setIsDisableTOTPOpen(false);
      setDisableTotpCode('');
      await loadTOTPStatus();
    }
  };

  const handleRegenerateBackupCodes = async () => {
    const code = prompt('Enter your TOTP code to regenerate backup codes:');
    if (!code) return;
    
    const codes = await regenerateBackupCodes(code);
    if (codes && totpSetupData) {
      setTotpSetupData({ ...totpSetupData, backup_codes: codes });
      setShowBackupCodes(true);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const downloadBackupCodes = () => {
    if (!totpSetupData?.backup_codes) return;
    
    const text = totpSetupData.backup_codes.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
  };

  // Auto-save backup contacts
  useEffect(() => {
    if (!debouncedBackupEmail && !debouncedBackupPhone) return;
    
    const saveBackupContacts = async () => {
      setSavingStatus('saving');
      
      try {
        await updateSettings({
          backup_email: debouncedBackupEmail,
          backup_phone: debouncedBackupPhone,
        });
        
        setSavingStatus('saved');
        
        setTimeout(() => {
          setSavingStatus(null);
        }, 2000);
      } catch (err) {
        console.error('Error saving backup contacts:', err);
        setSavingStatus(null);
      }
    };
    
    saveBackupContacts();
  }, [debouncedBackupEmail, debouncedBackupPhone]);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      alert('Пароли не совпадают');
      return;
    }

    if (newPassword.length < 8) {
      alert('Новый пароль должен содержать минимум 8 символов');
      return;
    }

    setPasswordChangeSuccess(false);
    resetProtectedOpsError();

    try {
      await changePassword({
        currentPassword,
        newPassword,
      });
      
      // Success!
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordChangeSuccess(true);
      
      setTimeout(() => {
        setPasswordChangeSuccess(false);
      }, 3000);
    } catch (err: any) {
      if (requiresTOTP) {
        // Open TOTP modal
        setPendingOperation(() => async (code: string) => {
          await changePassword(
            {
              currentPassword,
              newPassword,
            },
            code
          );
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPasswordChangeSuccess(true);
          setTimeout(() => setPasswordChangeSuccess(false), 3000);
        });
        setOperationType('изменить пароль');
        setTotpModalOpen(true);
      }
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail || !emailPassword) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    setEmailChangeSuccess(false);
    resetProtectedOpsError();

    try {
      await changeEmail({
        newEmail,
        currentPassword: emailPassword,
      });
      
      // Success!
      setUserEmail(newEmail);
      setNewEmail('');
      setEmailPassword('');
      setEmailChangeSuccess(true);
      
      setTimeout(() => {
        setEmailChangeSuccess(false);
        setIsEmailModalOpen(false);
      }, 2000);
    } catch (err: any) {
      if (requiresTOTP) {
        // Open TOTP modal
        setPendingOperation(() => async (code: string) => {
          await changeEmail(
            {
              newEmail,
              currentPassword: emailPassword,
            },
            code
          );
          setUserEmail(newEmail);
          setNewEmail('');
          setEmailPassword('');
          setEmailChangeSuccess(true);
          setTimeout(() => {
            setEmailChangeSuccess(false);
            setIsEmailModalOpen(false);
          }, 2000);
        });
        setOperationType('изменить email');
        setTotpModalOpen(true);
      }
    }
  };

  const handlePhoneChange = async () => {
    if (!newPhone || !phonePassword) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    setPhoneChangeSuccess(false);
    resetProtectedOpsError();

    try {
      await changePhone({
        newPhone,
        currentPassword: phonePassword,
      });
      
      // Success!
      setUserPhone(newPhone);
      setNewPhone('');
      setPhonePassword('');
      setPhoneChangeSuccess(true);
      
      setTimeout(() => {
        setPhoneChangeSuccess(false);
        setIsPhoneModalOpen(false);
      }, 2000);
    } catch (err: any) {
      if (requiresTOTP) {
        // Open TOTP modal
        setPendingOperation(() => async (code: string) => {
          await changePhone(
            {
              newPhone,
              currentPassword: phonePassword,
            },
            code
          );
          setUserPhone(newPhone);
          setNewPhone('');
          setPhonePassword('');
          setPhoneChangeSuccess(true);
          setTimeout(() => {
            setPhoneChangeSuccess(false);
            setIsPhoneModalOpen(false);
          }, 2000);
        });
        setOperationType('изменить телефон');
        setTotpModalOpen(true);
      }
    }
  };

  const handleTOTPVerify = async (code: string) => {
    if (pendingOperation) {
      try {
        await pendingOperation(code);
        setTotpModalOpen(false);
        setPendingOperation(null);
        setOperationType('');
      } catch (err) {
        // Error will be shown in modal
        throw err;
      }
    }
  };

  const handleAccountDeactivation = async () => {
    if (deleteConfirmation !== 'DELETE') {
      alert('Please type DELETE to confirm');
      return;
    }

    if (confirm('Are you sure you want to deactivate your account? You will have 30 days to restore it.')) {
      const result = await deactivateAccount(deleteReason);
      if (result) {
        alert(`Account deactivated. You have ${result.days_until_deletion} days to restore it before permanent deletion.`);
        await loadRecoveryInfo();
      }
    }
  };

  const handleAccountRestore = async () => {
    if (confirm('Do you want to restore your account?')) {
      const success = await restoreAccount();
      if (success) {
        alert('Account restored successfully!');
        await loadRecoveryInfo();
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Account Information</h3>
              <p className="text-sm text-gray-400">
                Manage your primary account contact information.
              </p>
              {totpStatus?.enabled && (
                <div className="mt-2 p-2 rounded bg-primary/10 border border-primary/20">
                  <p className="text-xs text-primary flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Changes to email or phone require TOTP verification
                  </p>
                </div>
              )}
            </div>

            {loadingUserData ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {/* Email Block */}
                <div className="p-4 rounded-lg border border-widget-border bg-black/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-300">Email</p>
                        <p className="text-sm text-white">{userEmail || 'Not set'}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setIsEmailModalOpen(true)}
                      size="sm"
                      variant="outline"
                    >
                      Change
                    </Button>
                  </div>
                </div>

                {/* Password Block */}
                <div className="p-4 rounded-lg border border-widget-border bg-black/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-300">Password</p>
                        <p className="text-xs text-gray-500">Change your password to update & protect your account</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setActiveTab('password')}
                      size="sm"
                      variant="outline"
                    >
                      Change
                    </Button>
                  </div>
                </div>

                {/* Phone Block */}
                <div className="p-4 rounded-lg border border-widget-border bg-black/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-300">Phone number</p>
                        <p className="text-sm text-white">{userPhone || 'Not set'}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setIsPhoneModalOpen(true)}
                      size="sm"
                      variant="outline"
                    >
                      {userPhone ? 'Change' : 'Add'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

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
              <h3 className="text-lg font-semibold text-white mb-2">Two-Factor Authentication (TOTP)</h3>
              <p className="text-sm text-gray-400">
                Add an extra layer of security using authenticator apps like Google Authenticator, Microsoft Authenticator, or Authy.
              </p>
            </div>

            {totpLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="p-4 rounded-lg border border-widget-border bg-black/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-white">TOTP Two-Factor Authentication</p>
                        <p className="text-sm text-gray-400">
                          {totpStatus?.enabled ? 'Enabled ✓' : 'Disabled'}
                        </p>
                      </div>
                    </div>
                    {!totpStatus?.enabled ? (
                      <Button onClick={handleSetupTOTP} size="sm">
                        <Shield className="w-4 h-4 mr-2" />
                        Enable 2FA
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => setIsDisableTOTPOpen(true)} 
                        variant="destructive" 
                        size="sm"
                      >
                        Disable 2FA
                      </Button>
                    )}
                  </div>
                </div>

                {totpStatus?.enabled && (
                  <div className="p-4 rounded-lg border border-widget-border bg-black/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-300">Backup Codes</p>
                      <Button 
                        onClick={handleRegenerateBackupCodes}
                        variant="outline"
                        size="sm"
                      >
                        Regenerate
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400">
                      Save your backup codes in a safe place. They can be used if you lose access to your authenticator app.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 'backup':
        return (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Резервные контакты</h3>
              <p className="text-sm text-gray-400">
                Добавьте резервные email и телефон для восстановления доступа к аккаунту.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Резервный Email
                  </label>
                  {savingStatus === 'saving' && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Сохранение...
                    </span>
                  )}
                  {savingStatus === 'saved' && (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Сохранено ✓
                    </span>
                  )}
                </div>
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
                  Резервный телефон
                </label>
                <Input
                  type="tel"
                  value={backupPhone}
                  onChange={(e) => setBackupPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="bg-black/40 border-widget-border"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Изменения сохраняются автоматически
                </p>
              </div>
            </div>
          </div>
        );

      case 'password':
        return (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Смена пароля</h3>
              <p className="text-sm text-gray-400">
                Защитите свой аккаунт, используя надёжный пароль (минимум 8 символов).
              </p>
              {totpStatus?.enabled && (
                <div className="mt-2 p-2 rounded bg-primary/10 border border-primary/20">
                  <p className="text-xs text-primary flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Для смены пароля потребуется TOTP код
                  </p>
                </div>
              )}
            </div>

            {passwordChangeSuccess && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-400 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Пароль успешно изменён!
                </p>
              </div>
            )}

            {protectedOpsError && !requiresTOTP && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {protectedOpsError}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Текущий пароль
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-black/40 border-widget-border"
                  disabled={protectedOpsLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Новый пароль
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-black/40 border-widget-border"
                  disabled={protectedOpsLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Подтвердите новый пароль
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-black/40 border-widget-border"
                  disabled={protectedOpsLoading}
                />
              </div>

              <Button 
                onClick={handlePasswordChange} 
                className="w-full"
                disabled={
                  !currentPassword || 
                  !newPassword || 
                  !confirmPassword || 
                  protectedOpsLoading
                }
              >
                {protectedOpsLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Изменение...
                  </>
                ) : (
                  'Изменить пароль'
                )}
              </Button>
            </div>
          </div>
        );

      case 'delete':
        return (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-2">Account Deactivation</h3>
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-200">
                    <p className="font-medium mb-1">30-Day Recovery Period</p>
                    <p>Your account will be deactivated and you'll have 30 days to restore it. After 30 days, the account will be permanently deleted.</p>
                  </div>
                </div>
              </div>
            </div>

            {recoveryInfo?.is_deactivated ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="font-medium text-red-200 mb-2">Account is Deactivated</p>
                  <p className="text-sm text-red-300">
                    Deletion scheduled for: {new Date(recoveryInfo.deletion_scheduled_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-red-300">
                    Days remaining: {recoveryInfo.days_remaining}
                  </p>
                </div>
                <Button onClick={handleAccountRestore} className="w-full">
                  Restore My Account
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reason for deactivation (optional)
                  </label>
                  <Input
                    type="text"
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Why are you leaving?"
                    className="bg-black/40 border-widget-border"
                  />
                </div>

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
                  onClick={handleAccountDeactivation} 
                  variant="destructive"
                  className="w-full"
                  disabled={deleteConfirmation !== 'DELETE'}
                >
                  Deactivate My Account
                </Button>
              </div>
            )}
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

      {/* TOTP Setup Modal */}
      {isSetupTOTPOpen && totpSetupData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#0C1015] rounded-lg p-6 w-full max-w-md border border-widget-border max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">
              Set Up Two-Factor Authentication
            </h3>
            
            {!showBackupCodes ? (
              <>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-black/40 border border-widget-border">
                    <p className="text-sm text-gray-300 mb-3">
                      1. Scan this QR code with your authenticator app:
                    </p>
                    <div className="flex justify-center mb-3">
                      <img 
                        src={totpSetupData.qr_code} 
                        alt="QR Code" 
                        className="w-48 h-48 rounded"
                      />
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                      Or enter this code manually:
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="flex-1 p-2 bg-black/60 rounded text-xs text-white font-mono text-center">
                        {totpSetupData.formatted_secret}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(totpSetupData.secret)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      2. Enter the 6-digit code from your app:
                    </label>
                    <Input
                      type="text"
                      maxLength={6}
                      value={totpVerifyCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setTotpVerifyCode(val);
                      }}
                      placeholder="000000"
                      className="bg-black/40 border-widget-border text-center text-lg font-mono"
                    />
                  </div>

                  {totpError && (
                    <p className="text-sm text-red-400">{totpError}</p>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSetupTOTPOpen(false);
                      setTotpVerifyCode('');
                      setTotpSetupData(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEnableTOTP}
                    className="flex-1"
                    disabled={totpVerifyCode.length !== 6 || totpLoading}
                  >
                    {totpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Enable'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-5 h-5 text-green-500" />
                      <p className="font-medium text-green-200">2FA Enabled Successfully!</p>
                    </div>
                    <p className="text-sm text-green-300">
                      Save these backup codes in a safe place.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-black/40 border border-widget-border">
                    <p className="text-sm text-gray-300 mb-3">Your Backup Codes:</p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {totpSetupData.backup_codes.map((code, idx) => (
                        <code key={idx} className="p-2 bg-black/60 rounded text-sm text-white font-mono text-center">
                          {code}
                        </code>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(totpSetupData.backup_codes.join('\n'))}
                        className="flex-1"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={downloadBackupCodes}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <p className="text-xs text-yellow-200">
                      ⚠️ Store these codes safely. You'll need them if you lose access to your authenticator app.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setIsSetupTOTPOpen(false);
                    setShowBackupCodes(false);
                    setTotpSetupData(null);
                  }}
                  className="w-full mt-6"
                >
                  Done
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* TOTP Disable Modal */}
      {isDisableTOTPOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#0C1015] rounded-lg p-6 w-full max-w-md border border-widget-border">
            <h3 className="text-lg font-semibold text-white mb-4">Disable Two-Factor Authentication</h3>
            <p className="text-sm text-gray-400 mb-4">
              Enter your TOTP code to confirm disabling 2FA
            </p>
            
            <div className="space-y-4">
              <Input
                type="text"
                maxLength={6}
                value={disableTotpCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setDisableTotpCode(val);
                }}
                placeholder="000000"
                className="bg-black/40 border-widget-border text-center text-lg font-mono"
              />

              {totpError && (
                <p className="text-sm text-red-400">{totpError}</p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDisableTOTPOpen(false);
                  setDisableTotpCode('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDisableTOTP}
                variant="destructive"
                className="flex-1"
                disabled={disableTotpCode.length !== 6 || totpLoading}
              >
                {totpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Disable 2FA'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Email Change Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#0C1015] rounded-lg p-6 w-full max-w-md border border-widget-border">
            <h3 className="text-lg font-semibold text-white mb-4">Изменить Email</h3>
            
            {emailChangeSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-400 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Email успешно изменён!
                </p>
              </div>
            )}

            {protectedOpsError && !requiresTOTP && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {protectedOpsError}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Текущий Email
                </label>
                <Input
                  type="email"
                  value={userEmail}
                  disabled
                  className="bg-black/60 border-widget-border text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Новый Email
                </label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="newemail@example.com"
                  className="bg-black/40 border-widget-border"
                  disabled={protectedOpsLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Текущий пароль (для подтверждения)
                </label>
                <Input
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  className="bg-black/40 border-widget-border"
                  disabled={protectedOpsLoading}
                />
              </div>

              {totpStatus?.enabled && (
                <div className="p-2 rounded bg-primary/10 border border-primary/20">
                  <p className="text-xs text-primary flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    После нажатия "Изменить" потребуется TOTP код
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEmailModalOpen(false);
                  setNewEmail('');
                  setEmailPassword('');
                  setEmailChangeSuccess(false);
                  resetProtectedOpsError();
                }}
                className="flex-1"
                disabled={protectedOpsLoading}
              >
                Отмена
              </Button>
              <Button
                onClick={handleEmailChange}
                className="flex-1"
                disabled={!newEmail || !emailPassword || protectedOpsLoading}
              >
                {protectedOpsLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Изменение...
                  </>
                ) : (
                  'Изменить'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Phone Change Modal */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#0C1015] rounded-lg p-6 w-full max-w-md border border-widget-border">
            <h3 className="text-lg font-semibold text-white mb-4">
              {userPhone ? 'Изменить телефон' : 'Добавить телефон'}
            </h3>
            
            {phoneChangeSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-400 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Телефон успешно {userPhone ? 'изменён' : 'добавлен'}!
                </p>
              </div>
            )}

            {protectedOpsError && !requiresTOTP && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {protectedOpsError}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {userPhone && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Текущий телефон
                  </label>
                  <Input
                    type="tel"
                    value={userPhone}
                    disabled
                    className="bg-black/60 border-widget-border text-gray-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {userPhone ? 'Новый телефон' : 'Телефон'}
                </label>
                <Input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="bg-black/40 border-widget-border"
                  disabled={protectedOpsLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Формат: +код страны и номер (например, +79123456789)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Текущий пароль (для подтверждения)
                </label>
                <Input
                  type="password"
                  value={phonePassword}
                  onChange={(e) => setPhonePassword(e.target.value)}
                  className="bg-black/40 border-widget-border"
                  disabled={protectedOpsLoading}
                />
              </div>

              {totpStatus?.enabled && (
                <div className="p-2 rounded bg-primary/10 border border-primary/20">
                  <p className="text-xs text-primary flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    После нажатия "{userPhone ? 'Изменить' : 'Добавить'}" потребуется TOTP код
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsPhoneModalOpen(false);
                  setNewPhone('');
                  setPhonePassword('');
                  setPhoneChangeSuccess(false);
                  resetProtectedOpsError();
                }}
                className="flex-1"
                disabled={protectedOpsLoading}
              >
                Отмена
              </Button>
              <Button
                onClick={handlePhoneChange}
                className="flex-1"
                disabled={!newPhone || !phonePassword || protectedOpsLoading}
              >
                {protectedOpsLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {userPhone ? 'Изменение...' : 'Добавление...'}
                  </>
                ) : (
                  userPhone ? 'Изменить' : 'Добавить'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TOTP Verification Modal for Protected Operations */}
      <TOTPVerificationModal
        isOpen={totpModalOpen}
        onClose={() => {
          setTotpModalOpen(false);
          setPendingOperation(null);
          setOperationType('');
          resetProtectedOpsError();
        }}
        onVerify={handleTOTPVerify}
        operation={operationType}
      />
    </div>
  );
}
