'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export function useRequireAuth(): { user: AuthUser | null; loading: boolean } {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('pedabook_user');
    if (!stored) {
      router.replace('/login');
      return;
    }
    try {
      setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem('pedabook_user');
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  return { user, loading };
}
