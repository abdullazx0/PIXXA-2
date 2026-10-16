import React from "react";
import type { LucideIcon } from "lucide-react";

export const EmptyState: React.FC<{
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ icon: Icon, title, subtitle, action }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center px-8 py-20 gap-3">
      <div className="glass-panel w-16 h-16 rounded-full flex items-center justify-center mb-1">
        <Icon size={26} className="text-white/60" strokeWidth={1.6} />
      </div>
      <p className="text-white text-[15px] font-medium">{title}</p>
      {subtitle && <p className="text-white/45 text-[13px] max-w-[260px] leading-relaxed">{subtitle}</p>}
      {action}
    </div>
  );
};
