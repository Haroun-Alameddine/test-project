'use client';

import React, { useRef, useState } from 'react';
import {
  LayoutTemplate,
  Layers,
  Shapes,
  Upload,
  Plus,
  Trash2,
  Type,
  Image as ImageIcon,
  Minus,
  Square,
  Circle,
  Triangle,
  Star,
  Table,
  AlignLeft,
  BookOpen,
} from 'lucide-react';
import { useAppStore, generateId } from '@/lib/store';
import type { Project, ProjectPage, CanvasObject, PageTemplateType } from '@/types';
import { cn } from '@/lib/utils';
import { arabicGrade2Template } from '@/lib/templates/definitions';
import PageThumbnail from './PageThumbnail';

interface LeftSidebarProps {
  project: Project;
  currentPageIndex: number;
  onPageSelect: (index: number) => void;
}

type Panel = 'templates' | 'pages' | 'elements' | 'uploads';

const PAGE_TEMPLATES: Array<{ type: PageTemplateType; label: string; bg: string; accent: string }> = [
  { type: 'cover', label: 'غلاف', bg: '#1B3A6B', accent: '#C9A227' },
  { type: 'unit_opener', label: 'مستهل وحدة', bg: '#2A5298', accent: '#E0B93A' },
  { type: 'lesson', label: 'درس', bg: '#ffffff', accent: '#1B3A6B' },
  { type: 'reading_text', label: 'نص قرائي', bg: '#FFFEF5', accent: '#C9A227' },
  { type: 'activity', label: 'نشاط', bg: '#F0FFF4', accent: '#2D9B5A' },
  { type: 'question', label: 'أسئلة', bg: '#FFF5F5', accent: '#E84855' },
  { type: 'vocabulary', label: 'مفردات', bg: '#F5F0FF', accent: '#7C3AED' },
  { type: 'summary', label: 'خلاصة', bg: '#F0F9FF', accent: '#3B82F6' },
  { type: 'table_of_contents', label: 'فهرس', bg: '#ffffff', accent: '#1B3A6B' },
  { type: 'back_cover', label: 'غلاف خلفي', bg: '#1B3A6B', accent: '#C9A227' },
  { type: 'empty', label: 'صفحة فارغة', bg: '#ffffff', accent: '#D1D5DB' },
];

function createBlankPage(pageNumber: number, templateType: PageTemplateType = 'empty'): ProjectPage {
  return {
    id: generateId(),
    pageNumber,
    templateType,
    width: 794,
    height: 1123,
    background: '#ffffff',
    objects: [],
  };
}

function createDefaultTextObject(x: number, y: number, text: string, fontSize: number, fontWeight = '400'): CanvasObject {
  return {
    id: generateId(),
    type: 'text',
    x,
    y,
    width: 400,
    height: fontSize * 2 + 16,
    rotation: 0,
    locked: false,
    visible: true,
    zIndex: 1,
    data: {
      text,
      style: {
        fontFamily: 'Cairo',
        fontSize,
        fontWeight,
        color: '#1C1C1C',
        align: 'right',
        direction: 'rtl',
        lineHeight: 1.6,
        letterSpacing: 0,
        paragraphSpacing: 0,
      },
      padding: { top: 4, right: 8, bottom: 4, left: 8 },
      background: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 0,
    },
  };
}

function createShapeObject(shape: 'rect' | 'circle' | 'triangle' | 'star', x = 200, y = 200): CanvasObject {
  return {
    id: generateId(),
    type: 'shape',
    x,
    y,
    width: 150,
    height: 150,
    rotation: 0,
    locked: false,
    visible: true,
    zIndex: 1,
    data: {
      shape,
      fill: '#3B82F6',
      stroke: 'transparent',
      strokeWidth: 0,
      borderRadius: 0,
    },
  };
}

function createImageObject(x = 150, y = 200): CanvasObject {
  return {
    id: generateId(),
    type: 'image',
    x,
    y,
    width: 300,
    height: 200,
    rotation: 0,
    locked: false,
    visible: true,
    zIndex: 1,
    data: {
      src: '',
      alt: '',
      objectFit: 'cover',
      borderRadius: 0,
      borderColor: 'transparent',
      borderWidth: 0,
    },
  };
}

function createTableObject(x = 100, y = 200): CanvasObject {
  const rows = 3;
  const cols = 3;
  const cells = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      content: r === 0 ? `رأس ${c + 1}` : `خلية ${r}-${c + 1}`,
      style: {
        fontFamily: 'Cairo',
        fontSize: 13,
        fontWeight: r === 0 ? '700' : '400',
        color: r === 0 ? '#ffffff' : '#1C1C1C',
        align: 'right' as const,
        direction: 'rtl' as const,
        lineHeight: 1.5,
        letterSpacing: 0,
        paragraphSpacing: 0,
      },
      background: 'transparent',
      colspan: 1,
      rowspan: 1,
    })),
  );
  return {
    id: generateId(),
    type: 'table',
    x,
    y,
    width: 500,
    height: 150,
    rotation: 0,
    locked: false,
    visible: true,
    zIndex: 1,
    data: {
      rows,
      cols,
      cells,
      headerRow: true,
      style: {
        borderColor: '#D1D5DB',
        borderWidth: 1,
        headerBackground: '#1B3A6B',
        alternateRows: true,
      },
    },
  };
}

export default function LeftSidebar({ project, currentPageIndex, onPageSelect }: LeftSidebarProps) {
  const { activePanel, setActivePanel, addPage, deletePage, reorderPages, addObject, updatePage, setSelectedObjectId } =
    useAppStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadedImages, setUploadedImages] = useState<{ url: string; name: string }[]>([]);
  const [contextMenu, setContextMenu] = useState<{ pageId: string; x: number; y: number } | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const currentPage = project.pages[currentPageIndex];

  // ─── Pages panel ────────────────────────────────────────────────────────────

  const handleAddPage = () => {
    const newPage = createBlankPage(project.pages.length + 1);
    addPage(newPage);
    onPageSelect(project.pages.length); // index after adding
  };

  const handleDeletePage = (pageId: string) => {
    if (project.pages.length <= 1) return;
    const idx = project.pages.findIndex((p) => p.id === pageId);
    deletePage(pageId);
    onPageSelect(Math.max(0, idx - 1));
    setContextMenu(null);
  };

  const handlePageContextMenu = (e: React.MouseEvent, pageId: string) => {
    e.preventDefault();
    setContextMenu({ pageId, x: e.clientX, y: e.clientY });
  };

  // Close context menu on click outside
  React.useEffect(() => {
    const handler = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handler);
      return () => document.removeEventListener('click', handler);
    }
  }, [contextMenu]);

  // Drag reorder
  const handleDragStart = (idx: number) => setDragIdx(idx);
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };
  const handleDrop = () => {
    if (dragIdx === null || dragOverIdx === null || dragIdx === dragOverIdx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    const ids = project.pages.map((p) => p.id);
    const [moved] = ids.splice(dragIdx, 1);
    ids.splice(dragOverIdx, 0, moved);
    reorderPages(ids);
    onPageSelect(dragOverIdx);
    setDragIdx(null);
    setDragOverIdx(null);
  };

  // ─── Templates panel ─────────────────────────────────────────────────────────

  /**
   * Apply a template type to the current page.
   * If the page already has objects, ask for confirmation before replacing them
   * with the pre-built objects from the Grade 2 Arabic template (or first
   * available template that contains a matching page type).
   */
  const applyPageTemplate = (templateType: PageTemplateType, bg: string) => {
    if (!currentPage) return;

    // Find matching page definition from Grade 2 template (fallback: just set type)
    const templatePage = arabicGrade2Template.pages.find(
      (p) => p.templateType === templateType,
    );

    const doApply = () => {
      if (templatePage && templatePage.objects.length > 0) {
        // Clone objects with fresh IDs
        const freshObjects: CanvasObject[] = templatePage.objects.map((obj) => ({
          ...obj,
          id: generateId(),
        }));
        useAppStore.getState().updatePage(currentPage.id, {
          templateType,
          background: bg,
          objects: freshObjects,
        });
      } else {
        // No pre-built objects available — just update type/background
        updatePage(currentPage.id, { templateType, background: bg });
      }
    };

    const hasObjects = currentPage.objects.length > 0;
    if (hasObjects) {
      const confirmed = window.confirm(
        'هذه الصفحة تحتوي على عناصر. هل تريد استبدالها بعناصر القالب الجديد؟',
      );
      if (confirmed) doApply();
    } else {
      doApply();
    }
  };

  const handleApplyTemplate = (templateType: PageTemplateType, bg: string) => {
    applyPageTemplate(templateType, bg);
  };

  // ─── Elements panel ──────────────────────────────────────────────────────────

  const addTextElement = (text: string, fontSize: number, fontWeight = '400') => {
    if (!currentPage) return;
    const obj = createDefaultTextObject(100, 100, text, fontSize, fontWeight);
    addObject(currentPage.id, obj);
    setSelectedObjectId(obj.id);
  };

  const addShapeElement = (shape: 'rect' | 'circle' | 'triangle' | 'star') => {
    if (!currentPage) return;
    const obj = createShapeObject(shape);
    addObject(currentPage.id, obj);
    setSelectedObjectId(obj.id);
  };

  const addImageElement = () => {
    if (!currentPage) return;
    const obj = createImageObject();
    addObject(currentPage.id, obj);
    setSelectedObjectId(obj.id);
  };

  const addTableElement = () => {
    if (!currentPage) return;
    const obj = createTableObject();
    addObject(currentPage.id, obj);
    setSelectedObjectId(obj.id);
  };

  const addLineElement = (style: 'solid' | 'double' | 'dashed') => {
    if (!currentPage) return;
    const strokeWidth = style === 'double' ? 4 : 2;
    const obj: CanvasObject = {
      id: generateId(),
      type: 'line',
      x: 100,
      y: 200,
      width: 400,
      height: strokeWidth,
      rotation: 0,
      locked: false,
      visible: true,
      zIndex: 1,
      data: {
        shape: 'rect',
        fill: '#374151',
        stroke: 'transparent',
        strokeWidth: 0,
        borderRadius: 0,
      },
    };
    addObject(currentPage.id, obj);
    setSelectedObjectId(obj.id);
  };

  // ─── Uploads panel ───────────────────────────────────────────────────────────

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      setUploadedImages((prev) => [...prev, { url, name: file.name }]);
    });
    if (fileRef.current) fileRef.current.value = '';
  };

  const insertUploadedImage = (url: string, name: string) => {
    if (!currentPage) return;
    const obj: CanvasObject = {
      id: generateId(),
      type: 'image',
      x: 150,
      y: 200,
      width: 300,
      height: 200,
      rotation: 0,
      locked: false,
      visible: true,
      zIndex: 1,
      data: {
        src: url,
        alt: name,
        objectFit: 'cover',
        borderRadius: 0,
        borderColor: 'transparent',
        borderWidth: 0,
      },
    };
    addObject(currentPage.id, obj);
    setSelectedObjectId(obj.id);
  };

  // ─── Tab definitions ─────────────────────────────────────────────────────────

  const tabs: Array<{ id: Panel; label: string; icon: React.ReactNode }> = [
    { id: 'templates', label: 'القوالب', icon: <LayoutTemplate size={16} /> },
    { id: 'pages', label: 'الصفحات', icon: <Layers size={16} /> },
    { id: 'elements', label: 'العناصر', icon: <Shapes size={16} /> },
    { id: 'uploads', label: 'الرفع', icon: <Upload size={16} /> },
  ];

  return (
    <aside
      className="flex flex-col bg-white border-e border-[var(--color-border)] shrink-0 overflow-hidden"
      style={{ width: 260, direction: 'rtl' }}
    >
      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)] shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePanel(tab.id)}
            title={tab.label}
            className={cn(
              'flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors border-b-2',
              activePanel === tab.id
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-blue-50/50'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]',
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto">
        {/* ── Templates Panel ── */}
        {activePanel === 'templates' && (
          <div className="p-3">
            <p className="text-xs text-[var(--color-text-muted)] mb-3">اختر قالبًا للصفحة الحالية</p>
            <div className="grid grid-cols-2 gap-2">
              {PAGE_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.type}
                  onClick={() => handleApplyTemplate(tpl.type, tpl.bg)}
                  className={cn(
                    'rounded-lg border-2 overflow-hidden transition-all hover:scale-[1.02] hover:shadow-md text-right',
                    currentPage?.templateType === tpl.type
                      ? 'border-[var(--color-primary)]'
                      : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]',
                  )}
                  title={tpl.label}
                >
                  <div
                    className="w-full aspect-[3/4] flex flex-col items-end justify-end p-2"
                    style={{ background: tpl.bg }}
                  >
                    <div className="w-3/4 h-1.5 rounded-full mb-1" style={{ background: tpl.accent, opacity: 0.9 }} />
                    <div className="w-1/2 h-1 rounded-full" style={{ background: tpl.accent, opacity: 0.5 }} />
                  </div>
                  <div className="px-2 py-1.5 bg-white">
                    <span className="text-[10px] font-medium text-[var(--color-text)]">{tpl.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Pages Panel ── */}
        {activePanel === 'pages' && (
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[var(--color-text)]">
                {project.pages.length} صفحة
              </span>
              <button
                onClick={handleAddPage}
                className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                title="إضافة صفحة"
              >
                <Plus size={13} />
                إضافة
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {project.pages.map((page, idx) => (
                <div
                  key={page.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={handleDrop}
                  onDragEnd={() => { setDragIdx(null); setDragOverIdx(null); }}
                  onContextMenu={(e) => handlePageContextMenu(e, page.id)}
                  className={cn(
                    'flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors',
                    idx === currentPageIndex ? 'bg-blue-50 border border-[var(--color-primary)]/30' : 'hover:bg-[var(--color-bg)]',
                    dragOverIdx === idx ? 'ring-2 ring-[var(--color-primary)]' : '',
                  )}
                  onClick={() => onPageSelect(idx)}
                >
                  <PageThumbnail
                    page={page}
                    isActive={idx === currentPageIndex}
                    onClick={() => onPageSelect(idx)}
                    scale={80 / 794}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--color-text)] truncate">صفحة {page.pageNumber}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] truncate">{page.objects.length} عنصر</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Context menu */}
            {contextMenu && (
              <div
                className="fixed z-50 bg-white border border-[var(--color-border)] rounded-xl shadow-xl py-1 min-w-[140px]"
                style={{ top: contextMenu.y, left: contextMenu.x }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleDeletePage(contextMenu.pageId)}
                  disabled={project.pages.length <= 1}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 size={13} />
                  حذف الصفحة
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Elements Panel ── */}
        {activePanel === 'elements' && (
          <div className="p-3 space-y-4">
            {/* Text */}
            <div>
              <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">نصوص</p>
              <div className="space-y-1">
                {[
                  { label: 'عنوان كبير', fontSize: 28, fontWeight: '700' },
                  { label: 'عنوان فرعي', fontSize: 20, fontWeight: '600' },
                  { label: 'نص عادي', fontSize: 14, fontWeight: '400' },
                  { label: 'نص مميز', fontSize: 14, fontWeight: '600' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => addTextElement(item.label, item.fontSize, item.fontWeight)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-right rounded-lg hover:bg-[var(--color-bg)] transition-colors border border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                  >
                    <Type size={13} className="text-[var(--color-text-muted)] shrink-0" />
                    <span className="text-xs text-[var(--color-text)]" style={{ fontSize: Math.min(item.fontSize, 13) }}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Shapes */}
            <div>
              <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">أشكال</p>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { shape: 'rect' as const, icon: <Square size={16} />, label: 'مستطيل' },
                  { shape: 'circle' as const, icon: <Circle size={16} />, label: 'دائرة' },
                  { shape: 'triangle' as const, icon: <Triangle size={16} />, label: 'مثلث' },
                  { shape: 'star' as const, icon: <Star size={16} />, label: 'نجمة' },
                ].map((item) => (
                  <button
                    key={item.shape}
                    onClick={() => addShapeElement(item.shape)}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[var(--color-bg)] transition-colors border border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                    title={item.label}
                  >
                    <span className="text-[var(--color-text-muted)]">{item.icon}</span>
                    <span className="text-[9px] text-[var(--color-text-muted)]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Frames */}
            <div>
              <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">إطارات</p>
              <div className="space-y-1">
                {[
                  { label: 'إطار صورة', icon: <ImageIcon size={13} />, action: addImageElement },
                  { label: 'إطار جدول', icon: <Table size={13} />, action: addTableElement },
                  {
                    label: 'إطار ملاحظة',
                    icon: <BookOpen size={13} />,
                    action: () => {
                      if (!currentPage) return;
                      const obj: CanvasObject = {
                        id: generateId(),
                        type: 'text',
                        x: 80,
                        y: 180,
                        width: 580,
                        height: 80,
                        rotation: 0,
                        locked: false,
                        visible: true,
                        zIndex: 1,
                        data: {
                          text: '<strong>ملاحظة:</strong> أدخل نصك هنا...',
                          style: {
                            fontFamily: 'Cairo',
                            fontSize: 13,
                            fontWeight: '400',
                            color: '#1C1C1C',
                            align: 'right',
                            direction: 'rtl',
                            lineHeight: 1.6,
                            letterSpacing: 0,
                            paragraphSpacing: 0,
                          },
                          padding: { top: 12, right: 16, bottom: 12, left: 16 },
                          background: '#FFFBEB',
                          borderColor: '#F59E0B',
                          borderWidth: 2,
                          borderRadius: 8,
                        },
                      };
                      addObject(currentPage.id, obj);
                      setSelectedObjectId(obj.id);
                    },
                  },
                  {
                    label: 'إطار سؤال',
                    icon: <AlignLeft size={13} />,
                    action: () => {
                      if (!currentPage) return;
                      const obj: CanvasObject = {
                        id: generateId(),
                        type: 'text',
                        x: 80,
                        y: 180,
                        width: 580,
                        height: 80,
                        rotation: 0,
                        locked: false,
                        visible: true,
                        zIndex: 1,
                        data: {
                          text: '<strong>سؤال:</strong> اكتب سؤالك هنا...',
                          style: {
                            fontFamily: 'Cairo',
                            fontSize: 13,
                            fontWeight: '400',
                            color: '#1C1C1C',
                            align: 'right',
                            direction: 'rtl',
                            lineHeight: 1.6,
                            letterSpacing: 0,
                            paragraphSpacing: 0,
                          },
                          padding: { top: 12, right: 16, bottom: 12, left: 16 },
                          background: '#EFF6FF',
                          borderColor: '#3B82F6',
                          borderWidth: 2,
                          borderRadius: 8,
                        },
                      };
                      addObject(currentPage.id, obj);
                      setSelectedObjectId(obj.id);
                    },
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center gap-2 px-3 py-2 text-right rounded-lg hover:bg-[var(--color-bg)] transition-colors border border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                  >
                    <span className="text-[var(--color-text-muted)] shrink-0">{item.icon}</span>
                    <span className="text-xs text-[var(--color-text)]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Lines */}
            <div>
              <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">خطوط</p>
              <div className="space-y-1">
                {[
                  { label: 'خط عادي', style: 'solid' as const },
                  { label: 'خط مزدوج', style: 'double' as const },
                  { label: 'خط منقط', style: 'dashed' as const },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => addLineElement(item.style)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-right rounded-lg hover:bg-[var(--color-bg)] transition-colors border border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                  >
                    <Minus size={13} className="text-[var(--color-text-muted)] shrink-0" />
                    <span className="text-xs text-[var(--color-text)]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Uploads Panel ── */}
        {activePanel === 'uploads' && (
          <div className="p-3">
            {/* Upload button */}
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-[var(--color-border)] rounded-xl hover:border-[var(--color-primary)] hover:bg-blue-50/30 transition-colors mb-4"
            >
              <Upload size={20} className="text-[var(--color-text-muted)]" />
              <span className="text-xs text-[var(--color-text-muted)]">انقر لرفع صور</span>
              <span className="text-[10px] text-[var(--color-text-subtle)]">PNG, JPG, WEBP</span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Uploaded images grid */}
            {uploadedImages.length === 0 ? (
              <p className="text-center text-xs text-[var(--color-text-subtle)] py-4">
                لم يتم رفع أي صور بعد
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {uploadedImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => insertUploadedImage(img.url, img.name)}
                    className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-[var(--color-primary)] transition-all relative group"
                    title={img.name}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Plus size={20} className="text-white" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
