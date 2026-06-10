import type {
  ParsedBook,
  Project,
  ProjectPage,
  CanvasObject,
  PageTemplateType,
  BookSection,
  TextObjectData,
  ShapeObjectData,
} from '@/types'
import { generateId } from '@/lib/utils'

// ─── Layout Options ───────────────────────────────────────────────────────────

export interface LayoutOptions {
  templateId: string
  maxTextPerPage: number // characters
}

const DEFAULT_OPTIONS: LayoutOptions = {
  templateId: 'default',
  maxTextPerPage: 800,
}

// ─── Page Dimensions (mm → px at 96dpi) ──────────────────────────────────────

function mmToPx(mm: number): number {
  return Math.round((mm / 25.4) * 96)
}

// ─── Helper: create a base page ───────────────────────────────────────────────

function basePage(
  pageNumber: number,
  templateType: PageTemplateType,
  project: Project
): ProjectPage {
  return {
    id: generateId(),
    pageNumber,
    templateType,
    width: mmToPx(project.documentSettings.width),
    height: mmToPx(project.documentSettings.height),
    background: project.theme.colors.background,
    objects: [],
  }
}

// ─── Helper: create a text object ────────────────────────────────────────────

function makeTextObject(
  id: string,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  options: Partial<TextObjectData> & { zIndex?: number } = {}
): CanvasObject {
  const data: TextObjectData = {
    text,
    style: {
      fontFamily: options.style?.fontFamily ?? 'Cairo',
      fontSize: options.style?.fontSize ?? 14,
      fontWeight: options.style?.fontWeight ?? '400',
      color: options.style?.color ?? '#1C1C1C',
      align: options.style?.align ?? 'right',
      direction: 'rtl',
      lineHeight: options.style?.lineHeight ?? 1.8,
      letterSpacing: options.style?.letterSpacing ?? 0,
      paragraphSpacing: options.style?.paragraphSpacing ?? 10,
    },
    padding: options.padding ?? { top: 8, right: 8, bottom: 8, left: 8 },
    background: options.background ?? 'transparent',
    borderColor: options.borderColor ?? 'transparent',
    borderWidth: options.borderWidth ?? 0,
    borderRadius: options.borderRadius ?? 0,
  }

  return {
    id,
    type: 'text',
    x,
    y,
    width,
    height,
    rotation: 0,
    locked: false,
    visible: true,
    zIndex: options.zIndex ?? 1,
    data,
  }
}

// ─── Helper: create a shape/background object ─────────────────────────────────

function makeShapeObject(
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  zIndex = 0
): CanvasObject {
  const data: ShapeObjectData = {
    shape: 'rect',
    fill,
    stroke: 'transparent',
    strokeWidth: 0,
    borderRadius: 0,
  }
  return {
    id,
    type: 'shape',
    x,
    y,
    width,
    height,
    rotation: 0,
    locked: false,
    visible: true,
    zIndex,
    data,
  }
}

// ─── Page Templates ───────────────────────────────────────────────────────────

export function createPageFromTemplate(
  templateType: PageTemplateType,
  content: Partial<BookSection>,
  pageNumber: number,
  project: Project
): ProjectPage {
  const page = basePage(pageNumber, templateType, project)
  const W = page.width
  const H = page.height
  const primary = project.theme.colors.primary
  const secondary = project.theme.colors.secondary
  const margins = {
    top: mmToPx(project.documentSettings.margins.top),
    right: mmToPx(project.documentSettings.margins.right),
    bottom: mmToPx(project.documentSettings.margins.bottom),
    left: mmToPx(project.documentSettings.margins.left),
  }
  const contentW = W - margins.left - margins.right
  const contentH = H - margins.top - margins.bottom

  const objects: CanvasObject[] = []

  switch (templateType) {
    case 'cover': {
      // Full-page background
      objects.push(makeShapeObject(generateId(), 0, 0, W, H, primary, 0))
      // Book title
      objects.push(
        makeTextObject(generateId(), content.title ?? 'عنوان الكتاب', margins.right, H * 0.3, contentW, 80, {
          zIndex: 1,
          style: {
            fontFamily: 'Cairo',
            fontSize: 32,
            fontWeight: '700',
            color: '#FFFFFF',
            align: 'center',
            direction: 'rtl',
            lineHeight: 1.4,
            letterSpacing: 0,
            paragraphSpacing: 0,
          },
        })
      )
      // Grade
      objects.push(
        makeTextObject(
          generateId(),
          content.content ?? '',
          margins.right,
          H * 0.45,
          contentW,
          50,
          {
            zIndex: 1,
            style: {
              fontFamily: 'Cairo',
              fontSize: 20,
              fontWeight: '400',
              color: secondary,
              align: 'center',
              direction: 'rtl',
              lineHeight: 1.4,
              letterSpacing: 0,
              paragraphSpacing: 0,
            },
          }
        )
      )
      break
    }

    case 'back_cover': {
      objects.push(makeShapeObject(generateId(), 0, 0, W, H, primary, 0))
      objects.push(
        makeTextObject(generateId(), 'Pedabook Builder', margins.right, H * 0.5, contentW, 50, {
          zIndex: 1,
          style: {
            fontFamily: 'Cairo',
            fontSize: 16,
            fontWeight: '400',
            color: '#FFFFFF',
            align: 'center',
            direction: 'rtl',
            lineHeight: 1.4,
            letterSpacing: 0,
            paragraphSpacing: 0,
          },
        })
      )
      break
    }

    case 'unit_opener': {
      // Header band
      objects.push(makeShapeObject(generateId(), 0, 0, W, H * 0.35, primary, 0))
      // Unit title
      objects.push(
        makeTextObject(
          generateId(),
          content.title ?? 'عنوان الوحدة',
          margins.right,
          H * 0.1,
          contentW,
          100,
          {
            zIndex: 1,
            style: {
              fontFamily: 'Cairo',
              fontSize: 26,
              fontWeight: '700',
              color: '#FFFFFF',
              align: 'center',
              direction: 'rtl',
              lineHeight: 1.4,
              letterSpacing: 0,
              paragraphSpacing: 0,
            },
          }
        )
      )
      // Content area
      if (content.content) {
        objects.push(
          makeTextObject(generateId(), content.content, margins.right, H * 0.4, contentW, contentH * 0.5, {
            zIndex: 1,
          })
        )
      }
      break
    }

    case 'lesson': {
      // Lesson title bar
      objects.push(makeShapeObject(generateId(), 0, margins.top - 8, W, 60, secondary, 0))
      objects.push(
        makeTextObject(
          generateId(),
          content.title ?? 'عنوان الدرس',
          margins.right,
          margins.top,
          contentW,
          44,
          {
            zIndex: 1,
            style: {
              fontFamily: 'Cairo',
              fontSize: 20,
              fontWeight: '700',
              color: '#FFFFFF',
              align: 'right',
              direction: 'rtl',
              lineHeight: 1.4,
              letterSpacing: 0,
              paragraphSpacing: 0,
            },
          }
        )
      )
      if (content.content) {
        objects.push(
          makeTextObject(
            generateId(),
            content.content,
            margins.right,
            margins.top + 70,
            contentW,
            contentH - 70,
            { zIndex: 1 }
          )
        )
      }
      break
    }

    case 'reading_text': {
      // Title
      objects.push(
        makeTextObject(
          generateId(),
          content.title ?? 'أقرأ',
          margins.right,
          margins.top,
          contentW,
          44,
          {
            zIndex: 1,
            style: {
              fontFamily: 'Cairo',
              fontSize: 18,
              fontWeight: '700',
              color: primary,
              align: 'right',
              direction: 'rtl',
              lineHeight: 1.4,
              letterSpacing: 0,
              paragraphSpacing: 0,
            },
          }
        )
      )
      // Body text
      objects.push(
        makeTextObject(
          generateId(),
          content.content ?? '',
          margins.right,
          margins.top + 50,
          contentW,
          contentH - 50,
          { zIndex: 1 }
        )
      )
      break
    }

    case 'activity': {
      objects.push(makeShapeObject(generateId(), margins.right - 4, margins.top - 4, contentW + 8, contentH + 8, '#FFF8E1', 0))
      objects.push(
        makeTextObject(
          generateId(),
          content.title ?? 'نشاط',
          margins.right,
          margins.top,
          contentW,
          44,
          {
            zIndex: 1,
            style: {
              fontFamily: 'Cairo',
              fontSize: 18,
              fontWeight: '700',
              color: secondary,
              align: 'right',
              direction: 'rtl',
              lineHeight: 1.4,
              letterSpacing: 0,
              paragraphSpacing: 0,
            },
          }
        )
      )
      objects.push(
        makeTextObject(
          generateId(),
          content.content ?? '',
          margins.right,
          margins.top + 50,
          contentW,
          contentH - 50,
          { zIndex: 1 }
        )
      )
      break
    }

    case 'question': {
      objects.push(
        makeTextObject(
          generateId(),
          content.title ?? 'أسئلة',
          margins.right,
          margins.top,
          contentW,
          44,
          {
            zIndex: 1,
            style: {
              fontFamily: 'Cairo',
              fontSize: 18,
              fontWeight: '700',
              color: primary,
              align: 'right',
              direction: 'rtl',
              lineHeight: 1.4,
              letterSpacing: 0,
              paragraphSpacing: 0,
            },
          }
        )
      )
      const questionText = (content.questions ?? []).length > 0
        ? (content.questions ?? []).map((q, i) => `${i + 1}. ${q}`).join('\n')
        : content.content ?? ''
      objects.push(
        makeTextObject(generateId(), questionText, margins.right, margins.top + 50, contentW, contentH - 50, {
          zIndex: 1,
        })
      )
      break
    }

    case 'vocabulary': {
      objects.push(makeShapeObject(generateId(), 0, 0, W, 80, primary, 0))
      objects.push(
        makeTextObject(generateId(), content.title ?? 'مفردات الدرس', margins.right, 18, contentW, 44, {
          zIndex: 1,
          style: {
            fontFamily: 'Cairo',
            fontSize: 20,
            fontWeight: '700',
            color: '#FFFFFF',
            align: 'right',
            direction: 'rtl',
            lineHeight: 1.4,
            letterSpacing: 0,
            paragraphSpacing: 0,
          },
        })
      )
      objects.push(
        makeTextObject(generateId(), content.content ?? '', margins.right, 90, contentW, contentH - 90, {
          zIndex: 1,
        })
      )
      break
    }

    case 'summary': {
      objects.push(
        makeTextObject(
          generateId(),
          content.title ?? 'خلاصة الدرس',
          margins.right,
          margins.top,
          contentW,
          44,
          {
            zIndex: 1,
            style: {
              fontFamily: 'Cairo',
              fontSize: 18,
              fontWeight: '700',
              color: primary,
              align: 'right',
              direction: 'rtl',
              lineHeight: 1.4,
              letterSpacing: 0,
              paragraphSpacing: 0,
            },
          }
        )
      )
      objects.push(
        makeTextObject(
          generateId(),
          content.content ?? '',
          margins.right,
          margins.top + 50,
          contentW,
          contentH - 50,
          { zIndex: 1 }
        )
      )
      break
    }

    default: {
      // empty / table_of_contents / etc.
      if (content.title) {
        objects.push(makeTextObject(generateId(), content.title, margins.right, margins.top, contentW, 44, { zIndex: 1 }))
      }
      if (content.content) {
        objects.push(makeTextObject(generateId(), content.content, margins.right, margins.top + 50, contentW, contentH - 50, { zIndex: 1 }))
      }
    }
  }

  page.objects = objects
  return page
}

// ─── Section → Template mapping ───────────────────────────────────────────────

function sectionToTemplate(type: BookSection['type']): PageTemplateType {
  switch (type) {
    case 'reading_text':
      return 'reading_text'
    case 'activity':
      return 'activity'
    case 'question':
      return 'question'
    case 'vocabulary':
      return 'vocabulary'
    case 'conclusion':
    case 'remember':
    case 'observe':
    case 'apply':
    case 'write':
      return 'summary'
    case 'table':
    case 'image':
    case 'title':
    default:
      return 'lesson'
  }
}

// ─── Split long text into chunks ──────────────────────────────────────────────

function splitTextChunks(text: string, maxChars: number): string[] {
  if (!text || text.length <= maxChars) return [text]
  const chunks: string[] = []
  let remaining = text
  while (remaining.length > maxChars) {
    // Try to break at a paragraph boundary
    let cutAt = remaining.lastIndexOf('\n', maxChars)
    if (cutAt <= 0) cutAt = remaining.lastIndexOf(' ', maxChars)
    if (cutAt <= 0) cutAt = maxChars
    chunks.push(remaining.substring(0, cutAt).trim())
    remaining = remaining.substring(cutAt).trim()
  }
  if (remaining) chunks.push(remaining)
  return chunks
}

// ─── Auto Layout ──────────────────────────────────────────────────────────────

export function autoLayoutBook(
  book: ParsedBook,
  project: Project,
  options: Partial<LayoutOptions> = {}
): ProjectPage[] {
  const opts: LayoutOptions = { ...DEFAULT_OPTIONS, ...options }
  const pages: ProjectPage[] = []
  let pageNumber = 1

  // 1. Cover page
  pages.push(
    createPageFromTemplate(
      'cover',
      {
        title: book.bookTitle || project.name,
        content: book.grade ? `الصف ${book.grade}` : project.grade,
      },
      pageNumber++,
      project
    )
  )

  // 2. Table of contents placeholder
  const tocPage = basePage(pageNumber++, 'table_of_contents', project)
  const tocTitle = makeTextObject(
    generateId(),
    'المحتويات',
    mmToPx(project.documentSettings.margins.right),
    mmToPx(project.documentSettings.margins.top),
    mmToPx(project.documentSettings.width - project.documentSettings.margins.left - project.documentSettings.margins.right),
    60,
    {
      zIndex: 1,
      style: {
        fontFamily: 'Cairo',
        fontSize: 24,
        fontWeight: '700',
        color: project.theme.colors.primary,
        align: 'center',
        direction: 'rtl',
        lineHeight: 1.4,
        letterSpacing: 0,
        paragraphSpacing: 0,
      },
    }
  )
  tocPage.objects = [tocTitle]
  pages.push(tocPage)

  // 3. Units
  for (const unit of book.units) {
    // Unit opener page
    pages.push(
      createPageFromTemplate(
        'unit_opener',
        { title: unit.unitTitle },
        pageNumber++,
        project
      )
    )

    // Lessons
    for (const lesson of unit.lessons) {
      // Lesson page
      pages.push(
        createPageFromTemplate(
          'lesson',
          { title: lesson.lessonTitle, content: '' },
          pageNumber++,
          project
        )
      )

      // Sections
      for (const section of lesson.sections) {
        const templateType = sectionToTemplate(section.type)

        // Handle text overflow — split long content
        const textChunks = splitTextChunks(section.content, opts.maxTextPerPage)

        // First chunk (or only chunk)
        pages.push(
          createPageFromTemplate(
            templateType,
            { ...section, content: textChunks[0] ?? '' },
            pageNumber++,
            project
          )
        )

        // Overflow pages
        for (let i = 1; i < textChunks.length; i++) {
          pages.push(
            createPageFromTemplate(
              templateType,
              { ...section, title: `${section.title} (تابع)`, content: textChunks[i] },
              pageNumber++,
              project
            )
          )
        }
      }
    }
  }

  // 4. Back cover
  pages.push(
    createPageFromTemplate('back_cover', {}, pageNumber, project)
  )

  return pages
}
