'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Plus,
  LogOut,
  Settings,
  ChevronDown,
  Upload,
  FileText,
  LayoutGrid,
  Clock,
  Download,
  Search,
  X,
  User,
  BarChart3,
  BookMarked,
  Sparkles,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Button from '@/components/ui/Button';
import ProjectCard from '@/components/dashboard/ProjectCard';
import CreateProjectWizard from '@/components/dashboard/CreateProjectWizard';
import { useProjectStore } from '@/store/projectStore';
import { bookTypeLabels, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { BookType } from '@/types';
import { useRequireAuth } from '@/hooks/useRequireAuth';

// ─── Mock templates data ─────────────────────────────────────────────────────

const MOCK_TEMPLATES = [
  {
    id: 't1',
    name: 'كتاب لغة عربية - أنيق',
    type: 'arabic_book' as BookType,
    gradient: 'from-[#1B3A6B] to-[#2a5298]',
    accent: '#C9A227',
    desc: 'تصميم كلاسيكي بالأزرق والذهبي',
  },
  {
    id: 't2',
    name: 'كتاب علوم - حديث',
    type: 'science_book' as BookType,
    gradient: 'from-[#1A6B3C] to-[#2d9b5a]',
    accent: '#8BC34A',
    desc: 'تصميم علمي بالأخضر',
  },
  {
    id: 't3',
    name: 'دليل معلم احترافي',
    type: 'teacher_guide' as BookType,
    gradient: 'from-[#6B1A5A] to-[#9b2d84]',
    accent: '#E91E8C',
    desc: 'دليل تدريسي شامل',
  },
  {
    id: 't4',
    name: 'مخطط دراسي سنوي',
    type: 'planner' as BookType,
    gradient: 'from-[#C75000] to-[#f57c00]',
    accent: '#FFC107',
    desc: 'منظم للفصل الدراسي',
  },
  {
    id: 't5',
    name: 'دفتر تمارين تفاعلي',
    type: 'notebook' as BookType,
    gradient: 'from-[#1565C0] to-[#1976D2]',
    accent: '#42A5F5',
    desc: 'تمارين وأنشطة متنوعة',
  },
  {
    id: 't6',
    name: 'كتاب مساعد مراجعة',
    type: 'support_book' as BookType,
    gradient: 'from-[#4A1565] to-[#7b1fa2]',
    accent: '#9C27B0',
    desc: 'مراجعة شاملة للمنهج',
  },
];

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: <LayoutGrid size={16} /> },
  { href: '/dashboard', label: 'مشاريعي', icon: <BookOpen size={16} /> },
  { href: '/templates', label: 'القوالب', icon: <BookMarked size={16} /> },
  { href: '/import', label: 'استيراد Word', icon: <Upload size={16} /> },
];

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth();
  const { projects, deleteProject, duplicateProject, updateProject } = useProjectStore();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNav, setActiveNav] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.docx') || file.name.endsWith('.doc'))) {
      router.push('/import');
    }
  }, [router]);

  // ── All hooks above this line ──────────────────────────────────────────────
  if (authLoading) return null;

  function handleLogout() {
    localStorage.removeItem('pedabook_user');
    localStorage.removeItem('pedabook_remember');
    router.push('/login');
  }

  function handleRename(id: string, name: string) {
    updateProject(id, { name });
  }

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookTypeLabels[p.bookType]?.includes(searchQuery)
  );

  // Stats
  const totalPages = projects.reduce((acc, p) => acc + p.pages.length, 0);
  const totalExports = Math.floor(projects.length * 1.4);

  const displayName = user?.name ?? 'مستخدم';
  const initials = displayName.slice(0, 2);

  return (
    <div className="min-h-screen bg-[#f4f6fb]" dir="rtl">
      {/* ── Top Navigation ─────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 bg-[#1B3A6B] rounded-xl flex items-center justify-center shadow-sm">
                <BookOpen className="text-[#C9A227]" size={20} />
              </div>
              <span className="font-bold text-[#1B3A6B] font-cairo text-lg hidden sm:block">
                Pedabook
              </span>
            </div>

            {/* Nav links - desktop */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveNav(i); router.push(item.href); }}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-cairo font-medium transition-colors',
                    activeNav === i
                      ? 'bg-[#1B3A6B]/10 text-[#1B3A6B]'
                      : 'text-gray-600 hover:text-[#1B3A6B] hover:bg-gray-100'
                  )}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={15} />}
                onClick={() => setWizardOpen(true)}
                className="hidden sm:inline-flex"
              >
                مشروع جديد
              </Button>

              {/* User dropdown */}
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none">
                    <div className="w-8 h-8 bg-[#1B3A6B] rounded-full flex items-center justify-center text-white text-xs font-bold font-cairo">
                      {initials}
                    </div>
                    <span className="text-sm font-cairo text-gray-700 hidden sm:block max-w-24 truncate">
                      {displayName}
                    </span>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={6}
                    className="z-50 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 animate-in fade-in-0 zoom-in-95 duration-100"
                  >
                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                      <p className="text-sm font-bold font-cairo text-[#1B3A6B]">{displayName}</p>
                      <p className="text-xs text-gray-500 font-cairo">{user?.email}</p>
                    </div>
                    <DropdownMenu.Item className="flex items-center gap-2.5 px-3 py-2 text-sm font-cairo text-gray-700 hover:bg-gray-50 cursor-pointer focus:outline-none focus:bg-gray-50">
                      <User size={14} />
                      الملف الشخصي
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className="flex items-center gap-2.5 px-3 py-2 text-sm font-cairo text-gray-700 hover:bg-gray-50 cursor-pointer focus:outline-none focus:bg-gray-50">
                      <Settings size={14} />
                      الإعدادات
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
                    <DropdownMenu.Item
                      onSelect={handleLogout}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-cairo text-red-600 hover:bg-red-50 cursor-pointer focus:outline-none focus:bg-red-50"
                    >
                      <LogOut size={14} />
                      تسجيل الخروج
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Main content ───────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Hero Section ─────────────────────────────── */}
        <div className="bg-gradient-to-br from-[#1B3A6B] to-[#2a5298] rounded-2xl p-7 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="hero-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hero-dots)" />
            </svg>
          </div>
          <div className="absolute -left-8 -top-8 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -right-12 -bottom-12 w-56 h-56 bg-white/5 rounded-full" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold font-cairo mb-1">
                مرحباً {displayName}! 👋
              </h1>
              <p className="text-blue-200 font-cairo text-sm">
                {projects.length === 0
                  ? 'ابدأ مشروعك الأول وأنشئ كتابك التعليمي الآن'
                  : `لديك ${projects.length} مشروع${projects.length > 1 ? 'اً' : ''} — استمر في الإبداع!`}
              </p>
            </div>
            <Button
              variant="gold"
              size="lg"
              icon={<Plus size={18} />}
              onClick={() => setWizardOpen(true)}
            >
              إنشاء كتاب جديد
            </Button>
          </div>
        </div>

        {/* ── Stats Bar ────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              icon: <BookOpen size={20} />,
              label: 'المشاريع',
              value: projects.length,
              color: 'text-[#1B3A6B]',
              bg: 'bg-[#1B3A6B]/10',
            },
            {
              icon: <FileText size={20} />,
              label: 'الصفحات',
              value: totalPages || projects.length * 40,
              color: 'text-[#C9A227]',
              bg: 'bg-[#C9A227]/10',
            },
            {
              icon: <Download size={20} />,
              label: 'التصديرات',
              value: totalExports,
              color: 'text-green-600',
              bg: 'bg-green-100',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4"
            >
              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', stat.bg, stat.color)}>
                {stat.icon}
              </div>
              <div>
                <div className={cn('text-2xl font-bold font-cairo', stat.color)}>{stat.value}</div>
                <div className="text-xs text-gray-500 font-cairo">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Recent Projects ───────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[#1B3A6B]" />
              <h2 className="text-lg font-bold text-[#1B3A6B] font-cairo">المشاريع الأخيرة</h2>
              <span className="bg-[#1B3A6B]/10 text-[#1B3A6B] text-xs font-cairo px-2 py-0.5 rounded-full font-semibold">
                {projects.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="بحث في المشاريع..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-9 py-2 text-sm font-cairo bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/20 focus:border-[#1B3A6B] w-44 sm:w-56"
                  dir="rtl"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={<Plus size={14} />}
                onClick={() => setWizardOpen(true)}
              >
                جديد
              </Button>
            </div>
          </div>

          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={deleteProject}
                  onDuplicate={duplicateProject}
                  onRename={handleRename}
                />
              ))}
              {/* Add new card */}
              <button
                onClick={() => setWizardOpen(true)}
                className="group border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 p-8 min-h-[220px] hover:border-[#1B3A6B]/40 hover:bg-[#1B3A6B]/5 transition-all duration-200"
              >
                <div className="w-12 h-12 bg-gray-100 group-hover:bg-[#1B3A6B]/10 rounded-xl flex items-center justify-center transition-colors">
                  <Plus size={22} className="text-gray-400 group-hover:text-[#1B3A6B]" />
                </div>
                <span className="text-sm font-cairo text-gray-400 group-hover:text-[#1B3A6B] font-medium transition-colors">
                  مشروع جديد
                </span>
              </button>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              {searchQuery ? (
                <>
                  <Search size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-cairo mb-2">لا توجد مشاريع تطابق "{searchQuery}"</p>
                  <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>مسح البحث</Button>
                </>
              ) : (
                <>
                  <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-700 font-cairo mb-2">لا توجد مشاريع بعد</h3>
                  <p className="text-gray-500 font-cairo text-sm mb-4">ابدأ مشروعك الأول الآن</p>
                  <Button variant="primary" icon={<Plus size={16} />} onClick={() => setWizardOpen(true)}>
                    إنشاء مشروع جديد
                  </Button>
                </>
              )}
            </div>
          )}
        </section>

        {/* ── Quick Templates ───────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[#C9A227]" />
              <h2 className="text-lg font-bold text-[#1B3A6B] font-cairo">قوالب جاهزة</h2>
            </div>
            <button
              onClick={() => router.push('/templates')}
              className="text-sm text-[#1B3A6B] hover:underline font-cairo font-semibold"
            >
              عرض الكل
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'thin' }}>
            {MOCK_TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                className="shrink-0 w-48 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer group"
              >
                {/* Thumbnail */}
                <div className={cn('h-28 bg-gradient-to-br relative flex items-center justify-center', tpl.gradient)}>
                  <div className="opacity-20">
                    <BookOpen size={32} className="text-white" />
                  </div>
                  <div className="absolute inset-3 flex flex-col gap-1.5 opacity-20">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-white/60 h-1.5 rounded" style={{ width: `${55 + (i % 3) * 15}%` }} />
                    ))}
                  </div>
                  <div
                    className="absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-white/50"
                    style={{ background: tpl.accent }}
                  />
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-xs font-bold text-[#1B3A6B] font-cairo truncate">{tpl.name}</p>
                  <p className="text-xs text-gray-400 font-cairo mt-0.5 truncate">{tpl.desc}</p>
                  <button
                    onClick={() => router.push('/templates')}
                    className="mt-2 w-full py-1.5 text-xs font-cairo font-semibold text-[#1B3A6B] bg-[#1B3A6B]/8 hover:bg-[#1B3A6B] hover:text-white rounded-lg transition-colors"
                  >
                    استخدم القالب
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Import Section ────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Upload size={18} className="text-[#1B3A6B]" />
            <h2 className="text-lg font-bold text-[#1B3A6B] font-cairo">استيراد ملف</h2>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200',
              isDragOver
                ? 'border-[#1B3A6B] bg-[#1B3A6B]/5 scale-[1.01]'
                : 'border-gray-200 bg-white hover:border-[#1B3A6B]/40 hover:bg-gray-50'
            )}
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center transition-colors',
                  isDragOver ? 'bg-[#1B3A6B]/10 text-[#1B3A6B]' : 'bg-gray-100 text-gray-400'
                )}
              >
                <Upload size={24} />
              </div>
              <div>
                <p className="font-bold text-gray-700 font-cairo">
                  {isDragOver ? 'أفلت الملف هنا' : 'اسحب وأفلت ملف Word هنا'}
                </p>
                <p className="text-sm text-gray-500 font-cairo mt-1">
                  يدعم ملفات .docx و .doc
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-px w-16 bg-gray-200" />
                <span className="text-xs text-gray-400 font-cairo">أو</span>
                <div className="h-px w-16 bg-gray-200" />
              </div>
              <Button
                variant="secondary"
                size="md"
                icon={<FileText size={16} />}
                onClick={() => fileInputRef.current?.click()}
              >
                استيراد من Word
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.doc"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    e.target.value = '';
                    router.push('/import');
                  }
                }}
              />
            </div>
          </div>
        </section>

        {/* Footer spacer */}
        <div className="h-8" />
      </main>

      {/* ── Wizard Modal ─────────────────────────────── */}
      <CreateProjectWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />
    </div>
  );
}
