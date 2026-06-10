import type { Project, ExportOptions, ProjectPage, CanvasObject, TextObjectData, ShapeObjectData, ImageObjectData } from '@/types'

// ─── InDesign Types ───────────────────────────────────────────────────────────

export interface InDesignProject {
  version: string
  projectName: string
  documentSettings: object
  colorSwatches: object[]
  paragraphStyles: object[]
  characterStyles: object[]
  masterPages: object[]
  pages: InDesignPage[]
  assets: InDesignAsset[]
  fonts: InDesignFont[]
}

export interface InDesignPage {
  pageNumber: number
  width: number
  height: number
  unit: string
  objects: InDesignObject[]
}

export interface InDesignObject {
  id: string
  type: string
  bounds: { x: number; y: number; width: number; height: number }
  rotation: number
  text?: string
  textStyle?: object
  imageRef?: string
  shapeType?: string
  fill?: string
  stroke?: string
}

export interface InDesignAsset {
  id: string
  name: string
  type: string
  src: string
}

export interface InDesignFont {
  name: string
  postScriptName: string
  style: string
}

// ─── Unit conversion ──────────────────────────────────────────────────────────

function pxToMm(px: number): number {
  return (px / 96) * 25.4
}

// ─── Convert a CanvasObject to InDesignObject ─────────────────────────────────

function canvasObjectToInDesign(obj: CanvasObject): InDesignObject {
  const base: InDesignObject = {
    id: obj.id,
    type: obj.type,
    bounds: {
      x: pxToMm(obj.x),
      y: pxToMm(obj.y),
      width: pxToMm(obj.width),
      height: pxToMm(obj.height),
    },
    rotation: obj.rotation,
  }

  switch (obj.type) {
    case 'text': {
      const td = obj.data as TextObjectData
      base.text = td.text
      base.textStyle = {
        fontFamily: td.style.fontFamily,
        fontSize: td.style.fontSize,
        fontWeight: td.style.fontWeight,
        color: td.style.color,
        align: td.style.align,
        direction: td.style.direction,
        lineHeight: td.style.lineHeight,
        paragraphSpacing: td.style.paragraphSpacing,
      }
      break
    }
    case 'image': {
      const imgData = obj.data as ImageObjectData
      base.imageRef = imgData.src
      break
    }
    case 'shape': {
      const shapeData = obj.data as ShapeObjectData
      base.shapeType = shapeData.shape
      base.fill = shapeData.fill
      base.stroke = shapeData.stroke
      break
    }
    default:
      break
  }

  return base
}

// ─── Convert a ProjectPage to InDesignPage ────────────────────────────────────

function pageToInDesign(page: ProjectPage): InDesignPage {
  return {
    pageNumber: page.pageNumber,
    width: pxToMm(page.width),
    height: pxToMm(page.height),
    unit: 'mm',
    objects: page.objects.map(canvasObjectToInDesign),
  }
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function exportToInDesignJSON(project: Project): InDesignProject {
  const { documentSettings, theme } = project

  const colorSwatches = Object.entries(theme.colors).map(([name, value]) => ({
    name,
    model: 'RGB',
    value,
  }))

  const paragraphStyles = [
    {
      name: 'Heading1',
      fontFamily: theme.fonts.heading,
      fontSize: theme.fontSizes.heading1,
      fontWeight: '700',
      color: theme.colors.heading,
      align: 'right',
      direction: 'rtl',
      lineSpacing: theme.lineSpacing,
      paragraphSpacing: theme.paragraphSpacing,
    },
    {
      name: 'Heading2',
      fontFamily: theme.fonts.heading,
      fontSize: theme.fontSizes.heading2,
      fontWeight: '700',
      color: theme.colors.heading,
      align: 'right',
      direction: 'rtl',
      lineSpacing: theme.lineSpacing,
      paragraphSpacing: theme.paragraphSpacing,
    },
    {
      name: 'Heading3',
      fontFamily: theme.fonts.heading,
      fontSize: theme.fontSizes.heading3,
      fontWeight: '600',
      color: theme.colors.heading,
      align: 'right',
      direction: 'rtl',
      lineSpacing: theme.lineSpacing,
      paragraphSpacing: theme.paragraphSpacing,
    },
    {
      name: 'Body',
      fontFamily: theme.fonts.body,
      fontSize: theme.fontSizes.body,
      fontWeight: '400',
      color: theme.colors.text,
      align: 'right',
      direction: 'rtl',
      lineSpacing: theme.lineSpacing,
      paragraphSpacing: theme.paragraphSpacing,
    },
    {
      name: 'Caption',
      fontFamily: theme.fonts.body,
      fontSize: theme.fontSizes.caption,
      fontWeight: '400',
      color: theme.colors.text,
      align: 'center',
      direction: 'rtl',
      lineSpacing: 1.4,
      paragraphSpacing: 6,
    },
  ]

  const characterStyles = [
    { name: 'Bold', fontWeight: '700' },
    { name: 'Italic', fontStyle: 'italic' },
    { name: 'Highlight', backgroundColor: theme.colors.accent },
  ]

  const masterPages = [
    {
      name: 'A-Master',
      basedOn: '',
      width: documentSettings.width,
      height: documentSettings.height,
      unit: documentSettings.unit,
      margins: documentSettings.margins,
    },
  ]

  // Collect unique image assets
  const assetMap = new Map<string, InDesignAsset>()
  for (const page of project.pages) {
    for (const obj of page.objects) {
      if (obj.type === 'image') {
        const imgData = obj.data as ImageObjectData
        if (imgData.src && !assetMap.has(imgData.src)) {
          assetMap.set(imgData.src, {
            id: obj.id,
            name: imgData.alt || `image-${obj.id}`,
            type: 'image',
            src: imgData.src,
          })
        }
      }
    }
  }

  // Collect unique fonts
  const fontSet = new Set<string>()
  fontSet.add(theme.fonts.heading)
  fontSet.add(theme.fonts.body)
  fontSet.add(theme.fonts.ui)
  for (const page of project.pages) {
    for (const obj of page.objects) {
      if (obj.type === 'text') {
        const td = obj.data as TextObjectData
        if (td.style.fontFamily) fontSet.add(td.style.fontFamily)
      }
    }
  }
  const fonts: InDesignFont[] = Array.from(fontSet).map((name) => ({
    name,
    postScriptName: name.replace(/\s+/g, '-'),
    style: 'Regular',
  }))

  return {
    version: '1.0.0',
    projectName: project.name,
    documentSettings: {
      width: documentSettings.width,
      height: documentSettings.height,
      unit: documentSettings.unit,
      orientation: documentSettings.orientation,
      bleed: documentSettings.bleed,
      margins: documentSettings.margins,
      columns: documentSettings.columns,
      gutter: documentSettings.gutter,
    },
    colorSwatches,
    paragraphStyles,
    characterStyles,
    masterPages,
    pages: project.pages.map(pageToInDesign),
    assets: Array.from(assetMap.values()),
    fonts,
  }
}

// ─── ExtendScript Generator ───────────────────────────────────────────────────

export function generateExtendScript(indesign: InDesignProject): string {
  const indent = (n: number) => '    '.repeat(n)
  const lines: string[] = []

  lines.push('// Pedabook Builder — Auto-generated InDesign ExtendScript')
  lines.push('// Run this script in InDesign via File > Scripts > Script Panel')
  lines.push('')
  lines.push('#target indesign')
  lines.push('')
  lines.push('(function() {')
  lines.push(`${indent(1)}// ─── Document settings`)
  lines.push(`${indent(1)}var docSettings = ${JSON.stringify(indesign.documentSettings, null, 2)
    .split('\n').join('\n' + indent(1))};`)
  lines.push('')
  lines.push(`${indent(1)}var doc = app.documents.add();`)
  lines.push(`${indent(1)}var docPrefs = doc.documentPreferences;`)
  const ds = indesign.documentSettings as Record<string, unknown>
  lines.push(`${indent(1)}docPrefs.pageWidth = "${ds['width']}${ds['unit']}";`)
  lines.push(`${indent(1)}docPrefs.pageHeight = "${ds['height']}${ds['unit']}";`)
  lines.push(`${indent(1)}docPrefs.facingPages = false;`)
  lines.push('')

  // Paragraph styles
  lines.push(`${indent(1)}// ─── Paragraph Styles`)
  for (const style of indesign.paragraphStyles) {
    const s = style as Record<string, unknown>
    lines.push(`${indent(1)}try {`)
    lines.push(`${indent(2)}var pStyle = doc.paragraphStyles.add({name: ${JSON.stringify(s.name)}});`)
    if (s.fontSize) lines.push(`${indent(2)}pStyle.pointSize = ${s.fontSize};`)
    if (s.color) lines.push(`${indent(2)}// Color: ${s.color}`)
    lines.push(`${indent(1)}} catch(e) {}`)
  }
  lines.push('')

  // Color swatches
  lines.push(`${indent(1)}// ─── Color Swatches`)
  for (const swatch of indesign.colorSwatches) {
    const sw = swatch as Record<string, unknown>
    const hex = String(sw.value ?? '#000000').replace('#', '')
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    lines.push(`${indent(1)}try {`)
    lines.push(`${indent(2)}var swatch = doc.colors.add();`)
    lines.push(`${indent(2)}swatch.name = ${JSON.stringify(sw.name)};`)
    lines.push(`${indent(2)}swatch.model = ColorModel.PROCESS;`)
    lines.push(`${indent(2)}swatch.space = ColorSpace.RGB;`)
    lines.push(`${indent(2)}swatch.colorValue = [${r}, ${g}, ${b}];`)
    lines.push(`${indent(1)}} catch(e) {}`)
  }
  lines.push('')

  // Pages
  lines.push(`${indent(1)}// ─── Pages`)
  lines.push(`${indent(1)}// Add ${indesign.pages.length} page(s)`)

  for (let pi = 0; pi < indesign.pages.length; pi++) {
    const page = indesign.pages[pi]
    lines.push(`${indent(1)}// Page ${page.pageNumber}`)
    lines.push(`${indent(1)}var page${pi} = (doc.pages.length > ${pi}) ? doc.pages.item(${pi}) : doc.pages.add();`)

    for (const obj of page.objects) {
      const x = obj.bounds.x
      const y = obj.bounds.y
      const w = obj.bounds.width
      const h = obj.bounds.height

      if (obj.type === 'text' && obj.text) {
        const safeText = obj.text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')
        lines.push(`${indent(1)}{`)
        lines.push(`${indent(2)}var tf = page${pi}.textFrames.add();`)
        lines.push(`${indent(2)}tf.geometricBounds = ["${y}mm", "${x}mm", "${y + h}mm", "${x + w}mm"];`)
        lines.push(`${indent(2)}tf.contents = "${safeText}";`)
        lines.push(`${indent(2)}tf.textFramePreferences.textColumnCount = 1;`)

        const ts = obj.textStyle as Record<string, unknown> | undefined
        if (ts) {
          if (ts.direction === 'rtl') {
            lines.push(`${indent(2)}tf.paragraphs.everyItem().paragraphDirection = ParagraphDirectionOptions.RIGHT_TO_LEFT_DIRECTION;`)
          }
          if (ts.fontSize) {
            lines.push(`${indent(2)}tf.paragraphs.everyItem().pointSize = ${ts.fontSize};`)
          }
          if (ts.fontFamily) {
            lines.push(`${indent(2)}try { tf.paragraphs.everyItem().appliedFont = app.fonts.item(${JSON.stringify(ts.fontFamily)}); } catch(e) {}`)
          }
        }
        lines.push(`${indent(1)}}`)
      } else if (obj.type === 'shape') {
        lines.push(`${indent(1)}{`)
        lines.push(`${indent(2)}var rect = page${pi}.rectangles.add();`)
        lines.push(`${indent(2)}rect.geometricBounds = ["${y}mm", "${x}mm", "${y + h}mm", "${x + w}mm"];`)
        if (obj.fill && obj.fill !== 'transparent') {
          lines.push(`${indent(2)}// Fill color: ${obj.fill}`)
        }
        lines.push(`${indent(1)}}`)
      } else if (obj.type === 'image' && obj.imageRef) {
        lines.push(`${indent(1)}{`)
        lines.push(`${indent(2)}var imgFrame = page${pi}.rectangles.add();`)
        lines.push(`${indent(2)}imgFrame.geometricBounds = ["${y}mm", "${x}mm", "${y + h}mm", "${x + w}mm"];`)
        lines.push(`${indent(2)}// Image ref: ${obj.imageRef.substring(0, 60)}`)
        lines.push(`${indent(1)}}`)
      }
    }
  }

  lines.push('')
  lines.push(`${indent(1)}// ─── Save`)
  lines.push(`${indent(1)}// doc.save(new File("~/Desktop/${indesign.projectName}.indd"));`)
  lines.push(`${indent(1)}alert("${indesign.projectName} — تم إنشاء المستند بنجاح (${indesign.pages.length} صفحة)");`)
  lines.push('}());')

  return lines.join('\n')
}

// ─── Download helpers ─────────────────────────────────────────────────────────

export function downloadJSON(data: object, filename: string): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.json') ? filename : `${filename}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export function downloadScript(script: string, filename: string): void {
  const blob = new Blob([script], { type: 'application/javascript' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.jsx') ? filename : `${filename}.jsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
