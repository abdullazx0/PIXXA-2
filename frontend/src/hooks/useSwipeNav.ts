import { useRef } from "react";

interface Options {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number;
}

/**
 * Detects a horizontal swipe gesture without hijacking vertical scrolling.
 * Attach the returned handlers to the section container's touch events.
 */
export function useSwipeNav({ onSwipeLeft, onSwipeRight, threshold = 60 }: Options) {
  const startX = useRef(0);
  const startY = useRef(0);
  const tracking = useRef(false);

  const onTouchStart = (e: React.TouchEvent) => {
    // Ignore gestures that start on sliders, horizontally scrolling rows
    // ([data-no-swipe]) or full-screen overlays (viewer, sheets).
    const target = e.target as HTMLElement;
    if (target.closest("input, [data-no-swipe], .fixed:not([data-nav])")) {
      tracking.current = false;
      return;
    }
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    tracking.current = true;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!tracking.current) return;
    tracking.current = false;
    const dx = e.changedTouches[0].clientX - startX.current;
    const dy = e.changedTouches[0].clientY - startY.current;

    // Only treat as a horizontal swipe if it clearly dominates over
    // vertical movement, so normal vertical scrolling is never hijacked.
    if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) onSwipeLeft();
      else onSwipeRight();
    }
  };

  return { onTouchStart, onTouchEnd };
}
