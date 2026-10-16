import React from "react";
import { MediaLibraryPage } from "../components/MediaLibraryPage";

export const Videos: React.FC<{ onOpenAlbums: () => void }> = ({ onOpenAlbums }) => (
  <MediaLibraryPage kind="video" onOpenAlbums={onOpenAlbums} />
);
