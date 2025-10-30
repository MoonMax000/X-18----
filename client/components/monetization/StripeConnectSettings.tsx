import { useState, useEffect } from 'react';
import { Check, ExternalLink, Loader2, AlertCircle, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { stripeConnectApi } from '@/services/api/stripeConnect';
import { cn } from '@/lib/utils';

export default function StripeConnectSettings() {
  const [account, setAccount] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAccount();

    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code) {
      handleOAuthCallback(code, state);
    }
  }, []);

  const loadAccount = async () => {
    try {
      setIsLoading(true);
      const result = await stripeConnectApi.getAccount();
      setAccount(result.connected ? result.account : null);
    } catch (err: any) {
      console.error('Failed to load account:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthCallback = async (code: string, state: string | null) => {
    try {
      setIsConnecting(true);
      await stripeConnectApi.handleCallback(code, state || undefined);
      
      // Remove code from URL
      window.history.replaceState({}, '', window.location.pathname);
      
      // Reload account
      await loadAccount();
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await stripeConnectApi.startConnectFlow();
    } catch (err: any) {
      setError(err.message);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Stripe account? You will no longer be able to receive payments.')) {
      return;
    }

    try {
      setIsDisconnecting(true);
      await stripeConnectApi.disconnectAccount();
      setAccount(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleOpenDashboard = async () => {
    try {
      const dashLink = await stripeConnectApi.getDashboardLink();
      window.open(dashLink.url, '_blank');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading || isConnecting) {
    return (
      <Card className="border-[#5E5E5E] bg-[#000000]">
        <CardContent className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#A06AFF]" />
            <p className="text-sm text-[#8E92A0]">
              {isConnecting ? 'Connecting your Stripe account...' : 'Loading...'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!account) {
    return (
      <Card className="border-[#5E5E5E] bg-[#000000]">
        <CardHeader>
          <CardTitle className="text-white">Connect Stripe to Start Earning</CardTitle>
          <CardDescription className="text-[#B0B0B0]">
            Подключите свой Stripe аккаунт, чтобы получать оплату за ваш контент
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-500/20 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-500">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#A06AFF]/20 text-[#A06AFF]">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Receive payments</h4>
                <p className="text-sm text-[#8E92A0]">
                  Get paid when users purchase your premium content or subscribe
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#A06AFF]/20 text-[#A06AFF]">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Automatic payouts</h4>
                <p className="text-sm text-[#8E92A0]">
                  Money is automatically transferred to your bank account
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#A06AFF]/20 text-[#A06AFF]">
                <ExternalLink className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Manage from dashboard</h4>
                <p className="text-sm text-[#8E92A0]">
                  Access full Stripe dashboard to track your earnings
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[#5E5E5E] bg-[#0C1014] p-4">
            <h4 className="text-sm font-semibold text-white mb-2">Platform Fee</h4>
            <p className="text-sm text-[#8E92A0]">
              We charge <span className="text-white font-semibold">10%</span> platform fee on all transactions.
              You will receive <span className="text-white font-semibold">90%</span> of every sale.
            </p>
          </div>

          <Button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-[#A06AFF] to-[#482090] hover:opacity-90"
          >
            {isConnecting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 1.408 0 2.077.535 2.77 1.35l1.856-1.564C15.877 3.79 14.505 3 12.65 3 9.909 3 8 4.559 8 6.913c0 2.298 1.892 3.389 4.274 4.215 2.246.744 3.193 1.467 3.193 2.527 0 .945-.8 1.539-2.091 1.539-1.611 0-2.627-.664-3.598-1.795L8 14.935c1.235 1.611 2.853 2.353 4.978 2.353 2.791 0 4.784-1.539 4.784-4.087 0-2.363-1.849-3.51-4.786-4.436z"/>
              </svg>
            )}
            Connect with Stripe
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#5E5E5E] bg-[#000000]">
      <CardHeader>
        <CardTitle className="text-white">Stripe Connected</CardTitle>
        <CardDescription className="text-[#B0B0B0]">
          Your Stripe account is connected and ready to receive payments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-red-500/20 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-500">{error}</AlertDescription>
          </Alert>
        )}

        <Alert className="border-green-500/20 bg-green-500/10">
          <Check className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-500">
            <div className="font-semibold">Connected successfully!</div>
            <div className="text-sm mt-1">
              {account.email && `Account: ${account.email}`}
              {account.country && ` • ${account.country}`}
            </div>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-[#5E5E5E] bg-[#0C1014] p-4">
            <div className="text-xs text-[#8E92A0] mb-1">Charges</div>
            <div className={cn(
              "text-sm font-semibold",
              account.chargesEnabled ? "text-green-500" : "text-yellow-500"
            )}>
              {account.chargesEnabled ? '✓ Enabled' : '⚠ Pending'}
            </div>
          </div>

          <div className="rounded-lg border border-[#5E5E5E] bg-[#0C1014] p-4">
            <div className="text-xs text-[#8E92A0] mb-1">Payouts</div>
            <div className={cn(
              "text-sm font-semibold",
              account.payoutsEnabled ? "text-green-500" : "text-yellow-500"
            )}>
              {account.payoutsEnabled ? '✓ Enabled' : '⚠ Pending'}
            </div>
          </div>

          <div className="rounded-lg border border-[#5E5E5E] bg-[#0C1014] p-4">
            <div className="text-xs text-[#8E92A0] mb-1">Details</div>
            <div className={cn(
              "text-sm font-semibold",
              account.detailsSubmitted ? "text-green-500" : "text-yellow-500"
            )}>
              {account.detailsSubmitted ? '✓ Complete' : '⚠ Incomplete'}
            </div>
          </div>
        </div>

        {(!account.chargesEnabled || !account.payoutsEnabled || !account.detailsSubmitted) && (
          <Alert className="border-yellow-500/20 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-500">
              <div className="font-semibold">Action required</div>
              <div className="text-sm mt-1">
                Complete your Stripe account setup to start receiving payments.
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleOpenDashboard}
            variant="outline"
            className="flex-1 border-[#5E5E5E] text-white hover:bg-[#1A1A1A]"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Dashboard
          </Button>

          <Button
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            variant="outline"
            className="border-red-500/50 text-red-500 hover:bg-red-500/10"
          >
            {isDisconnecting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
