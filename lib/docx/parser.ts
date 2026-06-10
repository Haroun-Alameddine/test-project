import mammoth from 'mammoth'
import type { ParsedBook, BookUnit, BookLesson, BookSection } from '@/types'

// ─── Raw Content ──────────────────────────────────────────────────────────────

export interface RawDocxContent {
  html: string
  text: string
  messages: any[]
}

// ─── Parse Functions ──────────────────────────────────────────────────────────

export async function parseDocxBuffer(buffer: ArrayBuffer): Promise<RawDocxContent> {
  try {
    const result = await mammoth.convertToHtml({ arrayBuffer: buffer })
    const textResult = await mammoth.extractRawText({ arrayBuffer: buffer })
    return {
      html: result.value,
      text: textResult.value,
      messages: result.messages,
    }
  } catch (error) {
    console.error('Error parsing DOCX buffer:', error)
    throw new Error(`Failed to parse Word file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function parseDocxFile(file: File): Promise<RawDocxContent> {
  try {
    const buffer = await file.arrayBuffer()
    return parseDocxBuffer(buffer)
  } catch (error) {
    console.error('Error parsing DOCX file:', error)
    throw new Error(`Failed to read Word file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// ─── Arabic Section Keywords ──────────────────────────────────────────────────

const SECTION_KEYWORDS: Array<{ pattern: RegExp; type: BookSection['type'] }> = [
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

function detectSectionType(text: string): BookSection['type'] | null {
  const trimmed = text.trim()
  for (const { pattern, type } of SECTION_KEYWORDS) {
    if (pattern.test(trimmed)) return type
  }
  return null
}

// ─── HTML Parsing ─────────────────────────────────────────────────────────────

interface HtmlNode {
  tag: string
  text: string
  html: string
}

function parseHtmlNodes(html: string): HtmlNode[] {
  // Simple tag-based parser for server-safe HTML parsing
  const nodes: HtmlNode[] = []
  // Match opening tag + content
  const tagRegex = /<(h1|h2|h3|h4|p|table|ul|ol|li|tr|td|th)[^>]*>([\s\S]*?)<\/\1>/gi
  let match: RegExpExecArray | null

  // For tables, grab the whole table block first
  const tableRegex = /<table[\s\S]*?<\/table>/gi
  const tables: string[] = []
  let tableMatch: RegExpExecArray | null
  while ((tableMatch = tableRegex.exec(html)) !== null) {
    tables.push(tableMatch[0])
  }

  // Replace tables with placeholder so they don't get double-parsed
  let htmlWithoutTables = html
  tables.forEach((t, i) => {
    htmlWithoutTables = htmlWithoutTables.replace(t, `<table>__TABLE_${i}__</table>`)
  })

  while ((match = tagRegex.exec(htmlWithoutTables)) !== null) {
    const tag = match[1].toLowerCase()
    const inner = match[2]
    // Strip inner HTML tags to get plain text
    const text = inner.replace(/<[^>]+>/g, '').trim()

    if (tag === 'table') {
      // Find which table this is
      const tableIdx = parseInt(text.replace('__TABLE_', '').replace('__', ''))
      nodes.push({ tag: 'table', text: extractTableText(tables[tableIdx] || ''), html: tables[tableIdx] || '' })
    } else {
      nodes.push({ tag, text, html: match[0] })
    }
  }

  return nodes
}

function extractTableText(tableHtml: string): string {
  const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi
  const cells: string[] = []
  let match: RegExpExecArray | null
  while ((match = cellRegex.exec(tableHtml)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim()
    if (text) cells.push(text)
  }
  return cells.join(' | ')
}

function extractListItems(html: string): string[] {
  const itemRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi
  const items: string[] = []
  let match: RegExpExecArray | null
  while ((match = itemRegex.exec(html)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, '').trim()
    if (text) items.push(text)
  }
  return items
}

// ─── Extract Sections ─────────────────────────────────────────────────────────

export function extractSections(html: string): BookSection[] {
  const nodes = parseHtmlNodes(html)
  const sections: BookSection[] = []

  let currentSection: Partial<BookSection> | null = null

  function flushSection() {
    if (currentSection && (currentSection.title || currentSection.content)) {
      sections.push({
        type: currentSection.type || 'reading_text',
        title: currentSection.title || '',
        content: currentSection.content || '',
        questions: currentSection.questions || [],
        images: currentSection.images || [],
        level: currentSection.level ?? 0,
      })
    }
    currentSection = null
  }

  for (const node of nodes) {
    if (node.tag === 'h1') {
      flushSection()
      currentSection = {
        type: 'title',
        title: node.text,
        content: '',
        questions: [],
        images: [],
        level: 1,
      }
    } else if (node.tag === 'h2') {
      flushSection()
      currentSection = {
        type: 'title',
        title: node.text,
        content: '',
        questions: [],
        images: [],
        level: 2,
      }
    } else if (node.tag === 'h3' || node.tag === 'h4') {
      flushSection()
      const detectedType = detectSectionType(node.text)
      currentSection = {
        type: detectedType || 'title',
        title: node.text,
        content: '',
        questions: [],
        images: [],
        level: node.tag === 'h3' ? 3 : 4,
      }
    } else if (node.tag === 'p') {
      if (!node.text) continue

      if (!currentSection) {
        // Check if this paragraph starts a new section
        const detectedType = detectSectionType(node.text)
        if (detectedType) {
          flushSection()
          currentSection = {
            type: detectedType,
            title: node.text,
            content: '',
            questions: [],
            images: [],
            level: 0,
          }
        } else {
          currentSection = {
            type: 'reading_text',
            title: '',
            content: node.text,
            questions: [],
            images: [],
            level: 0,
          }
        }
      } else {
        // Check if paragraph heading indicates a new section type
        const detectedType = detectSectionType(node.text)
        if (detectedType && !currentSection.content) {
          currentSection.type = detectedType
          if (!currentSection.title) currentSection.title = node.text
        } else {
          if (currentSection.type === 'question') {
            currentSection.questions = [...(currentSection.questions || []), node.text]
          } else {
            currentSection.content = currentSection.content
              ? currentSection.content + '\n' + node.text
              : node.text
          }
        }
      }
    } else if (node.tag === 'table') {
      flushSection()
      currentSection = {
        type: 'table',
        title: '',
        content: node.text,
        questions: [],
        images: [],
        level: 0,
      }
      flushSection()
    } else if (node.tag === 'ul' || node.tag === 'ol') {
      const items = extractListItems(node.html)
      if (items.length > 0) {
        if (!currentSection) {
          currentSection = {
            type: 'reading_text',
            title: '',
            content: items.join('\n• '),
            questions: [],
            images: [],
            level: 0,
          }
        } else {
          const listText = '• ' + items.join('\n• ')
          if (currentSection.type === 'question') {
            currentSection.questions = [...(currentSection.questions || []), ...items]
          } else {
            currentSection.content = currentSection.content
              ? currentSection.content + '\n' + listText
              : listText
          }
        }
      }
    }
  }

  flushSection()

  return sections
}

// ─── Structure Book ───────────────────────────────────────────────────────────

export function structureBook(sections: BookSection[]): ParsedBook {
  const book: ParsedBook = {
    bookTitle: '',
    grade: '',
    units: [],
  }

  let currentUnit: BookUnit | null = null
  let currentLesson: BookLesson | null = null

  function flushLesson() {
    if (currentLesson && currentUnit) {
      currentUnit.lessons.push(currentLesson)
    }
    currentLesson = null
  }

  function flushUnit() {
    flushLesson()
    if (currentUnit) {
      book.units.push(currentUnit)
    }
    currentUnit = null
  }

  for (const section of sections) {
    if (section.type === 'title' && section.level === 1) {
      if (!book.bookTitle) {
        book.bookTitle = section.title
        // Try to extract grade from title
        const gradeMatch = section.title.match(/الصف\s+(\S+)/)
        if (gradeMatch) book.grade = gradeMatch[1]
      } else {
        flushUnit()
        currentUnit = {
          unitTitle: section.title,
          lessons: [],
        }
      }
    } else if (section.type === 'title' && section.level === 2) {
      flushLesson()
      if (!currentUnit) {
        currentUnit = {
          unitTitle: section.title,
          lessons: [],
        }
      } else {
        currentLesson = {
          lessonTitle: section.title,
          sections: [],
        }
      }
    } else if (section.type === 'title' && section.level >= 3) {
      if (!currentUnit) {
        currentUnit = { unitTitle: 'الوحدة الأولى', lessons: [] }
      }
      if (!currentLesson) {
        currentLesson = { lessonTitle: section.title, sections: [] }
      } else {
        // Sub-section heading — treat as a new lesson
        flushLesson()
        currentLesson = { lessonTitle: section.title, sections: [] }
      }
    } else {
      // Regular content section
      if (!currentUnit) {
        currentUnit = { unitTitle: 'الوحدة الأولى', lessons: [] }
      }
      if (!currentLesson) {
        currentLesson = { lessonTitle: '', sections: [] }
      }
      currentLesson.sections.push(section)
    }
  }

  flushUnit()

  // Ensure at least one unit and lesson exist
  if (book.units.length === 0) {
    book.units.push({
      unitTitle: 'الوحدة الأولى',
      lessons: [{ lessonTitle: 'الدرس الأول', sections }],
    })
  }

  // Remove empty lessons
  for (const unit of book.units) {
    unit.lessons = unit.lessons.filter(
      (l) => l.sections.length > 0 || l.lessonTitle
    )
    if (unit.lessons.length === 0) {
      unit.lessons.push({ lessonTitle: 'الدرس الأول', sections: [] })
    }
  }

  return book
}
