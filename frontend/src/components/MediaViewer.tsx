import React, { useRef, useState } from "react";
import { X, Heart, Star, Share2, Info, Trash2, Play, Pause, Maximize } from "lucide-react";
import type { LocalMedia } from "../types/media";

export const MediaViewer: React.FC<{
  media: LocalMedia;
  index: number;
  total: number;
  isFavorite: boolean;
  isLiked: boolean;
  onClose: () => void;
  onToggleFavorite: () => void;
  onToggleLike: () => void;
  onShare: () => void;
  onInfo: () => void;
  onDelete: () => void;
}> = ({ media, index, total, isFavorite, isLiked, onClose, onToggleFavorite, onToggleLike, onShare, onInfo, onDelete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Number(e.target.value);
    setProgress(Number(e.target.value));
  };

  const enterFullscreen = () => {
    videoRef.current?.requestFullscreen?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 pt-[calc(14px+env(safe-area-inset-top,0px))] pb-3 relative z-10">
        <button onClick={onClose} className="w-9 h-9 rounded-full glass-panel flex items-center justify-center text-white">
          <X size={17} />
        </button>
        <span className="text-white/70 text-[13px]">
          {index + 1}/{total}
        </span>
        <button onClick={onInfo} className="w-9 h-9 rounded-full glass-panel flex items-center justify-center text-white">
          <Info size={17} />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden relative">
        {media.kind === "photo" ? (
          <img src={media.url} alt={media.filename} className="max-w-full max-h-full object-contain select-none" draggable={false} />
        ) : (
          <>
            <video
              ref={videoRef}
              src={media.url}
              className="max-w-full max-h-full object-contain"
              playsInline
              onClick={togglePlay}
              onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
            {!playing && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center"
                aria-label="Play"
              >
                <span className="w-16 h-16 rounded-full glass-panel-strong flex items-center justify-center">
                  <Play size={26} className="text-white fill-white" />
                </span>
              </button>
            )}
          </>
        )}
      </div>

      {media.kind === "video" && (
        <div className="px-4 pb-2 flex items-center gap-3">
          <button onClick={togglePlay} className="text-white">
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={progress}
            onChange={seek}
            className="flex-1 h-1 accent-white"
          />
          <button onClick={enterFullscreen} className="text-white">
            <Maximize size={16} />
          </button>
        </div>
      )}

      <div className="px-2 pb-[calc(16px+env(safe-area-inset-bottom,0px))] pt-1">
        <p className="text-white/80 text-[13px] text-center mb-3 truncate px-6">{media.filename}</p>
        <div className="flex items-center justify-center gap-8">
          <ActionBtn icon={Heart} label="Like" active={isLiked} onClick={onToggleLike} />
          <ActionBtn icon={Star} label="Favorite" active={isFavorite} onClick={onToggleFavorite} />
          <ActionBtn icon={Share2} label="Share" onClick={onShare} />
          <ActionBtn icon={Info} label="Info" onClick={onInfo} />
          <ActionBtn icon={Trash2} label="Delete" onClick={onDelete} danger />
        </div>
      </div>
    </div>
  );
};

const ActionBtn: React.FC<{ icon: React.ElementType; label: string; onClick: () => void; active?: boolean; danger?: boolean }> = ({
  icon: Icon,
  label,
  onClick,
  active,
  danger,
}) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1.5">
    <Icon
      size={21}
      strokeWidth={1.8}
      className={`${danger ? "text-red-400/90" : active ? "text-white fill-white" : "text-white/85"} ${active ? "heart-pop" : ""}`}
    />
    <span className="text-[10.5px] text-white/50">{label}</span>
  </button>
);
