import React, { useMemo, useState } from "react";
import { Shuffle } from "lucide-react";
import { useMedia } from "../context/MediaContext";
import { ReelCard } from "../components/ReelCard";
import { ShareSheet } from "../components/ShareSheet";
import { InfoSheet } from "../components/InfoSheet";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { AlbumPickerSheet } from "../components/AlbumPickerSheet";
import { EmptyState } from "../components/EmptyState";
import type { LocalMedia } from "../types/media";

function shuffled<T>(arr: T[], seed: number): T[] {
  const copy = [...arr];
  let s = seed || 1;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const Reels: React.FC = () => {
  const { videos, isFavorite, isLiked, onToggleFavorite, onToggleLike, deletedRecordId } = useMedia();
  const [seed] = useState(() => Date.now());
  const order = useMemo(() => shuffled(videos, seed), [videos, seed]);

  const [shareTarget, setShareTarget] = useState<LocalMedia | null>(null);
  const [infoTarget, setInfoTarget] = useState<LocalMedia | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LocalMedia | null>(null);
  const [albumSheetFor, setAlbumSheetFor] = useState<LocalMedia | null>(null);

  if (videos.length === 0) {
    return (
      <div className="h-[100dvh] flex flex-col">
        <ReelsHeader />
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={Shuffle}
            title="No reels yet"
            subtitle="Import some videos and PIXXA will turn them into a reels-style feed."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full relative">
      <ReelsHeader />
      <div className="h-full w-full overflow-y-scroll overscroll-contain snap-y snap-mandatory no-scrollbar">
        {order.map((media) => (
          <ReelCard
            key={media.clientId}
            media={media}
            caption="Random Moment"
            source="reels"
            isFavorite={isFavorite(media.clientId)}
            isLiked={isLiked(media.clientId)}
            onToggleFavorite={() => onToggleFavorite(media.clientId)}
            onToggleLike={() => onToggleLike(media.clientId)}
            onShare={() => setShareTarget(media)}
            onMore={() => setInfoTarget(media)}
          />
        ))}
      </div>

      {shareTarget && <ShareSheet media={shareTarget} onClose={() => setShareTarget(null)} />}
      {infoTarget && (
        <InfoSheet
          media={infoTarget}
          isFavorite={isFavorite(infoTarget.clientId)}
          onClose={() => setInfoTarget(null)}
          onToggleFavorite={() => onToggleFavorite(infoTarget.clientId)}
          onShare={() => setShareTarget(infoTarget)}
          onDelete={() => setDeleteTarget(infoTarget)}
          onAddToAlbum={() => setAlbumSheetFor(infoTarget)}
        />
      )}
      {albumSheetFor && <AlbumPickerSheet mediaClientId={albumSheetFor.clientId} onClose={() => setAlbumSheetFor(null)} />}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete this item?"
          message={deleteTarget.filename}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            deletedRecordId(deleteTarget.clientId);
            setDeleteTarget(null);
            setInfoTarget(null);
          }}
        />
      )}
    </div>
  );
};

const ReelsHeader: React.FC = () => (
  <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-4 pt-[calc(16px+env(safe-area-inset-top,0px))] pb-2 bg-gradient-to-b from-black/50 to-transparent">
    <div>
      <h1 className="text-white text-[22px] font-semibold tracking-tight">Reels</h1>
      <p className="text-white/55 text-[12px] mt-0.5">Random videos from your gallery</p>
    </div>
  </div>
);
