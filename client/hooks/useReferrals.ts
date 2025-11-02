import { useState, useEffect, useCallback } from 'react';
import { authFetch } from '../lib/auth-fetch';

interface ReferralStats {
  total_invites: number;
  completed_invites: number;
  pending_invites: number;
  total_earnings: number;
  current_tier: number;
  next_tier_progress: number;
}

interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  total_uses: number;
  is_active: boolean;
  created_at: string;
}

interface ReferralInvitation {
  id: string;
  referrer_id: string;
  referred_user_id?: string;
  code: string;
  status: 'pending' | 'completed' | 'rewarded';
  ip_address?: string;
  created_at: string;
  completed_at?: string;
}

export function useReferrals() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [code, setCode] = useState<ReferralCode | null>(null);
  const [invitations, setInvitations] = useState<ReferralInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await authFetch.fetch('/referrals/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching referral stats:', err);
    }
  }, []);

  const fetchCode = useCallback(async () => {
    try {
      const response = await authFetch.fetch('/referrals/code');
      if (response.ok) {
        const data = await response.json();
        setCode(data);
      }
    } catch (err) {
      console.error('Error fetching referral code:', err);
    }
  }, []);

  const fetchInvitations = useCallback(async (status?: 'active' | 'inactive') => {
    try {
      const url = status ? `/referrals/invitations?status=${status}` : '/referrals/invitations';
      const response = await authFetch.fetch(url);
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
      }
    } catch (err) {
      console.error('Error fetching invitations:', err);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchStats(),
        fetchCode(),
        fetchInvitations('active'),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load referral data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchStats, fetchCode, fetchInvitations]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const getReferralLink = useCallback(() => {
    if (!code) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/ref/${code.code}`;
  }, [code]);

  const copyReferralLink = useCallback(() => {
    const link = getReferralLink();
    if (link) {
      navigator.clipboard.writeText(link);
      return true;
    }
    return false;
  }, [getReferralLink]);

  return {
    stats,
    code,
    invitations,
    isLoading,
    error,
    getReferralLink,
    copyReferralLink,
    refetchStats: fetchStats,
    refetchInvitations: fetchInvitations,
    refetch: loadAll,
  };
}
