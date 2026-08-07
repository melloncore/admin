"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { leadsApi, conversationsApi } from "@/lib/api";

export function AdminShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badgeCounts, setBadgeCounts] = useState({ leads: 0, messages: 0 });

  useEffect(() => {
    let cancelled = false;
    async function loadCounts() {
      const [leads, conversations] = await Promise.all([leadsApi.list(), conversationsApi.list()]);
      if (cancelled) return;
      setBadgeCounts({
        leads: leads.filter((l) => l.status === "new").length,
        messages: conversations.reduce((sum, c) => sum + c.unreadCount, 0),
      });
    }
    loadCounts();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} badgeCounts={badgeCounts} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
