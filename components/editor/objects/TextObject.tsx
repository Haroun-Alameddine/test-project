'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import type { TextObjectData } from '@/types';

interface TextObjectProps {
  data: TextObjectData;
  isEditing: boolean;
  onTextChange?: (newText: string) => void;
}

export default function TextObject({ data, isEditing, onTextChange }: TextObjectProps) {
  const editRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      // Place cursor at end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  const handleInput = useCallback(() => {
    if (editRef.current && onTextChange) {
      onTextChange(editRef.current.innerHTML);
    }
  }, [onTextChange]);

  const style: React.CSSProperties = {
    fontFamily: data.style.fontFamily || 'Cairo',
    fontSize: `${data.style.fontSize || 16}px`,
    fontWeight: data.style.fontWeight || '400',
    color: data.style.color || '#1C1C1C',
    textAlign: data.style.align || 'right',
    direction: data.style.direction || 'rtl',
    lineHeight: data.style.lineHeight || 1.6,
    letterSpacing: `${data.style.letterSpacing || 0}px`,
    background: data.background || 'transparent',
    borderColor: data.borderColor || 'transparent',
    borderWidth: data.borderWidth ? `${data.borderWidth}px` : '0',
    borderStyle: data.borderWidth ? 'solid' : 'none',
    borderRadius: `${data.borderRadius || 0}px`,
    padding: `${data.padding?.top ?? 4}px ${data.padding?.right ?? 8}px ${data.padding?.bottom ?? 4}px ${data.padding?.left ?? 8}px`,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    boxSizing: 'border-box',
    wordBreak: 'break-word',
  };

  if (isEditing) {
    return (
      <div
        ref={editRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        style={style}
        className="outline-none"
        dangerouslySetInnerHTML={{ __html: data.text || '' }}
      />
    );
  }

  return (
    <div
      style={style}
      dangerouslySetInnerHTML={{ __html: data.text || '<span style="opacity:0.4">نقر مزدوج للتحرير...</span>' }}
    />
  );
}
