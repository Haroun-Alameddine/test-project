'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useProjectStore } from '@/store/projectStore'
import { autoLayoutBook } from '@/lib/layout/autoLayout'
import { defaultDocumentSettings, defaultTheme } from '@/lib/utils'
import type { AnalysisResult } from '@/lib/ai/analyzer'
import type { ParsedBook, BookSection } from '@/types'

// ─── Section type badge ────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  reading_text: 'bg-blue-100 text-blue-700',
  activity: 'bg-yellow-100 text-yellow-700',
  question: 'bg-purple-100 text-purple-700',
  remember: 'bg-green-100 text-green-700',
  observe: 'bg-teal-100 text-teal-700',
  apply: 'bg-orange-100 text-orange-700',
  write: 'bg-pink-100 text-pink-700',
  conclusion: 'bg-indigo-100 text-indigo-700',
  vocabulary: 'bg-emerald-100 text-emerald-700',
  table: 'bg-gray-100 text-gray-700',
  image: 'bg-slate-100 text-slate-700',
  title: 'bg-red-100 text-red-700',
}

const TYPE_LABELS: Record<string, string> = {
  reading_text: 'نص قرائي',
  activity: 'نشاط',
  question: 'أسئلة',
  remember: 'تذكر',
  observe: 'ألاحظ',
  apply: 'أطبق',
  write: 'اكتب',
  conclusion: 'خلاصة',
  vocabulary: 'مفردات',
  table: 'جدول',
  image: 'صورة',
  title: 'عنوان',
}

function SectionBadge({ type }: { type: BookSection['type'] }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-600'}`}>
      {TYPE_LABELS[type] ?? type}
    </span>
  )
}

// ─── Confidence bar ───────────────────────────────────────────────────────────

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-[var(--color-text-muted)] w-8 text-left">{pct}%</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalysisPage() {
  const router = useRouter()
  const addProject = useProjectStore((s) => s.addProject)

  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editJson, setEditJson] = useState('')
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [expandedUnits, setExpandedUnits] = useState<Set<number>>(new Set([0]))
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set())
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('pedabook_analysis')
    if (!stored) {
      router.replace('/import')
      return
    }
    try {
      const parsed = JSON.parse(stored) as AnalysisResult
      setResult(parsed)
      setEditJson(JSON.stringify(parsed.book, null, 2))
    } catch {
      router.replace('/import')
    }
  }, [router])

  // ─── Toggle accordion ──────────────────────────────────────────────────────

  function toggleUnit(index: number) {
    setExpandedUnits((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function toggleLesson(key: string) {
    setExpandedLessons((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // ─── Edit JSON ─────────────────────────────────────────────────────────────

  function handleJsonSave() {
    try {
      const parsed = JSON.parse(editJson) as ParsedBook
      if (!parsed.bookTitle && !parsed.units) throw new Error('بنية JSON غير صالحة')
      setResult((prev) => prev ? { ...prev, book: parsed } : prev)
      setJsonError(null)
      setEditMode(false)
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'JSON غير صالح')
    }
  }

  // ─── Apply to project ──────────────────────────────────────────────────────

  const handleApply = useCallback(async () => {
    if (!result) return
    setApplying(true)

    try {
      const book = result.book

      // Create a new project shell
      const projectData = {
        name: book.bookTitle || 'مشروع جديد',
        bookType: 'arabic_book' as const,
        grade: book.grade || '',
        documentSettings: { ...defaultDocumentSettings },
        theme: { ...defaultTheme },
        fonts: ['Cairo', 'Tajawal'],
        styles: [],
        pages: [],
      }

      const project = addProject(projectData)

      // Auto-layout
      const pages = autoLayoutBook(book, project, {
        templateId: 'default',
        maxTextPerPage: 800,
      })

      // Update project with pages
      const { updateProject } = useProjectStore.getState()
      updateProject(project.id, { pages })

      // Navigate to editor
      router.push(`/editor/${project.id}`)
    } catch (err) {
      console.error('Apply failed:', err)
      setApplying(false)
    }
  }, [result, addProject, router])

  // ─── Re-analyze ────────────────────────────────────────────────────────────

  function handleReanalyze() {
    sessionStorage.removeItem('pedabook_analysis')
    router.push('/import')
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  if (!result) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 animate-spin text-[var(--color-primary)]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-[var(--color-text-muted)]">جارٍ تحميل النتائج...</p>
        </div>
      </div>
    )
  }

  const { book } = result
  const totalLessons = book.units.reduce((acc, u) => acc + u.lessons.length, 0)
  const totalSections = book.units.reduce(
    (acc, u) => acc + u.lessons.reduce((a, l) => a + l.sections.length, 0),
    0
  )

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/import')}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            aria-label="رجوع"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-primary)]">نتائج التحليل</h1>
            <p className="text-sm text-[var(--color-text-muted)]">راجع البنية المقترحة وطبّقها على مشروع</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReanalyze}
            className="py-2 px-4 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)] transition-colors"
          >
            إعادة التحليل
          </button>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`py-2 px-4 rounded-lg border text-sm transition-colors ${
              editMode
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/5'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {editMode ? 'إخفاء المحرر' : 'تعديل يدوي'}
          </button>
          <button
            onClick={handleApply}
            disabled={applying}
            className="py-2 px-5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {applying ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                جارٍ التطبيق...
              </>
            ) : (
              'تطبيق على المشروع'
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-6 space-y-6">

        {/* Book Meta */}
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-primary)]">{book.bookTitle || 'بدون عنوان'}</h2>
              {book.grade && (
                <p className="text-[var(--color-text-muted)] mt-1">الصف: {book.grade}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-[var(--color-text-muted)]">
                <span><strong className="text-[var(--color-text)]">{book.units.length}</strong> وحدة</span>
                <span><strong className="text-[var(--color-text)]">{totalLessons}</strong> درس</span>
                <span><strong className="text-[var(--color-text)]">{totalSections}</strong> قسم</span>
              </div>
            </div>
            <div className="min-w-[140px]">
              <p className="text-xs text-[var(--color-text-muted)] mb-1">دقة التحليل</p>
              <ConfidenceBar value={result.confidence} />
            </div>
          </div>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg space-y-1">
              {result.warnings.map((w, i) => (
                <p key={i} className="text-yellow-700 text-xs flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {w}
                </p>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg space-y-1">
              {result.suggestions.map((s, i) => (
                <p key={i} className="text-blue-700 text-xs flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {s}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* JSON Editor */}
        {editMode && (
          <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5 space-y-3">
            <h3 className="font-semibold text-[var(--color-text)]">تعديل JSON يدوياً</h3>
            <textarea
              value={editJson}
              onChange={(e) => { setEditJson(e.target.value); setJsonError(null) }}
              rows={18}
              className="w-full rounded-lg border border-[var(--color-border)] bg-gray-50 px-4 py-3 text-xs font-mono text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 resize-y"
              dir="ltr"
            />
            {jsonError && (
              <p className="text-red-600 text-sm">{jsonError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleJsonSave}
                className="py-2 px-4 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                حفظ التعديلات
              </button>
              <button
                onClick={() => { setEditMode(false); setJsonError(null) }}
                className="py-2 px-4 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Units accordion */}
        <div className="space-y-3">
          {book.units.map((unit, ui) => (
            <div key={ui} className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden">
              {/* Unit header */}
              <button
                onClick={() => toggleUnit(ui)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--color-bg-alt)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {ui + 1}
                  </div>
                  <span className="font-semibold text-[var(--color-text)]">{unit.unitTitle || `الوحدة ${ui + 1}`}</span>
                  <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-alt)] px-2 py-0.5 rounded-full">
                    {unit.lessons.length} دروس
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 text-[var(--color-text-muted)] transition-transform ${expandedUnits.has(ui) ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Unit content */}
              {expandedUnits.has(ui) && (
                <div className="border-t border-[var(--color-border)] divide-y divide-[var(--color-border-subtle)]">
                  {unit.lessons.map((lesson, li) => {
                    const lessonKey = `${ui}-${li}`
                    const isExpanded = expandedLessons.has(lessonKey)

                    return (
                      <div key={li}>
                        {/* Lesson header */}
                        <button
                          onClick={() => toggleLesson(lessonKey)}
                          className="w-full flex items-center justify-between px-5 py-3 hover:bg-[var(--color-bg-alt)] transition-colors"
                        >
                          <div className="flex items-center gap-3 mr-8">
                            <div className="w-6 h-6 rounded-md bg-[var(--color-secondary)]/20 text-[var(--color-secondary-dark)] flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {li + 1}
                            </div>
                            <span className="font-medium text-[var(--color-text)] text-sm">
                              {lesson.lessonTitle || `الدرس ${li + 1}`}
                            </span>
                            <span className="text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-alt)] px-2 py-0.5 rounded-full">
                              {lesson.sections.length} أقسام
                            </span>
                          </div>
                          <svg
                            className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Sections */}
                        {isExpanded && (
                          <div className="px-5 pb-4 space-y-2 mr-14">
                            {lesson.sections.length === 0 ? (
                              <p className="text-[var(--color-text-subtle)] text-sm italic">لا توجد أقسام</p>
                            ) : (
                              lesson.sections.map((section, si) => (
                                <div
                                  key={si}
                                  className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-bg-alt)] hover:bg-[var(--color-bg)] transition-colors"
                                >
                                  <SectionBadge type={section.type} />
                                  <div className="flex-1 min-w-0">
                                    {section.title && (
                                      <p className="font-medium text-[var(--color-text)] text-sm truncate">{section.title}</p>
                                    )}
                                    {section.content && (
                                      <p className="text-[var(--color-text-muted)] text-xs mt-0.5 line-clamp-2">{section.content}</p>
                                    )}
                                    {section.questions.length > 0 && (
                                      <p className="text-[var(--color-text-subtle)] text-xs mt-0.5">
                                        {section.questions.length} سؤال
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="sticky bottom-4 flex justify-center pt-2">
          <button
            onClick={handleApply}
            disabled={applying}
            className="py-3 px-8 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-sm shadow-lg hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl flex items-center gap-2"
          >
            {applying ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                جارٍ إنشاء المشروع وتطبيق التصميم...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                تطبيق على المشروع وفتح المحرر
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  )
}
