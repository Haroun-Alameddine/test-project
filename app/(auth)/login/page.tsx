'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const errs: { email?: string; password?: string } = {};
    if (!email) errs.email = 'البريد الإلكتروني مطلوب';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'البريد الإلكتروني غير صالح';
    if (!password) errs.password = 'كلمة المرور مطلوبة';
    else if (password.length < 4) errs.password = 'كلمة المرور قصيرة جداً';
    return errs;
  }

  useEffect(() => {
    if (localStorage.getItem('pedabook_user')) {
      router.replace('/dashboard');
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    // Mock login — store user in localStorage
    await new Promise((r) => setTimeout(r, 800));
    const mockUser = {
      id: 'user-1',
      name: email.split('@')[0],
      email,
    };
    localStorage.setItem('pedabook_user', JSON.stringify(mockUser));
    if (remember) {
      localStorage.setItem('pedabook_remember', '1');
    }
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* ── Left Decorative Panel ─────────────────────────── */}
      <div className="hidden lg:flex w-1/2 bg-[#1B3A6B] relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Decorative book illustrations */}
        <div className="relative z-10 w-full max-w-sm">
          {/* Main book stack */}
          <div className="relative mx-auto" style={{ width: 280, height: 320 }}>
            {/* Book 3 (back) */}
            <div
              className="absolute rounded-lg shadow-2xl"
              style={{
                width: 200,
                height: 260,
                background: 'linear-gradient(135deg, #C9A227 0%, #e0b93a 100%)',
                bottom: 0,
                right: 20,
                transform: 'rotate(8deg)',
              }}
            >
              <div className="absolute inset-0 flex flex-col p-4 opacity-60">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white/30 h-2 rounded mb-2" style={{ width: `${65 + (i % 3) * 15}%` }} />
                ))}
              </div>
              <div className="absolute top-4 right-4 left-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full" />
                <div className="h-3 bg-white/40 rounded flex-1" />
              </div>
            </div>

            {/* Book 2 (middle) */}
            <div
              className="absolute rounded-lg shadow-2xl"
              style={{
                width: 200,
                height: 260,
                background: 'linear-gradient(135deg, #2a5298 0%, #1e3a8a 100%)',
                bottom: 8,
                right: 50,
                transform: 'rotate(-4deg)',
              }}
            >
              <div className="absolute inset-4 border border-white/20 rounded" />
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <div className="bg-white/20 h-3 rounded mb-2 w-3/4" />
                <div className="bg-white/15 h-2 rounded mb-1 w-1/2" />
              </div>
            </div>

            {/* Book 1 (front) */}
            <div
              className="absolute rounded-lg shadow-2xl overflow-hidden"
              style={{
                width: 210,
                height: 270,
                background: 'linear-gradient(160deg, #ffffff 0%, #f0f4fc 100%)',
                bottom: 16,
                left: 10,
                transform: 'rotate(-2deg)',
              }}
            >
              {/* Book header */}
              <div className="bg-[#1B3A6B] h-14 flex items-center px-4 gap-2">
                <div className="w-6 h-6 bg-[#C9A227] rounded" />
                <div className="flex-1">
                  <div className="h-2 bg-white/60 rounded mb-1 w-3/4" />
                  <div className="h-1.5 bg-white/30 rounded w-1/2" />
                </div>
              </div>
              {/* Book content lines */}
              <div className="p-4 space-y-2">
                <div className="h-3 bg-[#1B3A6B]/20 rounded w-4/5" />
                <div className="h-2 bg-gray-200 rounded w-full" />
                <div className="h-2 bg-gray-200 rounded w-5/6" />
                <div className="h-2 bg-gray-200 rounded w-full" />
                <div className="my-3 h-16 bg-[#1B3A6B]/10 rounded-lg border border-[#1B3A6B]/20 flex items-center justify-center">
                  <div className="w-8 h-8 bg-[#C9A227]/30 rounded-full" />
                </div>
                <div className="h-2 bg-gray-200 rounded w-full" />
                <div className="h-2 bg-gray-200 rounded w-4/5" />
                <div className="h-2 bg-gray-200 rounded w-3/5" />
              </div>
              {/* Page number */}
              <div className="absolute bottom-2 right-4 text-xs text-gray-400 font-cairo">١٤</div>
            </div>
          </div>

          {/* Text below illustration */}
          <div className="text-center mt-8">
            <h2 className="text-white text-2xl font-bold font-cairo mb-2">
              صمّم كتبك التعليمية
            </h2>
            <p className="text-white/70 font-cairo text-sm leading-relaxed">
              أداة احترافية لتصميم الكتب التعليمية العربية
              <br />
              بمعايير النشر الحديثة
            </p>
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['تصميم احترافي', 'قوالب جاهزة', 'تصدير PDF', 'عربي وإنجليزي'].map((f) => (
              <span
                key={f}
                className="bg-white/10 border border-white/20 text-white/80 text-xs font-cairo px-3 py-1 rounded-full"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ─────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-[#f4f6fb] p-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1B3A6B] rounded-2xl shadow-lg mb-4">
              <BookOpen className="text-[#C9A227]" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-[#1B3A6B] font-cairo">Pedabook Builder</h1>
            <p className="text-gray-500 text-sm font-cairo mt-1">محرر الكتب التعليمية الاحترافي</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-[#1B3A6B] font-cairo mb-6 text-center">
              تسجيل الدخول
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="البريد الإلكتروني"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                error={errors.email}
                icon={<Mail size={16} />}
                dir="ltr"
                required
                autoComplete="email"
              />

              <div>
                <Input
                  label="كلمة المرور"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                  error={errors.password}
                  icon={<Lock size={16} />}
                  iconRight={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-gray-400 hover:text-gray-600 pointer-events-auto"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  dir="ltr"
                  required
                  autoComplete="current-password"
                />
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 accent-[#1B3A6B] cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 font-cairo">تذكرني</span>
                </label>
                <button type="button" className="text-sm text-[#1B3A6B] hover:underline font-cairo">
                  نسيت كلمة المرور؟
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                className="mt-2"
              >
                تسجيل الدخول
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-cairo">أو</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Demo access */}
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => {
                setEmail('demo@pedabook.app');
                setPassword('demo1234');
              }}
            >
              تجربة الحساب التجريبي
            </Button>
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500 font-cairo mt-6">
            ليس لديك حساب؟{' '}
            <Link href="/register" className="text-[#1B3A6B] font-semibold hover:underline">
              سجل الآن
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
