import { ElemIcon } from './ElemIcon';
import type { WEl } from './types';

interface CardProps {
  el: WEl;
  isDragging: boolean;
  isFailed: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>, id: string) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>, id: string) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>, id: string) => void;
  onRemove: (id: string) => void;
}

export function WorkspaceCard({
  el,
  isDragging,
  isFailed,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onRemove
}: CardProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: el.x,
        top: el.y,
        transform: 'translate(-50%, -50%)',
        zIndex: isDragging ? 50 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none'
      }}
      className={`group bg-background flex w-20 flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 shadow-sm transition-shadow hover:shadow-md ${isFailed ? 'animate-shake border-destructive ring-destructive/40 ring-2' : 'border-border'}`}
      onPointerDown={(e) => onPointerDown(e, el.id)}
      onPointerMove={(e) => onPointerMove(e, el.id)}
      onPointerUp={(e) => onPointerUp(e, el.id)}
    >
      <button
        className='bg-foreground text-background absolute -top-1.5 -right-1.5 hidden h-4 w-4 items-center justify-center rounded-full text-[9px] opacity-60 group-hover:flex hover:opacity-100'
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onRemove(el.id)}
      >
        ×
      </button>
      <ElemIcon name={el.name} size={36} />
      <span className='line-clamp-2 w-full text-center text-[10px] leading-tight'>
        {el.name}
      </span>
    </div>
  );
}
