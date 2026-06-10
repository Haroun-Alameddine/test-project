'use client';

import React, { useState, useRef } from 'react';
import type { TableObjectData, TableCell } from '@/types';
import { useAppStore } from '@/lib/store';

interface TableObjectProps {
  data: TableObjectData;
  objectId: string;
  pageId: string;
  isSelected: boolean;
}

export default function TableObject({ data, objectId, pageId, isSelected }: TableObjectProps) {
  const updateObject = useAppStore((s) => s.updateObject);
  const [editingCell, setEditingCell] = useState<{ r: number; c: number } | null>(null);
  const cellRef = useRef<HTMLTableCellElement>(null);

  const handleCellDoubleClick = (r: number, c: number) => {
    if (isSelected) {
      setEditingCell({ r, c });
    }
  };

  const handleCellBlur = (r: number, c: number, content: string) => {
    const newCells = data.cells.map((row, ri) =>
      row.map((cell, ci) => (ri === r && ci === c ? { ...cell, content } : cell)),
    );
    updateObject(pageId, objectId, { data: { ...data, cells: newCells } });
    setEditingCell(null);
  };

  const bw = data.style?.borderWidth ?? 1;
  const bc = data.style?.borderColor ?? '#D1D5DB';
  const headerBg = data.style?.headerBackground ?? '#1B3A6B';

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13px',
          direction: 'rtl',
          fontFamily: 'Cairo, sans-serif',
        }}
      >
        <tbody>
          {data.cells.map((row, ri) => (
            <tr key={ri} style={{ background: data.style?.alternateRows && ri % 2 === 1 && ri !== 0 ? '#F9FAFB' : 'white' }}>
              {row.map((cell, ci) => {
                const isHeader = data.headerRow && ri === 0;
                const isEditing = editingCell?.r === ri && editingCell?.c === ci;
                return (
                  <td
                    key={ci}
                    ref={isEditing ? cellRef : undefined}
                    colSpan={cell.colspan || 1}
                    rowSpan={cell.rowspan || 1}
                    onDoubleClick={() => handleCellDoubleClick(ri, ci)}
                    style={{
                      border: `${bw}px solid ${bc}`,
                      padding: '6px 10px',
                      background: isHeader ? headerBg : (cell.background || 'transparent'),
                      color: isHeader ? '#ffffff' : (cell.style?.color || '#1C1C1C'),
                      fontWeight: isHeader ? '700' : (cell.style?.fontWeight || '400'),
                      textAlign: cell.style?.align || 'right',
                      cursor: isSelected ? 'text' : 'default',
                      minWidth: '60px',
                    }}
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={isEditing ? (e) => handleCellBlur(ri, ci, e.currentTarget.textContent || '') : undefined}
                  >
                    {!isEditing ? cell.content : undefined}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
