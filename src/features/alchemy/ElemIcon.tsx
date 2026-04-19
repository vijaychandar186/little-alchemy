'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getIconNum } from './data';

function iconSrc(num: number) {
  return num >= 599 ? `/icons/${num}.svg` : `/icons/${num}.png`;
}

export function ElemIcon({ name, size = 28 }: { name: string; size?: number }) {
  const num = getIconNum(name);
  const [src, setSrc] = useState<string | null>(num ? iconSrc(num) : null);

  useEffect(() => {
    const n = getIconNum(name);
    setSrc(n ? iconSrc(n) : null);
  }, [name]);

  if (!src)
    return (
      <span
        className='bg-foreground/10 text-foreground/40 inline-flex shrink-0 items-center justify-center rounded font-bold select-none'
        style={{
          width: size,
          height: size,
          fontSize: Math.max(10, size * 0.38)
        }}
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );

  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      unoptimized
      className='shrink-0 object-contain'
      style={{ width: size, height: size }}
    />
  );
}
