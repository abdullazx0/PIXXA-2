import React from "react";

export const ConfirmDialog: React.FC<{
  title: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ title, message, confirmLabel = "Delete", onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-8" onClick={onCancel}>
      <div
        className="glass-panel-strong w-full max-w-xs rounded-2xl p-5 text-center section-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-white text-[15px] font-medium mb-1">{title}</p>
        {message && <p className="text-white/50 text-[13px] mb-4">{message}</p>}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 glass-panel rounded-xl py-2.5 text-white/85 text-[14px] font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-white text-black rounded-xl py-2.5 text-[14px] font-semibold"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
