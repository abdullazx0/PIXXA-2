import { useEffect, useRef, useState } from "react";

/**
 * Plays a <video> only while it's substantially visible, pauses it the
 * moment it isn't - used by Reels/Feed so off-screen videos never keep
 * decoding frames or burning battery/memory.
 */
export function useIntersectionPlay(threshold = 0.6) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting && entry.intersectionRatio >= threshold;
        setIsVisible(visible);
        if (visible) {
          el.play().catch(() => {
            /* autoplay can be blocked until user interacts once - fine */
          });
        } else {
          el.pause();
        }
      },
      { threshold: [0, threshold, 1] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { videoRef, isVisible };
}
