'use client';

import { createPortal } from 'react-dom';
import { ElemIcon } from './ElemIcon';

export function ElementGhost({
  name,
  x,
  y
}: {
  name: string;
  x: number;
  y: number;
}) {
  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0.8
      }}
      className='border-border bg-background flex w-20 flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 shadow-lg'
    >
      <ElemIcon name={name} size={36} />
      <span className='line-clamp-2 w-full text-center text-[10px] leading-tight'>
        {name}
      </span>
    </div>,
    document.body
  );
}
