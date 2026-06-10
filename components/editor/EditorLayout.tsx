'use client';

import React, { useState } from 'react';
import type { Project } from '@/types';
import TopBar from './TopBar';
import LeftSidebar from './LeftSidebar';
import CanvasArea from './CanvasArea';
import RightSidebar from './RightSidebar';
import { useEditorKeyboard } from './useEditorKeyboard';

interface EditorLayoutProps {
  project: Project;
}

export default function EditorLayout({ project }: EditorLayoutProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const currentPage = project.pages[currentPageIndex] ?? project.pages[0];

  // Register keyboard shortcuts
  useEditorKeyboard(currentPage?.id ?? null);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--color-bg)] select-none">
      {/* Top Bar */}
      <TopBar project={project} />

      {/* Main content: left sidebar + canvas + right sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar
          project={project}
          currentPageIndex={currentPageIndex}
          onPageSelect={setCurrentPageIndex}
        />

        {/* Canvas Area */}
        <CanvasArea
          project={project}
          currentPage={currentPage}
          currentPageIndex={currentPageIndex}
        />

        {/* Right Sidebar */}
        <RightSidebar
          project={project}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
}
