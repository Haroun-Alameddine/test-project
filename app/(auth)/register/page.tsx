'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  function validate() {
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = 'الاسم مطلوب';
    if (!email) errs.email = 'البريد الإلكتروني مطلوب';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'البريد الإلكتروني غير صالح';
    if (!password) errs.password = 'كلمة المرور مطلوبة';
    else if (password.length < 6) errs.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    if (!confirmPassword) errs.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    else if (confirmPassword !== password) errs.confirmPassword = 'كلمتا المرور غير متطابقتين';
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    const mockUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email,
    };
    localStorage.setItem('pedabook_user', JSON.stringify(mockUser));
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* ── Left Decorative Panel ─────────────────────────── */}
      <div className="hidden lg:flex w-1/2 bg-[#1B3A6B] relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="relative z-10 w-full max-w-sm text-center">
          {/* Steps illustration */}
          <div className="flex flex-col gap-4 mb-8">
            {[
              { num: '١', title: 'أنشئ حسابك', desc: 'سجّل بياناتك في خطوة واحدة' },
              { num: '٢', title: 'اختر قالبك', desc: 'من مكتبة قوالب احترافية' },
              { num: '٣', title: 'صمّم وصدّر', desc: 'واحصل على كتابك بجودة نشر' },
            ].map((step) => (
              <div
                key={step.num}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 text-right"
              >
                <div className="w-10 h-10 bg-[#C9A227] rounded-full flex items-center justify-center text-white font-bold font-cairo text-lg shrink-0">
                  {step.num}
                </div>
                <div>
                  <div className="text-white font-semibold font-cairo text-sm">{step.title}</div>
                  <div className="text-white/60 font-cairo text-xs mt-0.5">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-white text-2xl font-bold font-cairo mb-2">
            انضم إلى Pedabook
          </h2>
          <p className="text-white/70 font-cairo text-sm leading-relaxed">
            أكثر من ١٠٠٠ معلم يستخدمون Pedabook
            <br />
            لإنشاء محتوى تعليمي احترافي
          </p>
        </div>
      </div>

      {/* ── Right Form Panel ─────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-[#f4f6fb] p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#1B3A6B] rounded-2xl shadow-lg mb-3">
              <BookOpen className="text-[#C9A227]" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-[#1B3A6B] font-cairo">Pedabook Builder</h1>
            <p className="text-gray-500 text-sm font-cairo mt-1">محرر الكتب التعليمية الاحترافي</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-[#1B3A6B] font-cairo mb-6 text-center">
              إنشاء حساب جديد
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="الاسم الكامل"
                type="text"
                placeholder="اسمك الكامل"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
                error={errors.name}
                icon={<User size={16} />}
                dir="rtl"
                required
                autoComplete="name"
              />

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

              <Input
                label="كلمة المرور"
                type={showPassword ? 'text' : 'password'}
                placeholder="6 أحرف على الأقل"
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
                autoComplete="new-password"
              />

              <Input
                label="تأكيد كلمة المرور"
                type={showConfirm ? 'text' : 'password'}
                placeholder="أعد كتابة كلمة المرور"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: undefined })); }}
                error={errors.confirmPassword}
                icon={<Lock size={16} />}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="text-gray-400 hover:text-gray-600 pointer-events-auto"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                dir="ltr"
                required
                autoComplete="new-password"
              />

              {/* Password strength indicator */}
              {password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          password.length >= level * 2
                            ? level <= 1
                              ? 'bg-red-400'
                              : level <= 2
                              ? 'bg-yellow-400'
                              : level <= 3
                              ? 'bg-blue-400'
                              : 'bg-green-400'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 font-cairo">
                    {password.length < 4
                      ? 'ضعيفة جداً'
                      : password.length < 6
                      ? 'ضعيفة'
                      : password.length < 8
                      ? 'مقبولة'
                      : 'قوية'}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                className="mt-2"
              >
                إنشاء حساب
              </Button>
            </form>
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-gray-500 font-cairo mt-6">
            لديك حساب بالفعل؟{' '}
            <Link href="/login" className="text-[#1B3A6B] font-semibold hover:underline">
              تسجيل الدخول
            </Link>
          </p>

          <p className="text-center text-xs text-gray-400 font-cairo mt-3">
            بإنشاء حساب، أنت توافق على{' '}
            <button className="underline hover:text-gray-600">شروط الاستخدام</button>
            {' '}و{' '}
            <button className="underline hover:text-gray-600">سياسة الخصوصية</button>
          </p>
        </div>
      </div>
    </div>
  );
}
