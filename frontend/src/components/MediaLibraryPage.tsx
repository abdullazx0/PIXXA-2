import React, { useMemo, useState } from "react";
import { Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import type { LocalMedia, FilterKey, MediaKind } from "../types/media";
import { useMedia } from "../context/MediaContext";
import { useMediaOverlays } from "../hooks/useMediaOverlays";
import { SectionHeader } from "./SectionHeader";
import { FilterChips } from "./FilterChips";
import { MediaGrid } from "./MediaGrid";
import { MediaViewer } from "./MediaViewer";
import { ShareSheet } from "./ShareSheet";
import { InfoSheet } from "./InfoSheet";
import { ConfirmDialog } from "./ConfirmDialog";
import { AlbumPickerSheet } from "./AlbumPickerSheet";
import { EmptyState } from "./EmptyState";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "albums", label: "Albums" },
  { key: "favorites", label: "Favorites" },
  { key: "recent", label: "Recent" },
];

export const MediaLibraryPage: React.FC<{ kind: MediaKind; onOpenAlbums: () => void }> = ({ kind, onOpenAlbums }) => {
  const { photos, videos, isFavorite, isLiked, onToggleFavorite, onToggleLike } = useMedia();
  const all = kind === "photo" ? photos : videos;

  const [filter, setFilter] = useState<FilterKey>("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = all;
    if (filter === "favorites") list = list.filter((m) => isFavorite(m.clientId));
    if (filter === "recent") list = [...list].slice(-30).reverse();
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.filename.toLowerCase().includes(q) ||
          m.extension.toLowerCase().includes(q) ||
          m.albumHint.toLowerCase().includes(q) ||
          (q === "favorite" && isFavorite(m.clientId))
      );
    }
    return list;
  }, [all, filter, search, isFavorite]);

  const handleFilterChange = (key: FilterKey) => {
    if (key === "albums") {
      onOpenAlbums();
      return;
    }
    setFilter(key);
  };

  const overlays = useMediaOverlays(filtered);
  const Icon = kind === "photo" ? ImageIcon : VideoIcon;
  const label = kind === "photo" ? "Photos" : "Videos";

  return (
    <div className="pb-28">
      <SectionHeader
        title={label}
        countLabel={`${all.length} ${label}`}
        search={search}
        onSearch={setSearch}
        searchOpen={searchOpen}
        onToggleSearch={() => setSearchOpen((s) => !s)}
        onMore={onOpenAlbums}
      />
      <FilterChips options={FILTERS} active={filter} onChange={handleFilterChange} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Icon}
          title={search ? "No results found" : `No ${label.toLowerCase()} yet`}
          subtitle={
            search
              ? "Try a different filename, extension or album."
              : `Import ${label.toLowerCase()} from your device to get started.`
          }
        />
      ) : (
        <MediaGrid items={filtered} onOpen={overlays.openViewer} />
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
