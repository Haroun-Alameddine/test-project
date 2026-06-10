import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pedabook Builder - تسجيل الدخول',
  description: 'محرر الكتب التعليمية الاحترافي',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
