"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Eye,
  MousePointerClick,
  Cookie,
  ArrowRight,
  UserPlus,
  MessagesSquare,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { PageHeader, StatCard, PageLoading } from "@/components/ui/Feedback";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { analyticsApi, leadsApi, conversationsApi } from "@/lib/api";
import type { AnalyticsSnapshot, Lead, Conversation } from "@/types";
import { timeAgo } from "@/lib/utils/date";

const STATUS_TONE: Record<Lead["status"], "info" | "warning" | "success" | "neutral" | "danger"> = {
  new: "info",
  contacted: "warning",
  qualified: "success",
  won: "success",
  lost: "danger",
};

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsApi.get(), leadsApi.list(), conversationsApi.list()]).then(
      ([a, l, c]) => {
        setAnalytics(a);
        setLeads(l);
        setConversations(c);
        setIsLoading(false);
      },
    );
  }, []);

  if (isLoading || !analytics) return <PageLoading />;

  const recentLeads = [...leads]
    .sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt))
    .slice(0, 4);
  const recentConversations = [...conversations]
    .sort((a, b) => +new Date(b.lastMessageAt) - +new Date(a.lastMessageAt))
    .slice(0, 4);
  const consentTotal =
    analytics.cookieConsent.accepted + analytics.cookieConsent.declined + analytics.cookieConsent.dismissed;
  const acceptRate = Math.round((analytics.cookieConsent.accepted / consentTotal) * 100);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="A quick read on how the site is performing and who needs a reply."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Visitors (30d)" value={analytics.totalVisitors.toLocaleString()} icon={Users} tone="brand" />
        <StatCard label="Page views (30d)" value={analytics.totalPageViews.toLocaleString()} icon={Eye} tone="coral" />
        <StatCard
          label="Top click"
          value={analytics.topClicks[0]?.clicks.toLocaleString() ?? "0"}
          delta={analytics.topClicks[0]?.label}
          icon={MousePointerClick}
          tone="teal"
        />
        <StatCard label="Cookie accept rate" value={`${acceptRate}%`} icon={Cookie} tone="brand" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Traffic, last 14 days"
            description="Visitors vs. page views"
            actions={
              <Link href="/analytics" className="flex items-center gap-1 text-sm font-medium text-brand-700">
                Full analytics <ArrowRight size={14} />
              </Link>
            }
          />
          <CardBody>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.traffic} margin={{ left: -20, right: 10 }}>
                  <defs>
                    <linearGradient id="visitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2B3A6C" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#2B3A6C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E6EF" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => d.slice(5)}
                    tick={{ fontSize: 11, fill: "#7B8194" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#7B8194" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, borderColor: "#E3E6EF", fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="#2B3A6C"
                    fill="url(#visitors)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="New leads" />
          <CardBody className="p-0">
            {recentLeads.length === 0 ? (
              <p className="px-5 py-6 text-sm text-ink-muted">No leads yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {recentLeads.map((lead) => (
                  <li key={lead.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{lead.name}</p>
                      <p className="truncate text-xs text-ink-muted">{lead.company}</p>
                    </div>
                    <Badge tone={STATUS_TONE[lead.status]}>{lead.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-line px-5 py-3">
              <Link href="/leads" className="flex items-center gap-1 text-sm font-medium text-brand-700">
                <UserPlus size={14} /> View all leads
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Recent conversations" />
          <CardBody className="p-0">
            <ul className="divide-y divide-line">
              {recentConversations.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{c.customerName}</p>
                    <p className="truncate text-xs text-ink-muted">{c.lastMessage}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {c.unreadCount > 0 && (
                      <span className="rounded-full bg-coral-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {c.unreadCount}
                      </span>
                    )}
                    <span className="text-xs text-ink-muted">{timeAgo(c.lastMessageAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-5 py-3">
              <Link href="/messages" className="flex items-center gap-1 text-sm font-medium text-brand-700">
                <MessagesSquare size={14} /> Open inbox
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Top clicked elements" description="Last 30 days" />
          <CardBody className="p-0">
            <ul className="divide-y divide-line">
              {analytics.topClicks.slice(0, 4).map((click) => (
                <li key={click.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{click.label}</p>
                    <p className="truncate text-xs text-ink-muted">{click.page}</p>
                  </div>
                  <span className="shrink-0 text-sm text-ink-soft">{click.clicks.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
