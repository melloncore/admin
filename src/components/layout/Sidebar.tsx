"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Layers, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { NAV_GROUPS } from "@/components/layout/nav-config";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  badgeCounts: { leads: number; messages: number };
}

const COLLAPSED_GROUPS_KEY = "mellon-sidebar-collapsed-groups";

export function Sidebar({ isOpen, onClose, badgeCounts }: SidebarProps) {
  const pathname = usePathname();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(COLLAPSED_GROUPS_KEY);
    if (stored) {
      try {
        setCollapsedGroups(JSON.parse(stored));
      } catch {
        // ignore malformed storage
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(COLLAPSED_GROUPS_KEY, JSON.stringify(collapsedGroups));
  }, [collapsedGroups, hydrated]);

  const toggleGroup = (title: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col bg-slate-950 text-white transition-transform lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-white/10 px-5">
          <Link href="/dashboard" className="flex items-center gap-2 font-display font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral-500 text-white">
              <Layers size={16} />
            </span>
            Mellon Core Admin
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-white/70 hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-5">
          {NAV_GROUPS.map((group) => {
            const isCollapsed = !!collapsedGroups[group.title];
            return (
              <div key={group.title}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.title)}
                  className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40 transition hover:text-white/70"
                  aria-expanded={!isCollapsed}
                >
                  {group.title}
                  <ChevronDown
                    size={13}
                    className={cn(
                      "transition-transform duration-200",
                      isCollapsed && "-rotate-90",
                    )}
                  />
                </button>
                <ul
                  className={cn(
                    "space-y-0.5 overflow-hidden transition-[max-height,opacity] duration-200",
                    isCollapsed ? "max-h-0 opacity-0" : "mt-1 max-h-[999px] opacity-100",
                  )}
                >
                  {group.items.map((item) => {
                    const isActive = pathname?.startsWith(item.href);
                    const badgeCount = item.badgeKey ? badgeCounts[item.badgeKey] : 0;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition",
                            isActive
                              ? "bg-white/10 text-white"
                              : "text-white/70 hover:bg-white/5 hover:text-white",
                          )}
                        >
                          <span className="flex items-center gap-2.5">
                            <item.icon size={16} />
                            {item.label}
                          </span>
                          {badgeCount > 0 && (
                            <span className="rounded-full bg-coral-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                              {badgeCount}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}