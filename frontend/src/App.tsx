import React, { useState } from "react";
import { MediaProvider, useMedia } from "./context/MediaContext";
import { Onboarding } from "./pages/Onboarding";
import { Photos } from "./pages/Photos";
import { Videos } from "./pages/Videos";
import { Reels } from "./pages/Reels";
import { Feed } from "./pages/Feed";
import { MySpace } from "./pages/MySpace";
import { Albums } from "./pages/Albums";
import { BottomNav } from "./components/BottomNav";
import { useSwipeNav } from "./hooks/useSwipeNav";

export type Section = "photos" | "videos" | "reels" | "feed" | "myspace";
const ORDER: Section[] = ["photos", "videos", "reels", "feed", "myspace"];

const AppShell: React.FC = () => {
  const { items, permission } = useMedia();
  const [section, setSection] = useState<Section>("photos");
  const [albumsOpen, setAlbumsOpen] = useState(false);

  const hasEntered = items.length > 0 || permission !== "unrequested";

  const goRelative = (dir: 1 | -1) => {
    const idx = ORDER.indexOf(section);
    const next = ORDER[Math.min(ORDER.length - 1, Math.max(0, idx + dir))];
    setSection(next);
  };

  const swipe = useSwipeNav({
    onSwipeLeft: () => goRelative(1),
    onSwipeRight: () => goRelative(-1),
  });

  if (!hasEntered) {
    return <Onboarding />;
  }

  if (albumsOpen) {
    return <Albums onClose={() => setAlbumsOpen(false)} />;
  }

  return (
    <div className="min-h-[100dvh] bg-black" onTouchStart={swipe.onTouchStart} onTouchEnd={swipe.onTouchEnd}>
      {section === "photos" && <Photos onOpenAlbums={() => setAlbumsOpen(true)} />}
      {section === "videos" && <Videos onOpenAlbums={() => setAlbumsOpen(true)} />}
      {section === "reels" && <Reels />}
      {section === "feed" && <Feed />}
      {section === "myspace" && <MySpace onOpenAlbums={() => setAlbumsOpen(true)} />}
      <BottomNav active={section} onSelect={setSection} />
    </div>
  );
};

export default function App() {
  return (
    <MediaProvider>
      <AppShell />
    </MediaProvider>
  );
}
