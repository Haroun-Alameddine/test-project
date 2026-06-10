import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { ParsedBook } from '@/types'
import type { AnalysisResult } from '@/lib/ai/analyzer'

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `أنت محلل محتوى تعليمي متخصص في الكتب العربية المدرسية.
مهمتك: تحليل نص كتاب مدرسي عربي وإرجاع بنية JSON منظمة تمثل محتوى الكتاب.

يجب أن يكون الإخراج JSON صالحاً فقط — لا نص إضافي، لا شرح، لا تعليقات.

البنية المطلوبة:
{
  "book": {
    "bookTitle": "string",
    "grade": "string",
    "units": [
      {
        "unitTitle": "string",
        "lessons": [
          {
            "lessonTitle": "string",
            "sections": [
              {
                "type": "reading_text|activity|question|remember|observe|apply|write|conclusion|vocabulary|table|image|title",
                "title": "string",
                "content": "string",
                "questions": ["string"],
                "images": [],
                "level": 0
              }
            ]
          }
        ]
      }
    ]
  },
  "confidence": 0.0,
  "warnings": ["string"],
  "suggestions": ["string"]
}

قواعد تحديد نوع القسم (type):
- "أقرأ" أو "قراءة" أو "النص القرائي" → reading_text
- "أتذكر" أو "تذكر" → remember
- "ألاحظ" أو "لاحظ" → observe
- "أطبق" أو "تطبيق" → apply
- "أكتب" → write
- "أستنتج" أو "خلاصة" → conclusion
- "أسئلة" أو "تدريبات" → question
- "مفردات" → vocabulary
- "نشاط" أو "نشاطي" → activity
- عناوين الوحدات → title (level:1)
- عناوين الدروس → title (level:2)
- عناوين الأقسام → title (level:3)

قدّر confidence من 0 إلى 1 بناءً على وضوح البنية.
أضف تحذيرات (warnings) إذا كان المحتوى غير واضح.
أضف اقتراحات (suggestions) لتحسين البنية.`

// ─── Mock fallback ────────────────────────────────────────────────────────────

function buildMockResult(text: string): AnalysisResult {
  const firstLine = text.split('\n').find((l) => l.trim().length > 0) ?? 'كتاب تعليمي'
  const gradeMatch = text.match(/الصف\s+(\S+)/)

  const book: ParsedBook = {
    bookTitle: firstLine.substring(0, 80).trim(),
    grade: gradeMatch ? gradeMatch[1] : 'غير محدد',
    units: [
      {
        unitTitle: 'الوحدة الأولى',
        lessons: [
          {
            lessonTitle: 'الدرس الأول',
            sections: [
              {
                type: 'reading_text',
                title: 'أقرأ',
                content: text.substring(0, 400).trim(),
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
    confidence: 0.6,
    warnings: ['تم استخدام البيانات التجريبية — لا يوجد مفتاح API أو وضع Mock مفعّل.'],
    suggestions: ['أضف مفتاح ANTHROPIC_API_KEY للحصول على تحليل حقيقي.'],
  }
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const text: string = body.text ?? ''

    if (!text.trim()) {
      return NextResponse.json(
        { error: 'لا يوجد نص للتحليل' },
        { status: 400 }
      )
    }

    // Truncate very long texts to avoid token limits
    const truncatedText = text.length > 15_000 ? text.substring(0, 15_000) + '\n...[النص مختصر]' : text

    const apiKey = process.env.ANTHROPIC_API_KEY
    const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'

    if (isMockMode || !apiKey) {
      return NextResponse.json(buildMockResult(truncatedText))
    }

    const client = new Anthropic({ apiKey })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `حلّل هذا النص وأخرج JSON منظماً:\n\n${truncatedText}`,
        },
      ],
    })

    // Extract text content from response
    const responseText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { type: 'text'; text: string }).text)
      .join('')

    // Parse JSON — try to extract JSON from the response
    let result: AnalysisResult
    try {
      // Remove markdown code fences if present
      const cleaned = responseText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim()

      const parsed = JSON.parse(cleaned)
      result = parsed as AnalysisResult

      // Validate required fields
      if (!result.book || !result.book.bookTitle === undefined) {
        throw new Error('Missing required book fields')
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', parseError)
      console.error('Raw response:', responseText.substring(0, 500))
      // Fall back to mock
      result = buildMockResult(truncatedText)
      result.warnings.unshift('تعذّر تحليل استجابة الذكاء الاصطناعي — تم استخدام البيانات التجريبية.')
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Analysis route error:', error)

    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'مفتاح API غير صالح أو منتهي الصلاحية' },
          { status: 401 }
        )
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'تجاوزت حد الطلبات — حاول مجدداً بعد قليل' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: `خطأ في التحليل: ${error instanceof Error ? error.message : 'خطأ غير معروف'}` },
      { status: 500 }
    )
  }
}
