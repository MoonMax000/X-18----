import { useState } from 'react';
import { X, AlertTriangle, Link2 } from 'lucide-react';

interface AccountLinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  provider: string;
  linkingToken: string;
  message: string;
  onLinkAccount: (password: string) => Promise<void>;
}

/**
 * Modal для связывания OAuth аккаунта с существующим аккаунтом
 * Появляется когда пользователь пытается войти через OAuth,
 * но email уже зарегистрирован
 */
const AccountLinkingModal = ({
  isOpen,
  onClose,
  email,
  provider,
  linkingToken,
  message,
  onLinkAccount,
}: AccountLinkingModalProps) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError('Введите пароль');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onLinkAccount(password);
      // Успех - модал закроется автоматически после редиректа
    } catch (err: any) {
      setError(err.message || 'Не удалось связать аккаунты');
      setIsLoading(false);
    }
  };

  const getProviderName = (provider: string) => {
    return provider === 'google' ? 'Google' : provider === 'apple' ? 'Apple' : provider;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-zinc-900 rounded-lg shadow-xl max-w-md w-full p-6 border border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">
              Связывание аккаунта
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Message */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-200 mb-2">
                Аккаунт с email <strong>{email}</strong> уже существует.
              </p>
              <p className="text-sm text-gray-400">
                Чтобы войти через {getProviderName(provider)}, подтвердите, что это ваш аккаунт, введя пароль.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Пароль от вашего аккаунта
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Введите пароль"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Info Message */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-300">
              После подтверждения вы сможете входить как через email и пароль, так и через {getProviderName(provider)}.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors border border-zinc-700"
              disabled={isLoading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !password}
            >
              {isLoading ? 'Связывание...' : 'Связать аккаунты'}
            </button>
          </div>
        </form>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <p className="text-xs text-gray-500 text-center">
            Если вы не помните пароль, закройте это окно и используйте функцию восстановления пароля.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountLinkingModal;
