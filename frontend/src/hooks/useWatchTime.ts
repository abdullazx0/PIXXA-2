import { useCallback, useEffect, useRef } from "react";
import { logWatchTime } from "../api/social";

const FLUSH_INTERVAL_MS = 5000;

/**
 * Accumulates real watch time for one video element and flushes it to the
 * backend periodically. Time only accrues while `isPlayingVisible` is true
 * (visible in viewport AND not paused AND tab is foregrounded) - see
 * useIntersectionPlay + document.visibilitychange handling below.
 */
export function useWatchTime(source: "videos" | "reels" | "feed", mediaClientId: string) {
  const accumulated = useRef(0);
  const lastTick = useRef<number | null>(null);

  const flush = useCallback(() => {
    if (accumulated.current > 0.5) {
      logWatchTime(source, mediaClientId, accumulated.current);
      accumulated.current = 0;
    }
  }, [source, mediaClientId]);

  useEffect(() => {
    const interval = setInterval(flush, FLUSH_INTERVAL_MS);
    const onHide = () => {
      lastTick.current = null;
      flush();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onHide);
      flush();
    };
  }, [flush]);

  const tick = useCallback((isPlayingVisible: boolean) => {
    const now = performance.now();
    if (isPlayingVisible && document.visibilityState === "visible") {
      if (lastTick.current !== null) {
        accumulated.current += (now - lastTick.current) / 1000;
      }
      lastTick.current = now;
    } else {
      lastTick.current = null;
    }
  }, []);

  return { tick, flush };
}
