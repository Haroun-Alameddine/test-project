'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import { parseDocxFile } from '@/lib/docx/parser'
import type { RawDocxContent } from '@/lib/docx/parser'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ImportPage() {
  const router = useRouter()

  const [file, setFile] = useState<File | null>(null)
  const [rawContent, setRawContent] = useState<RawDocxContent | null>(null)
  const [pasteText, setPasteText] = useState('')
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file')

  const [parseError, setParseError] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')

  // ─── Dropzone ───────────────────────────────────────────────────────────────

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const dropped = acceptedFiles[0]
    if (!dropped) return

    setParseError(null)
    setFile(dropped)
    setRawContent(null)

    try {
      const content = await parseDocxFile(dropped)
      setRawContent(content)
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'فشل قراءة الملف')
      setFile(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    multiple: false,
    maxSize: 20 * 1024 * 1024,
    onDropRejected: (fileRejections) => {
      const reason = fileRejections[0]?.errors[0]
      if (reason?.code === 'file-invalid-type') {
        setParseError('يُقبل ملف .docx فقط')
      } else if (reason?.code === 'file-too-large') {
        setParseError('حجم الملف يتجاوز 20 MB')
      } else {
        setParseError('ملف غير مقبول')
      }
    },
  })

  // ─── Analyze ────────────────────────────────────────────────────────────────

  async function handleAnalyze() {
    const textToAnalyze = activeTab === 'file' ? rawContent?.text ?? '' : pasteText

    if (!textToAnalyze.trim()) return

    setAnalyzing(true)
    setProgress(0)
    setStatusMsg('جارٍ تجهيز المحتوى...')
    setParseError(null)

    // Simulated progress updates
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 85) {
          const step = Math.random() * 8 + 2
          const next = Math.min(prev + step, 85)
          if (next < 30) setStatusMsg('يتم تحليل محتوى الكتاب بالذكاء الاصطناعي...')
          else if (next < 60) setStatusMsg('جارٍ التعرف على الوحدات والدروس...')
          else setStatusMsg('يتم تصنيف الأقسام والمحتوى...')
          return next
        }
        return prev
      })
    }, 400)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToAnalyze }),
      })

      clearInterval(progressInterval)
      setProgress(95)
      setStatusMsg('جارٍ تنظيم النتائج...')

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error ?? `خطأ ${res.status}`)
      }

      const analysisResult = await res.json()

      // Store result in sessionStorage and navigate
      sessionStorage.setItem('pedabook_analysis', JSON.stringify(analysisResult))
      setProgress(100)
      setStatusMsg('اكتمل التحليل!')

      await new Promise((r) => setTimeout(r, 500))
      router.push('/analysis')
    } catch (err) {
      clearInterval(progressInterval)
      setProgress(0)
      setAnalyzing(false)
      setStatusMsg('')
      setParseError(err instanceof Error ? err.message : 'فشل التحليل')
    }
  }

  // ─── Clear ──────────────────────────────────────────────────────────────────

  function handleClear() {
    setFile(null)
    setRawContent(null)
    setParseError(null)
    setPasteText('')
    setProgress(0)
    setStatusMsg('')
  }

  const hasContent = activeTab === 'file' ? !!rawContent : pasteText.trim().length > 0
  const canAnalyze = hasContent && !analyzing

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          aria-label="رجوع"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-[var(--color-primary)]">استيراد ملف Word</h1>
          <p className="text-sm text-[var(--color-text-muted)]">استورد كتابك من ملف .docx أو الصق النص مباشرة</p>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8 space-y-6">

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[var(--color-border)]">
          <button
            onClick={() => setActiveTab('file')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'file'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            رفع ملف .docx
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'text'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            لصق النص
          </button>
        </div>

        {/* File Drop Tab */}
        {activeTab === 'file' && (
          <div className="space-y-4">
            {!file ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  isDragActive && !isDragReject
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                    : isDragReject
                    ? 'border-[var(--color-error)] bg-[var(--color-error)]/5'
                    : 'border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/3'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    isDragActive ? 'bg-[var(--color-primary)]/10' : 'bg-[var(--color-bg-alt)]'
                  }`}>
                    <svg className="w-7 h-7 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  {isDragActive && !isDragReject ? (
                    <p className="text-[var(--color-primary)] font-medium">أفلت الملف هنا</p>
                  ) : isDragReject ? (
                    <p className="text-[var(--color-error)] font-medium">نوع الملف غير مدعوم</p>
                  ) : (
                    <>
                      <p className="text-[var(--color-text)] font-medium">اسحب ملف .docx وأفلته هنا</p>
                      <p className="text-[var(--color-text-muted)] text-sm">أو انقر للاختيار من جهازك</p>
                      <p className="text-[var(--color-text-subtle)] text-xs">يُقبل: .docx فقط — الحد الأقصى: 20 MB</p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text)] text-sm">{file.name}</p>
                      <p className="text-[var(--color-text-muted)] text-xs">{formatBytes(file.size)}</p>
                      {rawContent && (
                        <p className="text-[var(--color-success)] text-xs mt-0.5">
                          تم القراءة — {rawContent.text.length.toLocaleString('ar-SA')} حرف
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleClear}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors p-1"
                    aria-label="حذف"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {rawContent && rawContent.messages.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-yellow-700 text-xs font-medium mb-1">تنبيهات عند القراءة:</p>
                    {rawContent.messages.slice(0, 3).map((msg, i) => (
                      <p key={i} className="text-yellow-600 text-xs">{msg?.message ?? String(msg)}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Paste Text Tab */}
        {activeTab === 'text' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--color-text)]">
              الصق نص الكتاب
            </label>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="الصق محتوى الكتاب هنا... يمكنك نسخ النص من أي مصدر."
              rows={14}
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] resize-y font-[var(--font-body)]"
              dir="rtl"
            />
            {pasteText.trim() && (
              <p className="text-[var(--color-text-muted)] text-xs text-left">
                {pasteText.length.toLocaleString('ar-SA')} حرف
              </p>
            )}
          </div>
        )}

        {/* Error */}
        {parseError && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 text-sm">{parseError}</p>
          </div>
        )}

        {/* Progress Bar */}
        {analyzing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">{statusMsg}</span>
              <span className="font-medium text-[var(--color-primary)]">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-[var(--color-bg-alt)] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-[var(--color-text-muted)] text-sm animate-pulse">
              يتم تحليل محتوى الكتاب بالذكاء الاصطناعي...
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="flex-1 py-3 px-6 rounded-xl bg-[var(--color-primary)] text-white font-semibold text-sm hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {analyzing ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                جارٍ التحليل...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                </svg>
                تحليل المحتوى
              </>
            )}
          </button>

          {hasContent && !analyzing && (
            <button
              onClick={handleClear}
              className="py-3 px-4 rounded-xl border border-[var(--color-border)] text-[var(--color-text-muted)] text-sm hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)] transition-colors"
            >
              مسح
            </button>
          )}
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-blue-700 text-sm space-y-1">
            <p className="font-medium">كيف يعمل؟</p>
            <p>يستخدم النظام الذكاء الاصطناعي لتحليل محتوى الكتاب وتنظيمه في وحدات ودروس وأقسام، ثم يطبّق تصميماً تلقائياً على الصفحات.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
