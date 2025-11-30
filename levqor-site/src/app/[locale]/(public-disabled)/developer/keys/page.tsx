'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ApiKey {
  key_id: string;
  key_prefix: string;
  tier: string;
  is_active: boolean;
  calls_used: number;
  calls_limit: number;
  reset_at: string;
  created_at: string;
  last_used_at: string | null;
}

interface Usage {
  calls_used: number;
  calls_limit: number;
  calls_remaining: number;
  reset_at: string;
}

export default function ApiKeysPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin?callbackUrl=/developer/keys');
    } else if (status === 'authenticated') {
      fetchKeys();
      fetchUsage();
    }
  }, [status, router]);

  const fetchKeys = async () => {
    try {
      const res = await fetch('https://api.levqor.ai/api/developer/keys', {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys || []);
      }
    } catch (err) {
      console.error('Failed to fetch keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async () => {
    try {
      const res = await fetch('https://api.levqor.ai/api/developer/usage', {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUsage(data.current_period);
      }
    } catch (err) {
      console.error('Failed to fetch usage:', err);
    }
  };

  const createKey = async (tier: 'sandbox' | 'pro' | 'enterprise') => {
    setCreating(true);
    setError(null);
    setNewKey(null);

    try {
      const res = await fetch('https://api.levqor.ai/api/developer/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
        body: JSON.stringify({ tier }),
      });

      const data = await res.json();

      if (res.ok) {
        setNewKey(data.key);
        fetchKeys();
        fetchUsage();
      } else {
        setError(data.message || data.error || 'Failed to create API key');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`https://api.levqor.ai/api/developer/keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });

      if (res.ok) {
        fetchKeys();
        fetchUsage();
      }
    } catch (err) {
      console.error('Failed to revoke key:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const hasActiveKey = keys.some(k => k.is_active);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/developer" className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block">
            ← Back to Developer Portal
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            API Keys
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your Levqor API keys and monitor usage
          </p>
        </div>

        {/* Usage Stats */}
        {usage && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Current Usage
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Calls Used</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {usage.calls_used.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Calls Remaining</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {usage.calls_remaining.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Resets On</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {new Date(usage.reset_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${(usage.calls_used / usage.calls_limit) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-right">
                {((usage.calls_used / usage.calls_limit) * 100).toFixed(1)}% used
              </p>
            </div>
          </div>
        )}

        {/* New Key Alert */}
        {newKey && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
              ✅ API Key Created Successfully!
            </h3>
            <p className="text-sm text-green-800 dark:text-green-200 mb-4">
              Copy this key now - you won't be able to see it again!
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between">
              <code className="text-sm font-mono text-gray-900 dark:text-white flex-1">
                {newKey}
              </code>
              <button
                onClick={() => copyToClipboard(newKey)}
                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-8">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Create Key Section */}
        {!hasActiveKey && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Create Your First API Key
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Choose a tier to get started. You can upgrade anytime.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={() => createKey('sandbox')}
                disabled={creating}
                className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-600 dark:hover:border-blue-400 transition-colors disabled:opacity-50"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Sandbox</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">1,000 calls/mo - Free</p>
              </button>
              <button
                onClick={() => createKey('pro')}
                disabled={creating}
                className="p-4 border-2 border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Pro</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">10,000 calls/mo - $19/mo</p>
              </button>
              <button
                onClick={() => createKey('enterprise')}
                disabled={creating}
                className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-600 dark:hover:border-purple-400 transition-colors disabled:opacity-50"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Enterprise</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Unlimited - $199/mo</p>
              </button>
            </div>
          </div>
        )}

        {/* Existing Keys */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Your API Keys
          </h2>
          
          {keys.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No API keys yet. Create one to get started!
            </p>
          ) : (
            <div className="space-y-4">
              {keys.map((key) => (
                <div
                  key={key.key_id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
                          {key.key_prefix}
                        </code>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded ${
                            key.tier === 'enterprise'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : key.tier === 'pro'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}
                        >
                          {key.tier.toUpperCase()}
                        </span>
                        {!key.is_active && (
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            REVOKED
                          </span>
                        )}
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Calls Used</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {key.calls_used.toLocaleString()} / {key.calls_limit.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Created</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {new Date(key.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Last Used</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {key.last_used_at
                              ? new Date(key.last_used_at).toLocaleDateString()
                              : 'Never'}
                          </p>
                        </div>
                      </div>
                    </div>
                    {key.is_active && (
                      <button
                        onClick={() => revokeKey(key.key_id)}
                        className="ml-4 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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

        {/* Documentation Link */}
        <div className="mt-8 text-center">
          <Link
            href="/developer/docs"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            View API Documentation →
          </Link>
        </div>
      </div>
    </div>
  );
}
