# Интеграция авторизации с существующими модальными окнами

## Шаги интеграции

### 1. Установите зависимости

```bash
pnpm add @supabase/supabase-js bcrypt jsonwebtoken
pnpm add -D @types/bcrypt @types/jsonwebtoken
```

### 2. Обновите App.tsx

```tsx
import { AuthProvider } from '@/contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Ваш существующий код */}
      </BrowserRouter>
    </AuthProvider>
  );
}
```

### 3. Интегрируйте с LoginModal

В файле `client/components/auth/LoginModal.tsx`:

```tsx
import { useAuthIntegration } from '@/hooks/useAuthIntegration';

const LoginModal: FC<LoginModalProps> = ({ isOpen, onClose }) => {
  // Добавьте хук
  const {
    isLoading,
    error,
    setError,
    handleLogin,
    handleVerifyCode,
    handleForgotPassword,
    handleResetPassword
  } = useAuthIntegration();

  // Замените существующую логи��у логина
  const handleLoginSubmit = async () => {
    setAuthError('');
    
    const emailOrPhone = authMethod === 'email' ? email : phoneNumber;
    const result = await handleLogin(emailOrPhone, password);
    
    if (result.success) {
      if (result.requires2FA) {
        // Показать 2FA экран
        setCurrentScreen('2fa');
        setMaskedEmail(result.maskedContact || '');
      } else {
        // Успешный вход, закрыть модалку
        onClose();
      }
    } else {
      // Ошибка уже установлена в хуке
    }
  };

  // Замените логику верификации 2FA кода
  const handleVerify2FA = async () => {
    const code = twoFactorCode.join('');
    const success = await handleVerifyCode(/* userId */, code, '2fa');
    
    if (success) {
      onClose();
    } else {
      setTwoFactorError('Invalid code');
    }
  };

  // Замените логику восстановления пароля
  const handleForgotPasswordSubmit = async () => {
    const success = await handleForgotPassword(forgotEmail);
    
    if (success) {
      setCurrentScreen('forgot-sent');
    }
  };

  // Замените логику сброса пароля
  const handleResetPasswordSubmit = async (token: string) => {
    const success = await handleResetPassword(token, newPassword);
    
    if (success) {
      setCurrentScreen('password-reset');
    }
  };

  // Отображайте ошибки и состояние загрузки
  {error && (
    <div className="text-red-500 text-sm mt-2">{error}</div>
  )}
  
  {isLoading && <LoadingSpinner />}
};
```

### 4. Интегрируйте с SignUpModal

В файле `client/components/auth/SignUpModal.tsx`:

```tsx
import { useAuthIntegration } from '@/hooks/useAuthIntegration';

export const SignUpModal: FC<SignUpModalProps> = ({ isOpen, onClose }) => {
  const { isLoading, error, handleSignup } = useAuthIntegration();
  
  const [userId, setUserId] = useState<string>('');

  const handleSignupSubmit = async () => {
    // Валидация
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    const result = await handleSignup({
      email: authMethod === 'email' ? email : undefined,
      phone: authMethod === 'phone' ? phone : undefined,
      password
    });

    if (result.success && result.userId) {
      setUserId(result.userId);
      setShowVerification(true);
    }
  };

  return (
    <>
      {!showVerification ? (
        // Форма регистрации
        <form onSubmit={handleSignupSubmit}>
          {/* Ваши поля */}
          {error && <div className="text-red-500">{error}</div>}
          <button disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
      ) : (
        // Модалка верификации
        <VerificationModal
          isOpen={showVerification}
          onClose={onClose}
          onBack={() => setShowVerification(false)}
          method={authMethod}
          contact={authMethod === 'email' ? email : phone}
          userId={userId}
        />
      )}
    </>
  );
};
```

### 5. Интегрируйте с VerificationModal

В файле `client/components/auth/VerificationModal.tsx`:

```tsx
interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  method: 'email' | 'phone';
  contact: string;
  userId: string; // Добавьте это
}

export const VerificationModal: FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  onBack,
  method,
  contact,
  userId // Добавьте это
}) => {
  const { isLoading, error, handleVerifyCode } = useAuthIntegration();

  const handleVerify = async () => {
    const codeString = code.join('');
    const type = method === 'email' ? 'email_verification' : 'phone_verification';
    
    const success = await handleVerifyCode(userId, codeString, type);
    
    if (success) {
      // Верификация успешна
      onClose();
      // Опционально: показать success toast
    } else {
      setError('invalid');
    }
  };

  return (
    // Ваш UI
    <div>
      {error && <ErrorMessage error={error} />}
      <button onClick={handleVerify} disabled={isLoading}>
        {isLoading ? 'Verifying...' : 'Verify'}
      </button>
    </div>
  );
};
```

### 6. Используйте useAuth в других компонентах

```tsx
import { useAuth } from '@/contexts/AuthContext';

function UserProfile() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 7. Обновите AvatarDropdown

В файле `client/components/ui/AvatarDropdown/AvatarDropdown.tsx`:

```tsx
import { useAuth } from '@/contexts/AuthContext';

export const AvatarDropdown: FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  
  // Если п��льзователь не авторизован, показываем Login кнопку
  if (!isAuthenticated) {
    return (
      <button onClick={() => setIsLoginModalOpen(true)}>
        Login
      </button>
    );
  }

  // Если авторизован, показываем аватар и меню
  return (
    <div>
      <img src={user?.avatarUrl || '/default-avatar.png'} />
      {/* Меню */}
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

---

## Тестирование интеграции

### 1. Тест регистрации
1. Откройте приложение
2. Нажмите на аватар → Login → "Create account"
3. Заполните форму регистрации
4. Проверьте консоль для кода верификации (в dev режиме)
5. Введите код
6. Проверьте, что вы вошли в систему

### 2. Тест логина
1. Введите email и пароль
2. Нажмите Login
3. Если включен 2FA, введите код
4. Проверьте, что вы вошли в систему

### 3. Тест восстановления пароля
1. Нажмите "Forgot password?"
2. Введите email
3. Проверьте консол�� для токена сброса (в dev режиме)
4. Используйте токен для сброса пароля
5. Войдите с новым паролем

---

## Дополнительные возможности

### Автоматический refresh токена

Уже реализовано в `client/lib/api/auth.ts`! Axios interceptor автоматически обновляет токен при истечении.

### Защищенные маршруты

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/" />;
  
  return <>{children}</>;
}
```

### Персистентность состояния

Уже реализовано! Токены сохраняются в `localStorage`, и пользователь остается авторизованным после перезагрузки страницы.

---

**Готово!** 🎉 Ваши модальные окна полностью интегрированы с системой авторизации.
