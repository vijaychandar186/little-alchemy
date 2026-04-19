'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  v1Data,
  v2Data,
  buildLookup,
  getStarters,
  loadState,
  saveState
} from './data';
import { useWorkspaceDrag } from './hooks/useWorkspaceDrag';
import { useSidebarDrag } from './hooks/useSidebarDrag';
import { WorkspaceCard } from './WorkspaceCard';
import { ElementGhost } from './ElementGhost';
import { ElementSidebar } from './Sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import type { Version, WEl } from './types';

export default function AlchemyGame({
  defaultOpen = true
}: {
  defaultOpen?: boolean;
}) {
  const [version, setVersion] = useState<Version>('v1');
  const [v1Disc, setV1Disc] = useState<Set<string>>(new Set());
  const [v2Disc, setV2Disc] = useState<Set<string>>(new Set());
  const [workspace, setWorkspace] = useState<WEl[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const activeData = version === 'v1' ? v1Data : v2Data;
  const discovered = version === 'v1' ? v1Disc : v2Disc;
  const setDiscovered = version === 'v1' ? setV1Disc : setV2Disc;
  const total = Object.keys(activeData).length;
  const lookup = useMemo(() => buildLookup(activeData), [activeData]);

  const {
    draggingId,
    failedIds,
    syncRef,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onRemove
  } = useWorkspaceDrag({ workspaceRef, lookup, setWorkspace, setDiscovered });

  const {
    sidebarDrag,
    onSidebarPointerDown,
    onSidebarPointerMove,
    onSidebarPointerUp
  } = useSidebarDrag({ workspaceRef, setWorkspace });

  useEffect(() => {
    syncRef(workspace);
  }, [workspace, syncRef]);

  useEffect(() => {
    const state = loadState();
    setV1Disc(new Set(state?.v1?.length ? state.v1 : getStarters(v1Data)));
    setV2Disc(new Set(state?.v2?.length ? state.v2 : getStarters(v2Data)));
    if (state?.version) setVersion(state.version);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(version, [...v1Disc], [...v2Disc]);
  }, [version, v1Disc, v2Disc, hydrated]);

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement)
      document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  const switchVersion = (v: Version) => {
    if (v === version) return;
    setVersion(v);
    setWorkspace([]);
  };

  const confirmReset = () => {
    setDiscovered(new Set(getStarters(activeData)));
    setWorkspace([]);
    setResetOpen(false);
  };

  if (!hydrated) return null;

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      className='h-screen min-h-0 overflow-hidden'
    >
      {/* main: header + workspace — flex-1 sibling of the sidebar gap */}
      <div className='bg-background text-foreground flex min-w-0 flex-1 flex-col overflow-hidden'>
        <header className='border-border flex h-12 shrink-0 items-center justify-between border-b px-4'>
          <span className='text-xs font-semibold tracking-[0.18em] uppercase select-none'>
            Little Alchemy
          </span>
          <SidebarTrigger />
        </header>

        <div
          ref={workspaceRef}
          className='bg-background relative flex-1 overflow-hidden'
        >
          {workspace.length === 0 && (
            <p className='text-muted-foreground/30 pointer-events-none absolute inset-0 flex items-center justify-center text-sm select-none'>
              Click or drag elements from the list to combine
            </p>
          )}
          {workspace.map((el) => (
            <WorkspaceCard
              key={el.id}
              el={el}
              isDragging={draggingId === el.id}
              isFailed={failedIds.has(el.id)}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onRemove={onRemove}
            />
          ))}
          <div className='pointer-events-none absolute bottom-4 left-5 leading-none select-none'>
            <span
              className='text-foreground/[0.07] font-light tabular-nums'
              style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)' }}
            >
              {discovered.size}/{total}
            </span>
          </div>
        </div>

        {sidebarDrag && (
          <ElementGhost
            name={sidebarDrag.name}
            x={sidebarDrag.x}
            y={sidebarDrag.y}
          />
        )}

        <Dialog open={resetOpen} onOpenChange={setResetOpen}>
          <DialogContent className='sm:max-w-sm'>
            <DialogHeader>
              <DialogTitle>Reset progress?</DialogTitle>
              <DialogDescription>
                All discovered {version === 'v1' ? 'Version 1' : 'Version 2'}{' '}
                elements will be lost. This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className='gap-2'>
              <Button variant='outline' onClick={() => setResetOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmReset}>Reset</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* sidebar — direct child of SidebarProvider so its gap div is a flex sibling */}
      <ElementSidebar
        discovered={discovered}
        onItemPointerDown={onSidebarPointerDown}
        onItemPointerMove={onSidebarPointerMove}
        onItemPointerUp={onSidebarPointerUp}
        version={version}
        onSwitchVersion={switchVersion}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onClear={() => setWorkspace([])}
        onReset={() => setResetOpen(true)}
      />
    </SidebarProvider>
  );
}
