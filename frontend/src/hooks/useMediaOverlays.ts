import { useState } from "react";
import type { LocalMedia } from "../types/media";
import { useMedia } from "../context/MediaContext";

export function useMediaOverlays(list: LocalMedia[]) {
  const { deletedRecordId } = useMedia();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [shareTarget, setShareTarget] = useState<LocalMedia | null>(null);
  const [infoTarget, setInfoTarget] = useState<LocalMedia | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LocalMedia | null>(null);
  const [albumSheetFor, setAlbumSheetFor] = useState<LocalMedia | null>(null);

  const openViewer = (item: LocalMedia) => {
    const idx = list.findIndex((i) => i.clientId === item.clientId);
    setViewerIndex(idx >= 0 ? idx : 0);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deletedRecordId(deleteTarget.clientId);
      setDeleteTarget(null);
      setViewerIndex(null);
      setInfoTarget(null);
    }
  };

  const current = viewerIndex !== null ? list[viewerIndex] : null;

  return {
    list,
    viewerIndex,
    current,
    setViewerIndex,
    openViewer,
    shareTarget,
    setShareTarget,
    infoTarget,
    setInfoTarget,
    deleteTarget,
    setDeleteTarget,
    albumSheetFor,
    setAlbumSheetFor,
    confirmDelete,
  };
}
