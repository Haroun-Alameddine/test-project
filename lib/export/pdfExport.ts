import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib'
import type { Project, ExportOptions, ProjectPage, CanvasObject, TextObjectData, ShapeObjectData, ImageObjectData } from '@/types'

// ─── Unit helpers ─────────────────────────────────────────────────────────────

/** Convert mm to PDF points (1 pt = 1/72 inch, 1 inch = 25.4 mm) */
function mmToPt(mm: number): number {
  return (mm / 25.4) * 72
}

/** Convert pixels (96dpi) to PDF points */
function pxToPt(px: number): number {
  return (px / 96) * 72
}

// ─── Colour helpers ───────────────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '')
  if (clean.length !== 6 && clean.length !== 3) return { r: 0, g: 0, b: 0 }
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean
  return {
    r: parseInt(full.slice(0, 2), 16) / 255,
    g: parseInt(full.slice(2, 4), 16) / 255,
    b: parseInt(full.slice(4, 6), 16) / 255,
  }
}

function cssColorToRgb(color: string): { r: number; g: number; b: number } {
  if (!color || color === 'transparent' || color === 'none') return { r: 1, g: 1, b: 1 }
  if (color.startsWith('#')) return hexToRgb(color)
  return { r: 0, g: 0, b: 0 }
}

// ─── Page size (in points) ────────────────────────────────────────────────────

function getPageDimensions(
  project: Project,
  options: ExportOptions,
  bleedPt: number
): { width: number; height: number } {
  const { width, height, unit } = project.documentSettings
  let widthPt: number
  let heightPt: number

  if (unit === 'mm') {
    widthPt = mmToPt(width)
    heightPt = mmToPt(height)
  } else if (unit === 'in') {
    widthPt = width * 72
    heightPt = height * 72
  } else {
    // assume px
    widthPt = pxToPt(width)
    heightPt = pxToPt(height)
  }

  if (options.includeBleed) {
    widthPt += bleedPt * 2
    heightPt += bleedPt * 2
  }

  return { width: widthPt, height: heightPt }
}

// ─── Draw a single page ───────────────────────────────────────────────────────

async function drawPage(
  pdfPage: PDFPage,
  projectPage: ProjectPage,
  pageWidth: number,
  pageHeight: number,
  bleedPt: number,
  pdfDoc: PDFDocument,
  includeBleed: boolean
): Promise<void> {
  // Background
  const bgColor = cssColorToRgb(projectPage.background || '#FFFFFF')
  pdfPage.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: pageHeight,
    color: rgb(bgColor.r, bgColor.g, bgColor.b),
  })

  // Embed font once
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Sort objects by zIndex
  const sorted = [...projectPage.objects].sort((a, b) => a.zIndex - b.zIndex)

  for (const obj of sorted) {
    // Convert canvas coords (px, origin top-left) to PDF coords (pt, origin bottom-left)
    const xPt = pxToPt(obj.x) + (includeBleed ? bleedPt : 0)
    const widthPt = pxToPt(obj.width)
    const heightPt = pxToPt(obj.height)
    // PDF y-axis is flipped: y=0 is bottom
    const yPt = pageHeight - pxToPt(obj.y) - heightPt - (includeBleed ? bleedPt : 0)

    if (!obj.visible) continue

    switch (obj.type) {
      case 'shape': {
        const shapeData = obj.data as ShapeObjectData
        const fillColor = cssColorToRgb(shapeData.fill)
        const strokeColor = cssColorToRgb(shapeData.stroke)
        const borderRadius = shapeData.borderRadius ?? 0

        if (shapeData.shape === 'circle') {
          pdfPage.drawEllipse({
            x: xPt + widthPt / 2,
            y: yPt + heightPt / 2,
            xScale: widthPt / 2,
            yScale: heightPt / 2,
            color: rgb(fillColor.r, fillColor.g, fillColor.b),
            borderColor: shapeData.stroke && shapeData.stroke !== 'transparent'
              ? rgb(strokeColor.r, strokeColor.g, strokeColor.b)
              : undefined,
            borderWidth: shapeData.strokeWidth ?? 0,
          })
        } else {
          pdfPage.drawRectangle({
            x: xPt,
            y: yPt,
            width: widthPt,
            height: heightPt,
            color: rgb(fillColor.r, fillColor.g, fillColor.b),
            borderColor: shapeData.stroke && shapeData.stroke !== 'transparent'
              ? rgb(strokeColor.r, strokeColor.g, strokeColor.b)
              : undefined,
            borderWidth: shapeData.strokeWidth ?? 0,
            // borderRadius not supported in pdf-lib drawRectangle
          })
        }
        break
      }

      case 'text': {
        const textData = obj.data as TextObjectData
        if (!textData.text) break

        const textColor = cssColorToRgb(textData.style.color || '#000000')
        const fontSize = Math.max(6, textData.style.fontSize ?? 12)
        const useFont = (textData.style.fontWeight === '700' || textData.style.fontWeight === 'bold')
          ? boldFont
          : font

        // Background rect
        if (textData.background && textData.background !== 'transparent') {
          const bg = cssColorToRgb(textData.background)
          pdfPage.drawRectangle({
            x: xPt,
            y: yPt,
            width: widthPt,
            height: heightPt,
            color: rgb(bg.r, bg.g, bg.b),
          })
        }

        // Draw text — split into lines
        const padding = textData.padding ?? { top: 8, right: 8, bottom: 8, left: 8 }
        const paddingTop = pxToPt(padding.top)
        const paddingLeft = pxToPt(padding.left)
        const paddingRight = pxToPt(padding.right)

        const availWidth = widthPt - paddingLeft - paddingRight
        const lineHeight = (textData.style.lineHeight ?? 1.6) * fontSize

        // Simple word-wrap
        const words = textData.text.replace(/\n/g, ' \n ').split(' ')
        const lines: string[] = []
        let currentLine = ''

        for (const word of words) {
          if (word === '\n') {
            lines.push(currentLine.trim())
            currentLine = ''
            continue
          }
          const testLine = currentLine ? `${currentLine} ${word}` : word
          const testWidth = useFont.widthOfTextAtSize(testLine, fontSize)
          if (testWidth > availWidth && currentLine) {
            lines.push(currentLine.trim())
            currentLine = word
          } else {
            currentLine = testLine
          }
        }
        if (currentLine.trim()) lines.push(currentLine.trim())

        // Draw lines from top
        const startY = yPt + heightPt - paddingTop - fontSize

        lines.forEach((line, i) => {
          const lineY = startY - i * lineHeight
          if (lineY < yPt) return // clip to box

          let lineX = xPt + paddingLeft
          if (textData.style.align === 'center') {
            const textW = useFont.widthOfTextAtSize(line, fontSize)
            lineX = xPt + (widthPt - textW) / 2
          } else if (textData.style.align === 'right') {
            const textW = useFont.widthOfTextAtSize(line, fontSize)
            lineX = xPt + widthPt - paddingRight - textW
          }

          pdfPage.drawText(line, {
            x: Math.max(0, lineX),
            y: lineY,
            size: fontSize,
            font: useFont,
            color: rgb(textColor.r, textColor.g, textColor.b),
          })
        })

        break
      }

      case 'image': {
        const imgData = obj.data as ImageObjectData
        if (!imgData.src || imgData.src.startsWith('http')) {
          // Placeholder rectangle for external/missing images
          pdfPage.drawRectangle({
            x: xPt,
            y: yPt,
            width: widthPt,
            height: heightPt,
            color: rgb(0.9, 0.9, 0.9),
            borderColor: rgb(0.7, 0.7, 0.7),
            borderWidth: 1,
          })
        } else {
          try {
            // Attempt to embed if src is data URL
            const isJpeg = imgData.src.startsWith('data:image/jpeg')
            const isPng = imgData.src.startsWith('data:image/png')
            if (isJpeg || isPng) {
              const base64 = imgData.src.split(',')[1]
              const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
              const embeddedImage = isJpeg
                ? await pdfDoc.embedJpg(bytes)
                : await pdfDoc.embedPng(bytes)
              pdfPage.drawImage(embeddedImage, {
                x: xPt,
                y: yPt,
                width: widthPt,
                height: heightPt,
              })
            }
          } catch {
            // Fallback placeholder
            pdfPage.drawRectangle({
              x: xPt,
              y: yPt,
              width: widthPt,
              height: heightPt,
              color: rgb(0.9, 0.9, 0.9),
            })
          }
        }
        break
      }

      case 'line': {
        pdfPage.drawLine({
          start: { x: xPt, y: yPt + heightPt / 2 },
          end: { x: xPt + widthPt, y: yPt + heightPt / 2 },
          thickness: 1,
          color: rgb(0, 0, 0),
        })
        break
      }

      default:
        break
    }
  }
}

// ─── Crop Marks ───────────────────────────────────────────────────────────────

function drawCropMarks(
  pdfPage: PDFPage,
  contentWidth: number,
  contentHeight: number,
  bleedPt: number
): void {
  const markLength = 14
  const gap = 4
  const color = rgb(0, 0, 0)
  const thickness = 0.5
  const totalW = contentWidth + bleedPt * 2
  const totalH = contentHeight + bleedPt * 2

  const corners = [
    { x: bleedPt, y: bleedPt },
    { x: totalW - bleedPt, y: bleedPt },
    { x: bleedPt, y: totalH - bleedPt },
    { x: totalW - bleedPt, y: totalH - bleedPt },
  ]

  for (const { x, y } of corners) {
    // Horizontal mark
    const hDir = x < totalW / 2 ? -1 : 1
    pdfPage.drawLine({
      start: { x: x + hDir * gap, y },
      end: { x: x + hDir * (gap + markLength), y },
      thickness,
      color,
    })
    // Vertical mark
    const vDir = y < totalH / 2 ? -1 : 1
    pdfPage.drawLine({
      start: { x, y: y + vDir * gap },
      end: { x, y: y + vDir * (gap + markLength) },
      thickness,
      color,
    })
  }
}

// ─── Page Number ──────────────────────────────────────────────────────────────

async function drawPageNumber(
  pdfPage: PDFPage,
  pageNumber: number,
  totalPages: number,
  pageWidth: number,
  pdfDoc: PDFDocument
): Promise<void> {
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const text = `${pageNumber} / ${totalPages}`
  const fontSize = 8
  const textWidth = font.widthOfTextAtSize(text, fontSize)
  pdfPage.drawText(text, {
    x: (pageWidth - textWidth) / 2,
    y: 20,
    size: fontSize,
    font,
    color: rgb(0.5, 0.5, 0.5),
  })
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export async function exportToPDF(project: Project, options: ExportOptions): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()

  const bleedMm = options.includeBleed ? (project.documentSettings.bleed ?? 3) : 0
  const bleedPt = mmToPt(bleedMm)

  const { width: pageWidth, height: pageHeight } = getPageDimensions(project, options, bleedPt)

  // Filter pages if needed — for now process all
  const pages = project.pages

  for (let i = 0; i < pages.length; i++) {
    const projectPage = pages[i]
    const pdfPage = pdfDoc.addPage([pageWidth, pageHeight])

    await drawPage(pdfPage, projectPage, pageWidth, pageHeight, bleedPt, pdfDoc, options.includeBleed)

    if (options.includeCropMarks && options.includeBleed) {
      const contentW = pageWidth - bleedPt * 2
      const contentH = pageHeight - bleedPt * 2
      drawCropMarks(pdfPage, contentW, contentH, bleedPt)
    }

    await drawPageNumber(pdfPage, i + 1, pages.length, pageWidth, pdfDoc)
  }

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}

// ─── Browser Download ─────────────────────────────────────────────────────────

export function downloadPDF(bytes: Uint8Array<ArrayBuffer>, filename: string): void {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
