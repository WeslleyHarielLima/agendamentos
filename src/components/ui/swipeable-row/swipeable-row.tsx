'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type SwipeableRowProps = {
  children: React.ReactNode;
  renderActions: (close: () => void) => React.ReactNode;
  actionsWidth: number;
  className?: string;
};

export function SwipeableRow({
  children,
  renderActions,
  actionsWidth,
  className,
}: SwipeableRowProps) {
  const [offset, setOffset] = useState(0);
  const [animating, setAnimating] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const startOffset = useRef(0);
  const tracking = useRef(false);
  const axis = useRef<'h' | 'v' | null>(null);
  const currentOffset = useRef(0);

  const close = useCallback(() => {
    currentOffset.current = 0;
    setAnimating(true);
    setOffset(0);
  }, []);

  const openRow = useCallback(() => {
    currentOffset.current = -actionsWidth;
    setAnimating(true);
    setOffset(-actionsWidth);
  }, [actionsWidth]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const onStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      startOffset.current = currentOffset.current;
      tracking.current = true;
      axis.current = null;
      setAnimating(false);
    };

    const onMove = (e: TouchEvent) => {
      if (!tracking.current) return;

      const dx = e.touches[0].clientX - startX.current;
      const dy = e.touches[0].clientY - startY.current;

      if (axis.current === null) {
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
          axis.current = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
        }
        return;
      }

      if (axis.current === 'v') return;

      e.preventDefault();

      const next = Math.max(
        -actionsWidth,
        Math.min(0, startOffset.current + dx)
      );
      currentOffset.current = next;
      setOffset(next);
    };

    const onEnd = () => {
      if (!tracking.current) return;
      tracking.current = false;
      if (axis.current !== 'h') return;

      if (currentOffset.current < -(actionsWidth / 3)) {
        openRow();
      } else {
        close();
      }
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
    };
  }, [actionsWidth, close, openRow]);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Botões de ação (apenas mobile) — ficam atrás do conteúdo */}
      <div
        className="absolute right-0 top-0 bottom-0 md:hidden flex items-stretch"
        style={{ width: actionsWidth }}
      >
        {renderActions(close)}
      </div>

      {/* Conteúdo deslizável — z-index maior para cobrir os botões */}
      <div
        ref={contentRef}
        onClick={offset < 0 ? close : undefined}
        className="relative z-1"
        style={{
          transform: `translateX(${offset}px)`,
          transition: animating
            ? 'transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)'
            : 'none',
          touchAction: 'pan-y',
        }}
      >
        {children}
      </div>
    </div>
  );
}
