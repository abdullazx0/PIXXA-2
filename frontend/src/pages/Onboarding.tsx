import React, { useRef, useState } from "react";
import { Lock, ShieldCheck, HardDrive, ArrowRight, RotateCcw } from "lucide-react";
import { useMedia } from "../context/MediaContext";

export const Onboarding: React.FC = () => {
  const { requestAccess, importViaInput, permission, supportsDirectoryPicker, loading } = useMedia();
  const inputRef = useRef<HTMLInputElement>(null);
  const [attempted, setAttempted] = useState(false);

  const handleAllow = async () => {
    setAttempted(true);
    if (supportsDirectoryPicker) {
      await requestAccess();
    } else {
      inputRef.current?.click();
    }
  };

  const handleFileFallback = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await importViaInput(e.target.files, "Imported");
  };

  const showDenied = attempted && permission === "denied" && !loading;

  return (
    <div className="min-h-[100dvh] bg-black flex flex-col justify-between px-6 pt-[calc(48px+env(safe-area-inset-top,0px))] pb-[calc(32px+env(safe-area-inset-bottom,0px))] relative overflow-hidden">
      {/* ambient glass orbs, purely decorative */}
      <div className="pointer-events-none absolute -top-10 -right-16 w-56 h-56 rounded-full bg-white/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-16 w-40 h-40 rounded-full bg-white/[0.04] blur-3xl" />

      <div className="relative z-10">
        <h1 className="text-white text-[38px] leading-[1.08] font-semibold tracking-tight">
          Your
          <br />
          Memories,
          <br />
          Your Space
        </h1>
        <p className="text-white/50 text-[15px] leading-relaxed mt-4 max-w-[280px]">
          {showDenied
            ? "We couldn't access your media that time. You can try again, or import photos and videos manually below."
            : "Give access to your photos and videos to view, organize and enjoy them in one place."}
        </p>
      </div>

      <div className="relative z-10 flex justify-center my-10">
        <div className="relative w-52 h-40">
          <div className="absolute inset-0 translate-x-5 -translate-y-3 rotate-6 glass-panel rounded-2xl" />
          <div className="absolute inset-0 -translate-x-4 translate-y-1 -rotate-3 glass-panel rounded-2xl" />
          <div className="absolute inset-0 glass-panel-strong rounded-2xl flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/12 flex items-center justify-center">
              <Lock size={22} className="text-white/85" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <div className="grid grid-cols-3 gap-2 mb-8 text-center">
          <Badge icon={ShieldCheck} label="Stays on your device" />
          <Badge icon={Lock} label="Private & Secure" />
          <Badge icon={HardDrive} label="We don't upload anything" />
        </div>

        <button
          onClick={handleAllow}
          disabled={loading}
          className="w-full bg-white text-black rounded-2xl py-4 flex items-center justify-center gap-2 font-semibold text-[15px] disabled:opacity-60"
        >
          {loading ? "Loading your media…" : "Allow Access"}
          {!loading && <ArrowRight size={17} />}
        </button>

        {showDenied && (
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full glass-panel text-white rounded-2xl py-3.5 flex items-center justify-center gap-2 font-medium text-[14px] mt-3"
          >
            <RotateCcw size={15} /> Choose photos & videos manually
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileFallback}
        />

        <p className="text-white/30 text-[11.5px] text-center mt-4">Your media stays on your device.</p>
      </div>
    </div>
  );
};

const Badge: React.FC<{ icon: React.ElementType; label: string }> = ({ icon: Icon, label }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="w-10 h-10 rounded-full glass-panel flex items-center justify-center">
      <Icon size={16} className="text-white/70" />
    </div>
    <span className="text-white/45 text-[10.5px] leading-tight">{label}</span>
  </div>
);
