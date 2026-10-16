import React from "react";
import { MediaLibraryPage } from "../components/MediaLibraryPage";

export const Photos: React.FC<{ onOpenAlbums: () => void }> = ({ onOpenAlbums }) => (
  <MediaLibraryPage kind="photo" onOpenAlbums={onOpenAlbums} />
);
