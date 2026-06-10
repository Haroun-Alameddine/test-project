'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  ExternalLink,
  BookOpen,
  FlaskConical,
  BookMarked,
  Calendar,
  NotebookPen,
  LibraryBig,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn, formatDate, bookTypeLabels } from '@/lib/utils';
import type { Project, BookType } from '@/types';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

const bookTypeColors: Record<BookType, { bg: string; border: string; icon: string }> = {
  arabic_book: { bg: 'from-[#1B3A6B] to-[#2a5298]', border: 'border-blue-200', icon: 'text-blue-100' },
  science_book: { bg: 'from-[#1A6B3C] to-[#2d9b5a]', border: 'border-green-200', icon: 'text-green-100' },
  teacher_guide: { bg: 'from-[#6B1A5A] to-[#9b2d84]', border: 'border-purple-200', icon: 'text-purple-100' },
  planner: { bg: 'from-[#E65100] to-[#f57c00]', border: 'border-orange-200', icon: 'text-orange-100' },
  notebook: { bg: 'from-[#1565C0] to-[#1976D2]', border: 'border-sky-200', icon: 'text-sky-100' },
  support_book: { bg: 'from-[#4A1565] to-[#7b1fa2]', border: 'border-violet-200', icon: 'text-violet-100' },
};

const bookTypeIconMap: Record<BookType, React.ReactNode> = {
  arabic_book: <BookOpen size={32} />,
  science_book: <FlaskConical size={32} />,
  teacher_guide: <BookMarked size={32} />,
  planner: <Calendar size={32} />,
  notebook: <NotebookPen size={32} />,
  support_book: <LibraryBig size={32} />,
};

const bookTypeBadgeColors: Record<BookType, string> = {
  arabic_book: 'bg-blue-100 text-blue-700',
  science_book: 'bg-green-100 text-green-700',
  teacher_guide: 'bg-purple-100 text-purple-700',
  planner: 'bg-orange-100 text-orange-700',
  notebook: 'bg-sky-100 text-sky-700',
  support_book: 'bg-violet-100 text-violet-700',
};

export default function ProjectCard({ project, onDelete, onDuplicate, onRename }: ProjectCardProps) {
  const router = useRouter();
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(project.name);
  const colors = bookTypeColors[project.bookType] ?? bookTypeColors.arabic_book;

  function handleRenameSubmit() {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== project.name) {
      onRename(project.id, trimmed);
    }
    setRenaming(false);
  }

  function handleRenameKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleRenameSubmit();
    if (e.key === 'Escape') { setRenaming(false); setRenameValue(project.name); }
  }

  return (
    <div
      className={cn(
        'group bg-white rounded-2xl border overflow-hidden shadow-sm',
        'transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-[#1B3A6B]/30',
        colors.border
      )}
    >
      {/* Thumbnail */}
      <div
        className={cn(
          'relative h-40 bg-gradient-to-br flex items-center justify-center cursor-pointer',
          colors.bg
        )}
        onClick={() => router.push(`/editor/${project.id}`)}
      >
        <div className={cn('opacity-30', colors.icon)}>
          {bookTypeIconMap[project.bookType]}
        </div>
        {/* Page lines decoration */}
        <div className="absolute inset-4 flex flex-col gap-1.5 opacity-20">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white/60 rounded h-1.5"
              style={{ width: `${55 + (i % 3) * 15}%`, marginRight: i % 2 === 0 ? 'auto' : 0 }}
            />
          ))}
        </div>
        {/* Page count badge */}
        <div className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm text-white text-xs font-cairo px-2 py-0.5 rounded-full">
          {project.pages.length > 0 ? `${project.pages.length} صفحة` : 'مسودة'}
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-xl px-4 py-2 flex items-center gap-2 text-[#1B3A6B] text-sm font-semibold font-cairo shadow-lg">
            <ExternalLink size={14} />
            فتح المشروع
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {renaming ? (
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={handleRenameKey}
                className="w-full text-sm font-bold text-[#1B3A6B] font-cairo bg-[#f0f4fc] border border-[#1B3A6B]/30 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]/30"
                dir="rtl"
              />
            ) : (
              <h3
                className="text-sm font-bold text-[#1B3A6B] font-cairo truncate cursor-pointer hover:underline"
                title={project.name}
                onClick={() => setRenaming(true)}
              >
                {project.name}
              </h3>
            )}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span
                className={cn(
                  'text-xs font-cairo px-2 py-0.5 rounded-full font-medium',
                  bookTypeBadgeColors[project.bookType]
                )}
              >
                {bookTypeLabels[project.bookType]}
              </span>
              {project.grade && project.grade !== 'عام' && (
                <span className="text-xs text-gray-500 font-cairo">{project.grade}</span>
              )}
            </div>
          </div>

          {/* Actions menu */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0 focus:outline-none"
                aria-label="خيارات المشروع"
              >
                <MoreVertical size={16} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={4}
                className="z-50 min-w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 animate-in fade-in-0 zoom-in-95 duration-100"
              >
                <DropdownMenu.Item
                  className="flex items-center gap-2.5 px-3 py-2 text-sm font-cairo text-gray-700 hover:bg-[#f0f4fc] hover:text-[#1B3A6B] cursor-pointer transition-colors focus:outline-none focus:bg-[#f0f4fc]"
                  onSelect={() => router.push(`/editor/${project.id}`)}
                >
                  <ExternalLink size={14} />
                  فتح المشروع
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex items-center gap-2.5 px-3 py-2 text-sm font-cairo text-gray-700 hover:bg-[#f0f4fc] hover:text-[#1B3A6B] cursor-pointer transition-colors focus:outline-none focus:bg-[#f0f4fc]"
                  onSelect={() => { setRenameValue(project.name); setRenaming(true); }}
                >
                  <Edit2 size={14} />
                  إعادة التسمية
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  className="flex items-center gap-2.5 px-3 py-2 text-sm font-cairo text-gray-700 hover:bg-[#f0f4fc] hover:text-[#1B3A6B] cursor-pointer transition-colors focus:outline-none focus:bg-[#f0f4fc]"
                  onSelect={() => onDuplicate(project.id)}
                >
                  <Copy size={14} />
                  تكرار المشروع
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
                <DropdownMenu.Item
                  className="flex items-center gap-2.5 px-3 py-2 text-sm font-cairo text-red-600 hover:bg-red-50 cursor-pointer transition-colors focus:outline-none focus:bg-red-50"
                  onSelect={() => onDelete(project.id)}
                >
                  <Trash2 size={14} />
                  حذف المشروع
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <span className="text-xs text-gray-400 font-cairo">
            آخر تعديل: {formatDate(project.updatedAt)}
          </span>
          <button
            onClick={() => router.push(`/editor/${project.id}`)}
            className="text-xs text-[#1B3A6B] hover:underline font-cairo font-semibold"
          >
            تعديل
          </button>
        </div>
      </div>
    </div>
  );
}
