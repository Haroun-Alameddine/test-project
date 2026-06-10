'use client';

import React, { useState, useRef, useCallback } from 'react';
import type { CanvasObject, TextObjectData, ImageObjectData, ShapeObjectData, TableObjectData } from '@/types';
import { useAppStore, generateId } from '@/lib/store';
import { cn } from '@/lib/utils';
import TextObject from './objects/TextObject';
import ImageObject from './objects/ImageObject';
import ShapeObject from './objects/ShapeObject';
import TableObject from './objects/TableObject';
import { Copy, Trash2, Lock, Unlock, ArrowUp, ArrowDown } from 'lucide-react';

interface PageObjectProps {
  obj: CanvasObject;
  pageId: string;
  isSelected: boolean;
  zoom: number;
  onSelect: (id: string) => void;
}

type ResizeHandle = 'nw' | 'n' | 'ne' | 'w' | 'e' | 'sw' | 's' | 'se';

const HANDLE_CURSORS: Record<ResizeHandle, string> = {
  nw: 'nwse-resize', n: 'ns-resize', ne: 'nesw-resize',
  w: 'ew-resize',                    e: 'ew-resize',
  sw: 'nesw-resize', s: 'ns-resize', se: 'nwse-resize',
};

const RESIZE_HANDLES: Array<{ handle: ResizeHandle; x: string | number; y: string | number }> = [
  { handle: 'nw', x: -4, y: -4 },
  { handle: 'n', x: '50%', y: -4 },
  { handle: 'ne', x: '100%', y: -4 },
  { handle: 'e', x: '100%', y: '50%' },
  { handle: 'se', x: '100%', y: '100%' },
  { handle: 's', x: '50%', y: '100%' },
  { handle: 'sw', x: -4, y: '100%' },
  { handle: 'w', x: -4, y: '50%' },
];

export default function PageObject({ obj, pageId, isSelected, zoom, onSelect }: PageObjectProps) {
  const { updateObject, deleteObject, addObject, setSelectedObjectId } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; objX: number; objY: number } | null>(null);
  const resizeRef = useRef<{
    startX: number; startY: number;
    objX: number; objY: number;
    objW: number; objH: number;
    handle: ResizeHandle;
  } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (obj.locked) return;
      if ((e.target as HTMLElement).closest('[data-handle]')) return;
      e.stopPropagation();
      onSelect(obj.id);

      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        objX: obj.x,
        objY: obj.y,
      };

      const onMouseMove = (ev: MouseEvent) => {
        if (!dragRef.current) return;
        const dx = (ev.clientX - dragRef.current.startX) / zoom;
        const dy = (ev.clientY - dragRef.current.startY) / zoom;
        updateObject(pageId, obj.id, {
          x: dragRef.current.objX + dx,
          y: dragRef.current.objY + dy,
        });
      };

      const onMouseUp = () => {
        dragRef.current = null;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [obj, pageId, zoom, onSelect, updateObject]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (obj.type === 'text') setIsEditing(true);
    },
    [obj.type]
  );

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, handle: ResizeHandle) => {
      if (obj.locked) return;
      e.preventDefault();
      e.stopPropagation();
      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        objX: obj.x,
        objY: obj.y,
        objW: obj.width,
        objH: obj.height,
        handle,
      };
      const onMouseMove = (ev: MouseEvent) => {
        if (!resizeRef.current) return;
        const { startX, startY, objX, objY, objW, objH, handle: h } = resizeRef.current;
        const dx = (ev.clientX - startX) / zoom;
        const dy = (ev.clientY - startY) / zoom;
        let newX = objX, newY = objY, newW = objW, newH = objH;
        if (h.includes('e')) newW = Math.max(20, objW + dx);
        if (h.includes('w')) { newW = Math.max(20, objW - dx); newX = objX + (objW - newW); }
        if (h.includes('s')) newH = Math.max(20, objH + dy);
        if (h.includes('n')) { newH = Math.max(20, objH - dy); newY = objY + (objH - newH); }
        updateObject(pageId, obj.id, {
          x: Math.round(newX), y: Math.round(newY),
          width: Math.round(newW), height: Math.round(newH),
        });
      };
      const onMouseUp = () => {
        resizeRef.current = null;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [obj, pageId, zoom, updateObject],
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  }, []);

  const handleDuplicate = useCallback(() => {
    const dup: CanvasObject = { ...obj, id: generateId(), x: obj.x + 20, y: obj.y + 20 };
    addObject(pageId, dup);
    setSelectedObjectId(dup.id);
    setShowMenu(false);
  }, [obj, pageId, addObject, setSelectedObjectId]);

  const handleDelete = useCallback(() => {
    deleteObject(pageId, obj.id);
    setSelectedObjectId(null);
    setShowMenu(false);
  }, [obj.id, pageId, deleteObject, setSelectedObjectId]);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: obj.x,
    top: obj.y,
    width: obj.width,
    height: obj.height,
    transform: `rotate(${obj.rotation || 0}deg)`,
    cursor: obj.locked ? 'default' : 'move',
    userSelect: 'none',
    zIndex: obj.zIndex || 1,
    opacity: obj.visible === false ? 0 : 1,
    pointerEvents: obj.visible === false ? 'none' : 'auto',
  };

  return (
    <>
      <div
        style={style}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onClick={(e) => { e.stopPropagation(); onSelect(obj.id); }}
        className={cn('group', isSelected && !isEditing && 'ring-2 ring-blue-500 ring-offset-0')}
      >
        {/* Object content */}
        {obj.type === 'text' && (
          <TextObject
            data={obj.data as TextObjectData}
            isEditing={isEditing}
            onTextChange={(text) => {
              updateObject(pageId, obj.id, { data: { ...(obj.data as TextObjectData), text } });
            }}
          />
        )}
        {obj.type === 'image' && (
          <ImageObject
            data={obj.data as ImageObjectData}
            objectId={obj.id}
            pageId={pageId}
          />
        )}
        {(obj.type === 'shape' || obj.type === 'line') && (
          <ShapeObject
            data={obj.data as ShapeObjectData}
            width={obj.width}
            height={obj.height}
          />
        )}
        {obj.type === 'table' && (
          <TableObject
            data={obj.data as TableObjectData}
            objectId={obj.id}
            pageId={pageId}
            isSelected={isSelected}
          />
        )}

        {/* Selection handles */}
        {isSelected && !isEditing && !obj.locked && (
          <>
            {RESIZE_HANDLES.map(({ handle, x, y }) => (
              <div
                key={handle}
                data-handle="true"
                className="absolute w-2 h-2 bg-white border-2 border-blue-500 rounded-sm z-50"
                style={{
                  left: x,
                  top: y,
                  transform: 'translate(-50%, -50%)',
                  cursor: HANDLE_CURSORS[handle],
                }}
                onMouseDown={(e) => handleResizeMouseDown(e, handle)}
              />
            ))}
            {/* Rotation handle */}
            <div
              data-handle="true"
              className="absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full z-50"
              style={{
                left: '50%',
                top: -20,
                transform: 'translate(-50%, 0)',
                cursor: 'grab',
              }}
            />
          </>
        )}

        {/* Locked indicator */}
        {obj.locked && (
          <div className="absolute top-1 right-1 opacity-50">
            <Lock size={10} className="text-gray-600" />
          </div>
        )}
      </div>

      {/* Context menu */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div
            className="fixed bg-white rounded-xl shadow-xl border border-gray-200 z-[9999] py-1 min-w-[160px] text-sm"
            style={{ left: menuPos.x, top: menuPos.y, direction: 'rtl' }}
          >
            <button
              className="w-full px-3 py-1.5 text-right hover:bg-gray-50 flex items-center gap-2 justify-end"
              onClick={handleDuplicate}
            >
              <span>تكرار</span>
              <Copy size={14} />
            </button>
            <button
              className="w-full px-3 py-1.5 text-right hover:bg-gray-50 flex items-center gap-2 justify-end"
              onClick={() => {
                updateObject(pageId, obj.id, { locked: !obj.locked });
                setShowMenu(false);
              }}
            >
              <span>{obj.locked ? 'إلغاء القفل' : 'قفل'}</span>
              {obj.locked ? <Unlock size={14} /> : <Lock size={14} />}
            </button>
            <button
              className="w-full px-3 py-1.5 text-right hover:bg-gray-50 flex items-center gap-2 justify-end"
              onClick={() => {
                updateObject(pageId, obj.id, { zIndex: (obj.zIndex || 1) + 1 });
                setShowMenu(false);
              }}
            >
              <span>تقديم للأمام</span>
              <ArrowUp size={14} />
            </button>
            <button
              className="w-full px-3 py-1.5 text-right hover:bg-gray-50 flex items-center gap-2 justify-end"
              onClick={() => {
                updateObject(pageId, obj.id, { zIndex: Math.max(1, (obj.zIndex || 1) - 1) });
                setShowMenu(false);
              }}
            >
              <span>إرسال للخلف</span>
              <ArrowDown size={14} />
            </button>
            <hr className="my-1 border-gray-100" />
            <button
              className="w-full px-3 py-1.5 text-right hover:bg-red-50 text-red-600 flex items-center gap-2 justify-end"
              onClick={handleDelete}
            >
              <span>حذف</span>
              <Trash2 size={14} />
            </button>
          </div>
        </>
      )}

      {/* Click outside to stop editing */}
      {isEditing && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsEditing(false)}
        />
      )}
    </>
  );
}
