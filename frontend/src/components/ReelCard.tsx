import React, { useEffect } from "react";
import { Heart, Star, Share2, MoreHorizontal } from "lucide-react";
import type { LocalMedia } from "../types/media";
import { useIntersectionPlay } from "../hooks/useIntersectionPlay";
import { useWatchTime } from "../hooks/useWatchTime";

export const ReelCard: React.FC<{
  media: LocalMedia;
  caption: string;
  source: "reels" | "feed";
  isFavorite: boolean;
  isLiked: boolean;
  onToggleFavorite: () => void;
  onToggleLike: () => void;
  onShare: () => void;
  onMore: () => void;
}> = ({ media, caption, source, isFavorite, isLiked, onToggleFavorite, onToggleLike, onShare, onMore }) => {
  const { videoRef, isVisible } = useIntersectionPlay(0.65);
  const { tick, flush } = useWatchTime(source, media.clientId);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onFrame = () => tick(isVisible && !v.paused);
    v.addEventListener("timeupdate", onFrame);
    v.addEventListener("play", onFrame);
    v.addEventListener("pause", () => tick(false));
    return () => {
      v.removeEventListener("timeupdate", onFrame);
      v.removeEventListener("play", onFrame);
      flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  return (
    <div className="relative h-full w-full snap-start flex items-center justify-center bg-black overflow-hidden">
      <video
        ref={videoRef}
        src={media.url}
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover grayscale-[0.1]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />

      <div className="absolute left-4 right-20 bottom-[calc(28px+env(safe-area-inset-bottom,0px))] text-white">
        <p className="text-[14px] font-medium">{media.filename}</p>
        <p className="text-white/60 text-[12.5px] mt-0.5">{caption}</p>
      </div>

      <div className="absolute right-3 bottom-[calc(28px+env(safe-area-inset-bottom,0px))] flex flex-col items-center gap-5">
        <SideBtn icon={Heart} active={isLiked} onClick={onToggleLike} />
        <SideBtn icon={Star} active={isFavorite} onClick={onToggleFavorite} />
        <SideBtn icon={Share2} onClick={onShare} />
        <SideBtn icon={MoreHorizontal} onClick={onMore} />
      </div>
    </div>
  );
};

const SideBtn: React.FC<{ icon: React.ElementType; active?: boolean; onClick: () => void }> = ({
  icon: Icon,
  active,
  onClick,
}) => (
  <button onClick={onClick} className="flex flex-col items-center">
    <span className="w-11 h-11 rounded-full glass-panel flex items-center justify-center">
      <Icon size={19} className={active ? "text-white fill-white heart-pop" : "text-white/90"} />
    </span>
  </button>
);
