"use client";

import { cx } from "@/lib/utils";

interface AdminTabsProps {
  tabs: Array<{ id: string; label: string }>;
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function AdminTabs({ tabs, activeTab, onChange, className }: AdminTabsProps) {
  return (
    <div className={cx("flex gap-1 border-b border-border-soft", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cx(
            "relative px-4 py-2.5 text-label-md transition-colors duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-canvas",
            activeTab === tab.id
              ? "text-brand-primary"
              : "text-text-secondary hover:text-text-primary",
          )}
        >
          {tab.label}
          {activeTab === tab.id ? (
            <span className="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-brand-primary" />
          ) : null}
        </button>
      ))}
    </div>
  );
}
