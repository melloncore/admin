"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, ChevronDown, LogOut, Settings, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/Avatar";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-ink-soft hover:bg-paper lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <Link
          href="https://www.nexlayer.example"
          target="_blank"
          className="hidden items-center gap-1.5 text-sm text-ink-muted transition hover:text-ink sm:flex"
        >
          View live site <ExternalLink size={13} />
        </Link>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-paper"
        >
          <Avatar name={user?.name ?? "Admin"} size="sm" />
          <span className="hidden text-left sm:block">
            <span className="block font-medium text-ink">{user?.name ?? "Admin"}</span>
          </span>
          <ChevronDown size={14} className="text-ink-muted" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-line bg-white py-1.5 shadow-lift">
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-ink-soft transition hover:bg-paper"
              >
                <Settings size={15} /> Account settings
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-coral-600 transition hover:bg-coral-50"
              >
                <LogOut size={15} /> Log out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
