"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { Users, Eye, Timer, MousePointerClick } from "lucide-react";
import { PageHeader, StatCard, PageLoading } from "@/components/ui/Feedback";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { analyticsApi } from "@/lib/api";
import { CHART_PALETTE } from "@/lib/theme";
import type { AnalyticsSnapshot, ClickEvent, TopPage } from "@/types";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null);

  useEffect(() => {
    analyticsApi.get().then(setAnalytics);
  }, []);

  if (!analytics) return <PageLoading />;

  const consentData = [
    { name: "Accepted", value: analytics.cookieConsent.accepted },
    { name: "Declined", value: analytics.cookieConsent.declined },
    { name: "Dismissed", value: analytics.cookieConsent.dismissed },
  ];

  const clickColumns: Column<ClickEvent>[] = [
    { header: "Element", accessor: (row) => row.label },
    { header: "Page", accessor: (row) => row.page },
    { header: "Clicks", accessor: (row) => row.clicks.toLocaleString() },
  ];

  const pageColumns: Column<TopPage>[] = [
    { header: "Page", accessor: (row) => row.path },
    { header: "Views", accessor: (row) => row.views.toLocaleString() },
    { header: "Avg. time on page", accessor: (row) => row.avgTimeOnPage },
  ];

  return (
    <div>
      <PageHeader title="Analytics" description="Traffic, engagement and cookie-consent stats, last 30 days." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Visitors" value={analytics.totalVisitors.toLocaleString()} icon={Users} tone="brand" />
        <StatCard label="Page views" value={analytics.totalPageViews.toLocaleString()} icon={Eye} tone="coral" />
        <StatCard label="Bounce rate" value={`${analytics.bounceRate}%`} icon={MousePointerClick} tone="teal" />
        <StatCard label="Avg. session" value={analytics.avgSessionDuration} icon={Timer} tone="brand" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Visitors & page views" description="Last 14 days" />
          <CardBody>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.traffic} margin={{ left: -20, right: 10 }}>
                  <defs>
                    <linearGradient id="visitorsA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2B3A6C" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#2B3A6C" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="viewsA" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF6B4A" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#FF6B4A" stopOpacity={0} />
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
                  <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#E3E6EF", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="visitors" name="Visitors" stroke="#2B3A6C" fill="url(#visitorsA)" strokeWidth={2} />
                  <Area type="monotone" dataKey="pageViews" name="Page views" stroke="#FF6B4A" fill="url(#viewsA)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Cookie consent" description="Banner responses" />
          <CardBody>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={consentData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {consentData.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#E3E6EF", fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Top clicked elements" />
          <CardBody className="p-0">
            <DataTable columns={clickColumns} rows={analytics.topClicks} rowKey={(row) => row.id} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Top pages" />
          <CardBody>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topPages} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="path"
                    type="category"
                    width={90}
                    tick={{ fontSize: 11, fill: "#7B8194" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#E3E6EF", fontSize: 12 }} />
                  <Bar dataKey="views" fill="#2B3A6C" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3">
              <DataTable columns={pageColumns} rows={analytics.topPages} rowKey={(row) => row.path} />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
