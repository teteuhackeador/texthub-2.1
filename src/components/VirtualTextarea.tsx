import { memo, useRef, useEffect, useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";

interface VirtualTextareaProps {
  lines: string[];
  className?: string;
  readOnly?: boolean;
  placeholder?: string;
  height?: number;
}

export const VirtualTextarea = memo(({
  lines,
  className,
  readOnly = false,
  placeholder,
  height = 300
}: VirtualTextareaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const rafRef = useRef<number | null>(null);

  const itemHeight = 20;
  const overscan = 20; // Increased overscan for smoother scrolling

  const updateVisibleRange = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      lines.length,
      Math.ceil((scrollTop + height) / itemHeight) + overscan
    );

    setVisibleRange(prev => {
      if (prev.start === start && prev.end === end) return prev;
      return { start, end };
    });
  }, [lines.length, height]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Cancel previous RAF to avoid stacking
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(updateVisibleRange);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    updateVisibleRange(); // Initial calculation

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [updateVisibleRange]);

  // Memoize visible lines to prevent unnecessary re-renders
  const visibleLines = useMemo(() => {
    return lines.slice(visibleRange.start, visibleRange.end);
  }, [lines, visibleRange.start, visibleRange.end]);

  const totalHeight = lines.length * itemHeight;

  if (lines.length === 0 && placeholder) {
    return (
      <div className={cn(
        "flex items-start justify-start w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
        readOnly && "bg-muted/30",
        className
      )}
      style={{ height }}
      >
        <span className="text-muted-foreground">{placeholder}</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full rounded-md border border-input bg-background overflow-auto",
        readOnly && "bg-muted/30",
        className
      )}
      style={{ height }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleLines.map((line, idx) => {
          const lineIndex = visibleRange.start + idx;
          return (
            <div
              key={lineIndex}
              style={{
                position: 'absolute',
                top: lineIndex * itemHeight,
                height: itemHeight,
                width: '100%',
                willChange: 'transform', // GPU acceleration hint
              }}
              className="px-3 text-sm font-mono whitespace-pre overflow-hidden text-ellipsis"
            >
              {line || '\u00A0'}
            </div>
          );
        })}
      </div>
    </div>
  );
});

VirtualTextarea.displayName = "VirtualTextarea";
