import React, { useEffect } from "react";
import { Heart, Star, Share2, MoreHorizontal } from "lucide-react";
import type { LocalMedia } from "../types/media";
import { formatDate } from "../utils/format";
import { useIntersectionPlay } from "../hooks/useIntersectionPlay";
import { useWatchTime } from "../hooks/useWatchTime";

export const FeedCard: React.FC<{
  media: LocalMedia;
  isFavorite: boolean;
  isLiked: boolean;
  onOpen: () => void;
  onToggleFavorite: () => void;
  onToggleLike: () => void;
  onShare: () => void;
  onMore: () => void;
}> = ({ media, isFavorite, isLiked, onOpen, onToggleFavorite, onToggleLike, onShare, onMore }) => {
  const isVideo = media.kind === "video";
  const { videoRef, isVisible } = useIntersectionPlay(0.5);
  const { tick, flush } = useWatchTime("feed", media.clientId);

  useEffect(() => {
    if (!isVideo) return;
    const v = videoRef.current;
    if (!v) return;
    const onFrame = () => tick(isVisible && !v.paused);
    v.addEventListener("timeupdate", onFrame);
    return () => {
      v.removeEventListener("timeupdate", onFrame);
      flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, isVideo]);

  return (
    <div className="px-3 py-2">
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <div className="w-7 h-7 rounded-full bg-white/15" />
          <div className="flex-1 min-w-0">
            <p className="text-white text-[13px] font-medium">Today</p>
            <p className="text-white/40 text-[11px]">{formatDate(media.capturedAt)}</p>
          </div>
          <button onClick={onMore} className="text-white/60">
            <MoreHorizontal size={17} />
          </button>
        </div>

        <button onClick={onOpen} className="relative w-full aspect-square block bg-black">
          {isVideo ? (
            <video
              ref={videoRef}
              src={media.url}
              loop
              muted
              playsInline
              className="w-full h-full object-cover grayscale-[0.12]"
            />
          ) : (
            <img src={media.url} alt={media.filename} loading="lazy" className="w-full h-full object-cover grayscale-[0.12]" />
          )}
        </button>

        <div className="flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-4">
            <button onClick={onToggleLike}>
              <Heart size={19} className={isLiked ? "text-white fill-white heart-pop" : "text-white/80"} />
            </button>
            <button onClick={onToggleFavorite}>
              <Star size={19} className={isFavorite ? "text-white fill-white heart-pop" : "text-white/80"} />
            </button>
            <button onClick={onShare}>
              <Share2 size={18} className="text-white/80" />
            </button>
          </div>
          <p className="text-white/40 text-[11.5px] truncate max-w-[45%]">{media.filename}</p>
        </div>
      </div>
    </div>
  );
};
