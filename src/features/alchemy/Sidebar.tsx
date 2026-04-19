'use client';

import { useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SettingsPanel } from '@/features/theme/SettingsPanel';
import { ElemIcon } from './ElemIcon';
import type { Version } from './types';

interface ElementSidebarProps {
  discovered: Set<string>;
  onItemPointerDown: (e: React.PointerEvent, name: string) => void;
  onItemPointerMove: (e: React.PointerEvent, name: string) => void;
  onItemPointerUp: (e: React.PointerEvent, name: string) => void;
  version: Version;
  onSwitchVersion: (v: Version) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onClear: () => void;
  onReset: () => void;
}

export function ElementSidebar({
  discovered,
  onItemPointerDown,
  onItemPointerMove,
  onItemPointerUp,
  version,
  onSwitchVersion,
  isFullscreen,
  onToggleFullscreen,
  onClear,
  onReset
}: ElementSidebarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const allSorted = useMemo(
    () => [...discovered].sort((a, b) => a.localeCompare(b)),
    [discovered]
  );

  const grouped = useMemo(() => {
    const g: Record<string, string[]> = {};
    for (const el of allSorted) {
      const l = el.charAt(0).toUpperCase();
      (g[l] ??= []).push(el);
    }
    return g;
  }, [allSorted]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? allSorted.filter((n) => n.toLowerCase().includes(q)) : allSorted;
  }, [allSorted, query]);

  const handleSearchClose = (open: boolean) => {
    if (!open) setQuery('');
    setSearchOpen(open);
  };

  return (
    <>
      <Sidebar side='right' collapsible='icon' className='border-l'>
        <SidebarHeader className='border-b p-0'>
          {/* expanded */}
          <div className='flex h-12 items-center justify-between px-3 group-data-[collapsible=icon]:hidden'>
            <div className='flex items-center gap-2'>
              <div className='bg-card flex h-6 min-w-6 items-center justify-center rounded-md border px-1.5 shadow-sm'>
                <span className='text-muted-foreground text-[10px] leading-none font-semibold tabular-nums'>
                  {discovered.size}
                </span>
              </div>
              <span className='text-muted-foreground text-[10px] tracking-widest uppercase select-none'>
                found
              </span>
            </div>
            <Button
              variant='ghost'
              size='icon-sm'
              onClick={() => setSearchOpen(true)}
            >
              <Search className='h-3.5 w-3.5' />
            </Button>
          </div>
          {/* collapsed */}
          <div className='hidden flex-col items-center gap-1 py-2 group-data-[collapsible=icon]:flex'>
            <div className='bg-card flex h-7 w-7 items-center justify-center rounded-md border shadow-sm'>
              <span className='text-muted-foreground text-[10px] leading-none font-semibold tabular-nums'>
                {discovered.size}
              </span>
            </div>
            <Button
              variant='ghost'
              size='icon-sm'
              className='h-7 w-7'
              onClick={() => setSearchOpen(true)}
            >
              <Search className='h-3.5 w-3.5' />
            </Button>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {Object.entries(grouped).map(([letter, els]) => (
            <SidebarGroup
              key={letter}
              ref={(el: HTMLDivElement | null) => {
                sectionRefs.current[letter] = el;
              }}
              className='py-0'
            >
              <SidebarGroupLabel className='text-muted-foreground/40 text-[10px] font-semibold tracking-widest uppercase group-data-[collapsible=icon]:hidden'>
                {letter}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {els.map((name) => (
                    <SidebarMenuItem key={name}>
                      <SidebarMenuButton
                        tooltip={name}
                        className='cursor-grab group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!p-0 active:cursor-grabbing'
                        onPointerDown={(e) => onItemPointerDown(e, name)}
                        onPointerMove={(e) => onItemPointerMove(e, name)}
                        onPointerUp={(e) => onItemPointerUp(e, name)}
                      >
                        <div className='bg-card flex h-7 w-7 shrink-0 items-center justify-center rounded-md border shadow-sm'>
                          <ElemIcon name={name} size={18} />
                        </div>
                        <span className='truncate group-data-[collapsible=icon]:hidden'>
                          {name}
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className='border-t p-0'>
          {/* expanded */}
          <div className='flex h-12 items-center px-3 group-data-[collapsible=icon]:hidden'>
            <SettingsPanel
              version={version}
              onSwitchVersion={onSwitchVersion}
              isFullscreen={isFullscreen}
              onToggleFullscreen={onToggleFullscreen}
              onClear={onClear}
              onReset={onReset}
              popoverSide='top'
            />
          </div>
          {/* collapsed */}
          <div className='hidden flex-col items-center py-2 group-data-[collapsible=icon]:flex'>
            <SettingsPanel
              version={version}
              onSwitchVersion={onSwitchVersion}
              isFullscreen={isFullscreen}
              onToggleFullscreen={onToggleFullscreen}
              onClear={onClear}
              onReset={onReset}
              popoverSide='left'
            />
          </div>
        </SidebarFooter>
      </Sidebar>

      <Dialog open={searchOpen} onOpenChange={handleSearchClose}>
        <DialogContent className='gap-3 sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Search elements</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            placeholder='Type to search…'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <p className='text-muted-foreground text-[11px]'>
            {searchResults.length} found
          </p>
          <ScrollArea className='-mx-1 h-60 px-1'>
            <div className='space-y-0.5'>
              {searchResults.map((name) => (
                <div
                  key={name}
                  className='hover:bg-accent flex items-center gap-2 rounded-md px-2 py-1'
                >
                  <div className='bg-card flex h-7 w-7 shrink-0 items-center justify-center rounded-md border shadow-sm'>
                    <ElemIcon name={name} size={18} />
                  </div>
                  <span className='text-sm'>{name}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
