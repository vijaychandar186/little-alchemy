'use client';

import { useCallback, useRef, useState } from 'react';
import type { WEl } from '../types';

interface Options {
  workspaceRef: React.RefObject<HTMLDivElement | null>;
  setWorkspace: React.Dispatch<React.SetStateAction<WEl[]>>;
}

export function useSidebarDrag({ workspaceRef, setWorkspace }: Options) {
  const [sidebarDrag, setSidebarDrag] = useState<{
    name: string;
    x: number;
    y: number;
  } | null>(null);
  const sidebarDragRef = useRef<{
    name: string;
    startX: number;
    startY: number;
    dragging: boolean;
  } | null>(null);

  const onSidebarPointerDown = useCallback(
    (e: React.PointerEvent, name: string) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      sidebarDragRef.current = {
        name,
        startX: e.clientX,
        startY: e.clientY,
        dragging: false
      };
    },
    []
  );

  const onSidebarPointerMove = useCallback(
    (e: React.PointerEvent, name: string) => {
      const ref = sidebarDragRef.current;
      if (!ref || ref.name !== name) return;
      const moved = Math.hypot(e.clientX - ref.startX, e.clientY - ref.startY);
      if (moved > 6) {
        ref.dragging = true;
        setSidebarDrag({ name, x: e.clientX, y: e.clientY });
      } else if (ref.dragging) {
        setSidebarDrag({ name, x: e.clientX, y: e.clientY });
      }
    },
    []
  );

  const onSidebarPointerUp = useCallback(
    (e: React.PointerEvent, name: string) => {
      const ref = sidebarDragRef.current;
      if (!ref || ref.name !== name) return;
      const wasDragging = ref.dragging;
      sidebarDragRef.current = null;
      setSidebarDrag(null);

      const rect = workspaceRef.current?.getBoundingClientRect();
      if (wasDragging) {
        if (
          rect &&
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          setWorkspace((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              name,
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
            }
          ]);
        }
      } else {
        const w = rect?.width ?? 600;
        const h = rect?.height ?? 500;
        setWorkspace((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            name,
            x: 80 + Math.random() * (w - 160),
            y: 80 + Math.random() * (h - 160)
          }
        ]);
      }
    },
    [workspaceRef, setWorkspace]
  );

  return {
    sidebarDrag,
    onSidebarPointerDown,
    onSidebarPointerMove,
    onSidebarPointerUp
  };
}
