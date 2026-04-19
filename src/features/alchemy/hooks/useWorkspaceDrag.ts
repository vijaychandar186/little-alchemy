'use client';

import { useCallback, useRef, useState } from 'react';
import type { WEl } from '../types';

interface Options {
  workspaceRef: React.RefObject<HTMLDivElement | null>;
  lookup: Map<string, string>;
  setWorkspace: React.Dispatch<React.SetStateAction<WEl[]>>;
  setDiscovered: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export function useWorkspaceDrag({
  workspaceRef,
  lookup,
  setWorkspace,
  setDiscovered
}: Options) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());
  const draggingIdRef = useRef<string | null>(null);
  const dragOffsetRef = useRef({ ox: 0, oy: 0 });
  const workspaceElsRef = useRef<WEl[]>([]);

  const syncRef = useCallback((els: WEl[]) => {
    workspaceElsRef.current = els;
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, id: string) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      const rect = workspaceRef.current?.getBoundingClientRect();
      const el = workspaceElsRef.current.find((w) => w.id === id);
      if (!el || !rect) return;
      dragOffsetRef.current = {
        ox: e.clientX - rect.left - el.x,
        oy: e.clientY - rect.top - el.y
      };
      draggingIdRef.current = id;
      setDraggingId(id);
    },
    [workspaceRef]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, id: string) => {
      if (draggingIdRef.current !== id) return;
      const rect = workspaceRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left - dragOffsetRef.current.ox;
      const y = e.clientY - rect.top - dragOffsetRef.current.oy;
      setWorkspace((prev) =>
        prev.map((w) => (w.id === id ? { ...w, x, y } : w))
      );
    },
    [workspaceRef, setWorkspace]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, id: string) => {
      if (draggingIdRef.current !== id) return;
      draggingIdRef.current = null;
      setDraggingId(null);
      setWorkspace((prev) => {
        const current = prev.find((w) => w.id === id);
        if (!current) return prev;
        const target = prev.find(
          (w) =>
            w.id !== id &&
            Math.abs(w.x - current.x) < 130 &&
            Math.abs(w.y - current.y) < 130
        );
        if (!target) return prev;
        const key = [current.name.toLowerCase(), target.name.toLowerCase()]
          .sort()
          .join('|');
        const result = lookup.get(key);
        if (!result) {
          setFailedIds((s) => new Set([...s, id, target.id]));
          setTimeout(
            () =>
              setFailedIds((s) => {
                const n = new Set(s);
                n.delete(id);
                n.delete(target.id);
                return n;
              }),
            800
          );
          return prev;
        }
        setDiscovered((d) => new Set([...d, result]));
        return [
          ...prev.filter((w) => w.id !== id && w.id !== target.id),
          {
            id: crypto.randomUUID(),
            name: result,
            x: (current.x + target.x) / 2,
            y: (current.y + target.y) / 2
          }
        ];
      });
    },
    [lookup, setWorkspace, setDiscovered]
  );

  const onRemove = useCallback(
    (id: string) => {
      setWorkspace((prev) => prev.filter((w) => w.id !== id));
    },
    [setWorkspace]
  );

  return {
    draggingId,
    failedIds,
    syncRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onRemove
  };
}
