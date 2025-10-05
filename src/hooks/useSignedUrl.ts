"use client";

import { useState, useEffect, useCallback } from 'react';
import { generateSignedUrl } from '@/lib/pinata';

interface UseSignedUrlOptions {
  expires?: number;
  filename?: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
  autoRefresh?: boolean;
}

interface SignedUrlState {
  url: string | null;
  loading: boolean;
  error: string | null;
  expiresAt: Date | null;
  refresh: () => Promise<void>;
}

export function useSignedUrl(cid: string | null, options: UseSignedUrlOptions = {}): SignedUrlState {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);

  const {
    expires = 3600, // 1 hour default
    autoRefresh = true,
    ...otherOptions
  } = options;

  const fetchSignedUrl = useCallback(async () => {
    if (!cid) return;

    setLoading(true);
    setError(null);

    try {
      const response = await generateSignedUrl(cid, {
        expires,
        ...otherOptions
      });

      if (response.success) {
        setUrl(response.signedUrl);
        setExpiresAt(new Date(response.expiresAt));
      } else {
        throw new Error(response.error || 'Failed to generate signed URL');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setUrl(null);
      setExpiresAt(null);
    } finally {
      setLoading(false);
    }
  }, [cid, expires, otherOptions]);

  // Initial fetch
  useEffect(() => {
    if (cid) {
      fetchSignedUrl();
    }
  }, [cid, fetchSignedUrl]);

  // Auto-refresh before expiration
  useEffect(() => {
    if (!autoRefresh || !expiresAt || !url) return;

    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();
    
    // Refresh 5 minutes before expiry, or immediately if already expired
    const refreshTime = Math.max(0, timeUntilExpiry - 5 * 60 * 1000);

    const timeoutId = setTimeout(() => {
      fetchSignedUrl();
    }, refreshTime);

    return () => clearTimeout(timeoutId);
  }, [expiresAt, url, autoRefresh, fetchSignedUrl]);

  return {
    url,
    loading,
    error,
    expiresAt,
    refresh: fetchSignedUrl
  };
}