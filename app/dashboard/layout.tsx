'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('pedabook_user');
    if (!stored) {
      router.replace('/login');
    }
  }, [router]);

  return <>{children}</>;
}
