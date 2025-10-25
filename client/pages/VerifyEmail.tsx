import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Неверная ссылка для подтверждения');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Email успешно подтверждён! Теперь вы можете войти в систему.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Ошибка при подтверждении email');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Ошибка соединения с сервером');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Подтверждение Email</h1>
          <p className="text-muted-foreground">
            Tyrian Trade
          </p>
        </div>

        {status === 'loading' && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Подтверждаем ваш email...</p>
          </div>
        )}

        {status === 'success' && (
          <>
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-600 dark:text-green-400">
                {message}
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/login')}
                className="w-full"
                size="lg"
              >
                Войти в систему
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                На главную
              </Button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                onClick={() => navigate('/signup')}
                className="w-full"
                size="lg"
              >
                Зарегистрироваться заново
              </Button>
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                className="w-full"
                size="lg"
              >
                На главную
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
