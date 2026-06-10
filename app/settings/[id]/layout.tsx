'use client';

import React from 'react';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div dir="rtl" className="min-h-screen bg-[#f4f6fb]">
      {children}
    </div>
  );
}
