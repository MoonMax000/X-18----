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
    if (!deviceType) return <Monitor className="w-5 h-5" />;
    
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

  const handleRegenerateTOTPSetup = async () => {
    const data = await generateTOTP();
    if (data) {
      setTotpSetupData(data);
      setTotpVerifyCode(''); // Clear entered code
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
          <div className="flex w-full max-w-[1059px] flex-col gap-6">
            <section className="w-full">
              <div className="flex w-full flex-col gap-6 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 sm:p-6 backdrop-blur-[50px]">
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="text-xl font-bold text-white sm:text-2xl">Account Information</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Manage your primary account contact information
                    </p>
                  </div>
                </div>
                
                {totpStatus?.enabled && (
                  <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                    <p className="text-xs text-primary flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Changes to email or phone require TOTP verification
                    </p>
                  </div>
                )}

                {loadingUserData ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {/* Email Block */}
                    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] backdrop-blur-[50px]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                          <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white md:text-[15px]">Email</p>
                          <p className="text-xs text-gray-400">{userEmail || 'Not set'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsEmailModalOpen(true)}
                        className="inline-flex h-8 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-[#482090] px-4 text-xs font-bold text-white backdrop-blur-[50px] transition-opacity hover:opacity-90 sm:text-sm"
                      >
                        Change
                      </button>
                    </div>

                    {/* Password Block */}
                    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] backdrop-blur-[50px]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                          <Key className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white md:text-[15px]">Password</p>
                          <p className="text-xs text-gray-400">Protect your account with a strong password</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('password')}
                        className="inline-flex h-8 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-[#482090] px-4 text-xs font-bold text-white backdrop-blur-[50px] transition-opacity hover:opacity-90 sm:text-sm"
                      >
                        Change
                      </button>
                    </div>

                    {/* Phone Block */}
                    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] backdrop-blur-[50px]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                          <Phone className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white md:text-[15px]">Phone number</p>
                          <p className="text-xs text-gray-400">{userPhone || 'Not set'}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsPhoneModalOpen(true)}
                        className="inline-flex h-8 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-[#482090] px-4 text-xs font-bold text-white backdrop-blur-[50px] transition-opacity hover:opacity-90 sm:text-sm"
                      >
                        {userPhone ? 'Change' : 'Add'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        );

      case 'sessions':
        return (
          <div className="flex w-full max-w-[1059px] flex-col gap-6">
            <section className="w-full">
              <div className="flex w-full flex-col gap-6 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 sm:p-6 backdrop-blur-[50px]">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="text-xl font-bold text-white sm:text-2xl">Active Sessions</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Manage devices logged into your account
                    </p>
                  </div>
                </div>

                {sessionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {sessions?.map((session: Session) => (
                      <div
                        key={session.id}
                        className={cn(
                          "p-4 rounded-2xl border backdrop-blur-[50px]",
                          session.is_current 
                            ? "border-primary/50 bg-[rgba(160,106,255,0.1)]" 
                            : "border-[#181B22] bg-[rgba(11,14,17,0.5)]"
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                              {getDeviceIcon(session.device_type)}
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-white text-sm md:text-[15px]">
                                  {session.browser} on {session.os}
                                </span>
                                {session.is_current && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/30 text-primary font-bold">
                                    Current
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  {session.ip_address}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {session.last_active && !isNaN(new Date(session.last_active).getTime()) ? (
                                    <>Active {formatDistanceToNow(new Date(session.last_active))} ago</>
                                  ) : (
                                    <>Recently active</>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                          {!session.is_current && (
                            <button
                              onClick={() => revokeSession(session.id)}
                              className="inline-flex h-8 items-center justify-center gap-2 rounded-full bg-red-500/20 px-4 text-xs font-bold text-red-400 backdrop-blur-[50px] transition-opacity hover:opacity-90 sm:text-sm border border-red-500/30"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        );

      case 'twofa':
        return (
          <div className="flex w-full max-w-[1059px] flex-col gap-6">
            <section className="w-full">
              <div className="flex w-full flex-col gap-6 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 sm:p-6 backdrop-blur-[50px]">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="text-xl font-bold text-white sm:text-2xl">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Add extra security with authenticator apps
                    </p>
                  </div>
                </div>

                {totpLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {/* TOTP Status Block */}
                    <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] backdrop-blur-[50px]">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full",
                          totpStatus?.enabled ? "bg-green-500/20" : "bg-primary/20"
                        )}>
                          <Shield className={cn(
                            "w-5 h-5",
                            totpStatus?.enabled ? "text-green-500" : "text-primary"
                          )} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white md:text-[15px]">TOTP Authentication</p>
                          <p className="text-xs text-gray-400">
                            {totpStatus?.enabled ? 'Enabled ✓' : 'Not enabled'}
                          </p>
                        </div>
                      </div>
                      {!totpStatus?.enabled ? (
                        <button
                          onClick={handleSetupTOTP}
                          className="inline-flex h-8 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-[#482090] px-4 text-xs font-bold text-white backdrop-blur-[50px] transition-opacity hover:opacity-90 sm:text-sm"
                        >
                          <Shield className="w-4 h-4" />
                          Enable 2FA
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsDisableTOTPOpen(true)}
                          className="inline-flex h-8 items-center justify-center gap-2 rounded-full bg-red-500/20 px-4 text-xs font-bold text-red-400 backdrop-blur-[50px] transition-opacity hover:opacity-90 sm:text-sm border border-red-500/30"
                        >
                          Disable 2FA
                        </button>
                      )}
                    </div>

                    {/* Backup Codes Block */}
                    {totpStatus?.enabled && (
                      <div className="p-4 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] backdrop-blur-[50px]">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-primary" />
                            <p className="text-sm font-bold text-white md:text-[15px]">Backup Codes</p>
                          </div>
                          <button
                            onClick={handleRegenerateBackupCodes}
                            className="inline-flex h-7 items-center justify-center gap-1 rounded-full border border-[#181B22] bg-[rgba(12,16,20,0.5)] px-3 text-xs font-bold text-white backdrop-blur-[50px] transition-opacity hover:opacity-90"
                          >
                            Regenerate
                          </button>
                        </div>
                        <p className="text-xs text-gray-400">
                          Save your backup codes in a safe place. Use them if you lose access to your authenticator app.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        );

      case 'backup':
        return (
          <div className="flex w-full max-w-[1059px] flex-col gap-6">
            <section className="w-full">
              <div className="flex w-full flex-col gap-6 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 sm:p-6 backdrop-blur-[50px]">
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-white sm:text-2xl">Резервные контакты</h3>
                        <p className="text-sm text-gray-400 mt-1">
                          Для восстановления доступа к аккаунту
                        </p>
                      </div>
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
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] backdrop-blur-[50px]">
                    <label className="block text-sm font-bold text-white mb-3 md:text-[15px]">
                      Резервный Email
                    </label>
                    <Input
                      type="email"
                      value={backupEmail}
                      onChange={(e) => setBackupEmail(e.target.value)}
                      placeholder="backup@example.com"
                      className="bg-black/40 border-widget-border"
                    />
                  </div>

                  <div className="p-4 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] backdrop-blur-[50px]">
                    <label className="block text-sm font-bold text-white mb-3 md:text-[15px]">
                      Резервный телефон
                    </label>
                    <Input
                      type="tel"
                      value={backupPhone}
                      onChange={(e) => setBackupPhone(e.target.value)}
                      placeholder="+1234567890"
                      className="bg-black/40 border-widget-border"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                  <p className="text-xs text-primary text-center">
                    💡 Изменения сохраняются автоматически
                  </p>
                </div>
              </div>
            </section>
          </div>
        );

      case 'password':
        return (
          <div className="flex w-full max-w-[1059px] flex-col gap-6">
            <section className="w-full">
              <div className="flex w-full flex-col gap-6 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 sm:p-6 backdrop-blur-[50px]">
                <div className="flex items-center gap-3">
                  <Key className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="text-xl font-bold text-white sm:text-2xl">Смена пароля</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Используйте надёжный пароль (минимум 8 символов)
                    </p>
                  </div>
                </div>
                
                {totpStatus?.enabled && (
                  <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                    <p className="text-xs text-primary flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Для смены пароля потребуется TOTP код
                    </p>
                  </div>
                )}

                {passwordChangeSuccess && (
                  <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20">
                    <p className="text-sm text-green-400 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Пароль успешно изменён!
                    </p>
                  </div>
                )}

                {protectedOpsError && !requiresTOTP && (
                  <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {protectedOpsError}
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  <div className="p-4 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] backdrop-blur-[50px]">
                    <label className="block text-sm font-bold text-white mb-3 md:text-[15px]">
                      Текущий пароль
                    </label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-black/40 border-widget-border"
                      disabled={protectedOpsLoading}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="p-4 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] backdrop-blur-[50px]">
                    <label className="block text-sm font-bold text-white mb-3 md:text-[15px]">
                      Новый пароль
                    </label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-black/40 border-widget-border"
                      disabled={protectedOpsLoading}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="p-4 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] backdrop-blur-[50px]">
                    <label className="block text-sm font-bold text-white mb-3 md:text-[15px]">
                      Подтвердите новый пароль
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-black/40 border-widget-border"
                      disabled={protectedOpsLoading}
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    onClick={handlePasswordChange}
                    disabled={
                      !currentPassword || 
                      !newPassword || 
                      !confirmPassword || 
                      protectedOpsLoading
                    }
                    className={cn(
                      "w-full py-3 flex items-center justify-center gap-2 rounded-full text-sm font-bold text-white backdrop-blur-[50px] transition-all",
                      (!currentPassword || !newPassword || !confirmPassword || protectedOpsLoading)
                        ? "bg-gradient-to-r from-gray-600 to-gray-700 opacity-50 cursor-not-allowed"
                        : "bg-gradient-to-r from-primary to-[#482090] hover:opacity-90"
                    )}
                  >
                    {protectedOpsLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Изменение...
                      </>
                    ) : (
                      'Изменить пароль'
                    )}
                  </button>
                </div>
              </div>
            </section>
          </div>
        );

      case 'delete':
        return (
          <div className="flex w-full max-w-[1059px] flex-col gap-6">
            <section className="w-full">
              <div className="flex w-full flex-col gap-6 rounded-3xl border border-[#181B22] bg-[rgba(12,16,20,0.5)] p-4 sm:p-6 backdrop-blur-[50px]">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-6 h-6 text-red-400" />
                  <div>
                    <h3 className="text-xl font-bold text-white sm:text-2xl">Account Deactivation</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Temporarily or permanently delete your account
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-200">
                      <p className="font-bold mb-1">30-Day Recovery Period</p>
                      <p>Your account will be deactivated and you'll have 30 days to restore it. After 30 days, the account will be permanently deleted.</p>
                    </div>
                  </div>
                </div>

                {recoveryInfo?.is_deactivated ? (
                  <div className="flex flex-col gap-4">
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                      <p className="font-bold text-red-200 mb-3 text-sm md:text-[15px]">Account is Deactivated</p>
                      <div className="space-y-2 text-sm text-red-300">
                        <p>
                          <span className="font-medium">Deletion scheduled:</span>{' '}
                          {new Date(recoveryInfo.deletion_scheduled_at).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium">Days remaining:</span> {recoveryInfo.days_remaining}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleAccountRestore}
                      className="w-full py-3 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-[#482090] text-sm font-bold text-white backdrop-blur-[50px] transition-opacity hover:opacity-90"
                    >
                      Restore My Account
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="p-4 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] backdrop-blur-[50px]">
                      <label className="block text-sm font-bold text-white mb-3 md:text-[15px]">
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

                    <div className="p-4 rounded-2xl border border-[#181B22] bg-[rgba(11,14,17,0.5)] backdrop-blur-[50px]">
                      <label className="block text-sm font-bold text-white mb-3 md:text-[15px]">
                        Type DELETE to confirm
                      </label>
                      <Input
                        type="text"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="Type DELETE"
                        className="bg-black/40 border-widget-border uppercase"
                      />
                    </div>

                    <button
                      onClick={handleAccountDeactivation}
                      disabled={deleteConfirmation !== 'DELETE'}
                      className={cn(
                        "w-full py-3 flex items-center justify-center gap-2 rounded-full text-sm font-bold text-white backdrop-blur-[50px] transition-all",
                        deleteConfirmation !== 'DELETE'
                          ? "bg-gradient-to-r from-gray-600 to-gray-700 opacity-50 cursor-not-allowed"
                          : "bg-gradient-to-r from-red-600 to-red-700 hover:opacity-90"
                      )}
                    >
                      Deactivate My Account
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[600px]">
      {/* Tabs Navigation */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex flex-wrap items-center justify-center gap-2 p-1 rounded-[36px] border border-[#181B22] bg-[rgba(12,16,20,0.5)] backdrop-blur-[50px]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 md:py-2 rounded-[32px] text-xs md:text-sm font-bold transition-all whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-primary to-[#482090] text-white backdrop-blur-[58.33px]"
                    : "border border-[#181B22] bg-[rgba(12,16,20,0.5)] text-webGray hover:text-white backdrop-blur-[58.33px]"
                )}
              >
                <Icon className={cn(
                  "w-3.5 h-3.5 md:w-4 md:h-4",
                  activeTab === tab.id ? "text-white" : "text-webGray"
                )} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          {renderContent()}
        </div>
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
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-gray-300">
                        1. Scan this QR code with your authenticator app:
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRegenerateTOTPSetup}
                        disabled={totpLoading}
                      >
                        {totpLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <QrCode className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <div className="flex justify-center mb-3">
                      <img 
                        src={totpSetupData.qr_code} 
                        alt="QR Code" 
                        className="w-48 h-48 rounded"
                      />
                    </div>
                    <p className="text-xs text-gray-400 text-center mb-2">
                      Or enter this code manually:
                    </p>
                    <div className="flex items-center gap-2">
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
                    <p className="text-xs text-gray-500 text-center mt-2">
                      💡 Click <QrCode className="w-3 h-3 inline" /> to generate a new QR code
                    </p>
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
