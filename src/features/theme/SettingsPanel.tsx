'use client';

import {
  Maximize2,
  Minimize2,
  Monitor,
  Moon,
  Settings,
  Sun,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { SCHEMES } from './scheme.config';
import { useScheme } from './SchemeProvider';

type Version = 'v1' | 'v2';

interface SettingsPanelProps {
  version: Version;
  onSwitchVersion: (v: Version) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onClear: () => void;
  onReset: () => void;
  popoverSide?: 'top' | 'bottom' | 'left' | 'right';
}

const THEME_OPTIONS = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' }
];

export function SettingsPanel({
  version,
  onSwitchVersion,
  isFullscreen,
  onToggleFullscreen,
  onClear,
  onReset,
  popoverSide = 'bottom'
}: SettingsPanelProps) {
  const { theme, setTheme } = useTheme();
  const { activeScheme, setActiveScheme } = useScheme();

  return (
    <Popover>
      <PopoverTrigger className='border-border text-muted-foreground hover:bg-accent hover:text-foreground flex h-7 w-7 items-center justify-center rounded-md border transition-colors'>
        <Settings size={13} />
        <span className='sr-only'>Settings</span>
      </PopoverTrigger>

      <PopoverContent align='end' side={popoverSide} className='w-56 p-0'>
        <div className='space-y-4 p-4'>
          {/* Theme (light/dark/system) */}
          <div>
            <p className='text-muted-foreground mb-2 text-[10px] font-semibold tracking-widest uppercase'>
              Theme
            </p>
            <div className='flex gap-1.5'>
              {THEME_OPTIONS.map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-lg border px-2 py-2 text-[10px] transition-colors ${
                    theme === value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Scheme */}
          <div>
            <p className='text-muted-foreground mb-2 text-[10px] font-semibold tracking-widest uppercase'>
              Scheme
            </p>
            <Select
              value={activeScheme}
              onValueChange={(v) => v && setActiveScheme(v)}
            >
              <SelectTrigger className='w-full'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCHEMES.map(({ name, value }) => (
                  <SelectItem key={value} value={value}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='border-border border-t' />

          {/* Version */}
          <div>
            <p className='text-muted-foreground mb-2 text-[10px] font-semibold tracking-widest uppercase'>
              Version
            </p>
            <div className='border-border flex overflow-hidden rounded border text-xs'>
              {(['v1', 'v2'] as Version[]).map((v) => (
                <button
                  key={v}
                  onClick={() => onSwitchVersion(v)}
                  className={`flex-1 py-1.5 uppercase transition-colors ${version === v ? 'bg-foreground text-background' : 'hover:bg-muted'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className='border-border border-t' />

          {/* Actions */}
          <div className='flex flex-col gap-1.5'>
            <button
              onClick={onToggleFullscreen}
              className='text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors'
            >
              {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            </button>
            <button
              onClick={onClear}
              className='text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors'
            >
              <Trash2 size={12} />
              Clear workspace
            </button>
            <button
              onClick={onReset}
              className='text-destructive hover:bg-destructive/10 flex items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors'
            >
              <RotateCcw size={12} />
              Reset progress
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
