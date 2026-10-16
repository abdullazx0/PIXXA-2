import React, { useMemo, useState } from "react";
import { LayoutGrid } from "lucide-react";
import { useMedia } from "../context/MediaContext";
import { useMediaOverlays } from "../hooks/useMediaOverlays";
import { SectionHeader } from "../components/SectionHeader";
import { FilterChips } from "../components/FilterChips";
import { FeedCard } from "../components/FeedCard";
import { MediaViewer } from "../components/MediaViewer";
import { ShareSheet } from "../components/ShareSheet";
import { InfoSheet } from "../components/InfoSheet";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { AlbumPickerSheet } from "../components/AlbumPickerSheet";
import { EmptyState } from "../components/EmptyState";
import type { FeedFilterKey } from "../types/media";

const FILTERS: { key: FeedFilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "photos", label: "Photos" },
  { key: "videos", label: "Videos" },
  { key: "favorites", label: "Favorites" },
];

export const Feed: React.FC = () => {
  const { items, isFavorite, isLiked, onToggleFavorite, onToggleLike } = useMedia();
  const [filter, setFilter] = useState<FeedFilterKey>("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = items;
    if (filter === "photos") list = list.filter((m) => m.kind === "photo");
    if (filter === "videos") list = list.filter((m) => m.kind === "video");
    if (filter === "favorites") list = list.filter((m) => isFavorite(m.clientId));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((m) => m.filename.toLowerCase().includes(q) || m.extension.toLowerCase().includes(q));
    }
    return list;
  }, [items, filter, search, isFavorite]);

  const overlays = useMediaOverlays(filtered);

  return (
    <div className="pb-28">
      <SectionHeader
        title="Feed"
        subtitle="Your photos & videos in one continuous scroll"
        search={search}
        onSearch={setSearch}
        searchOpen={searchOpen}
        onToggleSearch={() => setSearchOpen((s) => !s)}
      />
      <FilterChips options={FILTERS} active={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <EmptyState icon={LayoutGrid} title="Nothing here yet" subtitle="Import photos and videos to start your feed." />
      ) : (
        <div className="pt-1">
          {filtered.map((media) => (
            <FeedCard
              key={media.clientId}
              media={media}
              isFavorite={isFavorite(media.clientId)}
              isLiked={isLiked(media.clientId)}
              onOpen={() => overlays.openViewer(media)}
              onToggleFavorite={() => onToggleFavorite(media.clientId)}
              onToggleLike={() => onToggleLike(media.clientId)}
              onShare={() => overlays.setShareTarget(media)}
              onMore={() => overlays.setInfoTarget(media)}
            />
          ))}
        </div>
      )}

      {overlays.current && (
        <MediaViewer
          media={overlays.current}
          index={overlays.viewerIndex!}
          total={filtered.length}
          isFavorite={isFavorite(overlays.current.clientId)}
          isLiked={isLiked(overlays.current.clientId)}
          onClose={() => overlays.setViewerIndex(null)}
          onToggleFavorite={() => onToggleFavorite(overlays.current!.clientId)}
          onToggleLike={() => onToggleLike(overlays.current!.clientId)}
          onShare={() => overlays.setShareTarget(overlays.current)}
          onInfo={() => overlays.setInfoTarget(overlays.current)}
          onDelete={() => overlays.setDeleteTarget(overlays.current)}
        />
      )}
      {overlays.shareTarget && <ShareSheet media={overlays.shareTarget} onClose={() => overlays.setShareTarget(null)} />}
      {overlays.infoTarget && (
        <InfoSheet
          media={overlays.infoTarget}
          isFavorite={isFavorite(overlays.infoTarget.clientId)}
          onClose={() => overlays.setInfoTarget(null)}
          onToggleFavorite={() => onToggleFavorite(overlays.infoTarget!.clientId)}
          onShare={() => overlays.setShareTarget(overlays.infoTarget)}
          onDelete={() => overlays.setDeleteTarget(overlays.infoTarget)}
          onAddToAlbum={() => overlays.setAlbumSheetFor(overlays.infoTarget)}
        />
      )}
      {overlays.albumSheetFor && (
        <AlbumPickerSheet mediaClientId={overlays.albumSheetFor.clientId} onClose={() => overlays.setAlbumSheetFor(null)} />
      )}
      {overlays.deleteTarget && (
        <ConfirmDialog
          title="Delete this item?"
          message={overlays.deleteTarget.filename}
          onCancel={() => overlays.setDeleteTarget(null)}
          onConfirm={overlays.confirmDelete}
        />
      )}
    </div>
  );
};
