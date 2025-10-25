import { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, X, Loader2, Trash2, Copy, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { backendApi } from '@/services/api/backend';
import { cn } from '@/lib/utils';

interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  scopes: string[];
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

export default function ApiSettings() {
  // Stripe Settings
  const [stripeSettings, setStripeSettings] = useState({
    hasSecretKey: false,
    hasPublishableKey: false,
    hasWebhookSecret: false,
    publishableKey: '',
    isActive: false,
    onboardingComplete: false,
  });

  const [stripeForm, setStripeForm] = useState({
    secretKey: '',
    publishableKey: '',
    webhookSecret: '',
  });

  const [showStripeKeys, setShowStripeKeys] = useState({
    secret: false,
    webhook: false,
  });

  const [stripeTesting, setStripeTesting] = useState(false);
  const [stripeTestResult, setStripeTestResult] = useState<any>(null);
  const [stripeSaving, setStripeSaving] = useState(false);

  // API Keys
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  // Load Stripe settings
  useEffect(() => {
    loadStripeSettings();
    loadApiKeys();
  }, []);

  const loadStripeSettings = async () => {
    try {
      const settings = await backendApi.getStripeSettings();
      setStripeSettings(settings);
      if (settings.publishableKey) {
        setStripeForm(prev => ({ ...prev, publishableKey: settings.publishableKey }));
      }
    } catch (error: any) {
      console.error('Failed to load Stripe settings:', error);
    }
  };

  const loadApiKeys = async () => {
    try {
      const keys = await backendApi.getApiKeys();
      setApiKeys(keys);
    } catch (error: any) {
      console.error('Failed to load API keys:', error);
    }
  };

  const handleSaveStripeSettings = async () => {
    try {
      setStripeSaving(true);
      await backendApi.updateStripeSettings({
        secretKey: stripeForm.secretKey || undefined,
        publishableKey: stripeForm.publishableKey || undefined,
        webhookSecret: stripeForm.webhookSecret || undefined,
      });

      await loadStripeSettings();
      setStripeForm({ secretKey: '', publishableKey: stripeForm.publishableKey, webhookSecret: '' });
      alert('Stripe settings saved successfully!');
    } catch (error: any) {
      alert(`Failed to save Stripe settings: ${error.message}`);
    } finally {
      setStripeSaving(false);
    }
  };

  const handleTestStripeConnection = async () => {
    try {
      setStripeTesting(true);
      setStripeTestResult(null);
      const result = await backendApi.testStripeConnection();
      setStripeTestResult(result);
    } catch (error: any) {
      setStripeTestResult({ success: false, error: error.message });
    } finally {
      setStripeTesting(false);
    }
  };

  const handleDeleteStripeSettings = async () => {
    if (!confirm('Are you sure you want to remove Stripe integration?')) return;

    try {
      await backendApi.deleteStripeSettings();
      await loadStripeSettings();
      setStripeForm({ secretKey: '', publishableKey: '', webhookSecret: '' });
      setStripeTestResult(null);
      alert('Stripe settings removed successfully');
    } catch (error: any) {
      alert(`Failed to remove Stripe settings: ${error.message}`);
    }
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) {
      alert('Please enter a name for the API key');
      return;
    }

    try {
      setCreatingKey(true);
      const result = await backendApi.createApiKey({
        name: newKeyName,
        scopes: ['read:profile', 'write:posts'], // TODO: Make configurable
      });

      setNewlyCreatedKey(result.key);
      await loadApiKeys();
      setNewKeyName('');
      setShowNewKeyForm(false);
    } catch (error: any) {
      alert(`Failed to create API key: ${error.message}`);
    } finally {
      setCreatingKey(false);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;

    try {
      await backendApi.deleteApiKey(id);
      await loadApiKeys();
      alert('API key deleted successfully');
    } catch (error: any) {
      alert(`Failed to delete API key: ${error.message}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Stripe Integration */}
      <Card className="border-[#5E5E5E] bg-[#000000]">
        <CardHeader>
          <CardTitle className="text-white">Stripe Integration</CardTitle>
          <CardDescription className="text-[#B0B0B0]">
            Подключите ваш Stripe аккаунт для приема платежей и управления подписками
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          {stripeSettings.isActive && (
            <Alert className="border-green-500/20 bg-green-500/10">
              <Check className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-500">
                Stripe is connected and active
                {stripeSettings.onboardingComplete && ' • Onboarding complete'}
              </AlertDescription>
            </Alert>
          )}

          {/* Secret Key */}
          <div className="space-y-2">
            <Label htmlFor="stripe-secret" className="text-white">
              Secret Key {stripeSettings.hasSecretKey && <span className="text-green-500">(configured)</span>}
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="stripe-secret"
                  type={showStripeKeys.secret ? 'text' : 'password'}
                  placeholder="sk_test_..."
                  value={stripeForm.secretKey}
                  onChange={(e) => setStripeForm(prev => ({ ...prev, secretKey: e.target.value }))}
                  className="bg-[#0C1014] border-[#5E5E5E] text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowStripeKeys(prev => ({ ...prev, secret: !prev.secret }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E92A0] hover:text-white"
                >
                  {showStripeKeys.secret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Publishable Key */}
          <div className="space-y-2">
            <Label htmlFor="stripe-publishable" className="text-white">
              Publishable Key {stripeSettings.hasPublishableKey && <span className="text-green-500">(configured)</span>}
            </Label>
            <Input
              id="stripe-publishable"
              placeholder="pk_test_..."
              value={stripeForm.publishableKey}
              onChange={(e) => setStripeForm(prev => ({ ...prev, publishableKey: e.target.value }))}
              className="bg-[#0C1014] border-[#5E5E5E] text-white"
            />
          </div>

          {/* Webhook Secret */}
          <div className="space-y-2">
            <Label htmlFor="stripe-webhook" className="text-white">
              Webhook Secret (Optional) {stripeSettings.hasWebhookSecret && <span className="text-green-500">(configured)</span>}
            </Label>
            <div className="relative">
              <Input
                id="stripe-webhook"
                type={showStripeKeys.webhook ? 'text' : 'password'}
                placeholder="whsec_..."
                value={stripeForm.webhookSecret}
                onChange={(e) => setStripeForm(prev => ({ ...prev, webhookSecret: e.target.value }))}
                className="bg-[#0C1014] border-[#5E5E5E] text-white pr-10"
              />
              <button
                type="button"
                onClick={() => setShowStripeKeys(prev => ({ ...prev, webhook: !prev.webhook }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E92A0] hover:text-white"
              >
                {showStripeKeys.webhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Test Result */}
          {stripeTestResult && (
            <Alert className={cn(
              'border',
              stripeTestResult.success 
                ? 'border-green-500/20 bg-green-500/10' 
                : 'border-red-500/20 bg-red-500/10'
            )}>
              {stripeTestResult.success ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <X className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription className={stripeTestResult.success ? 'text-green-500' : 'text-red-500'}>
                {stripeTestResult.success ? (
                  <div>
                    <div className="font-semibold">Connection successful!</div>
                    <div className="text-sm mt-1">
                      Account: {stripeTestResult.email} ({stripeTestResult.country})
                    </div>
                  </div>
                ) : (
                  `Connection failed: ${stripeTestResult.error}`
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleSaveStripeSettings}
              disabled={stripeSaving}
              className="bg-gradient-to-r from-[#A06AFF] to-[#482090] hover:opacity-90"
            >
              {stripeSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Settings'}
            </Button>
            <Button
              onClick={handleTestStripeConnection}
              disabled={stripeTesting || !stripeSettings.hasSecretKey}
              variant="outline"
              className="border-[#5E5E5E] text-white hover:bg-[#1A1A1A]"
            >
              {stripeTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test Connection'}
            </Button>
            {stripeSettings.isActive && (
              <Button
                onClick={handleDeleteStripeSettings}
                variant="outline"
                className="border-red-500/50 text-red-500 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card className="border-[#5E5E5E] bg-[#000000]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">API Keys</CardTitle>
              <CardDescription className="text-[#B0B0B0]">
                Управляйте API ключами для доступа к вашим данным
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowNewKeyForm(true)}
              size="sm"
              className="bg-gradient-to-r from-[#A06AFF] to-[#482090]"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Key
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* New key alert */}
          {newlyCreatedKey && (
            <Alert className="border-green-500/20 bg-green-500/10">
              <Check className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-500">
                <div className="font-semibold mb-2">API Key created successfully!</div>
                <div className="flex items-center gap-2 font-mono text-xs bg-black/30 p-2 rounded">
                  <code className="flex-1">{newlyCreatedKey}</code>
                  <button onClick={() => copyToClipboard(newlyCreatedKey)} className="hover:text-white">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-xs mt-2">
                  Make sure to copy your API key now. You won't be able to see it again!
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* New key form */}
          {showNewKeyForm && (
            <div className="border border-[#5E5E5E] rounded-lg p-4 space-y-4">
              <Input
                placeholder="API Key Name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="bg-[#0C1014] border-[#5E5E5E] text-white"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateApiKey}
                  disabled={creatingKey}
                  className="bg-gradient-to-r from-[#A06AFF] to-[#482090]"
                >
                  {creatingKey ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                </Button>
                <Button
                  onClick={() => setShowNewKeyForm(false)}
                  variant="outline"
                  className="border-[#5E5E5E] text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* API Keys list */}
          {apiKeys.length === 0 ? (
            <div className="text-center py-8 text-[#8E92A0]">
              No API keys yet. Create one to get started.
            </div>
          ) : (
            <div className="space-y-2">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between border border-[#5E5E5E] rounded-lg p-4 bg-[#0C1014]"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{key.name}</span>
                      {key.isActive ? (
                        <span className="text-xs text-green-500">Active</span>
                      ) : (
                        <span className="text-xs text-gray-500">Inactive</span>
                      )}
                    </div>
                    <div className="text-sm text-[#8E92A0] mt-1">
                      <span className="font-mono">••••••••{key.key.slice(-8)}</span>
                      {key.lastUsedAt && (
                        <span className="ml-4">
                          Last used: {new Date(key.lastUsedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDeleteApiKey(key.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
