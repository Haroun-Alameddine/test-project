import type { ParsedBook, BookSection } from '@/types'

// ─── Analysis Result ──────────────────────────────────────────────────────────

export interface AnalysisResult {
  book: ParsedBook
  confidence: number
  warnings: string[]
  suggestions: string[]
}

// ─── Keyword Classifier ───────────────────────────────────────────────────────

const SECTION_KEYWORD_MAP: Array<{ pattern: RegExp; type: BookSection['type'] }> = [
  { pattern: /أقرأ|قراءة|النص القرائي/, type: 'reading_text' },
  { pattern: /أتذكر|تذكر/, type: 'remember' },
  { pattern: /ألاحظ|لاحظ/, type: 'observe' },
  { pattern: /أطبق|طبّق|تطبيق/, type: 'apply' },
  { pattern: /أكتب|اكتب/, type: 'write' },
  { pattern: /أستنتج|استنتج|خلاصة|استنتاج/, type: 'conclusion' },
  { pattern: /أسئلة|سؤال|أجيب|تدريبات/, type: 'question' },
  { pattern: /مفردات|كلمات جديدة|المعجم/, type: 'vocabulary' },
  { pattern: /نشاطي|نشاط/, type: 'activity' },
]

export function classifySection(text: string, _context?: string): BookSection['type'] {
  const trimmed = text.trim()
  for (const { pattern, type } of SECTION_KEYWORD_MAP) {
    if (pattern.test(trimmed)) return type
  }
  return 'reading_text'
}

// ─── Mock Analysis ────────────────────────────────────────────────────────────

export function mockAnalysis(text: string): AnalysisResult {
  // Extract a rough title from first non-empty line
  const firstLine = text.split('\n').find((l) => l.trim().length > 0) ?? 'كتاب تعليمي'
  const gradeMatch = text.match(/الصف\s+(\S+)/)

  const book: ParsedBook = {
    bookTitle: firstLine.substring(0, 80).trim(),
    grade: gradeMatch ? gradeMatch[1] : 'غير محدد',
    units: [
      {
        unitTitle: 'الوحدة الأولى: التجربة',
        lessons: [
          {
            lessonTitle: 'الدرس الأول: مقدمة',
            sections: [
              {
                type: 'reading_text',
                title: 'أقرأ',
                content:
                  text.substring(0, 300).trim() ||
                  'هذا مثال على نص قرائي يتم استخراجه من ملف الكتاب المحمّل.',
                questions: [],
                images: [],
                level: 0,
              },
              {
                type: 'vocabulary',
                title: 'مفردات الدرس',
                content: 'مفردة ١ — مفردة ٢ — مفردة ٣',
                questions: [],
                images: [],
                level: 0,
              },
              {
                type: 'question',
                title: 'أسئلة للتقويم',
                content: '',
                questions: ['ما الموضوع الرئيسي للنص؟', 'اذكر ثلاث فوائد من الدرس.'],
                images: [],
                level: 0,
              },
            ],
          },
          {
            lessonTitle: 'الدرس الثاني: التطبيق',
            sections: [
              {
                type: 'activity',
                title: 'نشاط',
                content: 'نشاط تطبيقي يتعلق بالمحتوى الدراسي.',
                questions: [],
                images: [],
                level: 0,
              },
              {
                type: 'conclusion',
                title: 'أستنتج',
                content: 'خلاصة ما تعلمناه في هذا الدرس.',
                questions: [],
                images: [],
                level: 0,
              },
            ],
          },
        ],
      },
      {
        unitTitle: 'الوحدة الثانية: الاستكشاف',
        lessons: [
          {
            lessonTitle: 'الدرس الأول: الملاحظة',
            sections: [
              {
                type: 'observe',
                title: 'ألاحظ',
                content: 'نشاط الملاحظة وتسجيل النتائج.',
                questions: [],
                images: [],
                level: 0,
              },
              {
                type: 'apply',
                title: 'أطبق',
                content: 'تطبيق عملي على المفاهيم المدروسة.',
                questions: [],
                images: [],
                level: 0,
              },
            ],
          },
        ],
      },
    ],
  }

  return {
    book,
    confidence: 0.72,
    warnings: [
      'تم استخدام بيانات تجريبية — لا يوجد مفتاح API للذكاء الاصطناعي.',
      'قد لا تعكس البنية المقترحة تنظيم الكتاب الأصلي بدقة كاملة.',
    ],
    suggestions: [
      'تحقق من عناوين الوحدات والدروس وعدّلها إذا لزم الأمر.',
      'راجع أنواع الأقسام وتأكد من توافقها مع محتوى الكتاب.',
    ],
  }
}

// ─── Claude Analysis ──────────────────────────────────────────────────────────

export async function analyzeWithClaude(rawText: string): Promise<AnalysisResult> {
  const isMockMode =
    process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || !process.env.ANTHROPIC_API_KEY

  if (isMockMode) {
    return mockAnalysis(rawText)
  }

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: rawText }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error ?? `HTTP ${response.status}`)
    }

    const data = await response.json()
    return data as AnalysisResult
  } catch (error) {
    console.error('Claude analysis failed, falling back to mock:', error)
    const result = mockAnalysis(rawText)
    result.warnings.unshift(
      `تعذّر الاتصال بخدمة الذكاء الاصطناعي: ${
        error instanceof Error ? error.message : 'خطأ غير معروف'
      }`
    )
    return result
  }
}
