import { useState } from "react";
import type { ReactNode } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import { monthlyCollectionData, yearComparisonData, paymentMethodData } from "../data/mockData";

/* ── Helpers ──────────────────────────────────────────────────── */
function formatAmount(n: number) {
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(0) + "K";
  return "₹" + n;
}

/* ── Shared tooltip ───────────────────────────────────────────── */
interface TooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
}
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs"
      style={{ backgroundColor: "#0F172A", color: "#fff", boxShadow: "0 8px 24px rgba(15,23,42,0.25)" }}
    >
      {label && <p className="font-semibold mb-1" style={{ color: "rgba(255,255,255,0.9)" }}>{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span style={{ color: "rgba(148,163,184,0.9)" }}>{p.name}:</span>
          <span className="font-semibold ml-auto">{formatAmount(p.value ?? 0)}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Line/Area Chart: Monthly Collection Trend ───────────────── */
function CollectionTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={monthlyCollectionData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={formatAmount} width={44} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#2563EB", strokeWidth: 1, strokeDasharray: "3 3" }} />
        <Area
          type="monotone"
          dataKey="amount"
          name="Collection"
          stroke="#2563EB"
          strokeWidth={2}
          fill="url(#lineGrad)"
          activeDot={{ r: 5, stroke: "#2563EB", strokeWidth: 2, fill: "#fff" }}
          dot={{ r: 3, stroke: "#2563EB", strokeWidth: 2, fill: "#fff" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ── Bar Chart: Year Comparison ──────────────────────────────── */
function YearComparisonChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={yearComparisonData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barGap={2}>
        <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={formatAmount} width={44} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(37,99,235,0.05)" }} />
        <Legend
          verticalAlign="top"
          height={28}
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, color: "#64748B" }}
        />
        <Bar dataKey="fy24" name="FY 2024–25" fill="#CBD5E1" radius={[3, 3, 0, 0]} maxBarSize={14} />
        <Bar dataKey="fy25" name="FY 2025–26" fill="#93C5FD" radius={[3, 3, 0, 0]} maxBarSize={14} />
        <Bar dataKey="fy26" name="FY 2026–27" fill="#2563EB" radius={[3, 3, 0, 0]} maxBarSize={14} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ── Pie Chart: Payment Methods ──────────────────────────────── */
function PaymentMethodChart() {
  const [hovered, setHovered] = useState<string | null>(null);
  const total = paymentMethodData.reduce((s, d) => s + d.amount, 0);
  const hoveredEntry = paymentMethodData.find((d) => d.method === hovered);

  return (
    <div className="flex flex-col h-full">
      <div className="relative">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={paymentMethodData}
              dataKey="amount"
              nameKey="method"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={2}
              stroke="none"
              onMouseEnter={(_, i) => setHovered(paymentMethodData[i].method)}
              onMouseLeave={() => setHovered(null)}
            >
              {paymentMethodData.map((entry) => (
                <Cell
                  key={entry.method}
                  fill={entry.color}
                  opacity={hovered && hovered !== entry.method ? 0.45 : 1}
                  style={{ cursor: "pointer", transition: "opacity 0.2s ease" }}
                />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ paddingBottom: "8px" }}
        >
          <p className="text-sm font-bold" style={{ fontFamily: "'Poppins', sans-serif", color: "#0F172A" }}>
            {hoveredEntry ? `${hoveredEntry.percentage}%` : "Total"}
          </p>
          <p className="text-xs" style={{ color: "#64748B" }}>
            {hoveredEntry ? hoveredEntry.method : formatAmount(total)}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 px-1 mt-1">
        {paymentMethodData.map((d) => (
          <div
            key={d.method}
            className="flex items-center gap-2"
            onMouseEnter={() => setHovered(d.method)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: "default" }}
          >
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
            <div className="min-w-0">
              <p className="text-xs truncate" style={{ color: "#374151", fontWeight: hovered === d.method ? 600 : 400 }}>{d.method}</p>
              <p className="text-xs" style={{ color: "#94A3B8" }}>{d.percentage}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Section Header ───────────────────────────────────────────── */
function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div
      className="card-hover rounded-[12px] p-5 flex flex-col"
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #E2E8F0",
        boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
      }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold" style={{ fontFamily: "'Poppins', sans-serif", color: "#0F172A" }}>{title}</h3>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Analytics() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold" style={{ fontFamily: "'Poppins', sans-serif", color: "#0F172A" }}>
            Analytics Overview
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>Financial Year 2026–27 performance</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", color: "#475569" }}
            aria-label="Export analytics data"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar chart is wider */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Year-on-Year Collection"
            subtitle="Monthly comparison across financial years"
          >
            <YearComparisonChart />
          </ChartCard>
        </div>

        <ChartCard
          title="Payment Methods"
          subtitle="Collection breakdown by mode"
        >
          <PaymentMethodChart />
        </ChartCard>
      </div>

      {/* Line/area chart full width */}
      <ChartCard
        title="Monthly Collection Trend"
        subtitle="Total collections per month — FY 2026–27"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 rounded" style={{ backgroundColor: "#2563EB" }} />
            <span className="text-xs" style={{ color: "#64748B" }}>Collection (₹)</span>
          </div>
          <div className="ml-auto flex items-center gap-1 text-xs" style={{ color: "#94A3B8" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            </svg>
            <span style={{ color: "#059669", fontWeight: 600 }}>+12.4%</span>
            <span>vs last year</span>
          </div>
        </div>
        <CollectionTrendChart />
      </ChartCard>
    </div>
  );
}
