'use client';

import React, { useState } from 'react';
import { Download, FileJson, FileText, Loader2, Check, ChevronDown } from 'lucide-react';
import type { Project, ExportOptions } from '@/types';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface ExportPanelProps {
  project: Project;
  onClose?: () => void;
}

type ExportFormat = 'pdf' | 'json' | 'extendscript';

export default function ExportPanel({ project, onClose }: ExportPanelProps) {
  const { setExporting, setExportProgress } = useAppStore();

  const [pdfQuality, setPdfQuality] = useState<'screen' | 'print'>('print');
  const [includeBleed, setIncludeBleed] = useState(false);
  const [includeCropMarks, setIncludeCropMarks] = useState(false);
  const [spreadView, setSpreadView] = useState(false);
  const [pageRange, setPageRange] = useState<'all' | 'current' | 'custom'>('all');
  const [customRange, setCustomRange] = useState('');
  const [exportStatus, setExportStatus] = useState<Record<ExportFormat, 'idle' | 'loading' | 'done'>>({
    pdf: 'idle',
    json: 'idle',
    extendscript: 'idle',
  });

  const setStatus = (fmt: ExportFormat, status: 'idle' | 'loading' | 'done') => {
    setExportStatus((prev) => ({ ...prev, [fmt]: status }));
  };

  const handleExportPDF = async () => {
    setStatus('pdf', 'loading');
    setExporting(true);
    setExportProgress(10);

    try {
      const { exportToPDF, downloadPDF } = await import('@/lib/export/pdfExport');
      const options: ExportOptions = {
        format: 'pdf',
        quality: pdfQuality,
        includeBleed,
        includeCropMarks,
        spreadView,
        embedFonts: false,
      };
      setExportProgress(40);
      const bytes = await exportToPDF(project, options);
      setExportProgress(90);
      downloadPDF(bytes as any, project.name || 'pedabook-export');
      setExportProgress(100);
      setStatus('pdf', 'done');
      setTimeout(() => setStatus('pdf', 'idle'), 3000);
    } catch (err) {
      console.error('PDF export failed:', err);
      setStatus('pdf', 'idle');
    } finally {
      setExporting(false);
      setExportProgress(0);
    }
  };

  const handleExportJSON = () => {
    setStatus('json', 'loading');
    try {
      const { exportToInDesignJSON, downloadJSON } = require('@/lib/export/jsonExport');
      const idProj = exportToInDesignJSON(project);
      downloadJSON(idProj, `${project.name || 'project'}-indesign`);
      setStatus('json', 'done');
      setTimeout(() => setStatus('json', 'idle'), 3000);
    } catch {
      const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name || 'project'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus('json', 'done');
      setTimeout(() => setStatus('json', 'idle'), 3000);
    }
  };

  const handleExportExtendScript = () => {
    setStatus('extendscript', 'loading');
    try {
      const { exportToInDesignJSON, generateExtendScript, downloadScript } = require('@/lib/export/jsonExport');
      const idProj = exportToInDesignJSON(project);
      const script = generateExtendScript(idProj);
      downloadScript(script, `${project.name || 'project'}-indesign`);
      setStatus('extendscript', 'done');
      setTimeout(() => setStatus('extendscript', 'idle'), 3000);
    } catch (err) {
      console.error('ExtendScript export failed:', err);
      setStatus('extendscript', 'idle');
    }
  };

  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <div
        onClick={onChange}
        className={cn(
          'relative w-9 h-5 rounded-full transition-colors',
          checked ? 'bg-[var(--color-primary)]' : 'bg-gray-300'
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
            checked ? 'translate-x-4 left-0.5' : 'translate-x-0 left-0.5'
          )}
        />
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );

  return (
    <div className="w-full bg-white" style={{ direction: 'rtl' }}>
      {/* PDF Export */}
      <section className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={18} className="text-red-500" />
          <h3 className="text-sm font-bold text-gray-800">تصدير PDF</h3>
        </div>

        <div className="space-y-3">
          {/* Quality */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">الجودة</label>
            <div className="flex gap-2">
              {[
                { value: 'print' as const, label: 'طباعة (300dpi)', desc: 'جودة عالية للطباعة' },
                { value: 'screen' as const, label: 'شاشة (72dpi)', desc: 'حجم أصغر للرقمي' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPdfQuality(opt.value)}
                  className={cn(
                    'flex-1 p-2 rounded-lg border text-xs text-right transition-colors',
                    pdfQuality === opt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-800'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  )}
                >
                  <div className="font-semibold">{opt.label}</div>
                  <div className="text-gray-400 text-[10px]">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Page range */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">الصفحات</label>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { value: 'all' as const, label: 'الكل' },
                { value: 'current' as const, label: 'الصفحة الحالية' },
                { value: 'custom' as const, label: 'نطاق مخصص' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPageRange(opt.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs border transition-colors',
                    pageRange === opt.value
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {pageRange === 'custom' && (
              <input
                type="text"
                value={customRange}
                onChange={(e) => setCustomRange(e.target.value)}
                placeholder="مثال: 1-5, 8, 10-12"
                className="mt-2 w-full text-sm border border-gray-200 rounded px-3 py-1.5 focus:outline-none focus:border-blue-400"
                dir="ltr"
              />
            )}
          </div>

          {/* Toggles */}
          <div className="space-y-2">
            <Toggle checked={includeBleed} onChange={() => setIncludeBleed(!includeBleed)} label="تضمين منطقة الحواف (Bleed)" />
            <Toggle checked={includeCropMarks} onChange={() => setIncludeCropMarks(!includeCropMarks)} label="علامات القص (Crop Marks)" />
            <Toggle checked={spreadView} onChange={() => setSpreadView(!spreadView)} label="عرض صفحتين متقابلتين" />
          </div>

          <button
            onClick={handleExportPDF}
            disabled={exportStatus.pdf === 'loading'}
            className={cn(
              'w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors',
              exportStatus.pdf === 'done'
                ? 'bg-green-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white',
              exportStatus.pdf === 'loading' && 'opacity-75 cursor-not-allowed'
            )}
          >
            {exportStatus.pdf === 'loading' && <Loader2 size={16} className="animate-spin" />}
            {exportStatus.pdf === 'done' && <Check size={16} />}
            {exportStatus.pdf === 'idle' && <Download size={16} />}
            {exportStatus.pdf === 'idle' ? 'تصدير PDF' : exportStatus.pdf === 'loading' ? 'جارٍ التصدير...' : 'تم التصدير!'}
          </button>
        </div>
      </section>

      {/* InDesign Export */}
      <section className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileJson size={18} className="text-purple-600" />
          <h3 className="text-sm font-bold text-gray-800">تصدير InDesign</h3>
        </div>

        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          صدّر مشروعك بصيغة JSON لفتحه في InDesign، أو احصل على ملف ExtendScript لتشغيله مباشرة في InDesign.
        </p>

        <div className="space-y-2">
          <button
            onClick={handleExportJSON}
            disabled={exportStatus.json === 'loading'}
            className={cn(
              'w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border transition-colors',
              exportStatus.json === 'done'
                ? 'bg-green-600 text-white border-green-600'
                : 'border-purple-300 text-purple-700 hover:bg-purple-50 bg-white',
              exportStatus.json === 'loading' && 'opacity-75 cursor-not-allowed'
            )}
          >
            {exportStatus.json === 'loading' && <Loader2 size={16} className="animate-spin" />}
            {exportStatus.json === 'done' && <Check size={16} />}
            {exportStatus.json === 'idle' && <FileJson size={16} />}
            تصدير project.json
          </button>

          <button
            onClick={handleExportExtendScript}
            disabled={exportStatus.extendscript === 'loading'}
            className={cn(
              'w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border transition-colors',
              exportStatus.extendscript === 'done'
                ? 'bg-green-600 text-white border-green-600'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 bg-white',
              exportStatus.extendscript === 'loading' && 'opacity-75 cursor-not-allowed'
            )}
          >
            {exportStatus.extendscript === 'loading' && <Loader2 size={16} className="animate-spin" />}
            {exportStatus.extendscript === 'done' && <Check size={16} />}
            {exportStatus.extendscript === 'idle' && <FileText size={16} />}
            تصدير ExtendScript (.jsx)
          </button>
        </div>

        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
          <p className="text-xs text-amber-800">
            <strong>ملاحظة:</strong> ملف ExtendScript يمكن تشغيله من InDesign عبر File → Scripts → Browse لإنشاء المستند تلقائيًا.
          </p>
        </div>
      </section>

      {/* Project summary */}
      <div className="px-4 pb-4">
        <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
          <div className="flex justify-between"><span>المشروع:</span><span className="font-medium text-gray-700">{project.name}</span></div>
          <div className="flex justify-between"><span>الصفحات:</span><span>{project.pages.length}</span></div>
          <div className="flex justify-between"><span>الحجم:</span><span dir="ltr">{project.documentSettings.width}×{project.documentSettings.height} {project.documentSettings.unit}</span></div>
        </div>
      </div>
    </div>
  );
}
