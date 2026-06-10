'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useProjectStore } from '@/store/projectStore';
import EditorLayout from '@/components/editor/EditorLayout';
import type { Project } from '@/types';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { currentProject, setCurrentProject, projects } = useAppStore();
  const projectStoreProjects = useProjectStore((s) => s.projects);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    // 1. Already loaded
    if (currentProject?.id === id) {
      setLoading(false);
      return;
    }

    // 2. Check useAppStore projects list
    const fromAppStore = projects.find((p) => p.id === id);
    if (fromAppStore) {
      setCurrentProject(fromAppStore);
      setLoading(false);
      return;
    }

    // 3. Check useProjectStore (used by dashboard + analysis)
    const fromProjectStore = projectStoreProjects.find((p) => p.id === id);
    if (fromProjectStore) {
      setCurrentProject(fromProjectStore);
      setLoading(false);
      return;
    }

    // 4. Fallback: check localStorage directly
    try {
      const stored = localStorage.getItem('pedabook-projects');
      if (stored) {
        const parsed = JSON.parse(stored) as { state?: { projects?: Project[] } };
        const list = parsed?.state?.projects ?? [];
        const found = list.find((p) => p.id === id);
        if (found) {
          setCurrentProject(found);
          setLoading(false);
          return;
        }
      }
    } catch {
      // ignore
    }

    setNotFound(true);
    setLoading(false);
  }, [id, currentProject, projects, projectStoreProjects, setCurrentProject]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-bg)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#1B3A6B] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[var(--color-text-muted)]">جاري تحميل المشروع...</span>
        </div>
      </div>
    );
  }

  if (notFound || !currentProject) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[var(--color-bg)] gap-4">
        <p className="text-xl font-semibold text-[var(--color-text)]">لم يتم العثور على المشروع</p>
        <p className="text-sm text-[var(--color-text-muted)]">المشروع بالمعرّف {id} غير موجود.</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-[#1B3A6B] text-white rounded-lg text-sm hover:bg-[#2a5298] transition-colors"
        >
          العودة إلى لوحة التحكم
        </button>
      </div>
    );
  }

  return <EditorLayout project={currentProject} />;
}
